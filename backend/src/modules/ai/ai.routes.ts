import { Router, Request, Response, NextFunction } from "express";
import { llmReply, fallbackProductSuggestions } from "./ai.service";
import { authenticate } from "../../middleware/auth.middleware";

// Local FAQ / intent matcher: answers common customer questions without calling LLMs.
function getLocalAnswer(rawPrompt: string): string | null {
  const q = String(rawPrompt || "")
    .trim()
    .toLowerCase();
  if (!q) return null;

  if (/return|refund|exchange|return policy/.test(q)) {
    return (
      "Our returns policy: you can return most items within 30 days in original condition. " +
      "Start a return at /returns or contact support at /contact for help."
    );
  }

  if (/shipping|delivery|ship|delivery time|how long/.test(q)) {
    return (
      "Shipping: standard delivery takes 3-7 business days. Expedited options are available at checkout. " +
      "See full info at /shipping."
    );
  }

  if (/order status|track|where is my order|tracking/.test(q)) {
    return (
      "To track your order, visit /orders and enter your order number, or sign in to your account at /profile. " +
      "If you need help, contact support at /contact."
    );
  }

  if (/payment|card|charge|billing|refund charge/.test(q)) {
    return "Payment issues: we accept major cards and Stripe. For billing or refunds contact support at /contact and include your order number.";
  }

  if (/size|sizing|fit|measure/.test(q)) {
    return "Sizing: check the Size Guide at /size-guide for measurements and fit tips. If you're between sizes, we recommend sizing up.";
  }

  if (/store hours|open|location/.test(q)) {
    return "We are online 24/7 — for physical store info, see /contact or our Press page.";
  }

  if (/discount|coupon|promo|sale/.test(q)) {
    return "Promotions: discounts and coupon codes are applied at checkout when eligible. See current offers on the Home page banner.";
  }

  // short polite fallback for simple conversational prompts
  if (/^how are you\?|^how are you$|^what's up|^whats up/.test(q)) {
    return "I'm here to help — ask me about products, orders, shipping, or returns.";
  }

  return null;
}

const router = Router();

// POST /api/ai/reply — returns an LLM reply for the provided `prompt`.
router.post(
  "/reply",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prompt } = req.body;
      if (!prompt || !String(prompt).trim())
        return res
          .status(400)
          .json({ success: false, error: "prompt required" });
      // Quick local handler for very short conversational prompts (greetings)
      const raw = String(prompt).trim();
      const low = raw.toLowerCase();
      if (/^hi$|^hello$|^hey$|^hi there$/.test(low) || low.length <= 4) {
        return res.json({
          success: true,
          data: {
            reply:
              "Hi! I'm Boutique Assistant — I can help you find products, check orders, or answer questions about shipping. How can I help you today?",
          },
        });
      }
      // Local FAQ/intent handler
      const local = getLocalAnswer(raw);
      if (local) return res.json({ success: true, data: { reply: local } });
      try {
        const reply = await llmReply(String(prompt), req.user?.userId);
        return res.json({ success: true, data: { reply } });
      } catch (e) {
        // LLM unavailable — fallback to DB product suggestions
        const products = await fallbackProductSuggestions(String(prompt));
        if (products.length > 0) {
          const text = products
            .map((p: any) => `- ${p.name} — /products/${p.slug}`)
            .join("\n");
          const reply = `I couldn't reach the AI assistant, but here are some products that might help:\n${text}`;
          return res.json({ success: true, data: { reply } });
        }
        // No LLM and no product suggestions available — return a helpful fallback.
        return res.json({
          success: true,
          data: {
            reply:
              "I couldn't reach the AI assistant right now. Meanwhile I can help with:\n- Returns & refunds: /returns\n- Shipping & tracking: /shipping\n- Order status & tracking: /orders\n- Size guide & sizing help: /size-guide\nIf you'd like, contact support via /contact and include your question — I can also log your question so a team member follows up.",
          },
        });
      }
    } catch (err) {
      next(err);
    }
  },
);

// Public endpoint for widget use (no authentication) — uses same LLM/fallback logic
router.post(
  "/reply/public",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prompt } = req.body;
      if (!prompt || !String(prompt).trim())
        return res
          .status(400)
          .json({ success: false, error: "prompt required" });
      // Quick local handler for very short conversational prompts (greetings)
      const raw = String(prompt).trim();
      const low = raw.toLowerCase();
      if (/^hi$|^hello$|^hey$|^hi there$/.test(low) || low.length <= 4) {
        return res.json({
          success: true,
          data: {
            reply:
              "Hi! I'm Boutique Assistant — I can help you find products, check orders, or answer questions about shipping. How can I help you today?",
          },
        });
      }
      // Local FAQ/intent handler
      const local = getLocalAnswer(raw);
      if (local) return res.json({ success: true, data: { reply: local } });
      try {
        const reply = await llmReply(String(prompt), undefined);
        return res.json({ success: true, data: { reply } });
      } catch (e) {
        const products = await fallbackProductSuggestions(String(prompt));
        if (products.length > 0) {
          const text = products
            .map((p: any) => `- ${p.name} — /products/${p.slug}`)
            .join("\n");
          const reply = `I couldn't reach the AI assistant, but here are some products that might help:\n${text}`;
          return res.json({ success: true, data: { reply } });
        }
        // Public fallback: provide links and next steps so users aren't left stranded.
        return res.json({
          success: true,
          data: {
            reply:
              "I couldn't reach the AI assistant right now. Meanwhile I can help with:\n- Returns & refunds: /returns\n- Shipping & tracking: /shipping\n- Order status & tracking: /orders\n- Size guide & sizing help: /size-guide\nYou can also contact support at /contact — if you want, paste your full question and we'll follow up.",
          },
        });
      }
    } catch (err) {
      next(err);
    }
  },
);

export default router;
