#!/usr/bin/env node

/**
 * Database Reset Script
 * Clears all user data and accounts while preserving schema
 * Use with caution - this is a complete data wipe!
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log("🔄 Starting database reset...\n");

    // Keep track of what we're deleting
    let deletedCount = 0;

    // Delete in order of dependencies (foreign keys first)
    console.log("📋 Clearing data...");

    // Delete child records first, then parent records
    const verificationLogsDeleted = await prisma.verificationLog.deleteMany({});
    console.log(
      `  ✓ Deleted ${verificationLogsDeleted.count} verification logs`,
    );
    deletedCount += verificationLogsDeleted.count;

    const userNotificationsDeleted = await prisma.userNotifications.deleteMany(
      {},
    );
    console.log(
      `  ✓ Deleted ${userNotificationsDeleted.count} user notifications`,
    );
    deletedCount += userNotificationsDeleted.count;

    const userFavoritesDeleted = await prisma.userFavorites.deleteMany({});
    console.log(`  ✓ Deleted ${userFavoritesDeleted.count} user favorites`);
    deletedCount += userFavoritesDeleted.count;

    const reportsDeleted = await prisma.report.deleteMany({});
    console.log(`  ✓ Deleted ${reportsDeleted.count} reports`);
    deletedCount += reportsDeleted.count;

    const alertsDeleted = await prisma.alert.deleteMany({});
    console.log(`  ✓ Deleted ${alertsDeleted.count} alerts`);
    deletedCount += alertsDeleted.count;

    const incidentsDeleted = await prisma.incident.deleteMany({});
    console.log(`  ✓ Deleted ${incidentsDeleted.count} incidents`);
    deletedCount += incidentsDeleted.count;

    // Manufacturer-related data
    const codesDeleted = await prisma.code.deleteMany({});
    console.log(`  ✓ Deleted ${codesDeleted.count} codes`);
    deletedCount += codesDeleted.count;

    const batches = await prisma.batch.deleteMany({});
    console.log(`  ✓ Deleted ${batches.count} batches`);
    deletedCount += batches.count;

    const drugsDeleted = await prisma.drug.deleteMany({});
    console.log(`  ✓ Deleted ${drugsDeleted.count} drugs`);
    deletedCount += drugsDeleted.count;

    const productsDeleted = await prisma.product.deleteMany({});
    console.log(`  ✓ Deleted ${productsDeleted.count} products`);
    deletedCount += productsDeleted.count;

    const documentsDeleted = await prisma.document.deleteMany({});
    console.log(`  ✓ Deleted ${documentsDeleted.count} documents`);
    deletedCount += documentsDeleted.count;

    const paymentsDeleted = await prisma.payment.deleteMany({});
    console.log(`  ✓ Deleted ${paymentsDeleted.count} payments`);
    deletedCount += paymentsDeleted.count;

    const billingDeleted = await prisma.billingHistory.deleteMany({});
    console.log(`  ✓ Deleted ${billingDeleted.count} billing records`);
    deletedCount += billingDeleted.count;

    const disputesDeleted = await prisma.dispute.deleteMany({});
    console.log(`  ✓ Deleted ${disputesDeleted.count} disputes`);
    deletedCount += disputesDeleted.count;

    const teamMembersDeleted = await prisma.teamMember.deleteMany({});
    console.log(`  ✓ Deleted ${teamMembersDeleted.count} team members`);
    deletedCount += teamMembersDeleted.count;

    const teamInvitesDeleted = await prisma.teamInvite.deleteMany({});
    console.log(`  ✓ Deleted ${teamInvitesDeleted.count} team invites`);
    deletedCount += teamInvitesDeleted.count;

    const websiteChecksDeleted = await prisma.websiteLegitimacyCheck.deleteMany(
      {},
    );
    console.log(`  ✓ Deleted ${websiteChecksDeleted.count} website checks`);
    deletedCount += websiteChecksDeleted.count;

    const documentChecksDeleted = await prisma.documentForgerCheck.deleteMany(
      {},
    );
    console.log(`  ✓ Deleted ${documentChecksDeleted.count} document checks`);
    deletedCount += documentChecksDeleted.count;

    const trustHistoryDeleted = await prisma.trustScoreHistory.deleteMany({});
    console.log(`  ✓ Deleted ${trustHistoryDeleted.count} trust score records`);
    deletedCount += trustHistoryDeleted.count;

    // Finally, delete manufacturers and users
    const mfgDeleted = await prisma.manufacturer.deleteMany({});
    console.log(`  ✓ Deleted ${mfgDeleted.count} manufacturers`);
    deletedCount += mfgDeleted.count;

    const usersDeleted = await prisma.user.deleteMany({});
    console.log(`  ✓ Deleted ${usersDeleted.count} users`);
    deletedCount += usersDeleted.count;

    console.log(`\n✅ Database reset complete!`);
    console.log(`📊 Total records deleted: ${deletedCount}`);
    console.log("\n🚀 You can now sign in and create new accounts\n");
  } catch (error) {
    console.error("❌ Error resetting database:", error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetDatabase();
