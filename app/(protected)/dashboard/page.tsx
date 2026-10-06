import { Wrench } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
      <Wrench className="h-8 w-8 animate-pulse" />

      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-regular-text)]">
        Módulo en construcción
      </h1>

      <p className="mt-2 text-sm text-[var(--color-dark)] dark:text-[var(--color-details)] max-w-sm">
        Aún trabajo en esto ☕
      </p>
    </div>
  );
}
