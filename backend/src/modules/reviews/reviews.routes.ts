import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { db } from '../../config/database';
import { z } from 'zod';
import { AppError } from '../../middleware/error.middleware';

const router = Router();

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10, 'Review must be at least 10 characters'),
  images: z.array(z.string().url()).default([]),
});

// GET /api/reviews/product/:productId
router.get('/product/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const [reviews, total, agg] = await Promise.all([
      db.review.findMany({
        where: { productId: req.params.productId, isApproved: true },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.review.count({ where: { productId: req.params.productId, isApproved: true } }),
      db.review.aggregate({
        where: { productId: req.params.productId, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Rating distribution
    const distribution = await db.review.groupBy({
      by: ['rating'],
      where: { productId: req.params.productId, isApproved: true },
      _count: { rating: true },
    });

    res.json({
      success: true,
      data: {
        reviews,
        avgRating: agg._avg.rating,
        totalReviews: total,
        distribution,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) { next(err); }
});

// POST /api/reviews/product/:productId
router.post('/product/:productId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = reviewSchema.parse(req.body);
    const userId = req.user!.userId;
    const productId = req.params.productId;

    // Check if user purchased this product
    const purchased = await db.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: { in: ['DELIVERED', 'CONFIRMED'] } },
      },
    });

    const review = await db.review.create({
      data: { ...data, userId, productId, verifiedPurchase: !!purchased },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
});

// DELETE /api/reviews/:id
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await db.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }
    await db.review.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
});

// POST /api/reviews/:id/helpful
router.post('/:id/helpful', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await db.review.update({
      where: { id: req.params.id },
      data: { helpfulCount: { increment: 1 } },
    });
    res.json({ success: true, data: { helpfulCount: review.helpfulCount } });
  } catch (err) { next(err); }
});

export default router;
