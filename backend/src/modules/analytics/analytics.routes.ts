import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { db } from '../../config/database';
import type { OrderStatus } from '@prisma/client';

const router = Router();
const PAID_ORDER_STATUSES: OrderStatus[] = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

// GET /api/analytics/overview
router.get('/overview', authenticate, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalOrders, totalRevenue, totalUsers, totalProducts] = await Promise.all([
      db.order.count({ where: { status: { in: PAID_ORDER_STATUSES } } }),
      db.order.aggregate({ _sum: { total: true }, where: { status: { in: PAID_ORDER_STATUSES } } }),
      db.user.count({ where: { role: 'CUSTOMER' } }),
      db.product.count({ where: { isPublished: true } }),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentOrders, recentRevenue] = await Promise.all([
      db.order.count({ where: { createdAt: { gte: thirtyDaysAgo }, status: { in: PAID_ORDER_STATUSES } } }),
      db.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: thirtyDaysAgo }, status: { in: PAID_ORDER_STATUSES } },
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
      where: { createdAt: { gte: since }, status: { in: PAID_ORDER_STATUSES } },
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
    const paidItems = await db.orderItem.findMany({
      where: { order: { status: { in: PAID_ORDER_STATUSES } } },
      select: {
        productId: true,
        quantity: true,
        unitPrice: true,
        product: { select: { id: true, name: true, slug: true, images: { take: 1 } } },
      },
    });

    const stats = new Map<string, {
      productId: string;
      _sum: { quantity: number; unitPrice: number };
      _count: { productId: number };
      revenue: number;
      product: (typeof paidItems)[number]['product'];
    }>();

    for (const item of paidItems) {
      const stat = stats.get(item.productId) || {
        productId: item.productId,
        _sum: { quantity: 0, unitPrice: 0 },
        _count: { productId: 0 },
        revenue: 0,
        product: item.product,
      };
      const unitPrice = Number(item.unitPrice);
      stat._sum.quantity += item.quantity;
      stat._sum.unitPrice += unitPrice;
      stat._count.productId += 1;
      stat.revenue += unitPrice * item.quantity;
      stats.set(item.productId, stat);
    }

    const result = Array.from(stats.values())
      .sort((a, b) => b._sum.quantity - a._sum.quantity)
      .slice(0, 10);

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
