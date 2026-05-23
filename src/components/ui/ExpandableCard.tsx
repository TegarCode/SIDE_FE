import React from "react";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";

type ExpandableCardProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  actions?: React.ReactNode;
  expandActions?: React.ReactNode;
  expandLabel?: string;
  modalSize?: "lg" | "xl" | "2xl" | "full";
  modalBodyClassName?: string;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
};

export function ExpandableCard({
  title,
  subtitle,
  children,
  expandedContent,
  actions,
  expandActions,
  expandLabel = "Perbesar kartu",
  modalSize = "xl",
  modalBodyClassName,
  className,
  contentClassName,
  titleClassName
}: ExpandableCardProps) {
  const [open, setOpen] = React.useState(false);
  const canExpand = Boolean(expandedContent);

  return (
    <>
      <div
        className={cn(
          "flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
          className
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className={cn(
                "font-semibold tracking-tight text-slate-900",
                titleClassName
              )}
            >
              {title}
            </h3>
            {subtitle ? (
              <div className="text-xs text-slate-500">{subtitle}</div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {expandActions}
            {canExpand ? (
              <IconTooltip label={expandLabel}>
                <span>
                  <Button
                    type="button"
                    className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                    aria-label={expandLabel}
                    onClick={() => setOpen(true)}
                  >
                    <ArrowsPointingOutIcon className="h-4 w-4" />
                  </Button>
                </span>
              </IconTooltip>
            ) : null}
          </div>
        </div>

        <div className={cn("min-w-0 flex-1", contentClassName)}>{children}</div>
      </div>

      {canExpand ? (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={title}
          subtitle={subtitle}
          size={modalSize}
          bodyClassName={cn("bg-slate-50", modalBodyClassName)}
        >
          {expandedContent}
        </Modal>
      ) : null}
    </>
  );
}
