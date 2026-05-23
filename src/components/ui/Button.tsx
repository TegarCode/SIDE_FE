import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ButtonRounded = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "warning"
  | "danger";

const roundedClassMap: Record<ButtonRounded, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full"
};

const variantClassMap: Record<ButtonVariant, string> = {
  default: "",
  primary:
    "bg-[#384AA0] text-white hover:bg-[#253583] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#384AA0]/40",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
  outline:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
  ghost:
    "text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
  warning:
    "bg-amber-500 text-white hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  rounded?: ButtonRounded;
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, rounded, type = "button", variant = "default", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-60",
          variantClassMap[variant],
          rounded ? roundedClassMap[rounded] : undefined,
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
