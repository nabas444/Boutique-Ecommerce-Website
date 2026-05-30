import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { db } from '../../config/database';

const router = Router();

// GET /api/wishlist
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db.wishlistItem.findMany({
      where: { userId: req.user!.userId },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, comparePrice: true,
            images: { take: 1 },
            variants: { where: { isActive: true }, take: 5 },
          },
        },
        variant: true,
      },
      orderBy: { addedAt: 'desc' },
    });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

// POST /api/wishlist/:productId
router.post('/:productId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await db.wishlistItem.upsert({
      where: { userId_productId: { userId: req.user!.userId, productId: req.params.productId } },
      create: { userId: req.user!.userId, productId: req.params.productId, variantId: req.body.variantId },
      update: {},
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.wishlistItem.deleteMany({
      where: { userId: req.user!.userId, productId: req.params.productId },
    });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) { next(err); }
});

export default router;
