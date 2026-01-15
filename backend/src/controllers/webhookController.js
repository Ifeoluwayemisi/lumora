import crypto from "crypto";
import { upgradeToPremium } from "../services/subscriptionService.js";

export async function handlePaystackWebhook(req, res) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body)
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "charge.success") {
    const manufacturerId = event.data.metadata.manufacturerId;

    if (manufacturerId) {
      await upgradeToPremium(manufacturerId);
    }
  }

  res.sendStatus(200);
}
