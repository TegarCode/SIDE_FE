import React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

type AccordionProps = {
  title: string;
  description?: string;
  badge?: string;
  summary?: React.ReactNode;
  actions?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export function Accordion({
  title,
  description,
  badge,
  summary,
  actions,
  defaultOpen = false,
  className,
  contentClassName,
  children
}: AccordionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs",
        className
      )}
    >
      <div className="border-b border-slate-200 bg-white">
        <div
          className="flex cursor-pointer flex-wrap items-start justify-between gap-3 px-4 py-2.5 sm:px-5"
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((current) => !current);
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={open}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                {title}
              </h2>
              {badge ? (
                <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 ring-1 ring-slate-200">
                  {badge}
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="mt-1 text-xs text-slate-600">{description}</p>
            ) : null}
            {summary ? <div className="mt-2">{summary}</div> : null}
          </div>

          <div
            className="flex items-start gap-2"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {actions ? (
              <div className="flex items-center gap-2">{actions}</div>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
              aria-expanded={open}
              aria-label={open ? "Tutup panel" : "Buka panel"}
            >
              <ChevronDownIcon
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className={cn("px-4 py-3 sm:px-5", contentClassName)}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
