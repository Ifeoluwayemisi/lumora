import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { isAuthenticated, requireRole } from "../middleware/auth";
import { enqueueCertificateAnalysis } from "../services/aiQueue";

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", isAuthenticated);
  // manufacturer trigger their own re-analysis
  route.post(
    "/reanalysis",
    { preHandler: requireRole("MANUFACTURER") },
    async (request, reply) => {
      const body = z
        .object({ manufacturerId: z.string().optional() })
        .parse(request.body);
      const user = (request as any).user;
      const manId = body.manufacturerId || user.id;
      const man = await fastify.prisma.manufacturer.findUnique({
        where: { id: manId },
      });
      if (!man || !man.certificatePath)
        return reply
          .status(404)
          .send({ error: "Manufacturer or certificate not found" });
      const job = await enqueueCertificateAnalysis({
        manufacturerId: man.id,
        certPath: man.certificatePath,
        expectedNafda: man.nafdaNumber,
      });
      return { ok: true, jobId: job.id };
    }
  );

  // admin can trigger for any manufacturer
  route.post(
    "/reanalysis/admin",
    { preHandler: [requireRole("ADMIN")] },
    async (request, reply) => {
      const body = z.object({ manufacturerId: z.string() }).parse(request.body);
      const man = await fastify.prisma.manufacturer.findUnique({
        where: { id: body.manufacturerId },
      });
      if (!man || !man.certificatePath)
        return reply
          .status(404)
          .send({ error: "Manufacturer or certificate not found" });
      const job = await enqueueCertificateAnalysis({
        manufacturerId: man.id,
        certPath: man.certificatePath,
        expectedNafda: man.nafdaNumber,
      });
      return { ok: true, jobId: job.id };
    }
  );
};

export default route;
