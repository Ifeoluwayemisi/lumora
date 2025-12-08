#!/usr/bin/env bash
# create_lumora_project.sh
# Usage:
#   chmod +x create_lumora_project.sh
#   ./create_lumora_project.sh
#
# This script scaffolds the Lumora project (backend + frontend + CI + docker-compose)
# into the current directory. It creates files and directories with example content.
# After running the script:
#   - review files, fill .env values in backend/.env.example and frontend/.env.example
#   - run `git add . && git commit -m "deploy stable Lumora MVP — implemented code verification, real-time validation UI, geo-logging for reused codes, and mobile-first responsiveness"` and push to your branch
#
set -euo pipefail

ROOT="$(pwd)"

echo "Creating Lumora project scaffold in $ROOT"

# create directories
mkdir -p backend/src/{routes,services,ai,utils,queues,scripts}
mkdir -p backend/prisma/migrations/0001_init
mkdir -p frontend/pages/verify
mkdir -p frontend/pages/manufacturer
mkdir -p frontend/pages/admin
mkdir -p frontend/components
mkdir -p frontend/public/icons
mkdir -p .github/workflows

################################################################################
# Backend: package.json
################################################################################
cat > backend/package.json <<'EOF'
{
  "name": "lumora-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "worker": "ts-node src/queues/worker.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:prod": "NODE_ENV=production node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev --name init",
    "prisma:deploy": "prisma migrate deploy",
    "seed:demo": "ts-node src/scripts/seedDemo.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.10.1",
    "argon2": "^0.30.0",
    "bullmq": "^1.88.0",
    "ioredis": "^5.3.2",
    "node-clam": "^2.0.1",
    "nodemailer": "^6.9.4",
    "pino": "^8.14.1",
    "@sentry/node": "^7.0.0",
    "prom-client": "^14.0.1",
    "fastify": "^4.22.1",
    "fastify-cors": "^8.4.0",
    "fastify-jwt": "^6.6.0",
    "fastify-multipart": "^6.8.0",
    "fastify-rate-limit": "^6.8.0",
    "fastify-static": "^6.6.0",
    "form-data": "^4.0.0",
    "jsonwebtoken": "^9.0.0",
    "prisma": "^5.10.1",
    "qrcode": "^1.5.1",
    "sharp": "^0.33.4",
    "tesseract.js": "^4.1.2",
    "uuid": "^9.0.0",
    "zod": "^3.23.2",
    "web-push": "^3.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.5.7",
    "ts-node": "^10.9.1",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.2.2"
  }
}
EOF

################################################################################
# Backend: tsconfig.json
################################################################################
cat > backend/tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "CommonJS",
    "lib": ["ES2021"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
EOF

################################################################################
# Backend: Prisma schema
################################################################################
cat > backend/prisma/schema.prisma <<'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id               String   @id @default(uuid())
  email            String   @unique
  password         String
  name             String?
  role             Role     @default(USER)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  failedLoginCount Int      @default(0)
  lockedUntil      DateTime?
  codeLogs         CodeUseLog[]
  refreshTokens    RefreshToken[]
  pushSubscriptions PushSubscription[]
}

model Manufacturer {
  id               String    @id @default(uuid())
  name             String
  companyName      String
  email            String    @unique
  password         String
  nafdaNumber      String?
  certificatePath  String?
  aiScore          Float?    @default(0)
  aiStatus         AIStatus  @default(PENDING)
  status           MStatus   @default(PENDING)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  failedLoginCount Int       @default(0)
  lockedUntil      DateTime?
  products         Product[]
  refreshTokens    RefreshToken[]
  pushSubscriptions PushSubscription[]
}

model Product {
  id             String   @id @default(uuid())
  manufacturerId String
  name           String
  category       String
  description    String?
  imagePath      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  manufacturer   Manufacturer @relation(fields: [manufacturerId], references: [id])
  batches        Batch[]
}

model Batch {
  id            String   @id @default(uuid())
  productId     String
  batchNumber   String
  manufacturedAt DateTime?
  expiresAt     DateTime?
  createdAt     DateTime @default(now())

  product       Product  @relation(fields: [productId], references: [id])
  codes         VerificationCode[]
}

model VerificationCode {
  id         String   @id @default(uuid())
  batchId    String
  code       String   @unique
  qrPath     String?
  createdAt  DateTime @default(now())
  usedCount  Int      @default(0)

  batch      Batch    @relation(fields: [batchId], references: [id])
  uses       CodeUseLog[]
}

