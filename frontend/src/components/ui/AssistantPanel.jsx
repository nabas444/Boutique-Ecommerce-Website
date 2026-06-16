import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import api from "../../api/client";

export default function AssistantPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(prompt) {
    if (!prompt || !prompt.trim()) return;
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: { firstName: "You" },
      body: prompt,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/ai/reply/public", { prompt });
      const reply = res?.data?.data?.reply || "Sorry, no reply.";
      const botMsg = {
        id: `b-${Date.now()}`,
        sender: { firstName: "Boutique Assistant" },
        body: reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, botMsg]);
    } catch (e) {
      const botMsg = {
        id: `b-${Date.now()}`,
        sender: { firstName: "Boutique Assistant" },
        body: "Sorry, the assistant is unavailable.",
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center text-white">
          B
        </div>
        <div>
          <p className="font-semibold text-stone-900 text-sm">
            Boutique Assistant
          </p>
          <p className="text-xs text-stone-400">
            Ask me about products, sizing, or orders
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            Say hi to the assistant!
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender.firstName === "You" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[80%]">
              {!(msg.sender.firstName === "You") && (
                <p className="text-xs text-stone-400 mb-1 ml-1">
                  {msg.sender.firstName}
                </p>
              )}
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender.firstName === "You" ? "bg-stone-900 text-white rounded-br-sm" : "bg-stone-100 text-stone-800 rounded-bl-sm"}`}
              >
                {msg.body}
              </div>
              <p
                className={`text-xs text-stone-300 mt-1 ${msg.sender.firstName === "You" ? "text-right mr-1" : "ml-1"}`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="px-4 py-3 border-t border-stone-100">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the assistant..."
            className="flex-1 border border-stone-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-stone-800 transition-colors disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
