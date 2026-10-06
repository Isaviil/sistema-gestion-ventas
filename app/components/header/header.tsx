"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Sun, Moon } from "lucide-react";
import UserDropdown from "./user-dropdown";

interface HeaderProps {
  onToggle?: () => void;
}

const emptySubscribe = () => () => {};

export default function Header({ onToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const { data: session } = useSession();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b transition-colors duration-200"
      style={{
        backgroundColor: "var(--color-component-background)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            type="button"
            className="p-1.5 rounded-lg lg:hidden transition-colors"
            style={{ color: "var(--color-gray)" }}
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {session?.user.name && <UserDropdown name={session.user.name} />}

          {isMounted ? (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              type="button"
              className="p-2 rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-200 hover:scale-110" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 transition-transform duration-200 hover:scale-110" />
              )}
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
        </div>
      </div>
    </header>
  );
}
