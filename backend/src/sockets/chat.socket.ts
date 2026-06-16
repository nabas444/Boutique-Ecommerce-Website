import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { db } from "../config/database";
import { AuthPayload } from "../middleware/auth.middleware";

let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as AuthPayload;
    console.log(`Socket connected: ${user.userId} (${user.role})`);

    // Join user's personal room
    socket.join(`user:${user.userId}`);

    // Admin joins all rooms namespace
    if (user.role === "ADMIN") {
      socket.join("admin:room");
    }

    // ── Join a chat room ─────────────────────────────────────
    socket.on("chat:join", async (roomId: string) => {
      const room = await db.chatRoom.findUnique({ where: { id: roomId } });
      if (!room) return socket.emit("error", { message: "Room not found" });

      // Only the room owner or admin can join
      if (room.userId !== user.userId && user.role !== "ADMIN") {
        return socket.emit("error", { message: "Unauthorized" });
      }

      socket.join(`room:${roomId}`);
      socket.emit("chat:joined", { roomId });
    });

    // ── Send a message ────────────────────────────────────────
    socket.on(
      "chat:message",
      async (data: { roomId: string; body: string }) => {
        if (!data.roomId || !data.body?.trim()) return;

        const message = await db.chatMessage.create({
          data: {
            roomId: data.roomId,
            senderId: user.userId,
            body: data.body.trim(),
            isAdmin: user.role === "ADMIN",
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        });

        // Broadcast to everyone in the room
        io.to(`room:${data.roomId}`).emit("chat:message", message);

        // Notify admin panel of new message
        if (user.role !== "ADMIN") {
          io.to("admin:room").emit("chat:notification", {
            roomId: data.roomId,
            message,
          });
        }
        // If an ADMIN sent the message, notify the room owner (user)
        if (user.role === "ADMIN") {
          try {
            const room = await db.chatRoom.findUnique({
              where: { id: data.roomId },
            });
            if (room && room.userId) {
              io.to(`user:${room.userId}`).emit("chat:notification", {
                roomId: data.roomId,
                message,
              });
            }
          } catch (e) {
            // ignore notification failures
          }
        }
      },
    );

    // ── Typing indicator ──────────────────────────────────────
    socket.on("chat:typing", (data: { roomId: string; isTyping: boolean }) => {
      socket.to(`room:${data.roomId}`).emit("chat:typing", {
        userId: user.userId,
        isTyping: data.isTyping,
      });
    });

    // ── Mark messages as read ─────────────────────────────────
    socket.on("chat:read", async (roomId: string) => {
      await db.chatMessage.updateMany({
        where: {
          roomId,
          readAt: null,
          isAdmin: user.role !== "ADMIN",
        },
        data: { readAt: new Date() },
      });
      io.to(`room:${roomId}`).emit("chat:read", { roomId });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${user.userId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
