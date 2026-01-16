import prisma from "../models/prismaClient.js";
import {
  initializePayment,
  verifyPayment,
  getPublicKey,
} from "../services/paystackService.js";

/**
 * Initiate Paystack payment for plan upgrade
 * Returns authorization URL for frontend
 */
export async function initiatePayment(req, res) {
  try {
    const manufacturerId = req.user?.id;
    const { planId } = req.body;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!planId) {
      return res.status(400).json({ error: "Plan ID required" });
    }

    // Get manufacturer
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

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
      return res.status(400).json({ error: "Invalid plan" });
    }

    // Initialize Paystack payment
    const paymentData = await initializePayment(
      manufacturer.email,
      selectedPlan.amount,
      {
        manufacturerId,
        planId,
        planName: selectedPlan.name,
      }
    );

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
      `[GET_PAYMENT_CONFIG] publicKey: ${publicKey ? "✓ Set" : "✗ MISSING"}`
    );

    if (!publicKey) {
      console.error(
        "[GET_PAYMENT_CONFIG] ERROR: PAYSTACK_PUBLIC_KEY not found in environment"
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
