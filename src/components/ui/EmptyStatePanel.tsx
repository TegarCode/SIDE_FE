import { SparklesIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

type EmptyStatePanelProps = {
  title?: string;
  description: string;
  className?: string;
  compact?: boolean;
};

export function EmptyStatePanel({
  title = "Data belum tersedia",
  description,
  className,
  compact = false
}: EmptyStatePanelProps) {
  return (
    <div
      className={cn(
        "flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(241,245,249,0.96))] px-6 py-6 text-center",
        className
      )}
    >
      <div className={cn("max-w-sm", compact ? "space-y-2" : "space-y-3")}>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200">
          <SparklesIcon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            {title}
          </p>
          <p className="text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
