import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface DialogAddElementProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  onSave?: () => void;
  onCancel?: () => void;
  saveText?: string;
  cancelText?: string;
  onClose?: () => void;
  onInteractOutside?: (e: Event) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  isSubmitting?: boolean;
}

export function DialogAddElement({
  open,
  setOpen,
  title,
  children,
  className,
  onSave,
  onCancel,
  saveText = "Guardar",
  cancelText = "Volver",
  onClose,
  onInteractOutside,
  onEscapeKeyDown,
  isSubmitting = false,
}: DialogAddElementProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setOpen(false);
    }

    onClose?.();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave();
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 transition-all duration-200",
            "bg-[var(--color-overlay-dark)] backdrop-blur-xs",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />

        <DialogPrimitive.Content
          className={cn(
            "fixed top-[50%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%]",
            "flex flex-col gap-6 p-6 sm:p-8 rounded-2xl border shadow-2xl transition-all duration-200",
            "bg-[var(--color-brand-cream)] text-[var(--color-regular-text)] border-[var(--color-border)]",
            "dark:bg-[var(--color-background-secondary)] dark:border-[var(--color-border)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
          onInteractOutside={onInteractOutside}
          onEscapeKeyDown={onEscapeKeyDown}
        >
          <div className="flex flex-col text-left">
            <DialogPrimitive.Title className="text-xl font-bold tracking-tight text-[var(--color-regular-text)]">
              {title}
            </DialogPrimitive.Title>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 w-full">{children}</div>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer bg-gray-700 hover:bg-gray-800 text-white dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                {cancelText}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer shadow-sm bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    {saveText}
                    <Save className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
