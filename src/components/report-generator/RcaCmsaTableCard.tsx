import React from "react";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Pagination } from "@/components/ui/Pagination";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import type { RcaCmsaItem } from "@/service/report-generator/rcaCmsa";
import type {
  SortDirection,
  SortableCellValue,
  SortableColumn
} from "@/components/ui/SortableDataTable";

type Props = {
  data: RcaCmsaItem[];
  loading: boolean;
  originLabel: string;
  destinationLabel: string;
  strategyLabel: string;
  onDownloadSnapshotWord?: () => void;
  onDownloadSnapshotPdf?: () => void;
  onDownloadSummaryWord?: () => void;
  onDownloadSummaryPdf?: () => void;
  downloadLoadingKey?:
    | "snapshot-word"
    | "snapshot-pdf"
    | "summary-word"
    | "summary-pdf"
    | null;
};

type TableRow = Record<string, SortableCellValue>;

function buildRows(data: RcaCmsaItem[]): TableRow[] {
  return data.map((item) => ({
    HsCode: item.HsCode ?? "-",
    NamaProduk: item.NamaProduk ?? "-",
    Class_Asal: item.Class_Asal ?? "-",
    Class_Tujuan: item.Class_Tujuan ?? "-",
    Strategy: item.Strategy ?? "-",
    Asal_World: item.Asal_World ?? "0",
    Tujuan_World: item.Tujuan_World ?? "0",
    Impor_RI_From_World: item.Impor_RI_From_World ?? "0",
    Impor_RI_From_Partner: item.Impor_RI_From_Partner ?? "0",
    Ekspor_RI_To_Partner: item.Ekspor_RI_To_Partner ?? "0",
    Impor_Partner_From_World: item.Impor_Partner_From_World ?? "0"
  }));
}

function toComparableNumber(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value)
    .trim()
    .replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;

  const sign = cleaned.startsWith("-") ? "-" : "";
  const unsigned = cleaned.replace(/^-/, "");
  const commaCount = (unsigned.match(/,/g) ?? []).length;
  const dotCount = (unsigned.match(/\./g) ?? []).length;
  let normalized = unsigned;

  if (commaCount > 0 && dotCount > 0) {
    const lastComma = unsigned.lastIndexOf(",");
    const lastDot = unsigned.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    normalized = unsigned.replace(
      new RegExp(`\\${thousandsSeparator}`, "g"),
      ""
    );
    if (decimalSeparator === ",") normalized = normalized.replace(",", ".");
  } else if (commaCount > 0) {
    if (commaCount > 1) {
      normalized = unsigned.replace(/,/g, "");
    } else {
      const [left, right = ""] = unsigned.split(",");
      normalized = right.length === 3 ? `${left}${right}` : `${left}.${right}`;
    }
  } else if (dotCount > 0) {
    if (dotCount > 1) {
      normalized = unsigned.replace(/\./g, "");
    } else {
      const [left, right = ""] = unsigned.split(".");
      normalized = right.length === 3 ? `${left}${right}` : `${left}.${right}`;
    }
  }

  const parsed = Number(`${sign}${normalized}`);
  return Number.isFinite(parsed) ? parsed : null;
}

function getSortValue(value: SortableCellValue) {
  if (typeof value === "object" && value !== null && "display" in value) {
    return value.sortValue ?? "";
  }
  return value;
}

