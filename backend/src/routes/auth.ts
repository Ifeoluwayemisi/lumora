import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import argon2 from "argon2";
import dayjs from "dayjs";
import crypto from "crypto";
import { redisRateLimiter } from "../utils/redisRateLimiter";
import { sendEmail } from "../services/emailService";


const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 30);

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post("/signup", async (request, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().optional(),
    });
    const { email, password, name } = bodySchema.parse(request.body);
    const existing = await fastify.prisma.user.findUnique({ where: { email } });
    if (existing) return reply.status(400).send({ error: "Email exists" });
    const hash = await argon2.hash(password);
    const user = await fastify.prisma.user.create({
      data: { email, password: hash, name },
    });
    const token = fastify.jwt.sign(
      { id: user.id, role: "USER" },
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    const refreshPlain = crypto.randomBytes(64).toString("hex");
    const refreshHash = crypto
      .createHash("sha256")
      .update(refreshPlain)
      .digest("hex");
    const expiresAt = dayjs().add(REFRESH_TOKEN_DAYS, "day").toDate();
    await fastify.prisma.refreshToken.create({
      data: { tokenHash: refreshHash, userId: user.id, expiresAt },
    });
    return {
      token,
      refreshToken: refreshPlain,
      user: { id: user.id, email: user.email, name: user.name },
    };
  });

  fastify.post("/login", async (request, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });
    const { email, password } = bodySchema.parse(request.body);
    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) return reply.status(401).send({ error: "Invalid credentials" });
    const ok = await argon2.verify(user.password, password);
    if (!ok) return reply.status(401).send({ error: "Invalid credentials" });
    const token = fastify.jwt.sign(
      { id: user.id, role: "USER" },
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    const refreshPlain = crypto.randomBytes(64).toString("hex");
    const refreshHash = crypto
      .createHash("sha256")
      .update(refreshPlain)
      .digest("hex");
    const expiresAt = dayjs().add(REFRESH_TOKEN_DAYS, "day").toDate();
    await fastify.prisma.refreshToken.create({
      data: { tokenHash: refreshHash, userId: user.id, expiresAt },
    });
    return {
      token,
      refreshToken: refreshPlain,
      user: { id: user.id, email: user.email, role: user.role },
    };
  });

  fastify.post("/refresh", async (request, reply) => {
    const body = z.object({ refreshToken: z.string() }).parse(request.body);
    const incoming = body.refreshToken;
    const incomingHash = crypto
      .createHash("sha256")
      .update(incoming)
      .digest("hex");
    const rt = await fastify.prisma.refreshToken.findFirst({
      where: { tokenHash: incomingHash },
    });
    if (!rt || rt.revoked || new Date(rt.expiresAt) < new Date()) {
      return reply.status(401).send({ error: "Invalid refresh token" });
    }
    let payload: any = null;
    if (rt.userId) payload = { id: rt.userId, role: "USER" };
    else if (rt.manufacturerId)
      payload = { id: rt.manufacturerId, role: "MANUFACTURER" };
    else return reply.status(401).send({ error: "Invalid token owner" });

    await fastify.prisma.refreshToken.update({
      where: { id: rt.id },
      data: { revoked: true },
    });
    const newRefreshPlain = crypto.randomBytes(64).toString("hex");
    const newHash = crypto
      .createHash("sha256")
      .update(newRefreshPlain)
      .digest("hex");
    const expiresAt = dayjs().add(REFRESH_TOKEN_DAYS, "day").toDate();
    await fastify.prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: rt.userId ?? undefined,
        manufacturerId: rt.manufacturerId ?? undefined,
        expiresAt,
      },
    });
    const access = fastify.jwt.sign(
      { id: payload.id, role: payload.role },
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    return { token: access, refreshToken: newRefreshPlain };
  });

  fastify.post("/logout", async (request, reply) => {
    const body = z
      .object({ refreshToken: z.string().optional() })
      .parse(request.body);
    if (!body.refreshToken) return reply.send({ ok: true });
    const incomingHash = crypto
      .createHash("sha256")
      .update(body.refreshToken)
      .digest("hex");
    await fastify.prisma.refreshToken.updateMany({
      where: { tokenHash: incomingHash },
      data: { revoked: true },
    });
    return reply.send({ ok: true });
  });

  // add route: request-password-reset
  fastify.post(
    "/request-password-reset",
    { preHandler: redisRateLimiter(5, 60) },
    async (request, reply) => {
      const body = z.object({ email: z.string().email() }).parse(request.body);
      const user = await fastify.prisma.user.findUnique({
        where: { email: body.email },
      });
      const man = await fastify.prisma.manufacturer.findUnique({
        where: { email: body.email },
      });
      if (!user && !man) return reply.send({ ok: true }); // do not reveal existence

      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = dayjs().add(1, "hour").toDate();

      if (user) {
        await fastify.prisma.passwordResetToken.create({
          data: { tokenHash, userId: user.id, expiresAt },
        });
        await sendEmail(
          user.email,
          "Password reset",
          `<p>Use this token to reset: ${token}</p>`
        );
      } else if (man) {
        await fastify.prisma.passwordResetToken.create({
          data: { tokenHash, manufacturerId: man.id, expiresAt },
        });
        await sendEmail(
          man.email,
          "Password reset",
          `<p>Use this token to reset: ${token}</p>`
        );
      }
      return reply.send({ ok: true });
    }
  );

  // add route: reset-password
  fastify.post("/reset-password", async (request, reply) => {
    const body = z
      .object({ token: z.string(), password: z.string().min(8) })
      .parse(request.body);
    const tokenHash = crypto
      .createHash("sha256")
      .update(body.token)
      .digest("hex");
    const rec = await fastify.prisma.passwordResetToken.findFirst({
      where: { tokenHash },
    });
    if (!rec || new Date(rec.expiresAt) < new Date())
      return reply.status(400).send({ error: "Invalid token" });

    if (rec.userId) {
      await fastify.prisma.user.update({
        where: { id: rec.userId },
        data: { password: await argon2.hash(body.password) },
      });
    } else if (rec.manufacturerId) {
      await fastify.prisma.manufacturer.update({
        where: { id: rec.manufacturerId },
        data: { password: await argon2.hash(body.password) },
      });
    }
    await fastify.prisma.passwordResetToken.delete({ where: { id: rec.id } });
    return reply.send({ ok: true });
  });
};

export default route;
