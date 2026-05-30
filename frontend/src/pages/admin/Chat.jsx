import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { MessageCircle, Send, CheckCircle, XCircle, User } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

let socket;

export default function AdminChat() {
  const { user, accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const { data: roomsData, refetch: refetchRooms } = useQuery({
    queryKey: ['admin-chat-rooms'],
    queryFn: () => api.get('/chat/rooms').then(r => r.data.data),
    refetchInterval: 10000,
  });

  const rooms = roomsData || [];
  const openRooms = rooms.filter(r => r.status === 'OPEN');
  const closedRooms = rooms.filter(r => r.status === 'CLOSED');

  // Load messages for active room
  const { data: historyData } = useQuery({
    queryKey: ['admin-chat-messages', activeRoom?.id],
    queryFn: () => api.get(`/chat/rooms/${activeRoom.id}/messages`).then(r => r.data.data),
    enabled: !!activeRoom?.id,
  });

  useEffect(() => { if (historyData) setMessages(historyData); }, [historyData]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  // Socket setup
  useEffect(() => {
    if (!accessToken) return;
    socket = io('/', { auth: { token: accessToken } });
    socket.on('connect', () => {
      // Admin joins all rooms notification channel
    });
    socket.on('chat:notification', ({ roomId }) => {
      refetchRooms();
      if (activeRoom?.id === roomId) {
        qc.invalidateQueries(['admin-chat-messages', roomId]);
      }
    });
    socket.on('chat:message', msg => {
      if (msg.roomId === activeRoom?.id) {
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      }
    });
    socket.on('chat:typing', ({ isTyping, userId }) => {
      if (userId !== user?.id) setTyping(isTyping);
    });
    return () => socket?.disconnect();
  }, [accessToken, activeRoom?.id]);

  function selectRoom(room) {
    setActiveRoom(room);
    setMessages([]);
    if (socket) {
      socket.emit('chat:join', room.id);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !socket || !activeRoom) return;
    socket.emit('chat:message', { roomId: activeRoom.id, body: input.trim() });
    setInput('');
  }

  function handleInputChange(e) {
    setInput(e.target.value);
    socket?.emit('chat:typing', { roomId: activeRoom?.id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('chat:typing', { roomId: activeRoom?.id, isTyping: false });
    }, 1500);
  }

  async function closeRoom(roomId) {
    try {
      await api.patch(`/chat/rooms/${roomId}/close`);
      refetchRooms();
      if (activeRoom?.id === roomId) setActiveRoom(null);
      toast.success('Chat closed');
    } catch { toast.error('Failed to close chat'); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-stone-900">Support Chat</h1>
        <p className="text-stone-400 text-sm mt-1">{openRooms.length} open conversations</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden flex" style={{ height: '70vh' }}>
        {/* Rooms list */}
        <div className="w-72 border-r border-stone-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-stone-100">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Open ({openRooms.length})</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {openRooms.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle size={32} className="text-stone-200 mx-auto mb-2" />
                <p className="text-xs text-stone-400">No open conversations</p>
              </div>
            ) : openRooms.map(room => {
              const lastMsg = room.messages?.[0];
              const isActive = activeRoom?.id === room.id;
              return (
                <button key={room.id} onClick={() => selectRoom(room)}
                  className={`w-full text-left px-4 py-3.5 border-b border-stone-50 transition-colors hover:bg-stone-50 ${isActive ? 'bg-stone-50 border-l-2 border-l-stone-900' : ''}`}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 flex-shrink-0">
                      {room.user?.firstName?.[0]}
                    </div>
                    <p className="text-sm font-semibold text-stone-900 truncate">{room.user?.firstName} {room.user?.lastName}</p>
                  </div>
                  <p className="text-xs text-stone-400 truncate pl-9">{lastMsg?.body || 'No messages'}</p>
                </button>
              );
            })}

            {closedRooms.length > 0 && (
              <>
                <div className="p-4 border-b border-stone-100 mt-2">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Closed ({closedRooms.length})</p>
                </div>
                {closedRooms.map(room => (
                  <button key={room.id} onClick={() => selectRoom(room)}
                    className={`w-full text-left px-4 py-3.5 border-b border-stone-50 transition-colors hover:bg-stone-50 opacity-60 ${activeRoom?.id === room.id ? 'bg-stone-50' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 flex-shrink-0">
                        {room.user?.firstName?.[0]}
                      </div>
                      <p className="text-sm text-stone-600 truncate">{room.user?.firstName} {room.user?.lastName}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col">
          {!activeRoom ? (
            <div className="flex-1 flex items-center justify-center text-stone-300 flex-col gap-3">
              <MessageCircle size={48} />
              <p className="text-sm">Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-sm font-bold text-stone-600">
                    {activeRoom.user?.firstName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">{activeRoom.user?.firstName} {activeRoom.user?.lastName}</p>
                    <p className="text-xs text-stone-400">{activeRoom.user?.email}</p>
                  </div>
                </div>
                {activeRoom.status === 'OPEN' && (
                  <button onClick={() => closeRoom(activeRoom.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-red-600 border border-stone-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-colors">
                    <XCircle size={14} /> Close Chat
                  </button>
                )}
                {activeRoom.status === 'CLOSED' && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-stone-400 border border-stone-100 px-3 py-1.5 rounded-xl">
                    <CheckCircle size={14} /> Closed
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-10 text-stone-300 text-sm">No messages yet</div>
                )}
                {messages.map(msg => {
                  const isMine = msg.isAdmin;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[75%]">
                        {!isMine && <p className="text-xs text-stone-400 mb-1 ml-1">{msg.sender?.firstName}</p>}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-stone-900 text-white rounded-br-sm' : 'bg-stone-100 text-stone-800 rounded-bl-sm'}`}>
                          {msg.body}
                        </div>
                        <p className={`text-xs text-stone-300 mt-1 ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-stone-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                      {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {activeRoom.status === 'OPEN' ? (
                <div className="px-4 py-3 border-t border-stone-100">
                  <form onSubmit={sendMessage} className="flex items-center gap-3">
                    <input value={input} onChange={handleInputChange}
                      placeholder="Reply to customer..."
                      className="flex-1 border border-stone-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition" />
                    <button type="submit" disabled={!input.trim()}
                      className="w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-stone-800 transition-colors disabled:opacity-40">
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="px-4 py-3 border-t border-stone-100 text-center text-xs text-stone-400">
                  This conversation is closed
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
