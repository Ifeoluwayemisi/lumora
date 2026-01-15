import prisma from "../models/prismaClient.js";
import { startOfDay } from "date-fns";

export async function checkDailyCodeLimit(manufacturerId) {
  const user = await prisma.user.findUnique({
    where: { id: manufacturerId },
  });

  if (!user) throw new Error("Manufacturer not found");

  // PREMIUM users = unlimited
  if (user.plan === "PREMIUM") return true;

  const todayCount = await prisma.code.count({
    where: {
      manufacturerId,
      createdAt: { gte: startOfDay(new Date()) },
    },
  });

  if (todayCount >= user.dailyCodeLimit) {
    throw new Error(
      "Daily code limit reached. Upgrade to PREMIUM to generate more codes."
    );
  }

  return true;
}

export async function upgradeToPremium(manufacturerId, durationInDays = 30) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationInDays);

  return prisma.user.update({
    where: { id: manufacturerId },
    data: {
      plan: "PREMIUM",
      dailyCodeLimit: 100000,
      planExpiresAt: expiresAt,
    },
  });
}
