import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { DIPLOMASI_PAGE_SIZE } from "@/constants/indonesiaDiplomasi";
import { cn } from "@/utils/cn";
import type { DiplomasiSummaryCardView } from "@/type/indonesiaDiplomasi";

type DiplomasiSummarySectionProps = {
  cards: DiplomasiSummaryCardView[];
  page: number;
  onChangePage: (page: number) => void;
  loading: boolean;
  error: string | null;
};

export function DiplomasiSummarySection({
  cards,
  page,
  onChangePage,
  loading,
  error
}: DiplomasiSummarySectionProps) {
  const maxPage = Math.max(
    0,
    Math.ceil(cards.length / DIPLOMASI_PAGE_SIZE) - 1
  );
  const safePage = Math.min(page, maxPage);
  const start = safePage * DIPLOMASI_PAGE_SIZE;
  const end = start + DIPLOMASI_PAGE_SIZE;
  const visibleCards = cards.slice(start, end);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          Menampilkan{" "}
          <span className="font-semibold text-[#162360]">
            {cards.length === 0 ? 0 : start + 1}-{Math.min(end, cards.length)}
          </span>{" "}
          dari {cards.length} data
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => onChangePage(0)}
            disabled={safePage === 0}
            className="h-8 w-8 rounded-full border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-40"
            aria-label="Halaman pertama"
          >
            <ChevronDoubleLeftIcon className="mx-auto h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={() => onChangePage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            className="h-8 w-8 rounded-full border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-40"
            aria-label="Sebelumnya"
          >
            <ChevronLeftIcon className="mx-auto h-4 w-4" />
          </Button>

          {Array.from({ length: maxPage + 1 }).map((_, index) => {
            const active = index === safePage;
            return (
              <Button
                key={`summary-page-${index}`}
                type="button"
                onClick={() => onChangePage(index)}
                className={cn(
                  "h-8 w-8 rounded-full text-sm font-semibold",
                  active
                    ? "bg-[#5E7ADD] text-white shadow-sm"
                    : "border border-blue-300 bg-white text-blue-700 hover:bg-blue-50"
                )}
                aria-label={`Halaman ${index + 1}`}
              >
                {index + 1}
              </Button>
            );
          })}

          <Button
            type="button"
            onClick={() => onChangePage(Math.min(maxPage, safePage + 1))}
            disabled={safePage >= maxPage}
            className="h-8 w-8 rounded-full border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-40"
            aria-label="Berikutnya"
          >
            <ChevronRightIcon className="mx-auto h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={() => onChangePage(maxPage)}
            disabled={safePage >= maxPage}
            className="h-8 w-8 rounded-full border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-40"
            aria-label="Halaman terakhir"
          >
            <ChevronDoubleRightIcon className="mx-auto h-4 w-4" />
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {visibleCards.map((card) => (
          <SummaryCard key={card.id} card={card} loading={loading} />
        ))}
      </div>

      {!loading && visibleCards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-4 text-xs text-slate-600">
          Tidak ada data ringkasan yang dapat ditampilkan.
        </div>
      ) : null}
    </section>
  );
}
