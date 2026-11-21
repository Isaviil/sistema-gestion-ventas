interface EstadoBadgeProps {
  estado: string;
}

const estadoConfig: Record<string, string> = {
  INGRESADO: "bg-[var(--color-status-info)]/15 text-[var(--color-status-info)]",
  APROBADO:
    "bg-[var(--color-status-success)]/15 text-[var(--color-status-success)]",
  PARCIAL:
    "bg-[var(--color-status-partial)]/15 text-[var(--color-status-partial)]",
  ATENDIDO:
    "bg-[var(--color-status-complete)]/15 text-[var(--color-status-complete)]",
  ANULADO:
    "bg-[var(--color-status-danger)]/15 text-[var(--color-status-danger)]",
};

export const EstadoBadge = ({ estado }: EstadoBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-bold ${estadoConfig[estado]}`}
    >
      {estado}
    </span>
  );
};
