import { CalendarDays, UserRound } from "lucide-react";
import { IStatusDocument } from "./formulario";

interface StatusCardProps<T extends IStatusDocument> {
  data: T;
}
const statusConfig = [
  {
    label: "INGRESADO",
    userKey: "usuario_ing",
    dateKey: "fch_ing",
    color:
      "bg-blue-100 text-blue-800 border border-blue-300 shadow-sm dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60",
  },
  {
    label: "APROBADO",
    userKey: "usuario_aprob",
    dateKey: "fch_aprob",
    color:
      "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60",
  },
  {
    label: "PARCIAL",
    userKey: "usuario_aprob",
    dateKey: "fch_aprob",
    color:
      "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60",
  },
  {
    label: "ATENDIDO",
    userKey: "usuario_aprob",
    dateKey: "fch_aprob",
    color:
      "bg-purple-100 text-purple-800 border border-purple-300 shadow-sm dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60",
  },
  {
    label: "ANULADO",
    userKey: "usuario_anu",
    dateKey: "fch_anu",
    color:
      "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] border border-[var(--color-status-danger-border)] shadow-sm",
  },
];

export const StatusCard = <T extends IStatusDocument>({
  data,
}: StatusCardProps<T>) => {
  const status = statusConfig.find((item) => item.label === data.estado);

  const event = status
    ? {
        ...status,
        user: data[status.userKey as keyof IStatusDocument],
        date: data[status.dateKey as keyof IStatusDocument],
      }
    : null;

  return (
    <div className="space-y-2 cursor-default">
      {event?.date && (
        <div
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
      )}
    </div>
  );
};
