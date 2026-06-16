import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function clean() {
  await db.productVariant.deleteMany({});
  await db.productImage.deleteMany({});
  await db.product.deleteMany({});
  console.log('All products deleted');
  await db.$disconnect();
}
clean();
