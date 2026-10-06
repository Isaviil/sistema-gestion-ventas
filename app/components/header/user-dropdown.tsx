"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface UserDropdownProps {
  name: string;
}

export default function UserDropdown({ name }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-sm font-medium cursor-pointer transition-opacity hover:opacity-80"
        style={{ color: "var(--color-regular-text)" }}
        aria-label="Opciones de usuario"
      >
        {name}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-44 rounded-xl border p-1.5 shadow-xl backdrop-blur-md"
          style={{
            backgroundColor: "var(--color-component-background)",
            borderColor: "var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400/80 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
