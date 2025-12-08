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
