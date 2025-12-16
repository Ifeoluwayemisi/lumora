import { FastifyPluginAsync } from "fastify";
import authRoutes from "./auth";
import manufacturerRoutes from "./manufacturer";
// import productRoutes from "./products";
// import batchRoutes from "./batches";
// import codeRoutes from "./codes";
import verifyRoutes from "./verify";
import adminRoutes from "./admin";
// import aiRoutes from "./ai";
// import pushRoutes from "./push";

const routes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(manufacturerRoutes, { prefix: "/manufacturer" });
  // fastify.register(productRoutes, { prefix: "/products" });
  // fastify.register(batchRoutes, { prefix: "/batches" });
  // fastify.register(codeRoutes, { prefix: "/codes" });
  fastify.register(verifyRoutes, { prefix: "/verify" });
  fastify.register(adminRoutes, { prefix: "/admin" });
  // fastify.register(aiRoutes, { prefix: "/ai" });
  // fastify.register(pushRoutes, { prefix: "/push" });
};

export default routes;
