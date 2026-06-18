import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { stripe } from "../../config/stripe";
import { db } from "../../config/database";
import { deleteCart } from "../../config/redis";
import { applyOrderStatusTransition } from "../orders/orderFulfillment.service";
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

      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      if (order.userId !== req.user!.userId)
        return res.status(403).json({ success: false, message: "Forbidden" });
      if (!stripe)
        return res.status(503).json({
          success: false,
          message: "Stripe is not configured",
        });

      const amount = Math.round(Number(order.total) * 100);
      if (!Number.isFinite(amount) || amount < 50) {
        return res.status(400).json({
          success: false,
          message: "Order total is too low to process with Stripe",
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        payment_method_types: ["card"],
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

// POST /api/payments/confirm - confirm a succeeded Stripe PaymentIntent locally.
router.post(
  "/confirm",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, paymentIntentId } = z
        .object({
          orderId: z.string().uuid(),
          paymentIntentId: z.string().min(1),
        })
        .parse(req.body);

      if (!stripe)
        return res.status(503).json({
          success: false,
          message: "Stripe is not configured",
        });

      const order = await db.order.findUnique({ where: { id: orderId } });
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      if (order.userId !== req.user!.userId)
        return res.status(403).json({ success: false, message: "Forbidden" });

      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (
        paymentIntent.metadata?.orderId !== order.id ||
        paymentIntent.metadata?.userId !== req.user!.userId
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment does not match this order",
        });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          success: false,
          message: `Payment is ${paymentIntent.status}`,
        });
      }

      const updatedOrder = await db.$transaction(async (tx) => {
        return applyOrderStatusTransition(tx, order, "CONFIRMED", {
          stripePaymentId: paymentIntent.id,
        });
      });

      deleteCart(order.userId).catch((err) => {
        console.warn("Failed to clear cart after payment confirmation:", err);
      });

      res.json({ success: true, data: updatedOrder });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/payments/webhook - Stripe webhook (raw body)
router.post("/webhook", async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers["stripe-signature"] as string;
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({
      success: false,
      message: "Stripe is not configured",
    });
  }

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

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as any;
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          const order = await db.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order) {
            await db.$transaction(async (tx) => {
              return applyOrderStatusTransition(tx, order, "CONFIRMED", {
                stripePaymentId: pi.id,
              });
            });

            deleteCart(order.userId).catch((err) => {
              console.warn("Failed to clear cart after payment webhook:", err);
            });
          }
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as any;
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          const order = await db.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order) {
            await db.$transaction(async (tx) => {
              return applyOrderStatusTransition(tx, order, "CANCELLED");
            });
          }
        }
        break;
      }
    }
  } catch (err) {
    return next(err);
  }

  res.json({ received: true });
});

export default router;
