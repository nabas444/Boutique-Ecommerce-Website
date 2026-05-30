import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socketInstance = null;

export function useChat(roomId) {
  const { accessToken } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!accessToken) return;

    socketInstance = io('/', { auth: { token: accessToken } });

    socketInstance.on('connect', () => {
      setConnected(true);
      if (roomId) socketInstance.emit('chat:join', roomId);
    });

    socketInstance.on('disconnect', () => setConnected(false));

    socketInstance.on('chat:message', (msg) => {
      setMessages((prev) =>
        prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
    });

    socketInstance.on('chat:typing', ({ isTyping: typing }) => {
      setIsTyping(typing);
    });

    return () => {
      socketInstance?.disconnect();
      socketInstance = null;
    };
  }, [accessToken, roomId]);

  const sendMessage = useCallback(
    (body) => {
      if (!socketInstance || !roomId || !body.trim()) return;
      socketInstance.emit('chat:message', { roomId, body: body.trim() });
    },
    [roomId]
  );

  const sendTyping = useCallback(
    (isCurrentlyTyping) => {
      if (!socketInstance || !roomId) return;
      socketInstance.emit('chat:typing', { roomId, isTyping: isCurrentlyTyping });
      clearTimeout(typingTimeout.current);
      if (isCurrentlyTyping) {
        typingTimeout.current = setTimeout(() => {
          socketInstance?.emit('chat:typing', { roomId, isTyping: false });
        }, 1500);
      }
    },
    [roomId]
  );

  const markRead = useCallback(() => {
    if (!socketInstance || !roomId) return;
    socketInstance.emit('chat:read', roomId);
  }, [roomId]);

  return { messages, setMessages, isTyping, connected, sendMessage, sendTyping, markRead };
}
