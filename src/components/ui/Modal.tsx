import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

type ModalSize = "lg" | "xl" | "2xl" | "full";

const sizeClassMap: Record<ModalSize, string> = {
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
  full: "max-w-[94vw]"
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  size?: ModalSize;
  bodyClassName?: string;
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "xl",
  bodyClassName
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1600]">
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]"
        onMouseDown={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-5">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_28px_70px_rgba(11,25,58,0.35)] ring-1 ring-slate-100",
            sizeClassMap[size]
          )}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              {title ? (
                <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  {title}
                </h2>
              ) : null}
              {subtitle ? (
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              ) : null}
            </div>
            <Button
              type="button"
              className="rounded-md border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              onClick={onClose}
              aria-label="Tutup modal"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>

          <div
            className={cn(
              "min-h-0 flex-1 overflow-auto p-4 sm:p-5",
              bodyClassName
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
