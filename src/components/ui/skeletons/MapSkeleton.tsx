import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

type MapSkeletonProps = {
  className?: string;
};

export function MapSkeleton({ className }: MapSkeletonProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-slate-50",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="relative h-120 bg-[linear-gradient(135deg,#e2e8f0_0%,#cbd5e1_45%,#dbeafe_100%)]">
        <div className="absolute left-3 top-3 rounded-md border border-slate-200 bg-white/90 p-1.5">
          <Skeleton className="h-6 w-6 rounded-sm" />
          <Skeleton className="mt-1 h-6 w-6 rounded-sm" />
        </div>
        <div className="absolute bottom-3 left-3 right-3 rounded-md border border-slate-200 bg-white/90 p-2">
          <div className="flex gap-1.5">
            <Skeleton className="h-3 flex-1 rounded-full" />
            <Skeleton className="h-3 flex-1 rounded-full" />
            <Skeleton className="h-3 flex-1 rounded-full" />
            <Skeleton className="h-3 flex-1 rounded-full" />
            <Skeleton className="h-3 flex-1 rounded-full" />
          </div>
          <div className="mt-1 flex justify-between">
            <Skeleton className="h-2 w-10 rounded-full" />
            <Skeleton className="h-2 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
