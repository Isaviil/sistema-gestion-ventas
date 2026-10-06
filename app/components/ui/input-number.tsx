"use client";

import type React from "react";
import { useState, type FC } from "react";

interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  success?: boolean;
  error?: boolean;
  hint?: string;
  format?: string; // Ej: "#.##" → 2 decimales
  allowNegative?: boolean;
  noWrapper?: boolean;
  forceEnabledStyle?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputNumber: FC<NumberInputProps> = ({
  className = "",
  success = false,
  error = false,
  hint,
  format,
  allowNegative = false,
  noWrapper = false,
  forceEnabledStyle = false,
  value,
  onChange,
  onFocus,
  onBlur,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isLocked = !!rest.disabled;
  const isReadOnly = !!rest.readOnly;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;

    if (e.key === ".") {
      if (e.currentTarget.value.includes(".")) {
        e.preventDefault();
      }
      return;
    }

    if (
      allowNegative &&
      e.key === "-" &&
      e.currentTarget.selectionStart === 0 &&
      !e.currentTarget.value.includes("-")
    ) {
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");

    if (!/^-?\d*\.?\d*$/.test(pasted)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (!/^-?\d*\.?\d*$/.test(val)) return;

    if (!allowNegative && val.includes("-")) {
      val = val.replace("-", "");
    }

    e.target.value = val;
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const val = e.target.value;

    if (format && val) {
      const decimals = format.split(".")[1]?.length ?? 0;
      const num = Number(val);
      if (!isNaN(num)) {
        e.target.value = num.toFixed(decimals);
      }
    }

    onBlur?.(e);
  };

  const baseClasses = [
    "w-full flex-1 rounded-md border appearance-none px-2.5 py-1",
    "text-xs font-semibold shadow-sm placeholder:text-gray-400",
    "focus:outline-none h-8 uppercase transition-all duration-200",
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
      color: "var(--color-gray)",
      borderColor: "var(--color-border)",
      cursor: isLocked ? "not-allowed" : "default",
      boxShadow: "none",
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

  const renderInput = () => (
    <input
      type="text"
      inputMode="decimal"
      className={`${baseClasses} ${className}`.trim()}
      style={combinedStyle}
      value={value}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      {...rest}
    />
  );

  const renderHint = () =>
    hint && (
      <p
        className="text-[8px] ml-1 font-bold transition-colors duration-200"
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
    );

  if (noWrapper) {
    return (
      <>
        {renderInput()}
        {renderHint()}
      </>
    );
  }

  return (
    <div className="relative w-full">
      {renderInput()}
      {renderHint()}
    </div>
  );
};

export default InputNumber;
