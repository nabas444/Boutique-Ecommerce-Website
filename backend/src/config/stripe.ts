import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  if (process.env.NODE_ENV === "production" && !process.env.SKIP_STARTUP_CHECKS) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }
  console.warn("STRIPE_SECRET_KEY is not defined; Stripe payment routes are disabled.");
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      typescript: true,
    })
  : null;
