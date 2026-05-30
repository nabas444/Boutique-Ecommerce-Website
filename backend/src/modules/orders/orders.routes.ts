import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { db } from '../../config/database';
import { z } from 'zod';
import { AppError } from '../../middleware/error.middleware';
import { getCart, deleteCart } from '../../config/redis';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// GET /api/orders — list user orders (admin sees all)
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const where = isAdmin ? {} : { userId: req.user!.userId };
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: { include: { product: { select: { name: true, images: { take: 1 } } } } },
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    res.json({ success: true, data: { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
});

// GET /api/orders/:id — single order
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await db.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, images: { take: 1 } } },
            variant: true,
          },
        },
        address: true,
        discount: true,
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }

    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

// POST /api/orders — checkout (creates order from cart)
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      addressId: z.string().uuid(),
      discountCode: z.string().optional(),
      notes: z.string().optional(),
    });

    const { addressId, discountCode, notes } = schema.parse(req.body);
    const userId = req.user!.userId;

    // Verify address belongs to user
    const address = await db.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new AppError('Address not found', 404);

    // Get cart from Redis
    const cart = await getCart(userId);
    if (!cart.items?.length) throw new AppError('Cart is empty', 400);

    // Validate all variants & stock
    const variantIds = cart.items.map((i: any) => i.variantId);
    const variants = await db.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { id: true, name: true, price: true, isPublished: true } } },
    });

    for (const item of cart.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant || !variant.isActive || !variant.product.isPublished) {
        throw new AppError(`Product "${variant?.product?.name}" is no longer available`, 400);
      }
      if (variant.stock < item.quantity) {
        throw new AppError(`Not enough stock for "${variant.product.name}"`, 400);
      }
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = cart.items.map((item: any) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const unitPrice = Number(variant.product.price) + Number(variant.priceModifier);
      subtotal += unitPrice * item.quantity;
      return {
        variantId: item.variantId,
        productId: variant.product.id,
        quantity: item.quantity,
        unitPrice,
      };
    });

    // Apply discount
    let discountAmount = 0;
    let discountId: string | undefined;
    if (discountCode) {
      const discount = await db.discountCode.findUnique({
        where: { code: discountCode.toUpperCase() },
      });
      if (
        discount &&
        discount.isActive &&
        (!discount.expiresAt || discount.expiresAt > new Date()) &&
        (!discount.usesLimit || discount.usesCount < discount.usesLimit) &&
        (!discount.minOrder || subtotal >= Number(discount.minOrder))
      ) {
        discountId = discount.id;
        discountAmount =
          discount.type === 'PERCENT'
            ? (subtotal * Number(discount.value)) / 100
            : Math.min(Number(discount.value), subtotal);
      }
    }

    const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping over 500
    const total = subtotal - discountAmount + shippingCost;

    // Create order + decrement stock in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          subtotal,
          discountAmount,
          shippingCost,
          total,
          discountId,
          addressId,
          notes,
          status: 'PENDING',
          items: { create: orderItems },
        },
        include: { items: true },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Increment discount usage
      if (discountId) {
        await tx.discountCode.update({
          where: { id: discountId },
          data: { usesCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    // Clear cart
    await deleteCart(userId);

    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
});

// PATCH /api/orders/:id/status — admin update status
router.patch('/:id/status', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, trackingNumber } = z.object({
      status: z.enum(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
      trackingNumber: z.string().optional(),
    }).parse(req.body);

    const order = await db.order.update({
      where: { id: req.params.id },
      data: {
        status,
        trackingNumber,
        shippedAt: status === 'SHIPPED' ? new Date() : undefined,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
      },
      include: { user: true },
    });

    // Fire shipping email (non-blocking)
    if (status === 'SHIPPED' && trackingNumber && order.user) {
      import('../../utils/email')
        .then(({ sendShippingEmail }) =>
          sendShippingEmail(order.user.email, order.user.firstName, order.id, trackingNumber)
        )
        .catch(() => {});
    }

    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

// GET /api/orders/cart — get cart
router.get('/cart/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await getCart(req.user!.userId);
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
});

export default router;
