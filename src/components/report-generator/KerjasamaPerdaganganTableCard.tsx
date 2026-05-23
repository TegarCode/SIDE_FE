import React from "react";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { Pagination } from "@/components/ui/Pagination";
import type { KerjasamaPerdaganganItem } from "@/service/report-generator/kerjasamaPerdagangan";

type KerjasamaPerdaganganTableCardProps = {
  data: KerjasamaPerdaganganItem[];
  loading: boolean;
  originLabel: string;
  originItems: string[];
  destinationSummary: string;
  destinationItems: string[];
  sourceLabel: string;
  yearStartLabel: string;
  yearEndLabel: string;
  onDownloadSnapshotPdf?: () => void;
  onDownloadSnapshotWord?: () => void;
  downloadLoadingKey?: "snapshot-word" | "snapshot-pdf" | null;
};

const METRIC_LABELS: Record<string, string> = {
  ekspor: "Ekspor",
  impor: "Impor",
  neraca: "Neraca",
  total: "Total Perdagangan"
};

function formatValue(value: unknown) {
  if (value == null || value === "") return "-";
  return String(value);
}

export function KerjasamaPerdaganganTableCard({
  data,
  loading,
  originLabel,
  originItems,
  destinationSummary,
  destinationItems,
  sourceLabel,
  yearStartLabel,
  yearEndLabel,
  onDownloadSnapshotPdf,
  onDownloadSnapshotWord,
  downloadLoadingKey = null
}: KerjasamaPerdaganganTableCardProps) {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState("5");
  const [expandedRows, setExpandedRows] = React.useState<number[]>([]);
  const [openDownloadMenu, setOpenDownloadMenu] = React.useState<
    "snapshot" | null
  >(null);
  const downloadMenuRef = React.useRef<HTMLDivElement | null>(null);

  const years = React.useMemo(() => {
    const start = Number(yearStartLabel);
    const end = Number(yearEndLabel);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      return Array.from({ length: end - start + 1 }, (_, index) =>
        String(start + index)
      );
    }

    const set = new Set<string>();
    data.forEach((group) => {
      group.per?.forEach((entry) => {
        if (entry.tahun) set.add(String(entry.tahun));
      });
    });

    return Array.from(set).sort((left, right) => Number(left) - Number(right));
  }, [data, yearEndLabel, yearStartLabel]);

  const pageSize = React.useMemo(() => {
    if (limit === "ALL") return data.length || 1;
    const numeric = Number(limit);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 5;
  }, [data.length, limit]);

  const totalPages = React.useMemo(() => {
    if (limit === "ALL") return 1;
    return Math.max(1, Math.ceil(data.length / pageSize));
  }, [data.length, limit, pageSize]);

  const paginatedRows = React.useMemo(() => {
    if (limit === "ALL") return data;
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, limit, page, pageSize]);

  React.useEffect(() => {
    setPage(1);
  }, [data.length, limit]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!downloadMenuRef.current) return;
      if (downloadMenuRef.current.contains(event.target as Node)) return;
      setOpenDownloadMenu(null);
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderTooltipList = React.useCallback(
    (title: string, items: string[]) => (
      <div className="space-y-2">
        <div className="border-b border-slate-200 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
        </div>
        <div className="max-h-44 space-y-1 overflow-y-auto pr-1 text-xs text-slate-600">
          {items.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      </div>
    ),
    []
  );

  const subtitle = (
    <>
      <span>Asal: </span>
      {originItems.length > 2 ? (
        <HoverInfoTooltip
          content={renderTooltipList("Asal", originItems)}
          openOnClick
        >
          <span className="cursor-help underline decoration-dotted underline-offset-3">
            {originLabel}
          </span>
        </HoverInfoTooltip>
      ) : (
        <span>{originLabel}</span>
      )}
      <span> | Tujuan: </span>
      {destinationItems.length > 2 ? (
        <HoverInfoTooltip
          content={renderTooltipList("Tujuan", destinationItems)}
          openOnClick
        >
          <span className="cursor-help underline decoration-dotted underline-offset-3">
            {destinationSummary}
          </span>
        </HoverInfoTooltip>
      ) : (
        <span>{destinationSummary}</span>
      )}
      <span>{` | Tahun: ${yearStartLabel}-${yearEndLabel} | Total Data: ${data.length.toLocaleString("id-ID")}`}</span>
    </>
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-72 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-full max-w-4xl animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyStatePanel
        title="Data kerjasama perdagangan belum tersedia"
        description="Atur filter kerjasama perdagangan lalu tekan Cari Data untuk memuat hasil."
      />
    );
  }

  const table = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Klik baris pasangan negara untuk membuka detail metrik perdagangan.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Tampilkan</span>
          <DataLimitSelect
            value={limit}
            onChange={setLimit}
            options={["5", "10", "20", "50", "ALL"]}
            itemLabel="baris"
            className="w-32"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="w-12 border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]">
                  {" "}
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]">
                  Pasangan Negara
                </th>
                {years.map((year) => (
                  <th
                    key={year}
                    className="border-b border-slate-200 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em]"
                  >
                    {year} (Ribu US$)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.map((group, index) => {
                const rowIndex =
                  limit === "ALL" ? index : (page - 1) * pageSize + index;
                const isExpanded = expandedRows.includes(rowIndex);

                return (
                  <React.Fragment
                    key={`${rowIndex}-${group.NegaraAsal}-${group.NegaraTujuan}`}
                  >
                    <tr
                      className="cursor-pointer bg-emerald-50 transition hover:bg-emerald-100"
                      onClick={() =>
                        setExpandedRows((current) =>
                          current.includes(rowIndex)
                            ? current.filter((item) => item !== rowIndex)
                            : [...current, rowIndex]
                        )
                      }
                    >
                      <td className="px-4 py-3 text-slate-500">
                        {isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </td>
                      <td
                        colSpan={years.length + 1}
                        className="px-4 py-3 text-center font-semibold text-slate-800"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>
                            {group.NegaraAsal} - {group.NegaraTujuan}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {isExpanded
                      ? Object.entries(METRIC_LABELS).map(
                          ([metricKey, metricLabel], metricIndex) => (
                            <tr
                              key={`${rowIndex}-${metricKey}`}
                              className={
                                metricIndex % 2 === 0
                                  ? "bg-white"
                                  : "bg-slate-50/70"
                              }
                            >
                              <td className="px-4 py-3 text-slate-400"> </td>
                              <td className="px-4 py-3 font-medium text-slate-700">
                                {metricLabel}
                              </td>
                              {years.map((year) => {
                                const yearEntry = group.per?.find(
                                  (entry) => String(entry.tahun) === year
                                );
                                const detail = yearEntry?.detail?.[0] ?? {};
                                return (
                                  <td
                                    key={`${rowIndex}-${metricKey}-${year}`}
                                    className="px-4 py-3 text-right text-slate-900"
                                  >
                                    {formatValue(
                                      detail[metricKey as keyof typeof detail]
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          )
                        )
                      : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="px-0 pb-0"
      />
    </div>
  );

  return (
    <ExpandableCard
      title="Laporan Analisis Kerjasama Perdagangan"
      subtitle={subtitle}
      className="shadow-sm"
      actions={
        <div
          ref={downloadMenuRef}
          className="flex flex-wrap items-center justify-end gap-2"
        >
          <div className="relative">
            <Button
              type="button"
              variant="success"
              onClick={() =>
                setOpenDownloadMenu((current) =>
                  current === "snapshot" ? null : "snapshot"
                )
              }
              disabled={
                (!onDownloadSnapshotPdf && !onDownloadSnapshotWord) ||
                downloadLoadingKey !== null
              }
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold shadow-sm"
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5" />
              {downloadLoadingKey ? "Menyiapkan..." : "Snapshot"}
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </Button>

            {openDownloadMenu === "snapshot" ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setOpenDownloadMenu(null);
                    onDownloadSnapshotPdf?.();
                  }}
                  disabled={
                    !onDownloadSnapshotPdf || downloadLoadingKey !== null
                  }
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>PDF</span>
                  <span className="text-slate-400">.pdf</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDownloadMenu(null);
                    onDownloadSnapshotWord?.();
                  }}
                  disabled={
                    !onDownloadSnapshotWord || downloadLoadingKey !== null
                  }
                  className="flex w-full items-center justify-between border-t border-slate-100 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>Word</span>
                  <span className="text-slate-400">.docx</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      }
      expandedContent={table}
      modalSize="full"
      modalBodyClassName="bg-white"
    >
      <div className="space-y-4">
        {table}
        <p className="text-xs text-slate-500">
          Sumber Data: {sourceLabel || "-"}
        </p>
      </div>
    </ExpandableCard>
  );
}
