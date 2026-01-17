import axios from "axios";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_API_URL = "https://api.paystack.co";

// Debug logging
if (!PAYSTACK_SECRET_KEY || !PAYSTACK_PUBLIC_KEY) {
  console.warn("[PAYSTACK] Warning: Missing Paystack keys in environment");
  console.warn(
    `PAYSTACK_PUBLIC_KEY: ${PAYSTACK_PUBLIC_KEY ? "✓ Set" : "✗ MISSING"}`,
  );
  console.warn(
    `PAYSTACK_SECRET_KEY: ${PAYSTACK_SECRET_KEY ? "✓ Set" : "✗ MISSING"}`,
  );
}

/**
 * Initialize payment with Paystack
 * Creates a payment authorization URL
 */
export const initializePayment = async (email, amount, metadata) => {
  try {
    console.log("[PAYSTACK_INIT] Initializing payment:");
    console.log("[PAYSTACK_INIT] Email:", email);
    console.log("[PAYSTACK_INIT] Email type:", typeof email);
    console.log("[PAYSTACK_INIT] Email length:", email?.length);
    console.log("[PAYSTACK_INIT] Amount (kobo):", amount * 100);
    console.log("[PAYSTACK_INIT] Metadata:", metadata);

    const payload = {
      email,
      amount: amount * 100, // Convert to kobo
      metadata,
    };

    console.log("[PAYSTACK_INIT] Full payload:", JSON.stringify(payload));

    const response = await axios.post(
      `${PAYSTACK_API_URL}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[PAYSTACK_INIT] Success:", response.data.status);
    return response.data;
  } catch (error) {
    console.error("[PAYSTACK_INIT] Error:", error.message);
    console.error("[PAYSTACK_INIT] Response:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to initialize payment",
    );
  }
};

/**
 * Verify payment with Paystack
 * Confirms if a payment was successful
 */
export const verifyPayment = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("[PAYSTACK_VERIFY] Error:", error.message);
    throw new Error(
      error.response?.data?.message || "Failed to verify payment",
    );
  }
};

/**
 * Verify webhook signature from Paystack
 * Ensures webhook is authentic from Paystack
 */
export const verifyWebhookSignature = (payload, signature) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest("hex");

  return hash === signature;
};

/**
 * Create a plan on Paystack
 * Used for recurring billing (not needed for one-time payments)
 */
export const createPlan = async (name, interval, amount, description) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_API_URL}/plan`,
      {
        name,
        interval, // monthly, yearly, etc
        amount: amount * 100, // Convert to kobo
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("[PAYSTACK_CREATE_PLAN] Error:", error.message);
    throw new Error(error.response?.data?.message || "Failed to create plan");
  }
};

/**
 * Get public key for frontend
 * Used by frontend to initialize payment popup
 */
export const getPublicKey = () => {
  return PAYSTACK_PUBLIC_KEY;
};
