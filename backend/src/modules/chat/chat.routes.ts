import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { db } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

const router = Router();

// GET /api/chat/rooms — customer gets own, admin gets all
router.get('/rooms', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    const rooms = await db.chatRoom.findMany({
      where: isAdmin ? {} : { userId: req.user!.userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ success: true, data: rooms });
  } catch (err) { next(err); }
});

// POST /api/chat/rooms — open a new room
router.post('/rooms', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await db.chatRoom.findFirst({
      where: { userId: req.user!.userId, status: 'OPEN' },
    });
    if (existing) return res.json({ success: true, data: existing });

    const room = await db.chatRoom.create({
      data: { userId: req.user!.userId, subject: req.body.subject },
    });
    res.status(201).json({ success: true, data: room });
  } catch (err) { next(err); }
});

// GET /api/chat/rooms/:id/messages
router.get('/rooms/:id/messages', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await db.chatRoom.findUnique({ where: { id: req.params.id } });
    if (!room) throw new AppError('Room not found', 404);
    if (room.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }

    const messages = await db.chatMessage.findMany({
      where: { roomId: req.params.id },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
});

// PATCH /api/chat/rooms/:id/close — admin closes room
router.patch('/rooms/:id/close', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await db.chatRoom.update({
      where: { id: req.params.id },
      data: { status: 'CLOSED' },
    });
    res.json({ success: true, data: room });
  } catch (err) { next(err); }
});

export default router;
