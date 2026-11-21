"use client";

import { useState } from "react";
import {
  Ban,
  Clock,
  DollarSign,
  FileText,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useDashboard } from "@/app/services/useDashboard";

const MESES = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

function formatMoney(amount: number, symbol = "S/.") {
  return `${symbol} ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getEstadoBadge(estado: string) {
  switch (estado) {
    case "APROBADO":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "PARCIAL":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "INGRESADO":
      return "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";
    default:
      return "bg-neutral-500/15 text-neutral-600 dark:text-neutral-300 border-neutral-500/30";
  }
}

export function AdminDashboard({ userName }: { userName: string }) {
  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

  const [ano, setAno] = useState(currentYear);
  const [mes, setMes] = useState(currentMonth);

  const { data, isLoading, isError, refetch, isFetching } = useDashboard({
    ft: "year_month",
    ano,
    mes,
  });

  const years = Array.from({ length: 4 }, (_, i) =>
    String(Number(currentYear) - i),
  );

  return (
    <div className="space-y-6 p-6">
      {/* Cabecera y filtros de periodo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-regular-text)]">
            Panel de Control
          </h1>
          <p className="text-sm text-[var(--color-dark)] dark:text-[var(--color-details)]">
            Bienvenido, {userName}
          </p>
        </div>

        <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-[var(--color-regular-text)] outline-none"
          >
            {MESES.map((m) => (
              <option
                key={m.value}
                value={m.value}
                className="bg-neutral-900 text-white"
              >
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-[var(--color-regular-text)] outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-neutral-900 text-white">
                {y}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Actualizar métricas"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 text-[var(--color-regular-text)] hover:bg-neutral-500/10 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-500/5"
            />
          ))}
        </div>
      ) : isError || !data ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          No se pudieron cargar las métricas del dashboard.
        </div>
      ) : (
        <>
          {/* KPIs principales */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Facturación Activa */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-dark)] dark:text-[var(--color-details)]">
                  Facturación Activa
                </span>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[var(--color-regular-text)]">
                {formatMoney(data.kpis.facturacion.totalSoles, "S/.")}
              </p>
              <p className="mt-1 text-xs text-[var(--color-dark)] dark:text-[var(--color-details)]">
                {data.kpis.facturacion.activasCount} comprobantes
                {data.kpis.facturacion.totalDolares > 0
                  ? ` · ${formatMoney(data.kpis.facturacion.totalDolares, "US$")}`
                  : ""}
              </p>
            </div>

            {/* 2. Pedidos Pendientes */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-dark)] dark:text-[var(--color-details)]">
                  Pedidos Pendientes
                </span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[var(--color-regular-text)]">
                {data.kpis.pedidos.pendientesCount}
              </p>
              <p className="mt-1 text-xs text-[var(--color-dark)] dark:text-[var(--color-details)]">
                De {data.kpis.pedidos.activosCount} pedidos activos
              </p>
            </div>

            {/* 3. Guías de Remisión */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-dark)] dark:text-[var(--color-details)]">
                  Guías Emitidas
                </span>
                <Truck className="h-4 w-4 text-sky-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[var(--color-regular-text)]">
                {data.kpis.remisiones.activasCount}
              </p>
              <p className="mt-1 text-xs text-[var(--color-dark)] dark:text-[var(--color-details)]">
                Traslados activos del periodo
              </p>
            </div>

            {/* 4. Anulaciones */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-dark)] dark:text-[var(--color-details)]">
                  Anulaciones
                </span>
                <Ban className="h-4 w-4 text-rose-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[var(--color-regular-text)]">
                {data.kpis.totalAnulaciones}
              </p>
              <p className="mt-1 text-xs text-[var(--color-dark)] dark:text-[var(--color-details)]">
                {data.kpis.facturacion.anuladasCount} fac ·{" "}
                {data.kpis.pedidos.anuladasCount} ped ·{" "}
                {data.kpis.remisiones.anuladasCount} guías
              </p>
            </div>
          </div>

          {/* Mini listado de pedidos pendientes (máx. 5) */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-5 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--color-dark)] dark:text-[var(--color-details)]" />
                <h2 className="text-sm font-semibold text-[var(--color-regular-text)]">
                  Pedidos pendientes recientes
                </h2>
              </div>
              <span className="text-xs text-[var(--color-dark)] dark:text-[var(--color-details)]">
                Últimos {data.pendientesRecientes.length}
              </span>
            </div>

            {data.pendientesRecientes.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--color-dark)] dark:text-[var(--color-details)]">
                No hay pedidos pendientes en este periodo.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase text-[var(--color-dark)] dark:text-[var(--color-details)]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Pedido</th>
                      <th className="px-5 py-3 font-medium">Cliente</th>
                      <th className="px-5 py-3 font-medium">Vendedor</th>
                      <th className="px-5 py-3 font-medium">Estado</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {data.pendientesRecientes.map((item) => (
                      <tr key={item.id_ped} className="hover:bg-neutral-500/5">
                        <td className="px-5 py-3 font-mono text-xs font-medium text-[var(--color-regular-text)]">
                          {item.nrodoc}
                        </td>
                        <td className="px-5 py-3 text-[var(--color-regular-text)]">
                          {item.nomaux}
                        </td>
                        <td className="px-5 py-3 text-xs text-[var(--color-dark)] dark:text-[var(--color-details)]">
                          {item.vendedor}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getEstadoBadge(
                              item.estado,
                            )}`}
                          >
                            {item.estado}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-[var(--color-regular-text)]">
                          {formatMoney(
                            item.imptot,
                            item.codmon === "1" ? "S/." : "US$",
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
