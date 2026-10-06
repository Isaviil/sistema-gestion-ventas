"use client";

import type React from "react";
import { useState, type FC } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
  noWrapper?: boolean;
  forceEnabledStyle?: boolean;
}

const Input: FC<InputProps> = ({
  type = "text",
  className = "",
  success = false,
  error = false,
  noWrapper = false,
  forceEnabledStyle = false,
  hint,
  onChange,
  onFocus,
  onBlur,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isLocked = !!rest.disabled;
  const isReadOnly = !!rest.readOnly;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.toUpperCase();
    onChange?.(e);
  };

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
      type={type}
      className={`${baseClasses} ${className}`.trim()}
      style={combinedStyle}
      {...rest}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="characters"
      spellCheck="false"
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

export default Input;
