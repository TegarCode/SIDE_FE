import React, { type ReactNode } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronUpDownIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

export type SortDirection = "asc" | "desc";

export type SortableCellValue =
  | string
  | number
  | {
      display: ReactNode;
      sortValue?: string | number;
    };

export type SortableColumn =
  | string
  | {
      key: string;
      label: ReactNode;
      className?: string;
      headerClassName?: string;
      align?: "left" | "center" | "right";
      sortable?: boolean;
    };

type SortableDataTableProps = {
  columns: SortableColumn[];
  rows: Array<Record<string, SortableCellValue>>;
  className?: string;
  tableClassName?: string;
  disableDefaultMinWidth?: boolean;
  stickyFirstColumn?: boolean;
  showRowNumber?: boolean;
  rowNumberOffset?: number;
  onSortColumnChange?: (columnLabel: string) => void;
  onSortedRowsChange?: (rows: Array<Record<string, SortableCellValue>>) => void;
  initialSortKey?: string | null;
  initialSortDirection?: SortDirection;
  controlledSortKey?: string | null;
  controlledSortDirection?: SortDirection;
  onSortChange?: (sortKey: string, direction: SortDirection) => void;
  manualSorting?: boolean;
};

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

function normalizeColumns(columns: SortableColumn[]) {
  return columns.map((column) =>
    typeof column === "string"
      ? {
          key: column,
          label: column,
          align: "left" as const,
          sortable: true
        }
      : {
          align: "left" as const,
          sortable: true,
          ...column
        }
  );
}

function getCellDisplay(value: SortableCellValue) {
  if (typeof value === "object" && value !== null && "display" in value)
    return value.display;
  return value;
}

function getCellSortValue(value: SortableCellValue) {
  if (typeof value === "object" && value !== null && "display" in value) {
    return value.sortValue ?? "";
  }
  return value;
}

export function SortableDataTable({
  columns,
  rows,
  className,
  tableClassName,
  disableDefaultMinWidth = false,
  stickyFirstColumn = true,
  showRowNumber = false,
  rowNumberOffset = 0,
  onSortColumnChange,
  onSortedRowsChange,
  initialSortKey,
  initialSortDirection = "desc",
  controlledSortKey,
  controlledSortDirection,
  onSortChange,
  manualSorting = false
}: SortableDataTableProps) {
  const normalizedColumns = React.useMemo(
    () => normalizeColumns(columns),
    [columns]
  );
  const [sortKey, setSortKey] = React.useState<string | null>(
    initialSortKey ?? normalizedColumns[0]?.key ?? null
  );
  const [direction, setDirection] =
    React.useState<SortDirection>(initialSortDirection);
  const effectiveSortKey = controlledSortKey ?? sortKey;
  const effectiveDirection = controlledSortDirection ?? direction;

  React.useEffect(() => {
    setSortKey(initialSortKey ?? normalizedColumns[0]?.key ?? null);
  }, [initialSortKey, normalizedColumns]);

  React.useEffect(() => {
    setDirection(initialSortDirection);
  }, [initialSortDirection]);

  React.useEffect(() => {
    if (!normalizedColumns.length) {
      setSortKey(null);
      return;
    }
    if (
      effectiveSortKey &&
      normalizedColumns.some((column) => column.key === effectiveSortKey)
    )
      return;
    setSortKey(normalizedColumns[0].key);
  }, [effectiveSortKey, normalizedColumns]);

  const sortedRows = React.useMemo(() => {
    if (manualSorting) return rows;
    if (!effectiveSortKey) return rows;

    const next = [...rows];
    next.sort((left, right) => {
      const leftValue = getCellSortValue(left[effectiveSortKey] ?? "");
      const rightValue = getCellSortValue(right[effectiveSortKey] ?? "");

      const leftNumber = toComparableNumber(leftValue);
      const rightNumber = toComparableNumber(rightValue);
      if (leftNumber != null && rightNumber != null) {
        return effectiveDirection === "asc"
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
      return effectiveDirection === "asc" ? compared : -compared;
    });

    return next;
  }, [effectiveDirection, effectiveSortKey, manualSorting, rows]);

  React.useEffect(() => {
    if (!effectiveSortKey) return;
    const matched = normalizedColumns.find(
      (column) => column.key === effectiveSortKey
    );
    onSortColumnChange?.(
      typeof matched?.label === "string" ? matched.label : effectiveSortKey
    );
  }, [effectiveSortKey, normalizedColumns, onSortColumnChange]);

  React.useEffect(() => {
    onSortedRowsChange?.(sortedRows);
  }, [onSortedRowsChange, sortedRows]);

  const handleSort = (column: string) => {
    const nextDirection =
      effectiveSortKey === column
        ? effectiveDirection === "asc"
          ? "desc"
          : "asc"
        : "desc";

    if (onSortChange) {
      onSortChange(column, nextDirection);
      return;
    }

    if (sortKey === column) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(column);
    setDirection("desc");
  };

  return (
    <div className={cn("h-full overflow-auto", className)}>
      <table
        className={cn(
          !disableDefaultMinWidth && "min-w-180",
          "divide-y divide-slate-200 text-xs",
          tableClassName
        )}
      >
        <thead className="bg-slate-100 text-left text-slate-600">
          <tr>
            {showRowNumber ? (
              <th className="sticky top-0 left-0 z-30 w-12 bg-slate-100 px-3 py-2 text-center font-semibold">
                No
              </th>
            ) : null}
            {normalizedColumns.map((column, index) => {
              const active = effectiveSortKey === column.key;
              return (
                <th
                  key={column.key}
                  className={cn(
                    "sticky top-0 wrap-break-word bg-slate-100 px-3 py-2 font-semibold",
                    stickyFirstColumn && index === 0
                      ? showRowNumber
                        ? "left-12 z-20"
                        : "left-0 z-20"
                      : "z-10",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                    column.headerClassName
                  )}
                >
                  {column.sortable === false ? (
                    <div
                      className={cn(
                        "inline-flex items-center gap-1",
                        column.align === "right" && "ml-auto text-right",
                        column.align === "center" && "mx-auto"
                      )}
                    >
                      <span>{column.label}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1 transition hover:text-slate-900",
                        column.align === "right" && "ml-auto text-right",
                        column.align === "center" && "mx-auto"
                      )}
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.label}</span>
                      {active ? (
                        effectiveDirection === "asc" ? (
                          <ChevronUpIcon className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDownIcon className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronUpDownIcon className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {sortedRows.map((row, rowIndex) => (
            <tr key={`sortable-row-${rowIndex}`}>
              {showRowNumber ? (
                <td className="sticky left-0 z-20 bg-white px-3 py-2 text-center align-top text-slate-700">
                  {rowNumberOffset + rowIndex + 1}
                </td>
              ) : null}
              {normalizedColumns.map((column, columnIndex) => (
                <td
                  key={`${rowIndex}-${column.key}`}
                  className={cn(
                    "wrap-break-word px-3 py-2 align-top text-slate-700",
                    stickyFirstColumn &&
                      columnIndex === 0 &&
                      (showRowNumber
                        ? "sticky left-12 z-1 bg-white"
                        : "sticky left-0 z-1 bg-white"),
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                    column.className
                  )}
                >
                  {getCellDisplay(row[column.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
