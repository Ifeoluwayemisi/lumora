import crypto from "crypto";
import { verifyWebhookSignature } from "../services/paystackService.js";
import prisma from "../models/prismaClient.js";

/**
 * Paystack webhook handler
 * Called by Paystack when payment events occur
 */
export async function handlePaystackWebhook(req, res) {
  try {
    // Verify webhook signature
    const signature = req.headers["x-paystack-signature"];
    const verified = verifyWebhookSignature(req.body, signature);

    if (!verified) {
      console.error("[WEBHOOK] Invalid signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body.event;
    const data = req.body.data;

    console.log(`[WEBHOOK] Received event: ${event}`);

    // Handle successful charge
    if (event === "charge.success") {
      const reference = data.reference;
      const status = data.status;

      if (status === "success") {
        // Find payment record
        const payment = await prisma.payment.findUnique({
          where: { reference },
        });

        if (payment) {
          // Update payment status
          await prisma.payment.update({
            where: { reference },
            data: { status: "success" },
          });

          // Upgrade manufacturer plan
          await prisma.manufacturer.update({
            where: { id: payment.manufacturerId },
            data: {
              plan: "PREMIUM",
              planUpgradedAt: new Date(),
            },
          });

          // Create billing record
          await prisma.billingHistory.create({
            data: {
              manufacturerId: payment.manufacturerId,
              reference,
              amount: payment.amount,
              planId: payment.planId,
              status: "completed",
              transactionDate: new Date(),
            },
          });

          console.log(
            `[WEBHOOK] Payment ${reference} verified and plan upgraded`
          );
        }
      }
    }

    // Handle failed charge
    if (event === "charge.failed") {
      const reference = data.reference;

      const payment = await prisma.payment.findUnique({
        where: { reference },
      });

      if (payment) {
        await prisma.payment.update({
          where: { reference },
          data: { status: "failed" },
        });

        console.log(`[WEBHOOK] Payment ${reference} failed`);
      }
    }

    // Acknowledge receipt of webhook
    res.json({ success: true });
  } catch (err) {
    console.error("[WEBHOOK] Error:", err);
    // Still return 200 to prevent Paystack from retrying
    res.status(200).json({ success: true, error: err.message });
  }
}
