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
import { Pagination } from "@/components/ui/Pagination";
import type { MarketShareItem } from "@/service/report-generator/marketShare";

type MarketShareTableCardProps = {
  data: MarketShareItem[];
  loading: boolean;
  originLabel: string;
  destinationLabel: string;
  tradeTypeLabel: string;
  topProductLabel: string;
  yearLabel: string;
  sourceLabel: string;
  onDownloadSnapshotPdf?: () => void;
  onDownloadSnapshotWord?: () => void;
  downloadLoadingKey?: "snapshot-word" | "snapshot-pdf" | null;
};

function formatNumber(value: unknown, suffix = "") {
  if (value == null || value === "") return "-";

  const raw = String(value).trim();
  const normalized = raw.replace(/\./g, "").replace(/,/g, ".");
  const numeric = Number(normalized);

  if (Number.isNaN(numeric)) return `${value}${suffix}`;

  return `${numeric.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}${suffix}`;
}

function toComparableNumber(value: unknown) {
  if (value == null || value === "") return null;
  const normalized = String(value).trim().replace(/\./g, "").replace(/,/g, ".");
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

export function MarketShareTableCard({
  data,
  loading,
  originLabel,
  destinationLabel,
  tradeTypeLabel,
  topProductLabel,
  yearLabel,
  sourceLabel,
  onDownloadSnapshotPdf,
  onDownloadSnapshotWord,
  downloadLoadingKey = null
}: MarketShareTableCardProps) {
  const [sortKey, setSortKey] =
    React.useState<keyof MarketShareItem>("TotalNilai");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  );
  const [sortColumnLabel, setSortColumnLabel] = React.useState("Total Nilai");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState("50");
  const [expandedRows, setExpandedRows] = React.useState<number[]>([]);
  const [openDownloadMenu, setOpenDownloadMenu] = React.useState<
    "snapshot" | null
  >(null);
  const downloadMenuRef = React.useRef<HTMLDivElement | null>(null);

  const sortedRows = React.useMemo(() => {
    const rows = [...data];

    rows.sort((left, right) => {
      const leftValue = left?.[sortKey];
      const rightValue = right?.[sortKey];
      const leftNumber = toComparableNumber(leftValue);
      const rightNumber = toComparableNumber(rightValue);

      if (leftNumber != null && rightNumber != null) {
        return sortDirection === "asc"
          ? leftNumber - rightNumber
          : rightNumber - leftNumber;
      }

      const compared = String(leftValue ?? "").localeCompare(
        String(rightValue ?? ""),
        "id-ID",
        {
          sensitivity: "base",
          numeric: true
        }
      );
      return sortDirection === "asc" ? compared : -compared;
    });

    return rows;
  }, [data, sortDirection, sortKey]);

  const pageSize = React.useMemo(() => {
    if (limit === "ALL") return sortedRows.length || 1;
    const numeric = Number(limit);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 50;
  }, [limit, sortedRows.length]);

  const totalPages = React.useMemo(() => {
    if (limit === "ALL") return 1;
    return Math.max(1, Math.ceil(sortedRows.length / pageSize));
  }, [limit, pageSize, sortedRows.length]);

  const paginatedRows = React.useMemo(() => {
    if (limit === "ALL") return sortedRows;
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [limit, page, pageSize, sortedRows]);

  React.useEffect(() => {
    setPage(1);
  }, [data.length, limit, sortDirection, sortKey]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!downloadMenuRef.current) return;
      if (downloadMenuRef.current.contains(event.target as Node)) return;
      setOpenDownloadMenu(null);
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const subtitle = `Asal: ${originLabel} | Tujuan: ${destinationLabel} | Tipe Perdagangan: ${tradeTypeLabel} | ${topProductLabel} | Tahun: ${yearLabel} | Total Data: ${sortedRows.length.toLocaleString(
    "id-ID"
  )} | Sorting berdasarkan kolom ${sortColumnLabel}`;

  const handleSort = (key: keyof MarketShareItem, label: string) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "TotalNilai" ? "desc" : "asc");
      setSortColumnLabel(label);
    }
    if (sortKey === key) {
      setSortColumnLabel(label);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-72 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-full max-w-4xl animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (sortedRows.length === 0) {
    return (
      <EmptyStatePanel
        title="Data market share belum tersedia"
        description="Atur filter market share lalu tekan Cari Data untuk memuat hasil."
      />
    );
  }

  const table = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Klik baris untuk membuka rincian produk.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Tampilkan</span>
          <DataLimitSelect
            value={limit}
            onChange={setLimit}
            options={["10", "20", "50", "100", "ALL"]}
            itemLabel="baris"
            className="w-32"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="w-12 border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]">
                  {" "}
                </th>
                {[
                  { key: "NegaraAsal", label: "Negara/Entitas Asal" },
                  { key: "NegaraTujuan", label: "Negara/Entitas Tujuan" },
                  { key: "TipePerdagangan", label: "Tipe Perdagangan" },
                  { key: "Tahun", label: "Tahun" },
                  {
                    key: "TotalNilai",
                    label: "Total Nilai (Ribu US$)",
                    align: "right" as const
                  }
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={() =>
                      handleSort(
                        column.key as keyof MarketShareItem,
                        column.label
                      )
                    }
                    className={`border-b border-slate-200 cursor-pointer px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] ${
                      column.align === "right" ? "text-right" : ""
                    }`}
                  >
                    <div
                      className={`inline-flex items-center gap-1 ${column.align === "right" ? "justify-end" : "justify-start"}`}
                    >
                      <span>{column.label}</span>
                      <span className="text-slate-400">
                        {sortKey === column.key
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.map((row, index) => {
                const rowIndex =
                  limit === "ALL" ? index : (page - 1) * pageSize + index;
                const isExpanded = expandedRows.includes(rowIndex);

                return (
                  <React.Fragment
                    key={`${rowIndex}-${row.NegaraAsal}-${row.NegaraTujuan}-${row.Tahun}`}
                  >
                    <tr
                      className={`cursor-pointer transition hover:bg-slate-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      }`}
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
                      <td className="px-4 py-3 text-left text-slate-700">
                        {row.NegaraAsal || "-"}
                      </td>
                      <td className="px-4 py-3 text-left text-slate-700">
                        {row.NegaraTujuan || "-"}
                      </td>
                      <td className="px-4 py-3 text-left text-slate-700">
                        {row.TipePerdagangan || "-"}
                      </td>
                      <td className="px-4 py-3 text-left text-slate-700">
                        {row.Tahun || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatNumber(row.TotalNilai)}
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr className="bg-slate-50">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
                            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                              <h4 className="text-sm font-semibold text-slate-900">
                                Rincian Produk
                              </h4>
                              <p className="mt-1 text-xs text-slate-500">
                                Produk penyusun market share untuk baris yang
                                dipilih.
                              </p>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-slate-600">
                                  <tr>
                                    <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]">
                                      No
                                    </th>
                                    <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]">
                                      HS Code
                                    </th>
                                    <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]">
                                      Nama Produk
                                    </th>
                                    <th className="border-b border-slate-200 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em]">
                                      Nilai per Produk (Ribu US$)
                                    </th>
                                    <th className="border-b border-slate-200 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em]">
                                      Pangsa Ekspor (%)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {Array.isArray(row.products) &&
                                  row.products.length > 0 ? (
                                    row.products.map(
                                      (product, productIndex) => (
                                        <tr
                                          key={`${rowIndex}-product-${productIndex}`}
                                          className={
                                            productIndex % 2 === 0
                                              ? "bg-white"
                                              : "bg-slate-50/70"
                                          }
                                        >
                                          <td className="px-4 py-3 text-left text-slate-600">
                                            {productIndex + 1}
                                          </td>
                                          <td className="px-4 py-3 text-left text-slate-700">
                                            {product.hs4 || "-"}
                                          </td>
                                          <td className="px-4 py-3 text-left text-slate-700">
                                            {product.nama_produk || "-"}
                                          </td>
                                          <td className="px-4 py-3 text-right text-slate-900">
                                            {formatNumber(product.nilai)}
                                          </td>
                                          <td className="px-4 py-3 text-right text-slate-900">
                                            {formatNumber(product.pangsa, "%")}
                                          </td>
                                        </tr>
                                      )
                                    )
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan={5}
                                        className="px-4 py-5 text-center text-sm text-slate-500"
                                      >
                                        Rincian produk tidak tersedia untuk
                                        baris ini.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
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
      title="Laporan Analisis Market Share"
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
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-40 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-lg">
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
