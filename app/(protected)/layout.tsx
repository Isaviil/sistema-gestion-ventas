"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../components/header/header";
import Sidebar from "../components/sidebar/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  // Validación de usuario
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div
        className="flex h-screen w-full items-center justify-center font-medium"
        style={{
          backgroundColor: "var(--color-background-secondary)",
          color: "var(--color-regular-text)",
        }}
      >
        Cargando sesión...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: "var(--color-background-secondary)",
        color: "var(--color-regular-text)",
      }}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
