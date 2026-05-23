import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { AnalisisRcaEpdCalculationRow } from "@/type/analisis";
import {
  AnalisisTableLimitSelect,
  AnalisisTableSearchInput,
  AnalisisTableSortIcon,
  analisisDownloadButtonClass,
  analisisHeaderButtonClass,
  analisisHeaderButtonRightClass
} from "@/components/analisis/potensi-daya-saing/AnalisisTableUi";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";

type Props = {
  title: string;
  rows: AnalisisRcaEpdCalculationRow[];
  loading?: boolean;
  errorMessage?: string | null;
  originLabel?: string;
  destinationLabel?: string;
  sourceName?: string | null;
};

function compareSortValue(
  left: string | number | null | undefined,
  right: string | number | null | undefined,
  direction: "asc" | "desc"
) {
  const leftEmpty = left == null || left === "";
  const rightEmpty = right == null || right === "";
  if (leftEmpty && rightEmpty) return 0;
  if (leftEmpty) return 1;
  if (rightEmpty) return -1;

  const multiplier = direction === "asc" ? 1 : -1;
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return (leftNumber - rightNumber) * multiplier;
  }

  return String(left).localeCompare(String(right)) * multiplier;
}

function formatValue(value: string | number | null | undefined) {
  if (value == null || value === "") return "-";
  if (typeof value === "number") return value.toLocaleString("id-ID");
  return value;
}

function isNumericColumn(rows: AnalisisRcaEpdCalculationRow[], column: string) {
  return rows.some((row) => {
    const value = row[column];
    return value != null && value !== "" && Number.isFinite(Number(value));
  });
}

export function AnalisisRCAEPDCalculationTableCard({
  title,
  rows,
  loading = false,
  errorMessage,
  originLabel,
  destinationLabel,
  sourceName
}: Props) {
  const columns = React.useMemo(() => Object.keys(rows[0] ?? {}), [rows]);
  const numericColumns = React.useMemo(
    () => new Set(columns.filter((column) => isNumericColumn(rows, column))),
    [columns, rows]
  );
  const [sortKey, setSortKey] = React.useState<string>("");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc"
  );
  const [limit, setLimit] = React.useState(25);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    setSortKey((current) => {
      if (current && columns.includes(current)) return current;
      return columns[0] ?? "";
    });
  }, [columns]);

  const subtitle = React.useMemo(
    () =>
      [
        originLabel && `Asal: ${originLabel}`,
        destinationLabel && `Tujuan: ${destinationLabel}`
      ]
        .filter(Boolean)
        .join(" | "),
    [destinationLabel, originLabel]
  );

  const filteredRows = React.useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const sortedRows = sortKey
      ? [...rows].sort((left, right) =>
          compareSortValue(left[sortKey], right[sortKey], sortDirection)
        )
      : [...rows];

    if (!keyword) return sortedRows;
    return sortedRows.filter((row) =>
      columns.some((column) =>
        String(row[column] ?? "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [columns, rows, search, sortDirection, sortKey]);

  const displayedRows = React.useMemo(
    () => (limit === -1 ? filteredRows : filteredRows.slice(0, limit)),
    [filteredRows, limit]
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const renderSortIcon = (key: string) => {
    return (
      <AnalisisTableSortIcon
        active={sortKey === key}
        direction={sortDirection}
      />
    );
  };

  const handleDownload = React.useCallback(() => {
    downloadTableAsExcel({
      title,
      subtitle,
      source: sourceName ?? undefined,
      columns: [
        {
          key: "no",
          label: "No",
          selector: (_row: AnalisisRcaEpdCalculationRow, index: number) =>
            index + 1,
          numeric: true
        },
        ...columns.map((column) => ({
          key: column,
          label: column,
          selector: (row: AnalisisRcaEpdCalculationRow) => row[column] ?? "",
          numeric: isNumericColumn(displayedRows, column)
        }))
      ],
      rows: displayedRows,
      filename: title.replace(/\s+/g, "_"),
      sheetName: "RCA EPD Detail"
    });
  }, [columns, displayedRows, sourceName, subtitle, title]);

  const table = (
    <div className="w-full">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AnalisisTableSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari semua kolom..."
          containerClassName="max-w-[230px]"
        />

        <AnalisisTableLimitSelect
          value={limit}
          onChange={setLimit}
          options={[25, 50, 100, 300, -1]}
        />
      </div>

      <div className="mb-2 text-xs text-gray-500">
        Menampilkan {displayedRows.length} dari {filteredRows.length} produk
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[2400px] text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="text-xs uppercase text-slate-600">
              <th className="p-3 text-left font-semibold">No</th>
              {columns.map((column) => (
                <th
                  key={column}
                  className={`min-w-36 p-3 font-semibold ${
                    numericColumns.has(column) ? "text-right" : "text-left"
                  }`}
                >
                  <button
                    type="button"
                    className={
                      numericColumns.has(column)
                        ? analisisHeaderButtonRightClass
                        : analisisHeaderButtonClass
                    }
                    onClick={() => handleSort(column)}
                  >
                    {column}
                    {renderSortIcon(column)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {displayedRows.length ? (
              displayedRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="transition hover:bg-slate-50">
                  <td className="p-3">{rowIndex + 1}</td>
                  {columns.map((column) => (
                    <td
                      key={column}
                      className={`max-w-[320px] p-3 ${
                        numericColumns.has(column)
                          ? "text-right tabular-nums"
                          : ""
                      }`}
                    >
                      {formatValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-6 text-center text-sm text-slate-500"
                  colSpan={columns.length + 1}
                >
                  Data RCA-EPD Negara Detil belum tersedia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const content = loading ? (
    <TableSkeleton rows={8} />
  ) : errorMessage ? (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {errorMessage}
    </div>
  ) : (
    table
  );

  return (
    <ExpandableCard
      title={title}
      subtitle={subtitle}
      actions={
        <IconTooltip label="Unduh Excel">
          <span>
            <Button
              type="button"
              className={analisisDownloadButtonClass}
              onClick={handleDownload}
              disabled={!displayedRows.length}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      expandedContent={content}
      modalSize="full"
    >
      {content}
    </ExpandableCard>
  );
}
