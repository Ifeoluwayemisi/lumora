import { FastifyPluginAsync } from "fastify";
import { MultipartFile } from "@fastify/multipart";
import { z } from "zod";
import argon2 from "argon2";
import { ensureUploadDirs, saveMultipartFile } from "../utils/file";
import { isAuthenticated, requireRole } from "../middleware/auth";
import { createAudit } from "../services/auditService";
import { enqueueCertificateAnalysis } from "../services/aiQueue";

const route: FastifyPluginAsync = async (fastify) => {
  ensureUploadDirs();

  // REGISTER
  fastify.post("/register", async (request, reply) => {
    const multipart = await request.multipart();
    const fields: Record<string, any> = {};
    let certFile: MultipartFile | null = null;

    for await (const part of multipart) {
      if (part.type === "file" && part.fieldname === "certificate") {
        certFile = part as MultipartFile;
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    const bodySchema = z.object({
      name: z.string(),
      companyName: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
      nafdaNumber: z.string().optional(),
    });

    const parsed = bodySchema.parse(fields);

    const existing = await fastify.prisma.manufacturer.findUnique({
      where: { email: parsed.email },
    });
    if (existing)
      return reply.status(400).send({ error: "Manufacturer email exists" });

    const hash = await argon2.hash(parsed.password);

    let savedPath: string | null = null;
    if (certFile) {
      savedPath = await saveMultipartFile(
        certFile,
        process.env.CERT_UPLOAD_PATH || "./uploads/certificates"
      );
    }

    const manufacturer = await fastify.prisma.manufacturer.create({
      data: {
        name: parsed.name,
        companyName: parsed.companyName,
        email: parsed.email,
        password: hash,
        nafdaNumber: parsed.nafdaNumber,
        certificatePath: savedPath,
        aiScore: 0,
        aiStatus: "PENDING",
        status: "PENDING",
      },
    });

    if (savedPath) {
      await enqueueCertificateAnalysis({
        manufacturerId: manufacturer.id,
        certPath: savedPath,
        expectedNafda: parsed.nafdaNumber,
      });
    }

    // Optional: create audit
    await createAudit(fastify.prisma, {
      actorId: manufacturer.id,
      actorRole: "MANUFACTURER",
      action: "register",
      meta: { email: parsed.email },
    });

    return reply
      .status(201)
      .send({ manufacturer, message: "Registered. AI analysis queued." });
  });

  // LOGIN
  fastify.post("/login", async (request, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = bodySchema.parse(request.body);

    const man = await fastify.prisma.manufacturer.findUnique({
      where: { email },
    });

    if (!man || !(await argon2.verify(man.password, password))) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = fastify.jwt.sign(
      { id: man.id, role: "MANUFACTURER" },
      { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m" }
    );

    return {
      token,
      manufacturer: { id: man.id, email: man.email, status: man.status },
    };
  });

  // GET ME
  fastify.get("/me", async (request, reply) => {
    try {
      const auth = request.headers.authorization;
      if (!auth) return reply.status(401).send({ error: "Missing token" });

      const token = auth.replace("Bearer ", "");
      const decoded: any = fastify.jwt.verify(token);

      const man = await fastify.prisma.manufacturer.findUnique({
        where: { id: decoded.id },
        include: {
          products: {
            include: { batches: { include: { codes: true } } },
          },
        },
      });

      return { manufacturer: man };
    } catch (e) {
      return reply.status(401).send({ error: "Invalid token" });
    }
  });
};

export default route;
