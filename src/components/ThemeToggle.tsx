import { Moon, Sun } from "lucide-react";
import type { Theme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="group flex items-center gap-2 rounded-full border border-white/40 bg-white/15 py-1.5 pl-1.5 pr-3 text-sm font-medium text-white shadow-sm backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow transition-colors duration-300 ${
          isDark ? "text-slate-800" : "text-amber-500"
        }`}
      >
        {isDark ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
      </span>
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
