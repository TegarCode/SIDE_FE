import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type InsightStatCardProps = {
  title: string;
  value?: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  progress?: number | null;
  children?: ReactNode;
  className?: string;
};

export function InsightStatCard({
  title,
  value,
  badge,
  description,
  progress = null,
  children,
  className
}: InsightStatCardProps) {
  const clampedProgress =
    typeof progress === "number" && Number.isFinite(progress)
      ? Math.max(0, Math.min(100, progress))
      : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_12px_24px_rgba(15,23,42,0.05)]",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[#384AA0]" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>
      {children ?? (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">{value}</div>
            {badge ? (
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500">
                {badge}
              </span>
            ) : null}
          </div>
          {description ? (
            <div className="text-[12px] leading-5 text-slate-600">
              {description}
            </div>
          ) : null}
          {clampedProgress != null ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-400 transition-all"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
