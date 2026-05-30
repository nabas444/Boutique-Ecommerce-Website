import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { db } from '../../config/database';
import { z } from 'zod';
import { generateSlug } from '../../utils/slug';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  position: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// GET /api/categories
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await db.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
});

// POST /api/categories (admin)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.parse(req.body);
    const slug = await generateSlug(data.name, async s => !!(await db.category.findUnique({ where: { slug: s } })));
    const cat = await db.category.create({ data: { ...data, slug } });
    res.status(201).json({ success: true, data: cat });
  } catch (err) { next(err); }
});

// PUT /api/categories/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const cat = await db.category.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
});

export default router;