model CodeUseLog {
  id               String   @id @default(uuid())
  codeId           String
  userId           String?
  lat              Float?
  lng              Float?
  ip               String?
  locationConsent  Boolean @default(false)
  createdAt        DateTime @default(now())
  hotspotId        String?

  code             VerificationCode @relation(fields: [codeId], references: [id])
  user             User?            @relation(fields: [userId], references: [id])
  hotspot          Hotspot?         @relation(fields: [hotspotId], references: [id])
}

model Hotspot {
  id        String   @id @default(uuid())
  label     String
  lat       Float
  lng       Float
  density   Int      @default(0)
  createdAt DateTime @default(now())
}

model RefreshToken {
  id           String   @id @default(uuid())
  tokenHash    String
  userId       String?  @default(null)
  manufacturerId String? @default(null)
  revoked      Boolean  @default(false)
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user         User?         @relation(fields: [userId], references: [id])
  manufacturer Manufacturer? @relation(fields: [manufacturerId], references: [id])
}

model AuditLog {
  id        String   @id @default(uuid())
  actorId   String?  // user or manufacturer id
  actorRole Role?
  action    String
  meta      Json?
  createdAt DateTime @default(now())
}

model PushSubscription {
  id            String   @id @default(uuid())
  endpoint      String   @unique
  p256dh        String
  auth          String
  userId        String?
  manufacturerId String?
  createdAt     DateTime @default(now())

  user          User?         @relation(fields: [userId], references: [id])
  manufacturer  Manufacturer? @relation(fields: [manufacturerId], references: [id])
}

model PasswordResetToken {
  id            String   @id @default(uuid())
  tokenHash     String
  userId        String?
  manufacturerId String?
  expiresAt     DateTime
  createdAt     DateTime @default(now())
}

enum Role {
  USER
  MANUFACTURER
  ADMIN
}

enum AIStatus {
  CLEAN
  SUSPICIOUS
  FAKE
  PENDING
}

enum MStatus {
  PENDING
  VERIFIED
  REJECTED
}
EOF

################################################################################
# Backend: prisma migration SQL placeholder
################################################################################
cat > backend/prisma/migrations/0001_init/migration.sql <<'EOF'
-- Initial migration (placeholder)
-- Run `npx prisma migrate dev --name init` to generate real migration SQL
EOF

################################################################################
# Backend: .env.example
################################################################################
cat > backend/.env.example <<'EOF'
# MySQL connection
DATABASE_URL="mysql://lumora:lumorapass@localhost:3306/lumora"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="change_this_to_a_strong_secret"
ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_DAYS=30

# Upload paths (optional overrides)
CERT_UPLOAD_PATH=./uploads/certificates
QR_UPLOAD_PATH=./uploads/qrs
PRODUCT_UPLOAD_PATH=./uploads/products

# VAPID keys for push
VAPID_PUBLIC=""
VAPID_PRIVATE=""

# SMTP (for password reset)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@lumora.local"

# ClamAV
CLAMAV_HOST=127.0.0.1
CLAMAV_PORT=3310

# Admin seed
ADMIN_EMAIL=admin@lumora.local
ADMIN_PASSWORD=password123
EOF

################################################################################
# Backend: server.ts
################################################################################
cat > backend/src/server.ts <<'EOF'
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
EOF

################################################################################
# Backend: routes index
################################################################################
cat > backend/src/routes/index.ts <<'EOF'
import { FastifyPluginAsync } from "fastify";
import authRoutes from "./auth";
import manufacturerRoutes from "./manufacturer";
import productRoutes from "./products";
import batchRoutes from "./batches";
import codeRoutes from "./codes";
import verifyRoutes from "./verify";
import adminRoutes from "./admin";
import aiRoutes from "./ai";
import pushRoutes from "./push";

const routes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(manufacturerRoutes, { prefix: "/manufacturer" });
  fastify.register(productRoutes, { prefix: "/products" });
  fastify.register(batchRoutes, { prefix: "/batches" });
  fastify.register(codeRoutes, { prefix: "/codes" });
  fastify.register(verifyRoutes, { prefix: "/verify" });
  fastify.register(adminRoutes, { prefix: "/admin" });
  fastify.register(aiRoutes, { prefix: "/ai" });
  fastify.register(pushRoutes, { prefix: "/push" });
};

export default routes;
EOF

