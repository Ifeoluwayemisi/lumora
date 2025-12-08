import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const route: FastifyPluginAsync = async (fastify) => {
  fastify.get("/manufacturers/pending", async (request, reply) => {
    const mans = await fastify.prisma.manufacturer.findMany({ where: { status: "PENDING" } });
    return { mans };
  });

  fastify.post("/manufacturers/:id/approve", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const man = await fastify.prisma.manufacturer.update({ where: { id: params.id }, data: { status: "VERIFIED" } });
    return { man };
  });

  fastify.post("/manufacturers/:id/reject", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const man = await fastify.prisma.manufacturer.update({ where: { id: params.id }, data: { status: "REJECTED" } });
    return { man };
  });
};

export default route;
