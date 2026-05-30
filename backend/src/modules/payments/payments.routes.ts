import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { stripe } from "../../config/stripe";
import { db } from "../../config/database";
import { z } from "zod";

const router = Router();

// POST /api/payments/create-intent
router.post(
  "/create-intent",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = z
        .object({ orderId: z.string().uuid() })
        .parse(req.body);

      const order = await db.order.findUnique({ where: { id: orderId } });
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      if (order.userId !== req.user!.userId)
        return res.status(403).json({ success: false, message: "Forbidden" });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(order.total) * 100), // cents
        currency: "usd",
        metadata: { orderId: order.id, userId: req.user!.userId },
      });

      await db.order.update({
        where: { id: orderId },
        data: { stripePaymentId: paymentIntent.id },
      });

      res.json({
        success: true,
        data: { clientSecret: paymentIntent.client_secret },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/payments/webhook — Stripe webhook (raw body)
router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as any;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED", stripePaymentId: pi.id },
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as any;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      }
      break;
    }
  }

  res.json({ received: true });
});

export default router;