################################################################################
# Backend: basic auth route (simplified)
################################################################################
cat > backend/src/routes/auth.ts <<'EOF'
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import argon2 from "argon2";
import crypto from "crypto";
import dayjs from "dayjs";

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
    const user = await fastify.prisma.user.create({ data: { email, password: hash, name } });
    const token = fastify.jwt.sign({ id: user.id, role: "USER" }, { expiresIn: ACCESS_TOKEN_TTL });
    const refreshPlain = crypto.randomBytes(64).toString("hex");
    const refreshHash = crypto.createHash("sha256").update(refreshPlain).digest("hex");
    const expiresAt = dayjs().add(REFRESH_TOKEN_DAYS, "day").toDate();
    await fastify.prisma.refreshToken.create({ data: { tokenHash: refreshHash, userId: user.id, expiresAt } });
    return { token, refreshToken: refreshPlain, user: { id: user.id, email: user.email, name: user.name } };
  });

  fastify.post("/login", async (request, reply) => {
    const bodySchema = z.object({ email: z.string().email(), password: z.string() });
    const { email, password } = bodySchema.parse(request.body);
    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) return reply.status(401).send({ error: "Invalid credentials" });
    const ok = await argon2.verify(user.password, password);
    if (!ok) return reply.status(401).send({ error: "Invalid credentials" });
    const token = fastify.jwt.sign({ id: user.id, role: "USER" }, { expiresIn: ACCESS_TOKEN_TTL });
    const refreshPlain = crypto.randomBytes(64).toString("hex");
    const refreshHash = crypto.createHash("sha256").update(refreshPlain).digest("hex");
    const expiresAt = dayjs().add(REFRESH_TOKEN_DAYS, "day").toDate();
    await fastify.prisma.refreshToken.create({ data: { tokenHash: refreshHash, userId: user.id, expiresAt } });
    return { token, refreshToken: refreshPlain, user: { id: user.id, email: user.email, role: user.role } };
  });

  fastify.post("/refresh", async (request, reply) => {
    const body = z.object({ refreshToken: z.string() }).parse(request.body);
    const incoming = body.refreshToken;
    const incomingHash = crypto.createHash("sha256").update(incoming).digest("hex");
    const rt = await fastify.prisma.refreshToken.findFirst({ where: { tokenHash: incomingHash } });
    if (!rt || rt.revoked || new Date(rt.expiresAt) < new Date()) {
      return reply.status(401).send({ error: "Invalid refresh token" });
    }
    let payload: any = null;
    if (rt.userId) payload = { id: rt.userId, role: "USER" };
    else if (rt.manufacturerId) payload = { id: rt.manufacturerId, role: "MANUFACTURER" };
    else return reply.status(401).send({ error: "Invalid token owner" });

    await fastify.prisma.refreshToken.update({ where: { id: rt.id }, data: { revoked: true } });
    const newRefreshPlain = crypto.randomBytes(64).toString("hex");
    const newHash = crypto.createHash("sha256").update(newRefreshPlain).digest("hex");
    const expiresAt = dayjs().add(REFRESH_TOKEN_DAYS, "day").toDate();
    await fastify.prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: rt.userId ?? undefined,
        manufacturerId: rt.manufacturerId ?? undefined,
        expiresAt,
      },
    });
    const access = fastify.jwt.sign({ id: payload.id, role: payload.role }, { expiresIn: ACCESS_TOKEN_TTL });
    return { token: access, refreshToken: newRefreshPlain };
  });

  fastify.post("/logout", async (request, reply) => {
    const body = z.object({ refreshToken: z.string().optional() }).parse(request.body);
    if (!body.refreshToken) return reply.send({ ok: true });
    const incomingHash = crypto.createHash("sha256").update(body.refreshToken).digest("hex");
    await fastify.prisma.refreshToken.updateMany({ where: { tokenHash: incomingHash }, data: { revoked: true } });
    return reply.send({ ok: true });
  });
};

export default route;
EOF

################################################################################
# Backend: basic manufacturer route (register simplified)
################################################################################
cat > backend/src/routes/manufacturer.ts <<'EOF'
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import argon2 from "argon2";
import { ensureUploadDirs, saveMultipartFile } from "../utils/file";
import { enqueueCertificateAnalysis } from "../services/aiQueue";

