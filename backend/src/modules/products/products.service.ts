import { db } from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
} from "./products.schema";
import { generateSlug } from "../../utils/slug";
// Create a safe, lazy OpenAI client only when a real key is present.
// This avoids startup crashes when the key is missing or set to 'dummy_key'.
let openai: any = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "dummy_key") {
  try {
    // Lazy require so missing package or environment doesn't crash startup
    // @ts-ignore
    const { default: OpenAI } = require("openai");
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (err) {
    // Fail safely by leaving `openai` as null if OpenAI package is missing
    console.warn("OpenAI client initialization failed", err);
    openai = null;
  }
} else {
  console.warn("OpenAI API key not configured");
  openai = null;
}

// Optional Grok embeddings fallback (configure `GROK_API_KEY` and optionally `GROK_EMBEDDING_URL` in .env)
const GROK_API_KEY =
  process.env.GROK_API_KEY || process.env.GROK_AUTH_KEY || null;
const GROK_EMBEDDING_URL =
  process.env.GROK_EMBEDDING_URL || "https://api.grok.ai/v1/embeddings";

async function fetchGrokEmbedding(text: string) {
  if (!GROK_API_KEY) throw new Error("Grok API key not configured");
  try {
    const res = await fetch(GROK_EMBEDDING_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({ input: text }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Grok embedding failed: ${res.status} ${txt}`);
    }
    const body: any = await res.json();
    // Expecting OpenAI-like shape: { data: [{ embedding: [...] }] }
    if (body?.data && Array.isArray(body.data) && body.data[0]?.embedding) {
      return body.data[0].embedding;
    }
    // Fallback: try common fields
    if (body?.embedding) return body.embedding;
    throw new Error("Grok embedding response missing embedding");
  } catch (err) {
    throw err;
  }
}

async function getEmbedding(text: string) {
  // Try OpenAI first if available
  if (openai) {
    try {
      const embeddingRes: any = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return embeddingRes.data[0].embedding;
    } catch (err: any) {
      // Only proceed to Grok on quota/rate-limit or network errors
      const code = err?.code || err?.status;
      const recoverable =
        code === 429 ||
        err?.type === "insufficient_quota" ||
        err?.message?.includes("RateLimit");
      if (!recoverable) throw err;
      console.warn(
        "OpenAI embedding failed, attempting Grok fallback",
        err?.message || err,
      );
      // fallthrough to Grok
    }
  }

  // Try Grok fallback if configured
  if (GROK_API_KEY) {
    try {
      const grokVec = await fetchGrokEmbedding(text);
      return grokVec;
    } catch (gErr) {
      console.error("Grok embedding failed", gErr);
      throw gErr;
    }
  }

  // No provider available
  throw new Error("No embeddings provider available");
}

// ─── Select shape reused across queries ────────────────────────────────────────
const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  comparePrice: true,
  tags: true,
  material: true,
  careInfo: true,
  isPublished: true,
  isFeatured: true,
  viewCount: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { position: "asc" as const } },
  variants: {
    where: { isActive: true },
    orderBy: { createdAt: "asc" as const },
  },
  _count: { select: { reviews: true, orderItems: true } },
};

// ─── List products with filters ────────────────────────────────────────────────
export async function getProducts(query: ProductQuery, isAdmin = false) {
  const {
    page,
    limit,
    category,
    minPrice,
    maxPrice,
    sizes,
    colors,
    tags,
    inStock,
    isFeatured,
    sortBy,
    q,
  } = query;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  if (!isAdmin) where.isPublished = true;
  if (isFeatured !== undefined) where.isFeatured = isFeatured;

  if (category) {
    where.category = { slug: category };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (tags) {
    where.tags = { hasSome: tags.split(",").map((t) => t.trim()) };
  }

  if (sizes || colors || inStock !== undefined) {
    const variantWhere: any = { isActive: true };
    if (sizes)
      variantWhere.size = { in: sizes.split(",").map((s) => s.trim()) };
    if (colors)
      variantWhere.color = { in: colors.split(",").map((c) => c.trim()) };
    if (inStock) variantWhere.stock = { gt: 0 };
    where.variants = { some: variantWhere };
  }

  // Text query search (name, description, tags, category).
  // Split into tokens and require ALL tokens (AND) across any of the searchable fields.
  if (q) {
    const qTrim = String(q).trim();
    if (qTrim) {
      const tokens = qTrim
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean);
      if (tokens.length > 0) {
        // For each token, create an OR clause that checks multiple fields.
        where.AND = tokens.map((token) => ({
          OR: [
            { name: { contains: token, mode: "insensitive" } },
            { description: { contains: token, mode: "insensitive" } },
            { tags: { hasSome: [token.toLowerCase()] } },
            { category: { name: { contains: token, mode: "insensitive" } } },
          ],
        }));
      }
    }
  }

  // Sort order
  const orderByMap: Record<string, any> = {
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    newest: { createdAt: "desc" },
    popular: { viewCount: "desc" },
    rating: { reviews: { _count: "desc" } },
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: productSelect,
      orderBy: orderByMap[sortBy] || { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  // Attach avg rating
  const enriched = await Promise.all(
    products.map(async (p) => {
      const agg = await db.review.aggregate({
        where: { productId: p.id },
        _avg: { rating: true },
      });
      return { ...p, avgRating: agg._avg.rating };
    }),
  );

  return {
    products: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get single product by slug ────────────────────────────────────────────────
export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    select: {
      ...productSelect,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      },
    },
  });

  if (!product) throw new AppError("Product not found", 404);

  // Increment view count (fire and forget)
  db.product
    .update({ where: { slug }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const agg = await db.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  // Related products (same category)
  const related = await db.product.findMany({
    where: {
      categoryId: (product as any).category?.id,
      isPublished: true,
      id: { not: product.id },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: { take: 1 },
    },
    take: 4,
  });

  return {
    ...product,
    avgRating: agg._avg.rating,
    reviewCount: agg._count.rating,
    related,
  };
}

// ─── AI semantic search ────────────────────────────────────────────────────────
export async function aiSearch(query: string, userId?: string) {
  // If API key is missing, is a dummy key, or client failed to initialize,
  // fallback to a safe text search.
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === "dummy_key" ||
    !openai
  ) {
    return textSearch(query);
  }

  let embedding: number[];
  try {
    embedding = await getEmbedding(query);
  } catch (err) {
    console.error("AI search embedding failed", err);
    return textSearch(query);
  }
  const vectorStr = `[${embedding.join(",")}]`;

  // pgvector cosine similarity search
  const results = await db.$queryRaw<{ id: string; similarity: number }[]>`
    SELECT id, 1 - (embedding <=> ${vectorStr}::vector) AS similarity
    FROM products
    WHERE is_published = true AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT 20
  `;

  const productIds = results.map((r) => r.id);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: productSelect,
  });

  // Sort by similarity score
  const ordered = productIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  // Log search for analytics
  if (userId) {
    db.aiSearch
      .create({
        data: { userId, query, resultIds: productIds },
      })
      .catch(() => {});
  }

  return ordered;
}

async function textSearch(query: string) {
  const qTrim = String(query || "").trim();
  if (!qTrim) return [];
  const tokens = qTrim
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  // Require ALL tokens (AND) but allow each token to match across several fields (OR)
  const whereClause: any = { isPublished: true };
  if (tokens.length > 0) {
    whereClause.AND = tokens.map((token) => ({
      OR: [
        { name: { contains: token, mode: "insensitive" } },
        { description: { contains: token, mode: "insensitive" } },
        { tags: { hasSome: [token.toLowerCase()] } },
        { category: { name: { contains: token, mode: "insensitive" } } },
      ],
    }));
  }

  return db.product.findMany({
    where: whereClause,
    select: productSelect,
    take: 20,
  });
}

// ─── Admin: Create product ─────────────────────────────────────────────────────
export async function createProduct(input: CreateProductInput) {
  const slug = await generateSlug(input.name, async (s) => {
    const exists = await db.product.findUnique({ where: { slug: s } });
    return !!exists;
  });

  const { variants, ...productData } = input;

  const product = await db.product.create({
    data: {
      ...productData,
      slug,
      price: productData.price,
      comparePrice: productData.comparePrice,
      variants: { create: variants },
    },
    select: productSelect,
  });

  // Generate embedding in the background
  generateAndStoreEmbedding(product.id, input.name, input.description).catch(
    console.error,
  );

  return product;
}

// ─── Admin: Update product ─────────────────────────────────────────────────────
export async function updateProduct(id: string, input: UpdateProductInput) {
  const { variants, ...productData } = input;

  const product = await db.product.update({
    where: { id },
    data: productData,
    select: productSelect,
  });

  // Regenerate embedding if name/description changed
  if (input.name || input.description) {
    generateAndStoreEmbedding(
      id,
      input.name || product.name,
      input.description || product.description,
    ).catch(console.error);
  }

  return product;
}

// ─── Admin: Delete product ─────────────────────────────────────────────────────
export async function deleteProduct(id: string) {
  await db.product.delete({ where: { id } });
}

// ─── Admin: Add images ────────────────────────────────────────────────────────
export async function addProductImages(
  productId: string,
  images: { url: string; publicId: string; alt?: string }[],
) {
  const existing = await db.productImage.count({ where: { productId } });
  await db.productImage.createMany({
    data: images.map((img, i) => ({
      productId,
      ...img,
      isPrimary: existing === 0 && i === 0,
      position: existing + i,
    })),
  });
  return db.productImage.findMany({
    where: { productId },
    orderBy: { position: "asc" },
  });
}

// ─── Embedding helper ─────────────────────────────────────────────────────────
async function generateAndStoreEmbedding(
  productId: string,
  name: string,
  description: string,
) {
  // If API key missing/dummy or client not initialized, skip embedding.
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === "dummy_key" ||
    !openai
  ) {
    return;
  }

  const text = `${name}. ${description}`.slice(0, 2000);
  let res: any;
  let vector: number[];
  try {
    vector = await getEmbedding(text);
  } catch (err) {
    console.error("Failed to generate embedding for product", productId, err);
    return;
  }
  await db.$executeRaw`
    UPDATE products
    SET embedding = ${`[${vector.join(",")}]`}::vector
    WHERE id = ${productId}
  `;
}
