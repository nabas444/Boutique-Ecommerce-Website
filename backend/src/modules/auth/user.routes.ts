import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { db } from '../../config/database';
import { z } from 'zod';
import { AppError } from '../../middleware/error.middleware';
import { Request, Response, NextFunction } from 'express';

const router = Router();

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

const addressSchema = z.object({
  label: z.string().default('Home'),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().default('ET'),
  isDefault: z.boolean().default(false),
});

// GET /api/users/me
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, avatar: true, phone: true, createdAt: true,
        addresses: true,
        _count: { select: { orders: true, reviews: true, wishlist: true } },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PUT /api/users/me
router.put('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await db.user.update({
      where: { id: req.user!.userId },
      data,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, avatar: true, phone: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// GET /api/users/me/addresses
router.get('/me/addresses', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addresses = await db.address.findMany({ where: { userId: req.user!.userId } });
    res.json({ success: true, data: addresses });
  } catch (err) { next(err); }
});

// POST /api/users/me/addresses
router.post('/me/addresses', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = addressSchema.parse(req.body);
    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: req.user!.userId },
        data: { isDefault: false },
      });
    }
    const address = await db.address.create({
      data: { ...data, userId: req.user!.userId },
    });
    res.status(201).json({ success: true, data: address });
  } catch (err) { next(err); }
});

// DELETE /api/users/me/addresses/:id
router.delete('/me/addresses/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.address.deleteMany({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) { next(err); }
});

export default router;
