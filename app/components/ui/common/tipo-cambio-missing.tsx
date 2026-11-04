import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function NoExisteTipoDeCambio() {
  return (
    <div className="w-full max-w-[500px] md:max-w-[900px] mx-auto flex flex-col items-center justify-center p-8 rounded-xl border border-black/15 dark:border-[var(--color-border)] shadow-sm bg-gray-100 dark:bg-white/[0.02] gap-3 text-center my-6">
      <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-1">
        <AlertCircle className="w-6 h-6" />
      </div>

      <p className="text-base font-semibold text-[var(--color-regular-text)]">
        No existe un tipo de cambio para el día de hoy.
      </p>

      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Presione{" "}
        <Link
          href="/maestros/tipo-de-cambio"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 transition-colors font-semibold"
        >
          aquí
        </Link>{" "}
        para registrar el tipo de cambio.
      </p>
    </div>
  );
}
