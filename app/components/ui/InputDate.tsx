import { FC, useState } from "react";
import { useFormContext, UseFormRegisterReturn } from "react-hook-form";

interface InputDateProps extends React.InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
  name?: string;
  forceEnabledStyle?: boolean;
}

const InputDate: FC<InputDateProps> = ({
  className = "",
  success = false,
  error = false,
  hint,
  name,
  onChange,
  onFocus,
  onBlur,
  style,
  forceEnabledStyle = false,
  ...rest
}) => {
  const { register } = useFormContext();
  const [isFocused, setIsFocused] = useState(false);
  const isLocked = !!rest.disabled;
  const isReadOnly = !!rest.readOnly;

  const registerProps = rest as Partial<UseFormRegisterReturn>;

  const isRegisteredExternally =
    !!registerProps.onChange && !!registerProps.name && !!registerProps.ref;

  const field: Partial<UseFormRegisterReturn> = isRegisteredExternally
    ? registerProps
    : name
      ? register(name)
      : {};

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const baseClasses = [
    "w-full flex-1 rounded-md border appearance-none px-2.5 py-1",
    "text-xs font-semibold shadow-sm placeholder:text-gray-400",
    "focus:outline-none h-8 uppercase transition-all duration-200 [color-scheme:light] dark:[color-scheme:dark]",
  ].join(" ");

  let dynamicStyle: React.CSSProperties = {
    backgroundColor: "var(--color-component-background)",
    color: "var(--color-regular-text)",
    borderColor: isFocused
      ? "var(--color-border-focus)"
      : "var(--color-border)",
    boxShadow: isFocused ? "0 0 0 2px var(--color-ring-focus)" : "none",
  };

  if (forceEnabledStyle) {
    dynamicStyle = {
      backgroundColor: "var(--color-component-background)",
      color: "var(--color-regular-text)",
      borderColor: isFocused
        ? "var(--color-border-focus)"
        : "var(--color-border)",
      boxShadow: isFocused ? "0 0 0 2px var(--color-ring-focus)" : "none",
    };
  } else if (isLocked || isReadOnly) {
    dynamicStyle = {
      backgroundColor: "var(--color-background-primary)",
      color: "var(--color-regular-text)",
      borderColor: "var(--color-border)",
      cursor: isLocked ? "not-allowed" : "default",
      boxShadow: "none",
      opacity: 0.85,
    };
  } else if (error) {
    dynamicStyle = {
      backgroundColor: "var(--color-component-background)",
      color: "var(--color-regular-text)",
      borderColor: "var(--color-accent-primary)",
      boxShadow: isFocused ? "0 0 0 2px rgba(214, 61, 0, 0.2)" : "none",
    };
  } else if (success) {
    dynamicStyle = {
      backgroundColor: "var(--color-component-background)",
      color: "var(--color-regular-text)",
      borderColor: "var(--color-steel-ball-secondary)",
      boxShadow: isFocused ? "0 0 0 2px rgba(26, 75, 167, 0.2)" : "none",
    };
  }

  const combinedStyle = { ...dynamicStyle, ...style };

  return (
    <div className="relative w-full">
      <input
        type="date"
        {...field}
        {...rest}
        className={`${baseClasses} ${className}`.trim()}
        style={combinedStyle}
        onChange={(e) => {
          if (field.onChange) {
            void field.onChange(e);
          }
          onChange?.(e);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseDown={(e) => {
          if (!rest.readOnly && !rest.disabled) {
            try {
              e.currentTarget.showPicker();
            } catch {
              e.currentTarget.focus();
            }
          }
        }}
      />

      {hint && (
        <p
          className="text-[8px] ml-1 font-bold transition-colors duration-200 mt-1"
          style={{
            color: error
              ? "var(--color-accent-primary)"
              : success
                ? "var(--color-steel-ball-secondary)"
                : "var(--color-gray)",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default InputDate;
