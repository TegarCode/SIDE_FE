import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      className,
      containerClassName,
      labelClassName,
      leftSlot,
      rightSlot,
      ...props
    },
    ref
  ) => {
    const describedBy = error
      ? id
        ? `${id}-error`
        : undefined
      : helperText
        ? id
          ? `${id}-helper`
          : undefined
        : undefined;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "mb-1 block text-sm font-medium text-slate-800",
              labelClassName
            )}
          >
            {label}
            {props.required ? (
              <span aria-hidden="true" className="ml-1 text-red-600">
                *
              </span>
            ) : null}
          </label>
        )}

        <div className="relative">
          {leftSlot && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              {leftSlot}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "w-full border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#384AA0] focus:outline-none focus:ring-2",
              error
                ? "border-red-300 focus:ring-red-400"
                : "border-slate-300 focus:ring-[#384AA0]/30",
              leftSlot ? "pl-10" : "",
              rightSlot ? "pr-10" : "",
              className
            )}
            {...props}
          />
          {rightSlot && (
            <div className="absolute inset-y-0 right-3 grid place-items-center">
              {rightSlot}
            </div>
          )}
        </div>

        {error ? (
          <p
            id={id ? `${id}-error` : undefined}
            className="mt-1 text-xs text-red-600"
          >
            {error}
          </p>
        ) : helperText ? (
          <p
            id={id ? `${id}-helper` : undefined}
            className="mt-1 text-[11px] text-slate-500"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
