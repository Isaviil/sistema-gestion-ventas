import { IPedidoCabeceraPorID } from "@/app/(protected)/movimientos/pedidos/types";
import { CalendarDays, UserRound } from "lucide-react";

interface StatusCardProps {
  pedido: IPedidoCabeceraPorID;
}

const statusConfig = [
  {
    label: "INGRESADO",
    userKey: "usuario_ing",
    dateKey: "fch_ing",
    color: "bg-[var(--color-status-info)]/20",
  },
  {
    label: "APROBADO",
    userKey: "usuario_aprob",
    dateKey: "fch_aprob",
    color: "bg-emerald-500/15 dark:bg-emerald-400/15",
  },
  {
    label: "ANULADO",
    userKey: "usuario_anu",
    dateKey: "fch_anu",
    color: "bg-red-500/15 dark:bg-red-400/15",
  },
];

export const StatusCard = ({ pedido }: StatusCardProps) => {
  const events = statusConfig
    .map((status) => ({
      ...status,
      user: pedido[status.userKey as keyof IPedidoCabeceraPorID],
      date: pedido[status.dateKey as keyof IPedidoCabeceraPorID],
    }))
    .filter((event) => event.date);

  return (
    <div className="space-y-2 cursor-default">
      {events.map((event) => (
        <div
          key={event.label}
          className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[var(--color-regular-text)] ${event.color}`}
        >
          <span className="text-xs font-bold">{event.label}</span>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold">
              <UserRound size={14} />
              {event.user ?? "—"}
            </span>

            <span className="flex items-center gap-1.5 font-bold">
              <CalendarDays size={14} />
              {new Date(event.date as string).toLocaleString("es-PE", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
