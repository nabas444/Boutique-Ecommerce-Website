import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { db } from '../../config/database';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', authenticate, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalOrders, totalRevenue, totalUsers, totalProducts] = await Promise.all([
      db.order.count(),
      db.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      db.user.count({ where: { role: 'CUSTOMER' } }),
      db.product.count({ where: { isPublished: true } }),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentOrders, recentRevenue] = await Promise.all([
      db.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders, totalUsers, totalProducts,
        totalRevenue: totalRevenue._sum.total || 0,
        last30Days: {
          orders: recentOrders,
          revenue: recentRevenue._sum.total || 0,
        },
      },
    });
  } catch (err) { next(err); }
});

// GET /api/analytics/revenue?period=7|30|90
router.get('/revenue', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Number(req.query.period) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await db.order.findMany({
      where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const grouped: Record<string, number> = {};
    for (const order of orders) {
      const date = order.createdAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + Number(order.total);
    }

    const chart = Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
    res.json({ success: true, data: chart });
  } catch (err) { next(err); }
});

// GET /api/analytics/top-products
router.get('/top-products', authenticate, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const topProducts = await db.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, unitPrice: true },
      _count: { productId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const productIds = topProducts.map((p) => p.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true, images: { take: 1 } },
    });

    const result = topProducts.map((stat) => ({
      ...stat,
      product: products.find((p) => p.id === stat.productId),
    }));

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// GET /api/analytics/orders-by-status
router.get('/orders-by-status', authenticate, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const statuses = await db.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    res.json({ success: true, data: statuses });
  } catch (err) { next(err); }
});

export default router;
