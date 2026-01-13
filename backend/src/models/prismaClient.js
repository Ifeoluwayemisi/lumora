import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "production"
      ? [
          {
            emit: "event",
            level: "error",
          },
          {
            emit: "event",
            level: "warn",
          },
        ]
      : [
          {
            emit: "stdout",
            level: "query",
          },
          {
            emit: "stdout",
            level: "error",
          },
          {
            emit: "stdout",
            level: "warn",
          },
        ],
});

// Log Prisma events in production
if (process.env.NODE_ENV === "production") {
  prisma.$on("warn", (e) => {
    console.warn("[PRISMA WARNING]", e.message);
  });

  prisma.$on("error", (e) => {
    console.error("[PRISMA ERROR]", e.message);
  });
}

// Graceful disconnection
process.on("exit", async () => {
  await prisma.$disconnect();
});

export default prisma;