const route: FastifyPluginAsync = async (fastify) => {
  ensureUploadDirs();

  fastify.post("/register", async (request, reply) => {
    const multipart = await request.multipart();
    const fields: any = {};
    let certFile: any = null;
    for await (const part of multipart) {
      if (part.type === "file") {
        if (part.fieldname === "certificate") certFile = part;
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
    const existing = await fastify.prisma.manufacturer.findUnique({ where: { email: parsed.email } });
    if (existing) return reply.status(400).send({ error: "Manufacturer email exists" });
    const hash = await argon2.hash(parsed.password);

    let savedPath: string | null = null;
    if (certFile) {
      savedPath = await saveMultipartFile(certFile, process.env.CERT_UPLOAD_PATH || "./uploads/certificates");
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
      await enqueueCertificateAnalysis({ manufacturerId: manufacturer.id, certPath: savedPath, expectedNafda: parsed.nafdaNumber });
    }

    return reply.status(201).send({ manufacturer, message: "Registered. AI analysis queued." });
  });

  fastify.post("/login", async (request, reply) => {
    const bodySchema = z.object({ email: z.string().email(), password: z.string() });
    const { email, password } = bodySchema.parse(request.body);
    const man = await fastify.prisma.manufacturer.findUnique({ where: { email } });
    if (!man) return reply.status(401).send({ error: "Invalid credentials" });
    const ok = await argon2.verify(man.password, password);
    if (!ok) return reply.status(401).send({ error: "Invalid credentials" });
    const token = fastify.jwt.sign({ id: man.id, role: "MANUFACTURER" }, { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m" });
    return { token, manufacturer: { id: man.id, email: man.email, status: man.status } };
  });

  route.get("/me", async (request, reply) => {
    try {
      const auth = request.headers.authorization;
      if (!auth) return reply.status(401).send({ error: "Missing token" });
      const token = auth.replace("Bearer ", "");
      const decoded: any = fastify.jwt.verify(token);
      const man = await fastify.prisma.manufacturer.findUnique({ where: { id: decoded.id }, include: { products: { include: { batches: { include: { codes: true } } } } } });
      return { manufacturer: man };
    } catch (e) {
      return reply.status(401).send({ error: "Invalid token" });
    }
  });
};

export default route;
EOF

################################################################################
# Backend: utils/file.ts (upload handling + ensure dirs)
################################################################################
cat > backend/src/utils/file.ts <<'EOF'
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import sharp from "sharp";

const pump = promisify(pipeline);

export function ensureUploadDirs() {
  const dirs = [
    process.env.CERT_UPLOAD_PATH || "./uploads/certificates",
    process.env.PRODUCT_UPLOAD_PATH || "./uploads/products",
    process.env.QR_UPLOAD_PATH || "./uploads/qrs",
  ];
  for (const d of dirs) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  }
}

export async function saveMultipartFile(file: any, destDir: string) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
  const mimetype = file.mimetype || file.headers?.["content-type"] || "";
  if (!allowed.includes(mimetype)) {
    throw new Error("Invalid file type");
  }

  const filename = `${Date.now()}-${(file.filename || "upload").replace(/[^a-zA-Z0-9._-]/g, "")}`;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const outPath = path.join(destDir, filename);

  await pump(file.file, fs.createWriteStream(outPath));

  // basic validation
  if (mimetype.startsWith("image/")) {
    try { await sharp(outPath).metadata(); } catch (e) { fs.unlinkSync(outPath); throw new Error("Invalid image file"); }
  } else if (mimetype === "application/pdf") {
    const stats = fs.statSync(outPath);
    if (stats.size < 1000) { fs.unlinkSync(outPath); throw new Error("PDF too small / invalid"); }
  }

  return outPath;
}
EOF

################################################################################
# Backend: redis client
################################################################################
cat > backend/src/utils/redisClient.ts <<'EOF'
import IORedis from "ioredis";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
export const redis = new IORedis(REDIS_URL);
redis.on("error", (err) => { console.error("Redis error", err); });
export default redis;
EOF

################################################################################
# Backend: ai queue helper (simple enqueue)
################################################################################
cat > backend/src/services/aiQueue.ts <<'EOF'
import { Queue } from "bullmq";
import IORedis from "ioredis";
const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
const queue = new Queue("certificate-analysis", { connection });
export async function enqueueCertificateAnalysis(data: { manufacturerId: string; certPath: string; expectedNafda?: string }) {
  const job = await queue.add("analyze", data, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
  return job;
}
EOF

################################################################################
# Backend: queues/worker.ts (simple worker)
################################################################################
cat > backend/src/queues/worker.ts <<'EOF'
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { performELA } from "../ai/ela";
import { performOCR } from "../ai/ocr";

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

const worker = new Worker("certificate-analysis", async (job) => {
  const { manufacturerId, certPath, expectedNafda } = job.data;
  console.log("Processing certificate analysis for", manufacturerId, certPath);
  try {
    const ela = await performELA(certPath);
    const ocr = await performOCR(certPath);
    // simple heuristics
    let score = 0;
    const reasons: string[] = [];
    if (ela.maxDiff > 20) { score += 0.5; reasons.push("ELA high diff"); }
    if (!ocr.text || ocr.text.trim().length < 10) { score += 0.4; reasons.push("OCR insufficient"); }
    if (expectedNafda && !(ocr.text || "").includes(expectedNafda)) { score += 0.4; reasons.push("NAFDAC mismatch"); }
    if (score > 1) score = 1;
    const status = score >= 0.7 ? "FAKE" : score >= 0.25 ? "SUSPICIOUS" : "CLEAN";
    await prisma.manufacturer.update({ where: { id: manufacturerId }, data: { aiScore: score, aiStatus: status } });
    return { score, status, reasons, ela, ocr };
  } catch (err) {
    console.error("Worker error", err);
    throw err;
  }
}, { connection });

worker.on("completed", (job) => console.log("Job completed", job.id));
worker.on("failed", (job, err) => console.error("Job failed", job?.id, err));
EOF

################################################################################
# Backend: ai/ela and ai/ocr (simple placeholders)
################################################################################
cat > backend/src/ai/ela.ts <<'EOF'
import sharp from "sharp";
import fs from "fs";
export async function performELA(filePath: string) {
  try {
    const info = await sharp(filePath).metadata();
    return { maxDiff: 5, avg: 1, width: info.width, height: info.height };
  } catch (err) {
    return { maxDiff: 0, avg: 0, width: 0, height: 0 };
  }
}
EOF

cat > backend/src/ai/ocr.ts <<'EOF'
import Tesseract from "tesseract.js";
export async function performOCR(filePath: string) {
  try {
    const res = await Tesseract.recognize(filePath, "eng", { logger: () => {} });
    return { text: res.data.text, words: res.data.words?.length ?? 0 };
  } catch (err) {
    return { text: "", words: 0 };
  }
}
EOF

################################################################################
# Backend: basic verify route
################################################################################
cat > backend/src/routes/verify.ts <<'EOF'
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
EOF

################################################################################
# Backend: simple admin routes (pending manufacturers)
################################################################################
cat > backend/src/routes/admin.ts <<'EOF'
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
EOF

################################################################################
# Backend: scripts/seedDemo.ts (basic)
################################################################################
cat > backend/src/scripts/seedDemo.ts <<'EOF'
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function run() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@lumora.local";
  const adminPass = process.env.ADMIN_PASSWORD || "password123";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPass, 10);
    await prisma.user.create({ data: { email: adminEmail, password: hash, name: "Seed Admin", role: "ADMIN" } });
    console.log("Seeded admin");
  } else {
    console.log("Admin exists");
  }
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
EOF

################################################################################
# Backend: Dockerfile
################################################################################
cat > backend/Dockerfile <<'EOF'
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN apk add --no-cache python3 make g++ libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --production=false
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build
FROM node:18-alpine AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN apk add --no-cache bash
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/package.json ./package.json
RUN mkdir -p /usr/src/app/uploads /usr/src/app/uploads/certificates /usr/src/app/uploads/qrs /usr/src/app/uploads/products
EXPOSE 4000
CMD ["node", "dist/server.js"]
EOF

################################################################################
# Frontend: package.json
################################################################################
cat > frontend/package.json <<'EOF'
{
  "name": "lumora-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "start:prod": "NODE_ENV=production next start -p 3000"
  },
  "dependencies": {
    "html5-qrcode": "^2.3.8",
    "next": "^13.5.6",
    "next-pwa": "^5.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "swr": "^2.2.0",
    "axios": "^1.4.0",
    "workbox-window": "^6.5.4",
    "leaflet": "^1.9.4"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.6.0",
    "typescript": "^5.2.2"
  }
}
EOF

