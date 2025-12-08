import Fastify from "fastify";
import path from "path";
import fastifyMultipart from "fastify-multipart";
import fastifyStatic from "fastify-static";
import fastifyJwt from "@fastify/jwt";
import cors from "fastify-cors";
import rateLimit from "fastify-rate-limit";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import routes from "./routes";
import { ensureUploadDirs } from "./utils/file";
import { seedAdmin } from "./scripts/seed";

const prisma = new PrismaClient();
const server = Fastify({ logger: true });

// create uploads dirs
ensureUploadDirs();

// register plugins
server.register(fastifyMultipart, { limits: { fileSize: 20 * 1024 * 1024 } });
server.register(fastifyStatic, {
  root: path.join(__dirname, "..", "..", "uploads"),
  prefix: "/uploads/",
});
server.register(cors, { origin: true });
server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "secret_dev_change",
});
server.register(rateLimit, {
  max: 60,
  timeWindow: "1 minute",
});

// decorate prisma
server.decorate("prisma", prisma);

// simple health route
server.get("/health", async () => ({ ok: true }));

// register routes
server.register(routes, { prefix: "/api" });

// start server
const start = async () => {
  try {
    await server.listen({ port: Number(process.env.PORT) || 4000, host: "0.0.0.0" });
    server.log.info(`Server started`);
    await seedAdmin(server);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
