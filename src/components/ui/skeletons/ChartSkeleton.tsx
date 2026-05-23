import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

type ChartSkeletonProps = {
  className?: string;
};

export function ChartSkeleton({ className }: ChartSkeletonProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-slate-50",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>
      <div className="relative h-130 px-3 py-3">
        <div className="absolute inset-3 rounded-lg bg-white">
          <div className="absolute bottom-8 left-8 right-4 top-4">
            <div className="relative h-full w-full">
              <div className="absolute bottom-0 left-0 right-0 top-0 rounded-md border-l border-b border-slate-200" />
              <div className="absolute inset-x-0 top-[22%] border-t border-dashed border-slate-200" />
              <div className="absolute inset-x-0 top-[44%] border-t border-dashed border-slate-200" />
              <div className="absolute inset-x-0 top-[66%] border-t border-dashed border-slate-200" />
              <div className="absolute bottom-0 left-[8%] right-[4%] flex h-[78%] items-end justify-between gap-3">
                <Skeleton className="h-[38%] w-full rounded-t-md rounded-b-none" />
                <Skeleton className="h-[56%] w-full rounded-t-md rounded-b-none" />
                <Skeleton className="h-[30%] w-full rounded-t-md rounded-b-none" />
                <Skeleton className="h-[72%] w-full rounded-t-md rounded-b-none" />
                <Skeleton className="h-[48%] w-full rounded-t-md rounded-b-none" />
                <Skeleton className="h-[64%] w-full rounded-t-md rounded-b-none" />
                <Skeleton className="h-[42%] w-full rounded-t-md rounded-b-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-slate-200 px-3 py-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-14 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-14 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}