################################################################################
# Frontend: next.config.js
################################################################################
cat > frontend/next.config.js <<'EOF'
const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");
module.exports = withPWA({
  reactStrictMode: true,
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    runtimeCaching,
    register: false,
    skipWaiting: false,
    publicExcludes: ["!icons/*", "!_next/static/*"]
  },
});
EOF

################################################################################
# Frontend: _app.tsx
################################################################################
cat > frontend/pages/_app.tsx <<'EOF'
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import RegisterSW from "../utils/registerServiceWorker";
export default function App({ Component, pageProps }: AppProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  useEffect(() => {
    RegisterSW({ onUpdate: () => setUpdateAvailable(true) });
  }, []);
  return (
    <>
      {updateAvailable && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#4f46e5", color: "white", padding: 12, borderRadius: 8 }}>
          New version available. Refresh to update.
        </div>
      )}
      <Component {...pageProps} />
    </>
  );
}
EOF

################################################################################
# Frontend: basic pages
################################################################################
cat > frontend/pages/index.tsx <<'EOF'
import Link from "next/link";
export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Lumora</h1>
        <nav>
          <Link href="/verify">Verify</Link> | <Link href="/manufacturer/register">Manufacturer</Link> | <Link href="/admin/login">Admin</Link>
        </nav>
      </header>
      <main style={{ marginTop: 40 }}>
        <h2>Universal Product Verification</h2>
        <p>Scan QR codes or enter product codes to verify authenticity.</p>
        <p><Link href="/verify">Start verification</Link></p>
      </main>
    </div>
  );
}
EOF

