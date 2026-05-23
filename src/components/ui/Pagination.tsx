import React from "react";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showWhenSinglePage?: boolean;
};

function buildVisiblePages(page: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  return Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right);
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  showWhenSinglePage = false
}: PaginationProps) {
  if (totalPages <= 1 && !showWhenSinglePage) return null;

  const visiblePages = buildVisiblePages(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-xs font-medium text-slate-500">
        Halaman <span className="text-slate-700">{page}</span> dari{" "}
        <span className="text-slate-700">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 rounded-md p-0 text-slate-600"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="Halaman pertama"
        >
          <ChevronDoubleLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 rounded-md p-0 text-slate-600"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        {visiblePages.map((value, index) => {
          const previous = visiblePages[index - 1];
          const showGap = index > 0 && previous != null && value - previous > 1;

          return (
            <React.Fragment key={`page-${value}`}>
              {showGap ? (
                <span className="px-1 text-sm text-slate-400">...</span>
              ) : null}
              <Button
                type="button"
                variant={value === page ? "primary" : "outline"}
                className="h-8 min-w-8 rounded-md px-2 text-xs font-semibold"
                onClick={() => onPageChange(value)}
              >
                {value}
              </Button>
            </React.Fragment>
          );
        })}

        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 rounded-md p-0 text-slate-600"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Halaman berikutnya"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 rounded-md p-0 text-slate-600"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Halaman terakhir"
        >
          <ChevronDoubleRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
