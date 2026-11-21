"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "../AdminDashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin = session?.user?.rol === "ADMIN";

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/movimientos/pedidos");
    }
  }, [status, isAdmin, router]);

  if (status === "loading" || (status === "authenticated" && !isAdmin)) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-6 text-sm">
        Redirigiendo...
      </div>
    );
  }

  if (!session?.user) {
    return <div className="p-6 text-sm">No hay sesión activa.</div>;
  }

  const nombreCompleto =
    session.user.name?.trim() || session.user.username || "Usuario";
  const primerNombre = nombreCompleto.split(/\s+/)[0];

  return <AdminDashboard userName={primerNombre} />;
}
