import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", async (request, reply) => {
    const body = z.object({
      code: z.string(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      locationConsent: z.boolean().optional(),
    }).parse(request.body);

    const code = await fastify.prisma.verificationCode.findUnique({ where: { code: body.code }, include: { batch: { include: { product: true } }, uses: true } });
    if (!code) return reply.status(200).send({ status: "INVALID", message: "Code not recognized" });

    if (code.usedCount > 0) {
      const log = await fastify.prisma.codeUseLog.create({ data: { codeId: code.id, lat: body.lat, lng: body.lng, locationConsent: body.locationConsent ?? false } });
      await fastify.prisma.verificationCode.update({ where: { id: code.id }, data: { usedCount: { increment: 1 } } });
      return reply.send({ status: "USED", message: "This code has been used before", product: { name: code.batch.product.name, category: code.batch.product.category }, log });
    } else {
      const log = await fastify.prisma.codeUseLog.create({ data: { codeId: code.id, lat: body.lat, lng: body.lng, locationConsent: body.locationConsent ?? false } });
      await fastify.prisma.verificationCode.update({ where: { id: code.id }, data: { usedCount: 1 } });
      return reply.send({ status: "GENUINE", message: "Code is genuine and now marked as used", product: { name: code.batch.product.name, category: code.batch.product.category }, log });
    }
  });
};

export default route;