export function RcaCmsaTableCard({
  data,
  loading,
  originLabel,
  destinationLabel,
  strategyLabel,
  onDownloadSnapshotWord,
  onDownloadSnapshotPdf,
  onDownloadSummaryWord,
  onDownloadSummaryPdf,
  downloadLoadingKey = null
}: Props) {
  const [limit, setLimit] = React.useState("50");
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<string>("HsCode");
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>("asc");
  const [sortColumnLabel, setSortColumnLabel] = React.useState("HS Code");
  const [openDownloadMenu, setOpenDownloadMenu] = React.useState<
    "snapshot" | "summary" | null
  >(null);
  const downloadMenuRef = React.useRef<HTMLDivElement | null>(null);

  const columns = React.useMemo<SortableColumn[]>(
    () => [
      {
        key: "HsCode",
        label: "HS Code",
        className: "min-w-28 font-medium text-slate-900",
        headerClassName: "min-w-28"
      },
      {
        key: "NamaProduk",
        label: "Nama Produk",
        className: "min-w-84",
        headerClassName: "min-w-84"
      },
      {
        key: "Class_Asal",
        label: originLabel,
        className: "min-w-40",
        headerClassName: "min-w-40"
      },
      {
        key: "Class_Tujuan",
        label: destinationLabel,
        className: "min-w-40",
        headerClassName: "min-w-40"
      },
      {
        key: "Strategy",
        label: "Strategi",
        className: "min-w-32",
        headerClassName: "min-w-32"
      },
      {
        key: "Asal_World",
        label: "Asal Dunia (Ribu US$)",
        className: "min-w-42",
        headerClassName: "min-w-42",
        align: "right" as const
      },
      {
        key: "Tujuan_World",
        label: "Tujuan Dunia  (Ribu US$)",
        className: "min-w-42",
        headerClassName: "min-w-42",
        align: "right" as const
      },
      {
        key: "Impor_RI_From_World",
        label: "Impor RI dari Dunia (Ribu US$)",
        className: "min-w-48",
        headerClassName: "min-w-48",
        align: "right" as const
      },
      {
        key: "Impor_RI_From_Partner",
        label: "Impor RI dari Negara/Entitas (Ribu US$)",
        className: "min-w-52",
        headerClassName: "min-w-52",
        align: "right" as const
      },
      {
        key: "Ekspor_RI_To_Partner",
        label: "Ekspor RI ke Negara/Entitas (Ribu US$)",
        className: "min-w-52",
        headerClassName: "min-w-52",
        align: "right" as const
      },
      {
        key: "Impor_Partner_From_World",
        label: "Impor Negara/Entitas dari Dunia (Ribu US$)",
        className: "min-w-56",
        headerClassName: "min-w-56",
        align: "right" as const
      }
    ],
    [destinationLabel, originLabel]
  );

  const baseRows = React.useMemo(() => buildRows(data), [data]);
  const effectiveRows = React.useMemo(() => {
    const rows = [...baseRows];

    rows.sort((left, right) => {
      const leftValue = getSortValue(left[sortKey] ?? "");
      const rightValue = getSortValue(right[sortKey] ?? "");
      const leftNumber = toComparableNumber(leftValue);
      const rightNumber = toComparableNumber(rightValue);

      if (leftNumber != null && rightNumber != null) {
        return sortDirection === "asc"
          ? leftNumber - rightNumber
          : rightNumber - leftNumber;
      }

      const compared = String(leftValue).localeCompare(
        String(rightValue),
        "id-ID",
        {
          sensitivity: "base",
          numeric: true
        }
      );
      return sortDirection === "asc" ? compared : -compared;
    });

    return rows;
  }, [baseRows, sortDirection, sortKey]);

  React.useEffect(() => {
    setPage(1);
  }, [limit, data, sortDirection, sortKey]);

  const pageSize = React.useMemo(() => {
    if (limit === "ALL") return effectiveRows.length || 1;
    const numeric = Number(limit);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 10;
  }, [effectiveRows.length, limit]);

  const totalPages = React.useMemo(
    () =>
      limit === "ALL"
        ? 1
        : Math.max(1, Math.ceil(effectiveRows.length / pageSize)),
    [effectiveRows.length, limit, pageSize]
  );

  React.useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, totalPages]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!downloadMenuRef.current) return;
      if (downloadMenuRef.current.contains(event.target as Node)) return;
      setOpenDownloadMenu(null);
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pagedRows = React.useMemo(() => {
    if (limit === "ALL") return effectiveRows;
    const start = (page - 1) * pageSize;
    return effectiveRows.slice(start, start + pageSize);
  }, [effectiveRows, limit, page, pageSize]);

  const subtitle = `Asal: ${originLabel} | Tujuan: ${destinationLabel} | Jenis Analisis: ${strategyLabel} | Total Data: ${effectiveRows.length.toLocaleString("id-ID")} | Sorting berdasarkan kolom ${sortColumnLabel}`;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-72 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (effectiveRows.length === 0) {
    return (
      <EmptyStatePanel
        title="Data RCA-CMSA belum tersedia"
        description="Atur filter negara/entitas tujuan dan jenis analisis lalu tekan Cari Data untuk memuat hasil."
      />
    );
  }

  const table = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div />
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
        <SortableDataTable
          columns={columns}
          rows={pagedRows}
          controlledSortKey={sortKey}
          controlledSortDirection={sortDirection}
          onSortColumnChange={setSortColumnLabel}
          onSortChange={(nextKey, nextDirection) => {
            setSortKey(nextKey);
            setSortDirection(nextDirection);
          }}
          className="max-h-[90vh]"
          tableClassName="min-w-[1780px]"
        />
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
      title="Laporan Analisis RCA-CMSA"
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
              variant="primary"
              onClick={() =>
                setOpenDownloadMenu((current) =>
                  current === "snapshot" ? null : "snapshot"
                )
              }
              disabled={
                (!onDownloadSnapshotWord && !onDownloadSnapshotPdf) ||
                downloadLoadingKey !== null
              }
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold shadow-sm"
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5" />
              {downloadLoadingKey === "snapshot-word" ||
              downloadLoadingKey === "snapshot-pdf"
                ? "Menyiapkan..."
                : "Snapshot"}
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

          <div className="relative">
            <Button
              type="button"
              variant="success"
              onClick={() =>
                setOpenDownloadMenu((current) =>
                  current === "summary" ? null : "summary"
                )
              }
              disabled={
                (!onDownloadSummaryWord && !onDownloadSummaryPdf) ||
                downloadLoadingKey !== null
              }
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold shadow-sm"
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5" />
              {downloadLoadingKey === "summary-word" ||
              downloadLoadingKey === "summary-pdf"
                ? "Menyiapkan..."
                : "Summary"}
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </Button>

            {openDownloadMenu === "summary" ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setOpenDownloadMenu(null);
                    onDownloadSummaryPdf?.();
                  }}
                  disabled={
                    !onDownloadSummaryPdf || downloadLoadingKey !== null
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
                    onDownloadSummaryWord?.();
                  }}
                  disabled={
                    !onDownloadSummaryWord || downloadLoadingKey !== null
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
      {table}
    </ExpandableCard>
  );
}
