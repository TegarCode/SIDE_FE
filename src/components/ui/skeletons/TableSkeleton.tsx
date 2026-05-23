import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

type TableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function TableSkeleton({ rows = 8, className }: TableSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-slate-200 bg-white p-2",
        className
      )}
    >
      <div className="mb-2 grid grid-cols-[52px_1.4fr_repeat(3,minmax(120px,1fr))] gap-2">
        <Skeleton className="h-8 rounded-md" />
        <Skeleton className="h-8 rounded-md" />
        <Skeleton className="h-8 rounded-md" />
        <Skeleton className="h-8 rounded-md" />
        <Skeleton className="h-8 rounded-md" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`table-skeleton-${index}`}
            className="grid grid-cols-[52px_1.4fr_repeat(3,minmax(120px,1fr))] gap-2"
          >
            <Skeleton className="h-7 rounded-md" />
            <Skeleton className="h-7 rounded-md" />
            <Skeleton className="h-7 rounded-md" />
            <Skeleton className="h-7 rounded-md" />
            <Skeleton className="h-7 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
