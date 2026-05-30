import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin user ────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await db.user.upsert({
    where: { email: 'admin@boutique.com' },
    update: {},
    create: {
      email: 'admin@boutique.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Boutique',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user:', admin.email);

  // ── Test customer ─────────────────────────────────────────
  const customerPassword = await bcrypt.hash('Customer@1234', 12);
  const customer = await db.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'CUSTOMER',
    },
  });
  console.log('✅ Customer user:', customer.email);

  // ── Categories ────────────────────────────────────────────
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: 'women' },
      update: {},
      create: { name: 'Women', slug: 'women', description: "Women's fashion", position: 0 },
    }),
    db.category.upsert({
      where: { slug: 'men' },
      update: {},
      create: { name: 'Men', slug: 'men', description: "Men's fashion", position: 1 },
    }),
    db.category.upsert({
      where: { slug: 'shoes' },
      update: {},
      create: { name: 'Shoes', slug: 'shoes', description: 'Footwear for all', position: 2 },
    }),
    db.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories', description: 'Bags, belts & more', position: 3 },
    }),
  ]);
  console.log('✅ Categories created:', categories.map((c) => c.name).join(', '));

  // ── Sample products ───────────────────────────────────────
  const shoesCategory = categories.find((c) => c.slug === 'shoes')!;
  const womenCategory = categories.find((c) => c.slug === 'women')!;

  await db.product.upsert({
    where: { slug: 'classic-white-sneakers' },
    update: {},
    create: {
      name: 'Classic White Sneakers',
      slug: 'classic-white-sneakers',
      description: 'Timeless white sneakers that go with everything. Premium leather upper, cushioned sole for all-day comfort.',
      price: 89.99,
      comparePrice: 120.00,
      categoryId: shoesCategory.id,
      tags: ['sneakers', 'white', 'casual', 'leather'],
      material: 'Premium Leather',
      isPublished: true,
      isFeatured: true,
      variants: {
        create: [
          { size: '37', color: 'White', colorHex: '#FFFFFF', sku: 'SNK-WHT-37', stock: 15 },
          { size: '38', color: 'White', colorHex: '#FFFFFF', sku: 'SNK-WHT-38', stock: 20 },
          { size: '39', color: 'White', colorHex: '#FFFFFF', sku: 'SNK-WHT-39', stock: 18 },
          { size: '40', color: 'White', colorHex: '#FFFFFF', sku: 'SNK-WHT-40', stock: 12 },
          { size: '41', color: 'White', colorHex: '#FFFFFF', sku: 'SNK-WHT-41', stock: 8 },
        ],
      },
    },
  });

  await db.product.upsert({
    where: { slug: 'floral-summer-dress' },
    update: {},
    create: {
      name: 'Floral Summer Dress',
      slug: 'floral-summer-dress',
      description: 'Light and breezy floral dress perfect for summer days. Made from 100% breathable cotton.',
      price: 65.00,
      comparePrice: 85.00,
      categoryId: womenCategory.id,
      tags: ['dress', 'summer', 'floral', 'cotton'],
      material: '100% Cotton',
      isPublished: true,
      isFeatured: true,
      variants: {
        create: [
          { size: 'XS', color: 'Blue Floral', colorHex: '#4A90D9', sku: 'DRS-BLF-XS', stock: 10 },
          { size: 'S', color: 'Blue Floral', colorHex: '#4A90D9', sku: 'DRS-BLF-S', stock: 15 },
          { size: 'M', color: 'Blue Floral', colorHex: '#4A90D9', sku: 'DRS-BLF-M', stock: 20 },
          { size: 'L', color: 'Blue Floral', colorHex: '#4A90D9', sku: 'DRS-BLF-L', stock: 12 },
          { size: 'XL', color: 'Blue Floral', colorHex: '#4A90D9', sku: 'DRS-BLF-XL', stock: 6 },
        ],
      },
    },
  });

  // ── Discount codes ────────────────────────────────────────
  await db.discountCode.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off your first order',
      type: 'PERCENT',
      value: 10,
      isActive: true,
    },
  });

  await db.discountCode.upsert({
    where: { code: 'SAVE20' },
    update: {},
    create: {
      code: 'SAVE20',
      description: '$20 off orders over $100',
      type: 'FIXED',
      value: 20,
      minOrder: 100,
      isActive: true,
    },
  });

  console.log('✅ Sample products and discount codes created');
  console.log('\n🎉 Seed complete!');
  console.log('   Admin: admin@boutique.com / Admin@1234');
  console.log('   Customer: customer@example.com / Customer@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