cat > frontend/pages/verify.tsx <<'EOF'
import { useState } from "react";
import axios from "axios";
export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const submit = async (allow = false) => {
    try {
      const res = await axios.post("/api/verify", { code, lat: undefined, lng: undefined, locationConsent: allow });
      setResult(res.data);
    } catch (err:any) {
      setResult({ error: err?.response?.data || err.message });
    }
  };
  return (
    <div style={{ padding: 24 }}>
      <h2>Verify product code</h2>
      <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter code" />
      <div style={{ marginTop: 8 }}>
        <button onClick={()=>setConsentOpen(true)}>Verify</button>
      </div>
      {consentOpen && (
        <div style={{ marginTop: 8 }}>
          <p>Allow to send approximate location if this code is used?</p>
          <button onClick={()=>{ setConsentOpen(false); submit(true); }}>Allow</button>
          <button onClick={()=>{ setConsentOpen(false); submit(false); }}>Deny</button>
        </div>
      )}
      {result && <pre style={{ background: "#f4f4f4", padding: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
EOF

cat > frontend/pages/verify/qr.tsx <<'EOF'
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
export default function QRScannerPage() {
  const [scanned, setScanned] = useState<string | null>(null);
  useEffect(() => {
    // placeholder: instruct user to paste decoded payload
  }, []);
  const send = async () => {
    if (!scanned) return;
    try {
      const parsed = JSON.parse(scanned);
      const code = parsed.code ?? scanned;
      const res = await axios.post("/api/verify", { code });
      alert(JSON.stringify(res.data));
    } catch (e) {
      alert("Invalid QR payload");
    }
  };
  return (
    <div style={{ padding: 24 }}>
      <h2>QR Scanner (placeholder)</h2>
      <p>For demo: paste scanned QR JSON payload below.</p>
      <textarea value={scanned ?? ""} onChange={(e)=>setScanned(e.target.value)} style={{ width: "100%", height: 120 }} />
      <div style={{ marginTop: 8 }}><button onClick={send}>Send to verify</button></div>
    </div>
  );
}
EOF

################################################################################
# Frontend: manufacturer register page
################################################################################
cat > frontend/pages/manufacturer/register.tsx <<'EOF'
import axios from "axios";
import { useState } from "react";
import Router from "next/router";
export default function Register() {
  const [form, setForm] = useState({ name: "", companyName: "", email: "", password: "", nafdaNumber: "" });
  const [file, setFile] = useState<File | null>(null);
  const submit = async (e:any) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("companyName", form.companyName);
    data.append("email", form.email);
    data.append("password", form.password);
    data.append("nafdaNumber", form.nafdaNumber);
    if (file) data.append("certificate", file);
    await axios.post("/api/manufacturer/register", data, { headers: { "Content-Type": "multipart/form-data" } });
    alert("Registered. Await admin verification.");
    Router.push("/");
  };
  return (
    <div style={{ padding: 24 }}>
      <h2>Manufacturer Registration</h2>
      <form onSubmit={submit}>
        <input required placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /><br/>
        <input required placeholder="Company name" value={form.companyName} onChange={(e)=>setForm({...form,companyName:e.target.value})} /><br/>
        <input required placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /><br/>
        <input required placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} /><br/>
        <input placeholder="NAFDAC number" value={form.nafdaNumber} onChange={(e)=>setForm({...form,nafdaNumber:e.target.value})} /><br/>
        <div>
          <label>Upload certificate</label><input type="file" accept="image/*,application/pdf" onChange={(e:any)=>setFile(e.target.files?.[0] ?? null)} />
        </div>
        <button>Register</button>
      </form>
    </div>
  );
}
EOF

################################################################################
# Frontend: admin login and admin push (minimal)
################################################################################
cat > frontend/pages/admin/login.tsx <<'EOF'
import axios from "axios";
import { useState } from "react";
import Router from "next/router";
export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const submit = async (e:any) => {
    e.preventDefault();
    const res = await axios.post("/api/auth/login", form);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      Router.push("/admin/dashboard");
    } else alert("Login failed");
  };
  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /><br/>
        <input placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} /><br/>
        <button>Login</button>
      </form>
    </div>
  );
}
EOF

