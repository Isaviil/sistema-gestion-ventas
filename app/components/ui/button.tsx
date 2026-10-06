import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  size?: "xs" | "sm" | "md" | "lg";
  variant?:
    | "inputbutton"
    | "primary"
    | "outline"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "text"
    | "subtle"
    | "link"
    | "info";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  loadingText?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  size = "sm",
  variant = "primary",
  onClick,
  className = "",
  disabled = false,
  isLoading = false,
  loadingText = "Cargando...",
  title,
  startIcon,
  endIcon,
}) => {
  const sizeClasses = {
    xs: "h-7 px-3 text-xs",
    sm: "h-8 px-4 text-xs font-medium",
    md: "h-9 px-5 text-sm font-medium",
    lg: "h-10 px-6 text-sm font-medium",
  };

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 dark:shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed",

    success:
      "bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:border-emerald-400/20 dark:hover:bg-emerald-400/15 dark:text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed",

    danger:
      "bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 dark:bg-red-400/10 dark:border-red-400/20 dark:hover:bg-red-400/15 dark:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed",

    warning:
      "bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:border-amber-400/20 dark:hover:bg-amber-400/15 dark:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed",

    info: "bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-600 dark:bg-blue-400/10 dark:border-blue-400/20 dark:hover:bg-blue-400/15 dark:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed",

    secondary:
      "bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 " +
      "dark:bg-indigo-400/10 dark:border-indigo-400/20 dark:hover:bg-indigo-400/15 dark:text-indigo-300 " +
      "disabled:bg-indigo-50/60 disabled:border-indigo-200/60 disabled:text-indigo-400 " +
      "disabled:opacity-100 disabled:cursor-not-allowed " +
      "dark:disabled:bg-indigo-400/5 dark:disabled:border-indigo-400/10 dark:disabled:text-indigo-500/70",

    outline:
      "bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-700 dark:border-white/15 dark:hover:bg-white/5 dark:text-white/80 disabled:opacity-40 disabled:cursor-not-allowed",

    subtle:
      "bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed",

    text: "bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-white/5 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed",

    link: "bg-transparent text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed",

    inputbutton:
      "bg-gray-100 border border-gray-300 border-l-0 rounded-l-none rounded-r-md hover:bg-gray-200 text-gray-700 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed",
  };

  return (
    <button
      type={type}
      title={title}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-all shrink-0
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled || isLoading ? "cursor-not-allowed" : ""}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <svg
          className="w-4 h-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}

      {!isLoading && startIcon}
      {isLoading ? loadingText : children}
      {!isLoading && endIcon}
    </button>
  );
};

export default Button;
