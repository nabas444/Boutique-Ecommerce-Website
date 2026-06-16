import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Send, MessageCircle } from "lucide-react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useChat } from "../hooks/useChat";
import useNotificationStore from "../store/notificationStore";
import toast from "react-hot-toast";

export default function Chat() {
  const { user } = useAuthStore();
  const [roomId, setRoomId] = useState(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const { data: roomData } = useQuery({
    queryKey: ["chat-room"],
    queryFn: async () => {
      const res = await api.post("/chat/rooms", {
        subject: "Customer Support",
      });
      return res.data.data;
    },
  });

  useEffect(() => {
    if (roomData?.id) setRoomId(roomData.id);
  }, [roomData]);

  const {
    messages,
    setMessages,
    isTyping,
    connected,
    sendMessage,
    sendTyping,
    markRead,
  } = useChat(roomId);
  const { refreshUnread } = useNotificationStore();

  // Load history
  const { data: historyData } = useQuery({
    queryKey: ["chat-messages", roomId],
    queryFn: () =>
      api.get(`/chat/rooms/${roomId}/messages`).then((r) => r.data.data),
    enabled: !!roomId,
  });

  useEffect(() => {
    if (historyData) setMessages(historyData);
  }, [historyData]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // When room opens, mark messages as read and refresh unread counts
  useEffect(() => {
    if (roomId && historyData) {
      try {
        markRead();
      } catch (e) {}
      refreshUnread().catch?.(() => {});
    }
  }, [roomId, historyData]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    sendTyping(false);
    setInput("");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-stone-900">
          Support Chat
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          We typically reply within a few minutes
        </p>
      </div>

      <div
        className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col"
        style={{ height: "60vh" }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center">
            <MessageCircle size={16} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-stone-900 text-sm">
              Boutique Support
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-stone-300"}`}
              />
              <span className="text-xs text-stone-400">
                {connected ? "Online" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle
                size={40}
                className="text-stone-200 mx-auto mb-3"
              />
              <p className="text-stone-400 text-sm">
                Start a conversation with our team!
              </p>
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[75%]">
                  {!isMine && (
                    <p className="text-xs text-stone-400 mb-1 ml-1">
                      {msg.sender?.firstName}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? "bg-stone-900 text-white rounded-br-sm" : "bg-stone-100 text-stone-800 rounded-bl-sm"}`}
                  >
                    {msg.body}
                  </div>
                  <p
                    className={`text-xs text-stone-300 mt-1 ${isMine ? "text-right mr-1" : "ml-1"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-stone-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-stone-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-stone-100">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                sendTyping(true);
              }}
              placeholder="Type your message..."
              className="flex-1 border border-stone-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
              disabled={!connected}
            />
            <button
              type="submit"
              disabled={!input.trim() || !connected}
              className="w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-stone-800 transition-colors disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
