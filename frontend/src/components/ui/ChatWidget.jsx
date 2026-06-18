import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import api from "../../api/client";

const SUGGESTED_QUESTIONS = [
  "What are your shipping options?",
  "How do returns work?",
  "Help me choose a size",
  "How can I track my order?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "Hi! I can help with shipping, returns, sizing, payments, order tracking, stock, discounts, and style suggestions. Pick a question or ask your own.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, loading]);

  async function askAssistant(text) {
    setLoading(true);
    try {
      const { data } = await api.post("/ai/reply/public", { prompt: text });
      const reply =
        data?.data?.reply ||
        "I can help with products, shipping, returns, sizing, payments, and order tracking. What would you like to know?";
      setMessages((m) => [
        ...m,
        { id: `${Date.now()}-bot`, from: "bot", text: reply },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: `${Date.now()}-error`,
          from: "bot",
          text: "I could not reach the assistant right now. You can still ask about shipping, returns, sizing, payments, order tracking, discounts, or product availability.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function sendMessage(e, suggestedText) {
    e?.preventDefault();
    const text = (suggestedText || input).trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { id: Date.now(), from: "user", text }]);
    setInput("");
    askAssistant(text);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="w-80 h-[28rem] bg-white border border-stone-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-stone-600" />
              <div className="text-sm font-medium">Boutique Assistant</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-stone-500 hover:text-stone-900"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-auto" ref={listRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`mb-3 max-w-full ${m.from === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block whitespace-pre-line px-3 py-2 rounded-lg text-sm ${
                    m.from === "user"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mb-3 text-left">
                <div className="inline-block rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-500">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="p-3 border-t border-stone-100"
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(null, question)}
                  disabled={loading}
                  className="rounded-full border border-stone-200 px-3 py-1 text-left text-xs text-stone-600 transition-colors hover:border-amber-400 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {question}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask shipping, returns, sizing..."
                className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                aria-label="Send message"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        className="w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
