import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { db } from '../../config/database';
import { getCart, setCart, deleteCart } from '../../config/redis';
import { z } from 'zod';

const router = Router();

// GET /api/orders/cart/me
router.get('/cart/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await getCart(req.user!.userId);
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
});

// POST /api/orders/cart/items
router.post('/cart/items', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variantId, quantity } = z.object({ variantId: z.string(), quantity: z.number().int().min(1).default(1) }).parse(req.body);
    const cart = await getCart(req.user!.userId);
    const existing = cart.items.find((i: any) => i.variantId === variantId);

    const variant = await db.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { name: true, slug: true, price: true, images: { where: { isPrimary: true }, take: 1 } } } },
    });
    if (!variant) return res.status(404).json({ success: false, message: 'Variant not found' });

    const unitPrice = Number(variant.product.price) + Number(variant.priceModifier);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        variantId, quantity, unitPrice,
        productName: variant.product.name,
        productSlug: variant.product.slug,
        imageUrl: variant.product.images?.[0]?.url,
        color: variant.color,
        size: variant.size,
      });
    }

    await setCart(req.user!.userId, cart);
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
});

// PUT /api/orders/cart/items/:variantId
router.put('/cart/items/:variantId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = z.object({ quantity: z.number().int().min(1) }).parse(req.body);
    const cart = await getCart(req.user!.userId);
    const item = cart.items.find((i: any) => i.variantId === req.params.variantId);
    if (item) item.quantity = quantity;
    await setCart(req.user!.userId, cart);
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
});

// DELETE /api/orders/cart/items/:variantId
router.delete('/cart/items/:variantId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await getCart(req.user!.userId);
    cart.items = cart.items.filter((i: any) => i.variantId !== req.params.variantId);
    await setCart(req.user!.userId, cart);
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
});

// POST /api/orders/cart/details — enrich cart items with product info
router.post('/cart/details', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variantIds } = z.object({ variantIds: z.array(z.string()) }).parse(req.body);
    const variants = await db.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { name: true, slug: true, price: true, images: { where: { isPrimary: true }, take: 1 } } } },
    });
    const result = variants.map(v => ({
      variantId: v.id,
      unitPrice: Number(v.product.price) + Number(v.priceModifier),
      productName: v.product.name,
      productSlug: v.product.slug,
      imageUrl: v.product.images?.[0]?.url,
      color: v.color,
      size: v.size,
      stock: v.stock,
    }));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
