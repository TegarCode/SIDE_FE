import { InformationCircleIcon } from "@heroicons/react/24/outline";

type FilterFallbackCardProps = {
  title: string;
  body: string;
  className?: string;
};

export function FilterFallbackCard({
  title,
  body,
  className
}: FilterFallbackCardProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 bg-white/80 p-4 text-sm text-slate-600 ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <InformationCircleIcon className="mt-0.5 h-5 w-5 text-slate-400" />
        <div>
          <p className="font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">{body}</p>
        </div>
      </div>
    </div>
  );
}
