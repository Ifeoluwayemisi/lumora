import prisma from "../models/prismaClient.js";
import {
  initializePayment,
  verifyPayment,
  getPublicKey,
} from "../services/paystackService.js";
import { sendPaymentNotification } from "../services/notificationService.js";

/**
 * Initiate Paystack payment for plan upgrade
 * Returns authorization URL for frontend
 */
export async function initiatePayment(req, res) {
  try {
    console.log("[INITIATE_PAYMENT] Called");
    const manufacturerId = req.user?.id;
    const { planId } = req.body;

    console.log("[INITIATE_PAYMENT] manufacturerId:", manufacturerId);
    console.log("[INITIATE_PAYMENT] planId:", planId);

    if (!manufacturerId) {
      console.warn("[INITIATE_PAYMENT] No manufacturer ID - not authenticated");
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!planId) {
      console.warn("[INITIATE_PAYMENT] No planId provided");
      return res.status(400).json({ error: "Plan ID required" });
    }

    // Get manufacturer with user details
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });

    console.log("[INITIATE_PAYMENT] Manufacturer:", manufacturer?.id);

    if (!manufacturer) {
      console.warn("[INITIATE_PAYMENT] Manufacturer not found");
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: manufacturer.userId },
      select: { email: true },
    });

    if (!user || !user.email) {
      console.warn("[INITIATE_PAYMENT] User email not found");
      return res.status(404).json({ error: "User email not found" });
    }

    console.log("[INITIATE_PAYMENT] User email:", user.email);

    // Define plans
    const plans = {
      premium: {
        name: "Premium Plan",
        amount: 50000, // NGN
        duration: "monthly",
      },
    };

    const selectedPlan = plans[planId];
    if (!selectedPlan) {
      console.warn("[INITIATE_PAYMENT] Invalid plan:", planId);
      return res.status(400).json({ error: "Invalid plan" });
    }

    console.log("[INITIATE_PAYMENT] Selected plan:", selectedPlan);

    // Initialize Paystack payment
    console.log("[INITIATE_PAYMENT] Calling Paystack with email:", user.email);
    const paymentData = await initializePayment(
      user.email,
      selectedPlan.amount,
      {
        manufacturerId,
        planId,
        planName: selectedPlan.name,
      },
    );

    console.log("[INITIATE_PAYMENT] Paystack response:", paymentData.status);

    if (!paymentData.status) {
      console.error("[INITIATE_PAYMENT] Paystack error:", paymentData.message);
      return res.status(400).json({
        error: "Failed to initialize payment with Paystack",
        message: paymentData.message,
      });
    }

    // Store payment intent in database
    const payment = await prisma.payment.create({
      data: {
        manufacturerId,
        reference: paymentData.data.reference,
        amount: selectedPlan.amount,
        planId,
        status: "pending",
        accessCode: paymentData.data.access_code,
        authorizationUrl: paymentData.data.authorization_url,
      },
    });

    console.log("[INITIATE_PAYMENT] Payment created:", payment.reference);

    res.json({
      success: true,
      data: {
        authorization_url: paymentData.data.authorization_url,
        access_code: paymentData.data.access_code,
        reference: paymentData.data.reference,
      },
    });
  } catch (err) {
    console.error("[INITIATE_PAYMENT] Error:", err);
    console.error("[INITIATE_PAYMENT] Error stack:", err.stack);
    res.status(500).json({
      error: "Failed to initiate payment",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Verify Paystack payment and upgrade plan
 */
export async function verifyAndUpgradePlan(req, res) {
  try {
    const manufacturerId = req.user?.id;
    const { reference } = req.body;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!reference) {
      return res.status(400).json({ error: "Payment reference required" });
    }

    // Verify with Paystack
    const verificationResponse = await verifyPayment(reference);

    if (
      !verificationResponse.status ||
      !verificationResponse.data.status === "success"
    ) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.manufacturerId !== manufacturerId) {
      return res.status(403).json({ error: "Payment does not belong to user" });
    }

    // Update payment status
    await prisma.payment.update({
      where: { reference },
      data: { status: "success" },
    });

    // Upgrade manufacturer plan
    const updatedManufacturer = await prisma.manufacturer.update({
      where: { id: manufacturerId },
      data: {
        plan: "PREMIUM",
        planUpgradedAt: new Date(),
      },
    });

    // Create billing record
    await prisma.billingHistory.create({
      data: {
        manufacturerId,
        reference,
        amount: payment.amount,
        planId: payment.planId,
        status: "completed",
        transactionDate: new Date(),
      },
    });

    // Send payment notification
    try {
      await sendPaymentNotification({
        manufacturerId,
        amount: payment.amount,
        planId: payment.planId,
        status: "success",
        reference,
      });
    } catch (notifError) {
      console.warn("[VERIFY_PAYMENT] Notification error:", notifError.message);
    }

    res.json({
      success: true,
      message: "Plan upgraded successfully!",
      data: {
        plan: updatedManufacturer.plan,
        planUpgradedAt: updatedManufacturer.planUpgradedAt,
      },
    });
  } catch (err) {
    console.error("[VERIFY_PAYMENT] Error:", err);
    res.status(500).json({
      error: "Failed to verify payment",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Get payment configuration for frontend
 * Returns Paystack public key and plan details
 */
export async function getPaymentConfig(req, res) {
  try {
    console.log("[GET_PAYMENT_CONFIG] Called");
    const publicKey = getPublicKey();
    console.log(
      `[GET_PAYMENT_CONFIG] publicKey: ${publicKey ? "✓ Set" : "✗ MISSING"}`,
    );

    if (!publicKey) {
      console.error(
        "[GET_PAYMENT_CONFIG] ERROR: PAYSTACK_PUBLIC_KEY not found in environment",
      );
      return res.status(500).json({
        success: false,
        error: "Payment configuration not available",
        debug: "PAYSTACK_PUBLIC_KEY is missing",
      });
    }

    const plans = [
      {
        id: "basic",
        name: "Basic",
        price: 0,
        description: "For individuals and startups",
      },
      {
        id: "premium",
        name: "Premium",
        price: 50000,
        description: "For growing brands",
        currency: "NGN",
        interval: "monthly",
      },
    ];

    res.json({
      success: true,
      data: {
        publicKey,
        plans,
      },
    });
  } catch (err) {
    console.error("[GET_PAYMENT_CONFIG] Error:", err);
    res.status(500).json({
      error: "Failed to load payment config",
    });
  }
}

/**
 * Get billing history for manufacturer
 */
export async function getBillingHistory(req, res) {
  try {
    const manufacturerId = req.user?.id;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const history = await prisma.billingHistory.findMany({
      where: { manufacturerId },
      orderBy: { transactionDate: "desc" },
      take: 10,
    });

    res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    console.error("[GET_BILLING_HISTORY] Error:", err);
    res.status(500).json({
      error: "Failed to fetch billing history",
    });
  }
}
