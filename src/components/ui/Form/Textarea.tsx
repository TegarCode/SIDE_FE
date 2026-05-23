import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  rightSlot?: ReactNode;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      className,
      containerClassName,
      labelClassName,
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
        {label ? (
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
        ) : null}

        <div className="relative">
          <textarea
            ref={ref}
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "min-h-[96px] w-full border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#384AA0] focus:outline-none focus:ring-2",
              error
                ? "border-red-300 focus:ring-red-400"
                : "border-slate-300 focus:ring-[#384AA0]/30",
              rightSlot ? "pr-10" : "",
              className
            )}
            {...props}
          />
          {rightSlot ? (
            <div className="absolute right-3 top-3">{rightSlot}</div>
          ) : null}
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

Textarea.displayName = "Textarea";
