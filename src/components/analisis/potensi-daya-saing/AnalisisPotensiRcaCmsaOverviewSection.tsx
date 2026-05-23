import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnalisisPotensiSummaryCard } from "@/components/analisis/potensi-daya-saing/AnalisisPotensiSummaryCard";
import { AnalisisPotensiTableCard } from "@/components/analisis/potensi-daya-saing/AnalisisPotensiTableCard";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type {
  AnalisisPotensiDayaSaingOverviewResult,
  AnalisisPotensiDayaSaingSimpleRow
} from "@/type/analisis";

type AnalisisPotensiRcaCmsaOverviewSectionProps = {
  data: AnalisisPotensiDayaSaingOverviewResult | null;
  loading?: boolean;
  errorMessage?: string | null;
};

function filterRows(rows: AnalisisPotensiDayaSaingSimpleRow[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter((row) =>
    [row.rank, row.hs4, row.kode, row.nama, row.strategi, row.nilai]
      .map((value) => String(value ?? "").toLowerCase())
      .some((value) => value.includes(normalized))
  );
}

export function AnalisisPotensiRcaCmsaOverviewSection({
  data,
  loading = false,
  errorMessage
}: AnalisisPotensiRcaCmsaOverviewSectionProps) {
  const [query, setQuery] = React.useState("");

  const exportRows = React.useMemo(
    () => filterRows(data?.buckets.export ?? [], query),
    [data?.buckets.export, query]
  );
  const importRows = React.useMemo(
    () => filterRows(data?.buckets.import ?? [], query),
    [data?.buckets.import, query]
  );
  const fdiInboundRows = React.useMemo(
    () => filterRows(data?.buckets.fdiInbound ?? [], query),
    [data?.buckets.fdiInbound, query]
  );
  const fdiOutboundRows = React.useMemo(
    () => filterRows(data?.buckets.fdiOutbound ?? [], query),
    [data?.buckets.fdiOutbound, query]
  );

  const originLabel = data?.origin.name ?? data?.origin.code ?? "-";
  const destinationLabel =
    data?.destination.name ?? data?.destination.code ?? "-";
  const hasSearchQuery = query.trim().length > 0;
  const searchEmptyMessage = hasSearchQuery
    ? "Tidak ada hasil yang sesuai dengan pencarian."
    : "Data saran strategi belum tersedia.";
  const formatInitialCount = React.useCallback(
    (count: number | null | undefined) =>
      `${(count ?? 0).toLocaleString("id-ID")} entri (awal)`,
    []
  );

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div
          className="relative px-4 py-4 text-white sm:px-6"
          style={{
            backgroundImage: `
              linear-gradient(135deg, #384AA0, #5E7ADD),
              radial-gradient(1200px 400px at -10% -50%, rgba(255,255,255,.15), transparent 60%),
              radial-gradient(800px 300px at 110% 10%, rgba(255,255,255,.10), transparent 55%)
            `
          }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2 ring-1 ring-white/20">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight sm:text-lg">
                RCA &amp; CMSA
              </h3>
              <p className="text-xs text-white/90 sm:text-[13px]">
                Ringkasan konsep & interpretasi cepat
              </p>
            </div>
          </div>
          <div className="absolute right-4 top-4 hidden gap-2 sm:flex">
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
              Perdagangan
            </span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
              Daya Saing
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5">
              <span className="opacity-90">Asal:</span>
              <span className="ml-1 font-semibold">{originLabel}</span>
            </span>
            <span className="opacity-70">→</span>
            <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5">
              <span className="opacity-90">Tujuan:</span>
              <span className="ml-1 font-semibold">{destinationLabel}</span>
            </span>
          </div>
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/40 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                RCA
              </span>
              <span className="text-xs text-slate-500">
                Revealed Comparative Advantage
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              Mengukur{" "}
              <span className="font-semibold">
                keunggulan komparatif ekspor
              </span>{" "}
              suatu negara untuk produk tertentu dibanding total ekspor dunia.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/40 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                CMSA
              </span>
              <span className="text-xs text-slate-500">
                Constant Market Share Analysis
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              Menganalisis perubahan{" "}
              <span className="font-semibold">pangsa pasar </span> ekspor dengan
              memisahkan pengaruh faktor pertumbuhan pasar, komposisi produk,
              dan daya saing.
            </p>
          </div>
        </div>
      </section>

      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari rank / HS4 / kode / nama / strategi / nilai..."
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-2.5 rounded p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Hapus pencarian"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <TableSkeleton rows={2} />
            <TableSkeleton rows={2} />
            <TableSkeleton rows={2} />
            <TableSkeleton rows={2} />
            <TableSkeleton rows={2} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <TableSkeleton rows={8} />
            <TableSkeleton rows={8} />
            <TableSkeleton rows={8} />
            <TableSkeleton rows={8} />
          </div>
        </>
      ) : errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <AnalisisPotensiSummaryCard
              title="TOTAL SEMUA PRODUK"
              count={data?.totals.allCount ?? 0}
              subtitle={formatInitialCount(data?.totals.allCount)}
              accent="indigo"
            />
            <AnalisisPotensiSummaryCard
              title="TOP PRODUK EKSPOR"
              count={exportRows.length}
              subtitle={formatInitialCount(data?.totals.exportCount)}
              sumValue={data?.totals.exportSum}
              accent="emerald"
            />
            <AnalisisPotensiSummaryCard
              title="TOP PRODUK IMPOR"
              count={importRows.length}
              subtitle={formatInitialCount(data?.totals.importCount)}
              sumValue={data?.totals.importSum}
              accent="sky"
            />
            <AnalisisPotensiSummaryCard
              title="TOP PRODUK FDI INBOUND"
              count={fdiInboundRows.length}
              subtitle={formatInitialCount(data?.totals.fdiInboundCount)}
              sumValue={data?.totals.fdiInboundSum}
              accent="amber"
            />
            <AnalisisPotensiSummaryCard
              title="TOP PRODUK FDI OUTBOUND"
              count={fdiOutboundRows.length}
              subtitle={formatInitialCount(data?.totals.fdiOutboundCount)}
              sumValue={data?.totals.fdiOutboundSum}
              accent="rose"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalisisPotensiTableCard
              title="Saran Strategi Produk Ekspor Teratas"
              titleValue="Saran Strategi Ekspor"
              rows={exportRows}
              sourceName={data?.sourceName}
              originLabel={originLabel}
              destinationLabel={destinationLabel}
              emptyMessage={searchEmptyMessage}
            />
            <AnalisisPotensiTableCard
              title="Saran Strategi Produk Impor Teratas"
              titleValue="Saran Strategi Impor"
              rows={importRows}
              sourceName={data?.sourceName}
              originLabel={originLabel}
              destinationLabel={destinationLabel}
              emptyMessage={searchEmptyMessage}
            />
            <AnalisisPotensiTableCard
              title="Saran Strategi Produk FDI Masuk Teratas"
              titleValue="Saran Strategi FDI Masuk"
              rows={fdiInboundRows}
              sourceName={data?.sourceName}
              originLabel={originLabel}
              destinationLabel={destinationLabel}
              emptyMessage={searchEmptyMessage}
            />
            <AnalisisPotensiTableCard
              title="Saran Strategi Produk FDI Keluar Teratas"
              titleValue="Saran Strategi FDI Keluar"
              rows={fdiOutboundRows}
              sourceName={data?.sourceName}
              originLabel={originLabel}
              destinationLabel={destinationLabel}
              emptyMessage={searchEmptyMessage}
            />
          </div>
        </>
      )}
    </section>
  );
}
