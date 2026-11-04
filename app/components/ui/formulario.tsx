import * as React from "react";
import {
  ArrowLeft,
  Save,
  Loader2,
  XCircle,
  CheckCircle,
  Pencil,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import Totales from "./totals";
import Button from "./button";
import { StatusCard } from "./status-card";
import { IPedidoCabeceraPorID } from "@/app/(protected)/movimientos/pedidos/types";

interface FormularioProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  subtotal?: number;
  igv?: number;
  total?: number;
  showAnular?: boolean;
  showAprobar?: boolean;
  showEdit?: boolean;
  showSubmit?: boolean;
  onSave?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onAnular?: () => void;
  onAprobar?: () => void;
  saveText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  pedido?: IPedidoCabeceraPorID;
}

export function Formulario({
  title,
  children,
  className,
  subtotal,
  igv,
  total,
  showAnular,
  showAprobar,
  showEdit,
  showSubmit,
  onSave,
  onEdit,
  onCancel,
  onAnular,
  onAprobar,
  saveText = "Guardar",
  cancelText = "Volver",
  isSubmitting = false,
  pedido,
}: FormularioProps) {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    onSave?.();
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 p-6 sm:p-8 rounded-2xl border shadow-xl",
        "bg-[var(--color-brand-cream)] text-[var(--color-regular-text)] border-[var(--color-border)]",
        "dark:bg-[var(--color-background-secondary)] dark:border-[var(--color-border)] max-w-[1200px]",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-[var(--color-regular-text)]">
          {title}
        </h1>

        {pedido && <StatusCard pedido={pedido} />}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 w-full">{children}</div>

        <div className="flex flex-col justify-between gap-[5px] sm:flex-row">
          <div className="flex flex-wrap justify-center gap-1.5">
            <Button
              type="button"
              disabled={isSubmitting}
              startIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={onCancel}
              variant="cancel"
            >
              {cancelText}
            </Button>

            {showEdit
              ? onEdit && (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    startIcon={<Pencil className="w-4 h-4" />}
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit();
                    }}
                    variant="edit"
                  >
                    Editar
                  </Button>
                )
              : showSubmit && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    startIcon={<Save className="w-4 h-4" />}
                    variant="confirm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      saveText
                    )}
                  </Button>
                )}

            {onAnular && showAnular && (
              <Button
                type="button"
                disabled={isSubmitting}
                startIcon={<XCircle className="w-4 h-4" />}
                onClick={onAnular}
                variant="danger"
              >
                Anular
              </Button>
            )}

            {onAprobar && showAprobar && (
              <Button
                type="button"
                disabled={isSubmitting}
                startIcon={<CheckCircle className="w-4 h-4" />}
                onClick={onAprobar}
                variant="approve"
              >
                Aprobar
              </Button>
            )}
          </div>

          <Totales subtotal={subtotal ?? 0} igv={igv ?? 0} total={total ?? 0} />
        </div>
      </form>
    </div>
  );
}