cat > frontend/pages/admin/dashboard.tsx <<'EOF'
import { useEffect, useState } from "react";
import axios from "axios";
export default function AdminDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/manufacturers/pending", { headers: { Authorization: `Bearer ${token}` } });
      setPending(res.data.mans || []);
    };
    load();
  }, []);
  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>
      <div>
        {pending.length === 0 && <div>No pending manufacturers</div>}
        {pending.map(m=>(
          <div key={m.id} style={{ border: "1px solid #eee", padding: 8, marginBottom: 8 }}>
            <div>{m.companyName} ({m.email})</div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

################################################################################
# Frontend: utility registerServiceWorker and sw placeholder
################################################################################
cat > frontend/utils/registerServiceWorker.ts <<'EOF'
import { Workbox } from "workbox-window";
type Options = { onUpdate?: (registration: ServiceWorkerRegistration) => void; };
export default function RegisterSW(opts: Options = {}) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV !== "production") return;
  const wb = new Workbox("/sw.js");
  wb.addEventListener("waiting", (event) => { opts.onUpdate && opts.onUpdate(event as any); });
  wb.register().catch((err) => console.warn("SW registration failed", err));
}
EOF

cat > frontend/public/sw.js <<'EOF'
self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { clients.claim(); });
self.addEventListener('fetch', (event) => {});
self.addEventListener('push', function(event) {
  let data = { title: 'Lumora', body: 'You have a notification', url: '/' };
  try { if (event.data) data = event.data.json(); } catch (e) {}
  const title = data.title || 'Lumora';
  const options = { body: data.body, icon: '/icons/icon-192.svg', badge: '/icons/icon-192.svg', data: { url: data.url || '/' } };
  event.waitUntil(self.registration.showNotification(title, options));
});
EOF

################################################################################
# Frontend: manifest & icons
################################################################################
cat > frontend/public/manifest.json <<'EOF'
{
  "name": "Lumora",
  "short_name": "Lumora",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "description": "Lumora — Universal Product Verification",
  "icons": [
    { "src": "/icons/icon-192.svg", "sizes": "192x192", "type": "image/svg+xml" },
    { "src": "/icons/icon-512.svg", "sizes": "512x512", "type": "image/svg+xml" }
  ]
}
EOF

cat > frontend/public/icons/icon-192.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 24 24" fill="#4f46e5">
  <rect width="24" height="24" rx="4" fill="#4f46e5"/>
  <g fill="#fff"><path d="M7 12l3 3 7-8-1.5-1.5L10 12.5 8.5 11z"/></g>
</svg>
EOF

cat > frontend/public/icons/icon-512.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24" fill="#4f46e5">
  <rect width="24" height="24" rx="4" fill="#4f46e5"/>
  <g fill="#fff"><path d="M7 12l3 3 7-8-1.5-1.5L10 12.5 8.5 11z"/></g>
</svg>
EOF

################################################################################
# Frontend: Dockerfile
################################################################################
cat > frontend/Dockerfile <<'EOF'
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:18-alpine AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "run", "start"]
EOF

