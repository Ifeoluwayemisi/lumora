import prisma from "./src/models/prismaClient.js";

async function checkDatabase() {
  try {
    const userCount = await prisma.user.count();
    console.log("Total users:", userCount);

    const mfgCount = await prisma.manufacturer.count();
    console.log("Total manufacturers:", mfgCount);

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 3,
        select: { id: true, email: true, role: true },
      });
      console.log("\nRecent users:");
      users.forEach((u) => console.log(`  - ${u.email} (${u.role})`));
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
