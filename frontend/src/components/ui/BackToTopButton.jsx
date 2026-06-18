import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed bottom-24 right-6 z-40 h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg shadow-stone-900/20 transition-all duration-200 hover:bg-amber-500 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
        visible
          ? "flex translate-y-0 opacity-100"
          : "pointer-events-none flex translate-y-3 opacity-0"
      }`}
    >
      <ChevronUp size={22} />
    </button>
  );
}
