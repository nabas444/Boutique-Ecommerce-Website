import { db } from "../../config/database";

// Lightweight LLM service with OpenAI primary and Grok fallback for embeddings
// and simple completion. Keeps dependency usage minimal by using existing OpenAI
// client pattern found elsewhere in the codebase.

let openai: any = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "dummy_key") {
  try {
    // @ts-ignore
    const { default: OpenAI } = require("openai");
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (err) {
    console.warn("OpenAI initialization failed", err);
    openai = null;
  }
}

// Optional Google Gemini/Vertex-style configuration. For safety the code
// only attempts a Gemini call when both `GEMINI_API_KEY` and
// `GEMINI_API_URL` are provided in the environment. Do NOT commit API keys
// to source control — set them in your environment or a secrets store.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;
const GEMINI_API_URL = process.env.GEMINI_API_URL || null;

const GROK_API_KEY =
  process.env.GROK_API_KEY || process.env.GROK_AUTH_KEY || null;
const GROK_COMPLETION_URL =
  process.env.GROK_COMPLETION_URL || "https://api.grok.ai/v1/completions";
// Hugging Face Inference API config (optional)
const HF_API_KEY = process.env.HF_API_KEY || null;
const HF_MODEL = process.env.HF_MODEL || "google/flan-t5-small";

export async function llmReply(prompt: string, userId?: string) {
  // Prefer Gemini if explicitly configured (user provided key + URL)
  if (GEMINI_API_KEY && GEMINI_API_URL) {
    try {
      const resp = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GEMINI_API_KEY}`,
        },
        body: JSON.stringify({ input: prompt }),
      });
      const body: any = await resp.json();
      // Try several likely response shapes used by generative APIs.
      if (body?.candidates && body.candidates[0]) {
        // Vertex/Gemini-like candidate structure
        const cand = body.candidates[0];
        if (typeof cand === "string") return String(cand).trim();
        if (cand?.content) {
          // content may be an array or object
          if (Array.isArray(cand.content) && cand.content[0]?.text)
            return String(cand.content[0].text).trim();
          if (cand.content?.text) return String(cand.content.text).trim();
        }
      }
      if (body?.output && typeof body.output === "string")
        return body.output.trim();
      if (body?.output && Array.isArray(body.output) && body.output[0]?.content)
        return String(body.output[0].content).trim();
    } catch (err) {
      console.warn("Gemini completion failed, falling back to other providers");
    }
  }
  // prefer OpenAI Chat completions when available
  if (openai) {
    try {
      const res: any = await openai.chat.completions.create({
        model: "gpt-4o-mini", // permissive default; will fall back if unavailable
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      });
      // Support both OpenAI response shapes
      const content =
        res?.choices?.[0]?.message?.content || res?.choices?.[0]?.text || "";
      return String(content).trim();
    } catch (e: any) {
      console.warn(
        "OpenAI chat completion failed, will try Grok",
        e?.message || e,
      );
    }
  }

  // Try Grok completion endpoint if configured
  // Try Hugging Face Inference API if configured
  if (HF_API_KEY) {
    try {
      const hfResp = await fetch(
        `https://api-inference.huggingface.co/models/${HF_MODEL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HF_API_KEY}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 256 },
          }),
        },
      );
      const hfBody: any = await hfResp.json();
      // Hugging Face responses vary by model; try common shapes
      if (Array.isArray(hfBody) && hfBody[0]?.generated_text)
        return String(hfBody[0].generated_text).trim();
      if (hfBody?.generated_text) return String(hfBody.generated_text).trim();
      if (typeof hfBody === "string") return hfBody.trim();
      // if HF returned an error, log and continue to next provider
      if (hfBody?.error)
        console.warn("Hugging Face inference error:", hfBody.error);
    } catch (err) {
      console.error("Hugging Face inference failed", err);
    }
  }

  if (GROK_API_KEY) {
    try {
      const resp = await fetch(GROK_COMPLETION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({ input: prompt }),
      });
      const body: any = await resp.json();
      // Grok may return `output` or `text` or OpenAI-like `choices`
      if (body?.output) return String(body.output).trim();
      if (body?.text) return String(body.text).trim();
      if (body?.choices && body.choices[0]?.text)
        return String(body.choices[0].text).trim();
    } catch (err) {
      console.error("Grok completion failed", err);
    }
  }

  throw new Error("No LLM available");
}

// Fallback helper: simple DB text search when LLMs are unavailable
export async function fallbackProductSuggestions(query: string) {
  const q = String(query || "").trim();
  if (!q) return [];
  const tokens = q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const where: any = { isPublished: true };
  if (tokens.length > 0) {
    where.AND = tokens.map((token: string) => ({
      OR: [
        { name: { contains: token, mode: "insensitive" } },
        { description: { contains: token, mode: "insensitive" } },
        { tags: { hasSome: [token.toLowerCase()] } },
      ],
    }));
  }

  const products = await db.product.findMany({
    where,
    select: { id: true, name: true, slug: true, price: true },
    take: 5,
  });
  return products;
}
