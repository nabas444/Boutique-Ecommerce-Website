import { Router, Request, Response, NextFunction } from "express";
import { llmReply, fallbackProductSuggestions } from "./ai.service";
import { authenticate } from "../../middleware/auth.middleware";

const HELP_SUGGESTIONS = [
  "What are your shipping options?",
  "How do returns and refunds work?",
  "Can you help me choose a size?",
  "How can I track my order?",
  "What payment methods do you accept?",
  "Can you suggest an outfit for an occasion?",
];

function getSuggestionReply() {
  return (
    "Hi! I can help with common Boutique questions. You can ask me things like:\n" +
    HELP_SUGGESTIONS.map((item) => `- ${item}`).join("\n") +
    "\n\nTell me what you need help with, and I will guide you."
  );
}

const FAQ_TOPICS: { patterns: RegExp[]; answer: string }[] = [
  {
    patterns: [/return/, /refund/, /exchange/, /send.*back/, /money back/],
    answer:
      "Returns and exchanges: most items can be returned within 30 days if they are unused and in original condition. Start from /returns or contact support at /contact with your order number.",
  },
  {
    patterns: [
      /change.*address/,
      /update.*address/,
      /wrong address/,
      /delivery address/,
      /shipping address/,
    ],
    answer:
      "Address changes: contact /contact as soon as possible with your order number and the correct address. If the order has not shipped yet, the team may be able to update it.",
  },
  {
    patterns: [
      /shipping/,
      /delivery/,
      /\bship\b/,
      /deliver/,
      /how long/,
      /arrival/,
      /eta/,
    ],
    answer:
      "Shipping: standard delivery usually takes 3-7 business days, and expedited options may be available at checkout. Orders over $100 qualify for free shipping.",
  },
  {
    patterns: [
      /track/,
      /tracking/,
      /order status/,
      /where.*order/,
      /where is my package/,
    ],
    answer:
      "Order tracking: sign in and open /orders to check your order status. If you have a tracking number, use the carrier link in your confirmation email.",
  },
  {
    patterns: [/payment/, /card/, /checkout/, /billing/, /charge/, /stripe/, /pay/],
    answer:
      "Payments: Boutique accepts major cards through secure Stripe checkout. If a charge fails, check your card details, billing address, and bank authorization, then try again.",
  },
  {
    patterns: [
      /size/,
      /sizing/,
      /fit/,
      /measure/,
      /measurement/,
      /too small/,
      /too large/,
    ],
    answer:
      "Sizing help: check /size-guide for measurements. If you are between sizes, choose the larger size for relaxed fits or the smaller size for a closer fit.",
  },
  {
    patterns: [/discount/, /coupon/, /promo/, /promotion/, /sale/, /offer/, /10%/],
    answer:
      "Discounts: eligible promo codes are applied at checkout. Check the home page and sale sections for current offers, and make sure the code has not expired.",
  },
  {
    patterns: [/cancel/, /change.*order/, /edit.*order/, /address change/],
    answer:
      "Order changes: contact /contact as soon as possible with your order number. If the order has not shipped yet, the team may be able to help update or cancel it.",
  },
  {
    patterns: [/damaged/, /defective/, /wrong item/, /missing item/, /broken/, /not what i ordered/],
    answer:
      "Issue with an item: please contact /contact with your order number, a short description, and photos if the item arrived damaged or incorrect.",
  },
  {
    patterns: [/account/, /login/, /sign in/, /password/, /reset/, /profile/],
    answer:
      "Account help: sign in from /login, manage your profile at /profile, or use password reset if you cannot access your account.",
  },
  {
    patterns: [/wishlist/, /favorite/, /save item/, /saved item/],
    answer:
      "Wishlist: sign in, then use the wishlist button on products you want to save. You can return later to compare favorites before buying.",
  },
  {
    patterns: [
      /stock/,
      /available/,
      /availability/,
      /restock/,
      /sold out/,
      /out of stock/,
    ],
    answer:
      "Availability: product pages show current stock when available. If an item is sold out, check similar categories or ask me for alternatives by color, size, or occasion.",
  },
  {
    patterns: [/care/, /wash/, /washing/, /clean/, /fabric/, /material/],
    answer:
      "Care guidance: follow the care label on the item first. For delicate pieces, use cold water, gentle cycles, and air drying unless the product label says otherwise.",
  },
  {
    patterns: [
      /recommend/,
      /suggest/,
      /style/,
      /outfit/,
      /occasion/,
      /wedding/,
      /party/,
      /work/,
      /casual/,
    ],
    answer:
      "Style help: tell me the occasion, preferred color, size, budget, and whether you want something casual, work-ready, formal, or party-ready. I can suggest what to browse.",
  },
  {
    patterns: [/contact/, /support/, /help center/, /customer service/, /human/, /agent/],
    answer:
      "Support: for order-specific help, use /contact and include your order number. I can still help with general questions about products, shipping, returns, sizing, and checkout.",
  },
  {
    patterns: [/privacy/, /secure/, /security/, /safe/, /data/],
    answer:
      "Security: checkout is handled through Stripe, and account actions require authentication. Avoid sharing card numbers or passwords in chat.",
  },
];

// Local FAQ / intent matcher: answers common customer questions without calling LLMs.
function getLocalAnswer(rawPrompt: string): string | null {
  const q = String(rawPrompt || "")
    .trim()
    .toLowerCase();
  if (!q) return null;

  if (
    /^(hi|hello|hey|hi there)$/.test(q) ||
    /what can you do|help|faq|questions|topics|support/.test(q) ||
    /^how are you\??$|^what's up|^whats up/.test(q)
  )
    return getSuggestionReply();

  const matchedTopic = FAQ_TOPICS.find((topic) =>
    topic.patterns.some((pattern) => pattern.test(q)),
  );
  if (matchedTopic) return matchedTopic.answer;

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
      const earlyLocal = getLocalAnswer(raw);
      if (earlyLocal)
        return res.json({ success: true, data: { reply: earlyLocal } });
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
        const products = await fallbackProductSuggestions(String(prompt)).catch(
          (err) => {
            console.warn("Product fallback unavailable", err?.message || err);
            return [];
          },
        );
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
      const earlyLocal = getLocalAnswer(raw);
      if (earlyLocal)
        return res.json({ success: true, data: { reply: earlyLocal } });
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
        const products = await fallbackProductSuggestions(String(prompt)).catch(
          (err) => {
            console.warn("Product fallback unavailable", err?.message || err);
            return [];
          },
        );
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
