import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { db } from '../../config/database';
import { z } from 'zod';

const router = Router();

const discountSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.number().positive(),
  minOrder: z.number().positive().optional(),
  usesLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
});

// POST /api/discounts/apply — validate code at checkout
router.post('/apply', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderTotal } = z.object({
      code: z.string(),
      orderTotal: z.number().positive(),
    }).parse(req.body);

    const discount = await db.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount || !discount.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or expired discount code' });
    }
    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Discount code has expired' });
    }
    if (discount.usesLimit && discount.usesCount >= discount.usesLimit) {
      return res.status(400).json({ success: false, message: 'Discount code usage limit reached' });
    }
    if (discount.minOrder && orderTotal < Number(discount.minOrder)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ${discount.minOrder} required`,
      });
    }

    const discountAmount =
      discount.type === 'PERCENT'
        ? (orderTotal * Number(discount.value)) / 100
        : Math.min(Number(discount.value), orderTotal);

    res.json({
      success: true,
      data: { discount, discountAmount, finalTotal: orderTotal - discountAmount },
    });
  } catch (err) { next(err); }
});

// Admin routes
router.get('/', authenticate, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const discounts = await db.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: discounts });
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = discountSchema.parse(req.body);
    const discount = await db.discountCode.create({
      data: { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined },
    });
    res.status(201).json({ success: true, data: discount });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const discount = await db.discountCode.update({ where: { id: req.params.id }, data: { isActive } });
    res.json({ success: true, data: discount });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.discountCode.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Discount deleted' });
  } catch (err) { next(err); }
});

export default router;