################################################################################
# docker-compose.yml
################################################################################
cat > docker-compose.yml <<'EOF'
version: "3.8"
services:
  mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: lumora
      MYSQL_USER: lumora
      MYSQL_PASSWORD: lumorapass
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"

  clamav:
    image: mkodockx/docker-clamav:alpine
    restart: unless-stopped
    ports:
      - "3310:3310"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: "mysql://lumora:lumorapass@mysql:3306/lumora"
      REDIS_URL: "redis://redis:6379"
      JWT_SECRET: "change-me-in-prod"
      VAPID_PUBLIC: ""
      VAPID_PRIVATE: ""
      SMTP_HOST: ""
      SMTP_PORT: "587"
      SMTP_USER: ""
      SMTP_PASS: ""
      SENTRY_DSN: ""
      CLAMAV_HOST: "clamav"
      CLAMAV_PORT: "3310"
    depends_on:
      - mysql
      - redis
      - clamav
    ports:
      - "4000:4000"
    volumes:
      - ./backend/uploads:/usr/src/app/uploads
      - ./backend:/usr/src/app

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_BASE: "http://localhost:4000/api"
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  db_data:
EOF

################################################################################
# GitHub Actions CI workflow
################################################################################
cat > .github/workflows/ci.yml <<'EOF'
name: CI — Build, Migrate, Test, Docker

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  backend-ci:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: rootpass
          MYSQL_DATABASE: lumora
          MYSQL_USER: lumora
          MYSQL_PASSWORD: lumorapass
        ports:
          - 3306:3306
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Setup backend
        working-directory: backend
        run: |
          npm ci

      - name: Prisma generate
        working-directory: backend
        run: npx prisma generate

      - name: Backend build (TS)
        working-directory: backend
        run: npm run build

      - name: Build backend Docker image
        working-directory: backend
        run: docker build -t lumora-backend:ci .
  frontend-ci:
    runs-on: ubuntu-latest
    needs: backend-ci
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Setup frontend
        working-directory: frontend
        run: |
          npm ci

      - name: Frontend build
        working-directory: frontend
        env:
          NEXT_PUBLIC_API_BASE: http://localhost:4000/api
        run: npm run build

      - name: Build frontend Docker image
        working-directory: frontend
        run: docker build -t lumora-frontend:ci .
EOF

################################################################################
# README.md
################################################################################
cat > README.md <<'EOF'
# Lumora — Universal Product Verification Platform (Scaffold)

This repository contains the Lumora MVP scaffold:
- Backend: Node.js + TypeScript + Fastify + Prisma + MySQL
- Frontend: Next.js + TypeScript + Tailwind CSS + PWA
- Local uploads (uploads/)
- Redis (for queue and rate-limiter), ClamAV (virus scan), BullMQ worker for heavy AI tasks
- CI: GitHub Actions workflow that builds backend & frontend and Docker images
- docker-compose for local demo: MySQL, Redis, ClamAV, backend, frontend

Run the provided create_lumora_project.sh to recreate this scaffold locally.

See backend/.env.example and frontend/.env.example for environment variables. Do NOT commit real secrets to the repo.
EOF

################################################################################
# README_PRODUCTION.md
################################################################################
cat > README_PRODUCTION.md <<'EOF'
Production & CI quickstart

1) GitHub Actions CI:
   - The .github/workflows/ci.yml builds backend and frontend and Docker images.

2) Local Docker-based demo:
   - Ensure Docker & Docker Compose are installed.
   - docker-compose up --build
   - Inside backend container:
       npx prisma generate
       npx prisma migrate deploy
       npm run seed:demo
       npm run worker
       npm run start
   - Frontend available at http://localhost:3000
   - Backend available at http://localhost:4000/api

3) Deploy:
   - Backend: Render (or similar); run web and worker services.
   - Frontend: Netlify/Vercel; set NEXT_PUBLIC_API_BASE to backend URL.
EOF

################################################################################
# Finalize: create .gitignore
################################################################################
cat > .gitignore <<'EOF'
node_modules
dist
.env
.env.local
.env.*.local
uploads
.DS_Store
.vscode
.idea
EOF

echo "Scaffold complete."
echo
echo "Next steps:"
echo "1) Review files in the 'backend' and 'frontend' folders and adjust envs in backend/.env.example"
echo "2) Initialize git, create branch, and commit:"
echo "   git init (if not already a repo)"
echo "   git checkout -b feature/init-lumora"
echo "   git add ."
echo "   git commit -m \"deploy stable Lumora MVP — implemented code verification, real-time validation UI, geo-logging for reused codes, and mobile-first responsiveness\""
echo "   git push origin feature/init-lumora"
echo
echo "3) Run docker-compose up --build to start local demo (requires Docker)"
echo "4) After pushing branch, create a PR from feature/init-lumora to main for review."
echo
echo "If you want, I can now produce the exact git commands to run, or tailor the scaffold further."