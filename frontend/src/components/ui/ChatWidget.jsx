import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Use an inline assistant panel instead of redirecting to the admin Chat page
import AssistantPanel from "./AssistantPanel";
import { useAuthStore } from "../../store/authStore";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  function handleOpen() {
    if (!isAuthenticated()) {
      // send to login and then back to chat
      navigate("/login", { state: { from: "/chat" } });
      return;
    }
    setOpen(true);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        aria-label="Open support chat"
        className="fixed right-6 bottom-6 z-50 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 shadow-lg flex items-center justify-center text-stone-900 transition"
      >
        <MessageCircle size={22} />
      </button>

      {/* Modal panel */}
      {open && (
        <div className="fixed right-6 bottom-24 z-50 w-96 max-w-full h-[70vh] bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center">
                B
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm">
                  Boutique Assistant
                </p>
                <p className="text-xs text-stone-400">We're here to help</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-stone-500 hover:text-stone-900 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <AssistantPanel />
          </div>
        </div>
      )}
    </>
  );
}
