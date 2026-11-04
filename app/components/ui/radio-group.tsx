import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import { cn } from "@/app/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-all duration-200 outline-none cursor-pointer",
        // Colores y bordes base desde tus variables CSS
        "border-[var(--color-border)] bg-[var(--color-background-primary)] text-[var(--color-accent-primary)]",
        // Estados Hover & Focus
        "hover:border-[var(--color-accent-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-ring-focus)] focus-visible:border-[var(--color-border-focus)]",
        // Estado Seleccionado (Checked)
        "data-[state=checked]:border-[var(--color-accent-primary)] data-[state=checked]:bg-[var(--color-background-secondary)]",
        // Estados Deshabilitados e Inválidos
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--color-accent-light)]",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-[var(--color-accent-primary)] stroke-[var(--color-accent-primary)] absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
