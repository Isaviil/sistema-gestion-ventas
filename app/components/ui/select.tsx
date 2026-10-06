"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface SelectProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Root
> {
  error?: boolean;
  hint?: string;
  disabled?: boolean;
  readOnly?: boolean;
  success?: boolean;
  children?: React.ReactNode;
}

interface SelectTriggerProps extends React.ComponentProps<
  typeof SelectPrimitive.Trigger
> {
  size?: "sm" | "default";
  error?: boolean;
  success?: boolean;
}

const SelectStateContext = React.createContext({ readOnly: false });

const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectProps
>(
  (
    { error, success, disabled, readOnly = false, hint, children, ...props },
    ref,
  ) => {
    return (
      <div className="grid w-full gap-0 relative">
        <SelectStateContext.Provider value={{ readOnly }}>
          <SelectPrimitive.Root
            disabled={disabled}
            open={readOnly ? false : undefined}
            {...props}
          >
            <SelectPrimitive.Trigger ref={ref}></SelectPrimitive.Trigger>
            {children}
          </SelectPrimitive.Root>
        </SelectStateContext.Provider>
        {hint && (
          <p
            className={`mt-1 text-[8px] ml-1 font-bold absolute top-full ${
              error
                ? "text-red-500"
                : success
                  ? "text-emerald-500"
                  : "text-gray-500"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(
  (
    { className, size = "default", error, success, children, style, ...props },
    ref,
  ) => {
    const { readOnly } = React.useContext(SelectStateContext);

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        aria-readonly={readOnly || undefined}
        data-slot="select-trigger"
        data-size={size}
        style={{
          backgroundColor:
            readOnly || props.disabled
              ? "var(--color-table-header-solid)"
              : "var(--color-component-background)",
          borderColor: "var(--color-border)",
          color: "var(--color-regular-text)",
          ...style,
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors transition-shadow outline-none h-8 uppercase",
          "focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500",
          "data-placeholder:opacity-50",
          "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 text-gray-400",
          error &&
            "border-red-500 text-red-600 focus-visible:border-red-500 focus-visible:ring-red-500/20 dark:text-red-400",
          success &&
            "border-emerald-500 text-emerald-600 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 dark:text-emerald-400",
          (readOnly || props.disabled) &&
            "pointer-events-none cursor-not-allowed opacity-70",
          className,
        )}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentProps<typeof SelectPrimitive.Value>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    data-slot="select-value"
    className={cn("", className)}
    {...props}
  />
));
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentProps<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", style, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      data-slot="select-content"
      style={{
        backgroundColor: "var(--color-table-header-solid)",
        borderColor: "var(--color-border)",
        color: "var(--color-regular-text)",
        ...style,
      }}
      className={cn(
        "relative z-50 max-h-(--radix-select-content-available-height) min-w-32 rounded-md border shadow-lg overflow-x-hidden overflow-y-auto text-xs uppercase",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(
      "relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1 pr-8 pl-2 text-xs font-semibold transition-colors outline-none select-none uppercase",
      "hover:bg-black/5 dark:hover:bg-white/5 focus:bg-blue-500/10 focus:text-blue-500",
      "data-disabled:pointer-events-none data-disabled:opacity-40",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
      "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-3.5 text-blue-500" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn(
      "flex cursor-default items-center justify-center py-1 opacity-60",
      className,
    )}
    {...props}
  >
    <ChevronUpIcon className="size-3.5" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    data-slot="select-scroll-down-button"
    className={cn(
      "flex cursor-default items-center justify-center py-1 opacity-60",
      className,
    )}
    {...props}
  >
    <ChevronDownIcon className="size-3.5" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
