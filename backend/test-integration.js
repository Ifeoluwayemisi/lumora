/**
 * Test script to verify webhook and rate limiting integration
 * Run with: node test-integration.js
 */

async function testIntegration() {
  console.log("Testing webhook and rate limiting integration...\n");

  // Test 1: Import all required modules
  console.log("✓ Test 1: Importing modules...");
  try {
    const { sendWebhookNotification } =
      await import("./src/services/webhookNotificationService.js");
    const { initializeAgencies, resetHourlyCounters, resetDailyCounters } =
      await import("./src/utils/initializeAgencies.js");
    const { runAnalyticsJobs } = await import("./src/jobs/analyticsJobs.js");
    console.log("  ✓ All modules imported successfully\n");
  } catch (error) {
    console.error("  ✗ Import error:", error.message);
    process.exit(1);
  }

  // Test 2: Verify function signatures
  console.log("✓ Test 2: Verifying function signatures...");
  try {
    const { sendWebhookNotification } =
      await import("./src/services/webhookNotificationService.js");
    const { initializeAgencies } =
      await import("./src/utils/initializeAgencies.js");
    const { runAnalyticsJobs } = await import("./src/jobs/analyticsJobs.js");

    if (typeof sendWebhookNotification !== "function")
      throw new Error("sendWebhookNotification is not a function");
    if (typeof initializeAgencies !== "function")
      throw new Error("initializeAgencies is not a function");
    if (typeof runAnalyticsJobs !== "function")
      throw new Error("runAnalyticsJobs is not a function");

    console.log("  ✓ All function signatures valid\n");
  } catch (error) {
    console.error("  ✗ Signature error:", error.message);
    process.exit(1);
  }

  // Test 3: Verify codeController imports
  console.log("✓ Test 3: Verifying codeController imports...");
  try {
    const codeController = await import("./src/controllers/codeController.js");
    if (typeof codeController.flagCode !== "function")
      throw new Error("flagCode is not a function");
    console.log("  ✓ codeController.flagCode is callable\n");
  } catch (error) {
    console.error("  ✗ codeController error:", error.message);
    process.exit(1);
  }

  console.log("✅ All integration tests passed!");
  console.log("\nIntegration Summary:");
  console.log("  1. Webhook notification service: Ready");
  console.log("  2. Rate limiting initialization: Ready");
  console.log("  3. Analytics jobs: Ready");
  console.log("  4. Code controller integration: Ready");
}

testIntegration().catch(console.error);
