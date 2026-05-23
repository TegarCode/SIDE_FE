import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { AnalisisRscaTbiComparisonRow } from "@/type/analisis";
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
  rows: AnalisisRscaTbiComparisonRow[];
  loading?: boolean;
  errorMessage?: string | null;
  originLabel?: string;
  destinationLabel?: string;
  sourceName?: string | null;
};

type ComparisonColumn = {
  key: string;
  label: string;
  sourceKey: string;
  numeric?: boolean;
};

const comparisonColumns: ComparisonColumn[] = [
  { key: "hsCode", label: "HsCode", sourceKey: "Kode HS" },
  { key: "namaProduk", label: "Nama Produk", sourceKey: "Nama Produk" },
  { key: "pmAsalTahun2", label: "PM Asal Tahun 2", sourceKey: "PM Asal 2019" },
  { key: "pmAsalTahun4", label: "PM Asal Tahun 4", sourceKey: "PM Asal 2023" },
  {
    key: "pmTujuanTahun2",
    label: "PM Tujuan Tahun 2",
    sourceKey: "PM Tujuan 2019"
  },
  {
    key: "pmTujuanTahun4",
    label: "PM Tujuan Tahun 4",
    sourceKey: "PM Tujuan 2023"
  },
  {
    key: "strategyTahun2",
    label: "Strategy Tahun 2",
    sourceKey: "Strategy 2019"
  },
  {
    key: "strategyTahun4",
    label: "Strategy Tahun 4",
    sourceKey: "Strategy 2023"
  },
  {
    key: "valueA",
    label: "Value A",
    sourceKey: "Ekspor RI ke Dunia",
    numeric: true
  },
  {
    key: "valueB",
    label: "Value B",
    sourceKey: "Ekspor Mitra ke Dunia",
    numeric: true
  },
  {
    key: "valueC",
    label: "Value C",
    sourceKey: "Impor RI dari Dunia",
    numeric: true
  },
  {
    key: "valueD",
    label: "Value D",
    sourceKey: "Impor RI dari Mitra",
    numeric: true
  },
  {
    key: "valueE",
    label: "Value E",
    sourceKey: "Ekspor RI ke Mitra",
    numeric: true
  },
  {
    key: "valueF",
    label: "Value F",
    sourceKey: "Impor Mitra dari Dunia",
    numeric: true
  }
];

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

function getColumnValue(
  row: AnalisisRscaTbiComparisonRow,
  column: ComparisonColumn
) {
  return row[column.sourceKey];
}

export function AnalisisRSCATBIComparisonTableCard({
  title,
  rows,
  loading = false,
  errorMessage,
  originLabel,
  destinationLabel,
  sourceName
}: Props) {
  const columns = React.useMemo(() => comparisonColumns, []);
  const [sortKey, setSortKey] = React.useState<string>("");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc"
  );
  const [limit, setLimit] = React.useState(25);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    setSortKey((current) => {
      if (current && columns.some((column) => column.key === current)) {
        return current;
      }
      return columns[0]?.key ?? "";
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

  const valueLegend = React.useMemo(
    () => [
      {
        label: "Value A",
        description: `${originLabel ?? "IDN"} Export To World`
      },
      {
        label: "Value B",
        description: `${destinationLabel ?? "Partner"} Export To World`
      },
      {
        label: "Value C",
        description: `${originLabel ?? "IDN"} Import from World`
      },
      {
        label: "Value D",
        description: `${originLabel ?? "IDN"} Import from Partner`
      },
      {
        label: "Value E",
        description: `${originLabel ?? "IDN"} Export To Partner`
      },
      {
        label: "Value F",
        description: `${destinationLabel ?? "Partner"} Import from World`
      }
    ],
    [destinationLabel, originLabel]
  );

  const filteredRows = React.useMemo(() => {
    const activeColumn =
      columns.find((column) => column.key === sortKey) ?? columns[0];
    const keyword = search.trim().toLowerCase();
    const sortedRows =
      sortKey && activeColumn
        ? [...rows].sort((left, right) =>
            compareSortValue(
              getColumnValue(left, activeColumn),
              getColumnValue(right, activeColumn),
              sortDirection
            )
          )
        : [...rows];

    if (!keyword) return sortedRows;
    return sortedRows.filter((row) =>
      columns.some((column) =>
        String(getColumnValue(row, column) ?? "")
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
          selector: (_row: AnalisisRscaTbiComparisonRow, index: number) =>
            index + 1,
          numeric: true
        },
        ...columns.map((column) => ({
          key: column.key,
          label: column.label,
          selector: (row: AnalisisRscaTbiComparisonRow) =>
            getColumnValue(row, column) ?? "",
          numeric: column.numeric ?? false
        }))
      ],
      rows: displayedRows,
      filename: title.replace(/\s+/g, "_"),
      sheetName: "RSCA TBI Comparison"
    });
  }, [columns, displayedRows, sourceName, subtitle, title]);

  const table = (
    <div className="w-full">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-3">
          <div className="text-xs font-semibold uppercase text-slate-500">
            Keterangan Value A-F
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {valueLegend.map((item) => (
              <div
                key={item.label}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
              >
                <span className="font-semibold text-slate-900">
                  {item.label}
                </span>{" "}
                = {item.description}
              </div>
            ))}
          </div>
        </div>
      </div>

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
          options={[10, 25, 50, -1]}
        />
      </div>

      <div className="mb-2 text-xs text-gray-500">
        Menampilkan {displayedRows.length} dari {filteredRows.length} produk
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1800px] text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="text-xs uppercase text-slate-600">
              <th className="p-3 text-left font-semibold">No</th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`min-w-36 p-3 font-semibold ${
                    column.numeric ? "text-right" : "text-left"
                  }`}
                >
                  <button
                    type="button"
                    className={
                      column.numeric
                        ? analisisHeaderButtonRightClass
                        : analisisHeaderButtonClass
                    }
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                    {renderSortIcon(column.key)}
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
                      key={column.key}
                      className={`max-w-[320px] p-3 ${
                        column.numeric ? "text-right tabular-nums" : ""
                      }`}
                    >
                      {formatValue(getColumnValue(row, column))}
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
                  Data Country Comparison belum tersedia.
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
