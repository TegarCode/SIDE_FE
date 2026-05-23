import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";

type HoverInfoTooltipProps = {
  content: React.ReactNode;
  renderContent?: (close: () => void) => React.ReactNode;
  children: React.ReactNode;
  className?: string;
  openOnClick?: boolean;
};

export function HoverInfoTooltip({
  content,
  renderContent,
  children,
  className,
  openOnClick = false
}: HoverInfoTooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({
    top: 0,
    left: 0,
    placement: "top" as "top" | "bottom"
  });
  const anchorRef = React.useRef<HTMLSpanElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  const updatePosition = React.useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const anchorCenterX = rect.left + rect.width / 2;
    const anchorTopY = rect.top;
    const anchorBottomY = rect.bottom;
    const tooltipWidth = tooltipRef.current?.offsetWidth ?? 260;
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 52;
    const margin = 12;
    const clampedLeft = Math.min(
      window.innerWidth - tooltipWidth / 2 - margin,
      Math.max(tooltipWidth / 2 + margin, anchorCenterX)
    );
    const canPlaceTop = anchorTopY > tooltipHeight + 20;

    setPosition({
      top: canPlaceTop ? anchorTopY - 8 : anchorBottomY + 8,
      left: clampedLeft,
      placement: canPlaceTop ? "top" : "bottom"
    });
  }, []);

  const show = React.useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = React.useCallback(() => setOpen(false), []);

  const handleToggle = React.useCallback(
    (event: React.MouseEvent) => {
      if (!openOnClick) return;
      event.preventDefault();
      event.stopPropagation();
      if (open) {
        hide();
        return;
      }
      show();
    },
    [hide, open, openOnClick, show]
  );

  React.useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open || !openOnClick) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (
        (anchorRef.current && anchorRef.current.contains(target)) ||
        (tooltipRef.current && tooltipRef.current.contains(target))
      ) {
        return;
      }
      hide();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") hide();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [hide, open, openOnClick]);

  return (
    <>
      <span
        ref={anchorRef}
        className={className}
        onMouseEnter={openOnClick ? undefined : show}
        onMouseLeave={openOnClick ? undefined : hide}
        onFocus={openOnClick ? undefined : show}
        onBlur={openOnClick ? undefined : hide}
        onClick={handleToggle}
      >
        {children}
      </span>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={tooltipRef}
              className="fixed z-1700"
              style={{
                top: position.top,
                left: position.left,
                transform:
                  position.placement === "top"
                    ? "translate(-50%, -100%)"
                    : "translate(-50%, 0)"
              }}
            >
              <div className="relative max-w-65 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700 shadow-xl">
                {renderContent ? (
                  renderContent(hide)
                ) : (
                  <>
                    {openOnClick ? (
                      <button
                        type="button"
                        onClick={hide}
                        className="absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Tutup tooltip"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    <div className={openOnClick ? "pr-6" : undefined}>
                      {content}
                    </div>
                  </>
                )}
              </div>
              <div
                className={
                  position.placement === "top"
                    ? "mx-auto -mt-1 h-2 w-2 rotate-45 border-b border-r border-slate-200 bg-white"
                    : "mx-auto -mb-1 h-2 w-2 -rotate-135 border-b border-r border-slate-200 bg-white"
                }
              />
            </div>,
            document.body
          )
        : null}
    </>
  );
}
