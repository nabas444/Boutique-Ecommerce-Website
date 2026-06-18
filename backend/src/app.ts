import path from "path";
import fs from "fs";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (!key || process.env[key] !== undefined) continue;

    const value = valueParts
      .join("=")
      .trim()
      .replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

loadEnvFile(path.resolve(__dirname, "../../.env"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { db } from "./config/database";
import { redis } from "./config/redis";
import { errorMiddleware } from "./middleware/error.middleware";
import { rateLimiter } from "./middleware/rateLimit.middleware";

// Routes
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/products.routes";
import categoryRoutes from "./modules/products/categories.routes";
import imageRoutes from "./modules/products/images.routes";
import orderRoutes from "./modules/orders/orders.routes";
import cartRoutes from "./modules/orders/cart.routes";
import paymentRoutes from "./modules/payments/payments.routes";
// chatRoutes removed per feature cleanup
import aiRoutes from "./modules/ai/ai.routes";
import reviewRoutes from "./modules/reviews/reviews.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import discountRoutes from "./modules/discounts/discounts.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import userRoutes from "./modules/auth/user.routes";

const app = express();
const httpServer = createServer(app);

// Socket.IO/chat initialization removed (internal support chat feature deleted)

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5174",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(morgan("dev"));
app.use(cookieParser());

// Raw body for Stripe webhooks (must come BEFORE express.json)
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use("/api", rateLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", imageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", cartRoutes); // cart routes first (more specific paths)
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/analytics", analyticsRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000;

async function bootstrap() {
  try {
    if (!process.env.SKIP_STARTUP_CHECKS) {
      await db.$connect();
      console.log("✅ PostgreSQL connected");

      await redis.ping();
      console.log("✅ Redis connected");
    } else {
      console.log(
        "⚠️ SKIP_STARTUP_CHECKS is set — skipping DB/Redis connections for local dev",
      );
    }

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.IO ready`);
      console.log(`🌿 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await db.$disconnect();
  await redis.quit();
  process.exit(0);
});

bootstrap();

export default app;
