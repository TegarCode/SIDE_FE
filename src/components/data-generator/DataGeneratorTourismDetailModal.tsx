import React from "react";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { Modal } from "@/components/ui/Modal";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";

type TourismDetailRow = {
  asal?: string;
  tujuan?: string;
  total?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  rows: TourismDetailRow[];
  showOrigin?: boolean;
  showDestination?: boolean;
  source?: string;
  exportFilename: string;
};

function toSortableNumber(value: string) {
  const normalized = String(value ?? "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDisplayValue(value: string | undefined) {
  const numeric = toSortableNumber(String(value ?? ""));
  if (numeric === 0) return "N/A";
  return value ?? "-";
}

export function DataGeneratorTourismDetailModal({
  open,
  onClose,
  title,
  subtitle,
  rows,
  showOrigin = true,
  showDestination = true,
  source,
  exportFilename
}: Props) {
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filteredRows = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) =>
      [row.asal, row.tujuan, row.total].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [query, rows]);

  const handleDownload = React.useCallback(() => {
    const exportRows = [...filteredRows]
      .sort(
        (left, right) =>
          toSortableNumber(String(right.total ?? "")) -
          toSortableNumber(String(left.total ?? ""))
      )
      .map((row, index) => ({
        No: index + 1,
        ...(showOrigin ? { "Negara / Entitas Asal": row.asal ?? "-" } : {}),
        ...(showDestination
          ? { "Negara / Entitas Tujuan": row.tujuan ?? "-" }
          : {}),
        Total: formatDisplayValue(row.total)
      }));

    const columns = Object.keys(exportRows[0] ?? { No: "" }).map((key) => ({
      key,
      label: key,
      selector: (row: Record<string, string | number>) => row[key]
    }));

    downloadTableAsExcel({
      title,
      subtitle,
      source: source ?? "-",
      filename: exportFilename,
      columns,
      rows: exportRows
    });
  }, [
    exportFilename,
    filteredRows,
    showDestination,
    showOrigin,
    source,
    subtitle,
    title
  ]);

  const tableRows = React.useMemo(
    () =>
      filteredRows.map((row) => ({
        asal: row.asal ?? "-",
        tujuan: row.tujuan ?? "-",
        total: formatDisplayValue(row.total)
      })),
    [filteredRows]
  );

  const detailColumns = React.useMemo(() => {
    const columns: Array<{
      key: string;
      label: string;
      headerClassName?: string;
      className?: string;
      align?: "left" | "center" | "right";
    }> = [];

    if (showOrigin) {
      columns.push({
        key: "asal",
        label: "Negara / Entitas Asal",
        headerClassName: showDestination ? "w-[38%]" : "w-[46%]",
        className: "whitespace-normal"
      });
    }

    if (showDestination) {
      columns.push({
        key: "tujuan",
        label: "Negara / Entitas Tujuan",
        headerClassName: showOrigin ? "w-[38%]" : "w-[46%]",
        className: "whitespace-normal"
      });
    }

    columns.push({
      key: "total",
      label: "Total",
      align: "right",
      headerClassName:
        showOrigin && showDestination
          ? "w-[24%] text-right"
          : "w-[54%] text-right",
      className: "text-right"
    });

    return columns;
  }, [showDestination, showOrigin]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="xl"
      bodyClassName="bg-slate-50"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari detail negara..."
            containerClassName="w-full sm:max-w-[300px]"
            className="rounded-md border-slate-200 bg-white py-1.5 text-xs focus:border-slate-300 focus:ring-slate-200"
            leftSlot={
              <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
            }
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-lg p-2 text-slate-600"
            onClick={handleDownload}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-full rounded-lg bg-white">
          <SortableDataTable
            className="max-h-150 overflow-x-hidden overflow-y-auto rounded-md"
            tableClassName="w-full min-w-0 table-fixed text-sm [&_thead_th]:border [&_thead_th]:border-slate-300 [&_thead_th]:bg-slate-50 [&_tbody_td]:border [&_tbody_td]:border-slate-200"
            disableDefaultMinWidth
            stickyFirstColumn={false}
            showRowNumber
            initialSortKey="total"
            initialSortDirection="desc"
            columns={detailColumns}
            rows={tableRows}
          />
        </div>
      </div>
    </Modal>
  );
}
