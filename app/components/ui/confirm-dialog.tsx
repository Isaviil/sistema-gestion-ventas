import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import Button from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "secondary";
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "¿Eliminar elemento?",
  description = "¿Estás seguro de que deseas realizar esta acción? Esta operación no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 sm:max-w-[420px] bg-[var(--color-component-background)] border border-[var(--color-border)] shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-[var(--color-regular-text)]">
            {title}
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm leading-relaxed opacity-80 text-[var(--color-regular-text)]">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-5 border-t border-[var(--color-border)] pt-4">
          <div className="flex w-full justify-end gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelText}
            </Button>

            <Button
              variant={variant}
              size="sm"
              disabled={loading}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
