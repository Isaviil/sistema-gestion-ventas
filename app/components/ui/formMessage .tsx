import { cn } from "@/app/lib/utils";
import { HTMLAttributes } from "react";

type MessageType = "error" | "success" | "warning" | "info" | "default";

interface FormMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  type?: MessageType;
  size?: "xs" | "sm" | "base" | "lg";
  icon?: React.ReactNode;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const FormMessage = ({
  type = "default",
  size = "xs",
  icon,
  bold = false,
  italic = false,
  underline = false,
  className = "",
  children,
  ...props
}: FormMessageProps) => {
  // Mapeo adaptado a las variables CSS nativas de tu ERP (Axon)
  const typeClasses = {
    error:
      "text-[var(--color-accent-light)] dark:text-[var(--color-accent-light)]",
    success:
      "text-[var(--color-accent-secondary)] dark:text-[var(--color-accent-primary)]",
    warning:
      "text-[var(--color-accent-orange)] dark:text-[var(--color-accent-orange)]",
    info: "text-[var(--color-border-focus)] dark:text-[var(--color-border-focus)]",
    default: "text-[var(--color-gray)] dark:text-[var(--color-gray)]",
  };

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  };

  return (
    <p
      className={cn(
        "mt-0 ml-1 flex items-start gap-1.5 font-sans",
        typeClasses[type],
        sizeClasses[size],
        {
          "font-semibold": bold,
          italic: italic,
          "underline underline-offset-2": underline,
        },
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </p>
  );
};

export default FormMessage;
