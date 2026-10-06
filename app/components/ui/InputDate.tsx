import { FC } from "react";
import { useFormContext, UseFormRegisterReturn } from "react-hook-form";

interface InputDateProps extends React.InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
  name?: string;
}

const InputDate: FC<InputDateProps> = ({
  className = "",
  success = false,
  error = false,
  hint,
  name,
  onChange,
  ...rest
}) => {
  const { register } = useFormContext();

  const registerProps = rest as Partial<UseFormRegisterReturn>;

  const isRegisteredExternally =
    !!registerProps.onChange && !!registerProps.name && !!registerProps.ref;

  const field: Partial<UseFormRegisterReturn> = isRegisteredExternally
    ? registerProps
    : name
      ? register(name)
      : {};

  const base = `w-full flex-1 rounded border appearance-none px-2.5 py-1 text-xs font-normal shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 h-9 uppercase`;

  let stateClasses = "";

  if (rest.disabled) {
    stateClasses =
      "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700";
  } else if (rest.readOnly) {
    stateClasses =
      "bg-gray-50 text-gray-700 cursor-default border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  } else if (error) {
    stateClasses = "border-red-500 focus:border-red-500 focus:ring-red-500/20";
  } else if (success) {
    stateClasses =
      "border-green-500 focus:border-green-500 focus:ring-green-500/20";
  } else {
    stateClasses =
      "border-gray-300 hover:border-gray-400 focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white";
  }

  return (
    <div className="relative w-full">
      <input
        type="date"
        {...field}
        {...rest}
        className={`${base} ${stateClasses} ${className}`}
        onChange={(e) => {
          if (field.onChange) {
            void field.onChange(e);
          }
          onChange?.(e);
        }}
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
          className={`mt-1 text-xs ml-0.5 font-normal ${
            error
              ? "text-red-500"
              : success
                ? "text-green-500"
                : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default InputDate;
