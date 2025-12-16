import Fastify, { FastifyInstance } from "fastify";
import path from "path";
import multipart, { MultipartFile, MultipartValue } from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifyJwt from "@fastify/jwt";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import routes from "./routes";
import { ensureUploadDirs } from "./utils/file";
import promClient from "prom-client";
import rateLimit from "fastify-rate-limit";
import fs from "fs";
import { redis } from "./utils/redisClient";

// Type augmentation for Fastify instance
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// Initialize Prisma
const prisma = new PrismaClient();

// Create Fastify instance
const server: FastifyInstance = Fastify({ logger: true });

// Ensure necessary directories exist
ensureUploadDirs();

// Register plugins

// Multipart for file uploads
server.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

// Static file serving
server.register(fastifyStatic, {
  root: path.join(__dirname, "..", "..", "uploads"),
  prefix: "/uploads/",
});

// CORS (allow all origins for now, configure in production)
server.register(cors, { origin: true });

// JWT authentication
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  server.log.error("JWT_SECRET is not set. Exiting...");
  process.exit(1);
}
server.register(fastifyJwt, { secret: jwtSecret });

// Rate limiting — replace deprecated plugin with Fastify’s built-in or external solution if needed
// For simplicity, keeping it lightweight here
server.addHook("onRequest", async (request, reply) => {
  // Simple naive rate-limit placeholder
});
server.register(rateLimit, {
  max: 60,
  timeWindow: "1 minute",
});

// Decorate server with Prisma
server.decorate("prisma", prisma);

server.get("/metrics", async (req, reply) => {
  try {
    const metrics = await promClient.register.metrics();
    reply.type(promClient.register.contentType).send(metrics);
  } catch (err) {
    reply.status(500).send(err);
  }
});
// Health check
server.get("/health", async () => ({ ok: true }));

// API routes
server.register(routes, { prefix: "/api" });

// Graceful shutdown
const shutdown = async () => {
  server.log.info("Shutting down server...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start server
const start = async () => {
  try {
    await server.listen({
      port: Number(process.env.PORT) || 4000,
      host: "0.0.0.0",
    });
    server.log.info("Server started successfully");
  } catch (err) {
    server.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
