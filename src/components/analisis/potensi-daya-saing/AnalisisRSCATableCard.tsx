import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { AnalisisRscaTbiRow } from "@/type/analisis";
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
  rows: AnalisisRscaTbiRow[];
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
  if (typeof left === "string" || typeof right === "string") {
    return String(left).localeCompare(String(right)) * multiplier;
  }

  return (Number(left) - Number(right)) * multiplier;
}

function formatDecimal(value: number | null, fractionDigits = 4) {
  return value == null ? "-" : value.toFixed(fractionDigits);
}

export function AnalisisRSCATableCard({
  title,
  rows,
  loading = false,
  errorMessage,
  originLabel,
  destinationLabel,
  sourceName
}: Props) {
  const [sortKey, setSortKey] =
    React.useState<keyof AnalisisRscaTbiRow>("rsca2023");
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
      [item.kode, item.hs4, item.nama, item.pm2019, item.pm2023]
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(keyword))
    );
  }, [rows, search, sortDirection, sortKey]);

  const displayedRows = React.useMemo(
    () => (limit === -1 ? filteredRows : filteredRows.slice(0, limit)),
    [filteredRows, limit]
  );

  const handleSort = (key: keyof AnalisisRscaTbiRow) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  };

  const renderSortIcon = (key: keyof AnalisisRscaTbiRow) => {
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
          selector: (_row: AnalisisRscaTbiRow, index: number) => index + 1,
          numeric: true
        },
        { key: "kode", label: "HS Code", selector: (row) => row.kode ?? "-" },
        { key: "nama", label: "Produk", selector: (row) => row.nama },
        {
          key: "rsca2019",
          label: "RSCA 2019",
          selector: (row) => row.rsca2019 ?? "",
          numeric: true
        },
        {
          key: "rsca2023",
          label: "RSCA 2023",
          selector: (row) => row.rsca2023 ?? "",
          numeric: true
        },
        {
          key: "tbi2019",
          label: "TBI 2019",
          selector: (row) => row.tbi2019 ?? "",
          numeric: true
        },
        {
          key: "tbi2023",
          label: "TBI 2023",
          selector: (row) => row.tbi2023 ?? "",
          numeric: true
        },
        {
          key: "share2019",
          label: "Share 2019",
          selector: (row) => row.share2019 ?? "",
          numeric: true
        },
        {
          key: "share2023",
          label: "Share 2023",
          selector: (row) => row.share2023 ?? "",
          numeric: true
        },
        {
          key: "pm2019",
          label: "PM 2019",
          selector: (row) => row.pm2019 ?? "-"
        },
        {
          key: "pm2023",
          label: "PM 2023",
          selector: (row) => row.pm2023 ?? "-"
        }
      ],
      rows: displayedRows,
      filename: title.replace(/\s+/g, "_"),
      sheetName: "RSCA TBI"
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
        <table className="min-w-[1400px] text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="text-xs uppercase text-slate-600">
              <th className="p-3 text-left font-semibold">No</th>
              <th className="p-3 text-left font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonClass}
                  onClick={() => handleSort("kode")}
                >
                  HS Code
                  {renderSortIcon("kode")}
                </button>
              </th>
              <th className="p-3 text-left font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonClass}
                  onClick={() => handleSort("nama")}
                >
                  Produk
                  {renderSortIcon("nama")}
                </button>
              </th>
              <th className="p-3 text-right font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonRightClass}
                  onClick={() => handleSort("rsca2019")}
                >
                  RSCA 2019
                  {renderSortIcon("rsca2019")}
                </button>
              </th>
              <th className="p-3 text-right font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonRightClass}
                  onClick={() => handleSort("rsca2023")}
                >
                  RSCA 2023
                  {renderSortIcon("rsca2023")}
                </button>
              </th>
              <th className="p-3 text-right font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonRightClass}
                  onClick={() => handleSort("tbi2019")}
                >
                  TBI 2019
                  {renderSortIcon("tbi2019")}
                </button>
              </th>
              <th className="p-3 text-right font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonRightClass}
                  onClick={() => handleSort("tbi2023")}
                >
                  TBI 2023
                  {renderSortIcon("tbi2023")}
                </button>
              </th>
              <th className="p-3 text-right font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonRightClass}
                  onClick={() => handleSort("share2019")}
                >
                  Share 2019
                  {renderSortIcon("share2019")}
                </button>
              </th>
              <th className="p-3 text-right font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonRightClass}
                  onClick={() => handleSort("share2023")}
                >
                  Share 2023
                  {renderSortIcon("share2023")}
                </button>
              </th>
              <th className="p-3 text-center font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonClass}
                  onClick={() => handleSort("pm2019")}
                >
                  PM 2019
                  {renderSortIcon("pm2019")}
                </button>
              </th>
              <th className="p-3 text-center font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonClass}
                  onClick={() => handleSort("pm2023")}
                >
                  PM 2023
                  {renderSortIcon("pm2023")}
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
                  <td className="p-3 font-medium">{item.kode ?? item.hs4}</td>
                  <td className="p-3 max-w-[300px]">{item.nama}</td>
                  <td className="p-3 text-right">
                    {formatDecimal(item.rsca2019, 5)}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {formatDecimal(item.rsca2023, 5)}
                  </td>
                  <td className="p-3 text-right">
                    {formatDecimal(item.tbi2019, 5)}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {formatDecimal(item.tbi2023, 5)}
                  </td>
                  <td className="p-3 text-right">
                    {formatDecimal(item.share2019, 2)}
                  </td>
                  <td className="p-3 text-right">
                    {formatDecimal(item.share2023, 2)}
                  </td>
                  <td className="p-3 text-center">{item.pm2019 ?? "-"}</td>
                  <td className="p-3 text-center">{item.pm2023 ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-6 text-center text-sm text-slate-500"
                  colSpan={11}
                >
                  Data RSCA & TBI belum tersedia.
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
