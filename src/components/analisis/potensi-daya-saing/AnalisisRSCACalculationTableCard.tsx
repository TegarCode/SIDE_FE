import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { AnalisisRscaTbiCalculationRow } from "@/type/analisis";
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
  rows: AnalisisRscaTbiCalculationRow[];
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

function formatInteger(value: number | null) {
  return value == null ? "-" : value.toLocaleString("id-ID");
}

function formatDecimal(value: number | null, fractionDigits = 4) {
  return value == null ? "-" : value.toFixed(fractionDigits);
}

export function AnalisisRSCACalculationTableCard({
  title,
  rows,
  loading = false,
  errorMessage,
  originLabel,
  destinationLabel,
  sourceName
}: Props) {
  const [sortKey, setSortKey] =
    React.useState<keyof AnalisisRscaTbiCalculationRow>("rsca2023");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  );
  const [limit, setLimit] = React.useState(25);
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

  const handleSort = (key: keyof AnalisisRscaTbiCalculationRow) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  };

  const renderSortIcon = (key: keyof AnalisisRscaTbiCalculationRow) => {
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
          selector: (_row: AnalisisRscaTbiCalculationRow, index: number) =>
            index + 1,
          numeric: true
        },
        { key: "kode", label: "HS Code", selector: (row) => row.kode ?? "-" },
        { key: "nama", label: "Produk", selector: (row) => row.nama },
        {
          key: "nilai2019",
          label: "Nilai 2019",
          selector: (row) => row.nilai2019 ?? "",
          numeric: true
        },
        {
          key: "nilai2023",
          label: "Nilai 2023",
          selector: (row) => row.nilai2023 ?? "",
          numeric: true
        },
        {
          key: "dunia2019",
          label: "Dunia 2019",
          selector: (row) => row.dunia2019 ?? "",
          numeric: true
        },
        {
          key: "dunia2023",
          label: "Dunia 2023",
          selector: (row) => row.dunia2023 ?? "",
          numeric: true
        },
        {
          key: "rca2019",
          label: "RCA 2019",
          selector: (row) => row.rca2019 ?? "",
          numeric: true
        },
        {
          key: "rca2023",
          label: "RCA 2023",
          selector: (row) => row.rca2023 ?? "",
          numeric: true
        },
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
          key: "groupRsca2019",
          label: "Group RSCA 2019",
          selector: (row) => row.groupRsca2019 ?? "",
          numeric: true
        },
        {
          key: "groupRsca2023",
          label: "Group RSCA 2023",
          selector: (row) => row.groupRsca2023 ?? "",
          numeric: true
        },
        {
          key: "groupTbi2019",
          label: "Group TBI 2019",
          selector: (row) => row.groupTbi2019 ?? "",
          numeric: true
        },
        {
          key: "groupTbi2023",
          label: "Group TBI 2023",
          selector: (row) => row.groupTbi2023 ?? "",
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
      sheetName: "RSCA TBI Calculation"
    });
  }, [displayedRows, sourceName, subtitle, title]);

  const metricHeaders: Array<
    [keyof AnalisisRscaTbiCalculationRow, string, "integer" | "decimal"]
  > = [
    ["nilai2019", "Nilai 2019", "integer"],
    ["nilai2023", "Nilai 2023", "integer"],
    ["dunia2019", "Dunia 2019", "integer"],
    ["dunia2023", "Dunia 2023", "integer"],
    ["rca2019", "RCA 2019", "decimal"],
    ["rca2023", "RCA 2023", "decimal"],
    ["rsca2019", "RSCA 2019", "decimal"],
    ["rsca2023", "RSCA 2023", "decimal"],
    ["tbi2019", "TBI 2019", "decimal"],
    ["tbi2023", "TBI 2023", "decimal"],
    ["groupRsca2019", "Group RSCA 2019", "decimal"],
    ["groupRsca2023", "Group RSCA 2023", "decimal"],
    ["groupTbi2019", "Group TBI 2019", "decimal"],
    ["groupTbi2023", "Group TBI 2023", "decimal"]
  ];

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
          options={[25, 50, 100, 300, -1]}
        />
      </div>

      <div className="mb-2 text-xs text-gray-500">
        Menampilkan {displayedRows.length} dari {filteredRows.length} produk
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[2200px] text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="text-xs uppercase text-slate-600">
              <th className="p-3 text-left font-semibold">No</th>
              <th className="p-3 text-left font-semibold">
                <button
                  type="button"
                  className={analisisHeaderButtonClass}
                  onClick={() => handleSort("kode")}
                >
                  HS
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
              {metricHeaders.map(([key, label]) => (
                <th key={key} className="p-3 text-right font-semibold">
                  <button
                    type="button"
                    className={analisisHeaderButtonRightClass}
                    onClick={() => handleSort(key)}
                  >
                    {label}
                    {renderSortIcon(key)}
                  </button>
                </th>
              ))}
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
                  className="hover:bg-slate-50"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium">{item.kode ?? item.hs4}</td>
                  <td className="p-3 max-w-[300px]">{item.nama}</td>
                  {metricHeaders.map(([key, , type]) => (
                    <td key={key} className="p-3 text-right">
                      {type === "integer"
                        ? formatInteger(item[key] as number | null)
                        : formatDecimal(item[key] as number | null)}
                    </td>
                  ))}
                  <td className="p-3 text-center">{item.pm2019 ?? "-"}</td>
                  <td className="p-3 text-center">{item.pm2023 ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-6 text-center text-sm text-slate-500"
                  colSpan={19}
                >
                  Data perhitungan RSCA & TBI belum tersedia.
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
