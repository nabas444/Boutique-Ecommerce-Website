import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  categoryId: z.string().uuid(),
  tags: z.array(z.string()).default([]),
  material: z.string().optional(),
  careInfo: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  variants: z.array(z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    colorHex: z.string().optional(),
    sku: z.string().min(1),
    stock: z.number().int().min(0),
    priceModifier: z.number().default(0),
    weight: z.number().optional(),
  })).min(1, 'At least one variant is required'),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sizes: z.string().optional(),       // comma-separated
  colors: z.string().optional(),      // comma-separated
  tags: z.string().optional(),        // comma-separated
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular', 'rating']).default('newest'),
  q: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
