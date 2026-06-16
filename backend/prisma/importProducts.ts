import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const ENDPOINTS = [
  { url: 'https://dummyjson.com/products/category/womens-dresses', slug: 'women' },
  { url: 'https://dummyjson.com/products/category/womens-tops', slug: 'women' },
  { url: 'https://dummyjson.com/products/category/mens-shirts', slug: 'men' },
  { url: 'https://dummyjson.com/products/category/mens-shoes', slug: 'shoes' },
  { url: 'https://dummyjson.com/products/category/womens-shoes', slug: 'shoes' },
  { url: 'https://dummyjson.com/products/category/womens-watches', slug: 'accessories' },
  { url: 'https://dummyjson.com/products/category/mens-watches', slug: 'accessories' },
  { url: 'https://dummyjson.com/products/category/womens-bags', slug: 'accessories' },
  { url: 'https://dummyjson.com/products/category/sunglasses', slug: 'accessories' },
];
function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
async function main() {
  for (const ep of ENDPOINTS) {
    const cat = await db.category.findUnique({ where: { slug: ep.slug } });
    if (!cat) { console.log(`Category ${ep.slug} not found`); continue; }
    const res = await fetch(ep.url);
    const data = await res.json() as any;
    for (const p of data.products) {
      const slug = toSlug(p.title);
      const exists = await db.product.findUnique({ where: { slug } });
      if (exists) { console.log(`Skipping ${slug}`); continue; }
      await db.product.create({
        data: {
          name: p.title, slug,
          description: p.description,
          price: p.price,
          comparePrice: Math.round(p.price * 1.3 * 100) / 100,
          categoryId: cat.id,
          isPublished: true,
          isFeatured: false,
          tags: p.tags || [],
          images: { create: [{ url: p.thumbnail, isPrimary: true }] },
          variants: { create: [{ size: 'ONE SIZE', color: 'Default', colorHex: '#000000', sku: slug.substring(0, 20).toUpperCase(), stock: p.stock || 10, priceModifier: 0, isActive: true }] }
        }
      });
      console.log(`Imported ${p.title} -> ${ep.slug}`);
    }
  }
  console.log('Done!');
  await db.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
