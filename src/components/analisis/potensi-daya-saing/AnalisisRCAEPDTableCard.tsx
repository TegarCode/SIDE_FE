import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { AnalisisRcaEpdRow } from "@/type/analisis";
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
  rows: AnalisisRcaEpdRow[];
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

function formatDecimal(value: number | null, fractionDigits = 4) {
  return value == null ? "-" : value.toFixed(fractionDigits);
}

export function AnalisisRCAEPDTableCard({
  title,
  rows,
  loading = false,
  errorMessage,
  originLabel,
  destinationLabel,
  sourceName
}: Props) {
  const [sortKey, setSortKey] =
    React.useState<keyof AnalisisRcaEpdRow>("avgRca");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  );
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");

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
    const sortedRows = [...rows].sort((left, right) =>
      compareSortValue(left[sortKey], right[sortKey], sortDirection)
    );

    if (!keyword) return sortedRows;
    return sortedRows.filter((item) =>
      [item.kode, item.hs4, item.komoditas, item.kategoriEpd, item.xModel]
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(keyword))
    );
  }, [rows, search, sortDirection, sortKey]);

  const displayedRows = React.useMemo(
    () => (limit === -1 ? filteredRows : filteredRows.slice(0, limit)),
    [filteredRows, limit]
  );

  const handleSort = (key: keyof AnalisisRcaEpdRow) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  };

  const renderSortIcon = (key: keyof AnalisisRcaEpdRow) => {
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
          selector: (_row: AnalisisRcaEpdRow, index: number) => index + 1,
          numeric: true
        },
        {
          key: "kategoriEpd",
          label: "Kategori EPD",
          selector: (row) => row.kategoriEpd ?? "-"
        },
        { key: "kode", label: "Kode HS", selector: (row) => row.kode ?? "-" },
        {
          key: "komoditas",
          label: "Komoditas",
          selector: (row) => row.komoditas
        },
        {
          key: "avgGrowthShare",
          label: "AVG Growth Share",
          selector: (row) => row.avgGrowthShare ?? "",
          numeric: true
        },
        {
          key: "avgGrowthDemand",
          label: "AVG Growth Demand",
          selector: (row) => row.avgGrowthDemand ?? "",
          numeric: true
        },
        {
          key: "avgRca",
          label: "AVG RCA",
          selector: (row) => row.avgRca ?? "",
          numeric: true
        },
        {
          key: "xModel",
          label: "X Model",
          selector: (row) => row.xModel ?? "-"
        }
      ],
      rows: displayedRows,
      filename: title.replace(/\s+/g, "_"),
      sheetName: "RCA EPD"
    });
  }, [displayedRows, sourceName, subtitle, title]);

  const table = (
    <div className="w-full">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AnalisisTableSearchInput
          value={search}
          onChange={setSearch}
          containerClassName="max-w-[230px]"
        />

        <AnalisisTableLimitSelect
          value={limit}
          onChange={setLimit}
          options={[10, 25, 50, -1]}
        />
      </div>

      <div className="mb-2 text-xs text-gray-500">
        Menampilkan {displayedRows.length} dari {filteredRows.length} produk
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1300px] text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="text-xs uppercase text-slate-600">
              <th className="p-3 text-left font-semibold">No</th>
              <th className="p-3 text-left font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonClass}
                  onClick={() => handleSort("kategoriEpd")}
                >
                  Kategori EPD
                  {renderSortIcon("kategoriEpd")}
                </button>
              </th>
              <th className="p-3 text-left font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonClass}
                  onClick={() => handleSort("kode")}
                >
                  Kode HS
                  {renderSortIcon("kode")}
                </button>
              </th>
              <th className="p-3 text-left font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonClass}
                  onClick={() => handleSort("komoditas")}
                >
                  Komoditas
                  {renderSortIcon("komoditas")}
                </button>
              </th>
              <th className="p-3 text-right font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonRightClass}
                  onClick={() => handleSort("avgGrowthShare")}
                >
                  AVG Growth Share
                  {renderSortIcon("avgGrowthShare")}
                </button>
              </th>
              <th className="p-3 text-right font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonRightClass}
                  onClick={() => handleSort("avgGrowthDemand")}
                >
                  AVG Growth Demand
                  {renderSortIcon("avgGrowthDemand")}
                </button>
              </th>
              <th className="p-3 text-right font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonRightClass}
                  onClick={() => handleSort("avgRca")}
                >
                  AVG RCA
                  {renderSortIcon("avgRca")}
                </button>
              </th>
              <th className="p-3 text-left font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonClass}
                  onClick={() => handleSort("xModel")}
                >
                  X Model
                  {renderSortIcon("xModel")}
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {displayedRows.length ? (
              displayedRows.map((item, index) => (
                <tr
                  key={`${item.kode ?? item.hs4}-${index}`}
                  className="transition hover:bg-slate-50"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="max-w-[220px] p-3">
                    {item.kategoriEpd ?? "-"}
                  </td>
                  <td className="p-3 font-medium">{item.kode ?? item.hs4}</td>
                  <td className="max-w-[360px] p-3">{item.komoditas}</td>
                  <td className="p-3 text-right">
                    {formatDecimal(item.avgGrowthShare, 4)}
                  </td>
                  <td className="p-3 text-right">
                    {formatDecimal(item.avgGrowthDemand, 4)}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {formatDecimal(item.avgRca, 4)}
                  </td>
                  <td className="max-w-[280px] p-3">{item.xModel ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-6 text-center text-sm text-slate-500"
                  colSpan={8}
                >
                  Data RCA & EPD belum tersedia.
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
