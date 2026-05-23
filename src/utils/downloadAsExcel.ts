import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

type ExcelColumn<Row> = {
  key: string;
  label: string;
  selector?: (row: Row, index: number) => unknown;
  exportValue?: (row: Row, index: number) => unknown;
  numeric?: boolean;
  hidden?: boolean;
};

type DownloadExcelArgs<Row> = {
  title: string;
  subtitle?: string;
  source?: string;
  notes?: string | string[];
  columns: Array<ExcelColumn<Row>>;
  rows: Row[];
  filename: string;
  sheetName?: string;
};

function sanitizeFileName(raw: string) {
  return String(raw || "data")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 140);
}

function parseNumericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const source = value.trim();
  if (!source) return null;
  if (!/^[+-]?[0-9.,\s]+$/.test(source)) return null;

  const compact = source.replace(/\s+/g, "");
  const hasDot = compact.includes(".");
  const hasComma = compact.includes(",");
  let normalized = compact;

  if (hasDot && hasComma) {
    if (compact.lastIndexOf(",") > compact.lastIndexOf(".")) {
      normalized = compact.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = compact.replace(/,/g, "");
    }
  } else if (hasComma) {
    const parts = compact.split(",");
    normalized =
      parts.length === 2 && parts[1].length <= 2
        ? `${parts[0]}.${parts[1]}`
        : compact.replace(/,/g, "");
  } else if (hasDot) {
    const parts = compact.split(".");
    normalized =
      parts.length > 1 && parts.slice(1).every((part) => part.length === 3)
        ? compact.replace(/\./g, "")
        : compact;
  }

  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
}

export function downloadTableAsExcel<Row>({
  title,
  subtitle,
  source,
  notes,
  columns,
  rows,
  filename,
  sheetName = "Sheet1"
}: DownloadExcelArgs<Row>) {
  const dataColumns = columns.filter((column) => !column.hidden);
  const header = dataColumns.map((column) => column.label ?? column.key);
  const numericFlags: boolean[][] = [];

  const dataRows = rows.map((row, rowIndex) => {
    const rowFlags: boolean[] = [];

    const cells = dataColumns.map((column) => {
      const raw = column.exportValue
        ? column.exportValue(row, rowIndex)
        : column.selector
          ? column.selector(row, rowIndex)
          : (row as Record<string, unknown>)[column.key];

      if (raw == null) {
        rowFlags.push(false);
        return "";
      }

      const numeric = parseNumericValue(raw);
      const isNumeric =
        column.numeric === true || typeof raw === "number" || numeric !== null;
      if (isNumeric && numeric !== null) {
        rowFlags.push(true);
        return numeric;
      }

      rowFlags.push(false);
      if (typeof raw === "string" || typeof raw === "boolean") return raw;
      return String(raw);
    });

    numericFlags.push(rowFlags);
    return cells;
  });

  const notesRows = Array.isArray(notes)
    ? notes.filter(Boolean).map((note) => [String(note)])
    : notes
      ? [[String(notes)]]
      : [];

  const metaRows = [
    [title],
    subtitle ? [subtitle] : null,
    source ? [`Sumber: ${source}`] : null,
    ...notesRows,
    [`Diekspor: ${new Date().toLocaleString("id-ID")}`],
    []
  ].filter((row): row is string[] => Array.isArray(row));

  const aoa = [...metaRows, header, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const headerRowIndex = metaRows.length;
  const lastCol = Math.max(0, header.length - 1);

  const titleStyle = {
    font: { bold: true, sz: 14, color: { rgb: "0F172A" } },
    alignment: { horizontal: "left", vertical: "center" }
  };
  const metaStyle = {
    font: { sz: 10, color: { rgb: "64748B" } },
    alignment: { horizontal: "left", vertical: "center" }
  };
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "0F172A" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "CBD5E1" } },
      bottom: { style: "thin", color: { rgb: "CBD5E1" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } }
    }
  };

  if (ws.A1) ws.A1.s = titleStyle;
  for (let row = 1; row < metaRows.length; row += 1) {
    const cell = ws[XLSX.utils.encode_cell({ r: row, c: 0 })];
    if (cell) cell.s = metaStyle;
  }

  for (let col = 0; col <= lastCol; col += 1) {
    const addr = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
    if (ws[addr]) ws[addr].s = headerStyle;
  }

  for (let row = headerRowIndex + 1; row < aoa.length; row += 1) {
    for (let col = 0; col <= lastCol; col += 1) {
      const addr = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = ws[addr];
      if (!cell) continue;

      const dataRowIndex = row - (headerRowIndex + 1);
      const isNumeric =
        Boolean(numericFlags[dataRowIndex]?.[col]) || cell.t === "n";
      cell.s = {
        alignment: {
          horizontal: isNumeric ? "right" : "left",
          vertical: "center",
          wrapText: true
        },
        border: {
          top: { style: "thin", color: { rgb: "E2E8F0" } },
          bottom: { style: "thin", color: { rgb: "E2E8F0" } },
          left: { style: "thin", color: { rgb: "E2E8F0" } },
          right: { style: "thin", color: { rgb: "E2E8F0" } }
        }
      };
    }
  }

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
    ...(subtitle ? [{ s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } }] : [])
  ];

  ws["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: headerRowIndex, c: 0 },
      e: { r: headerRowIndex, c: lastCol }
    })
  };

  ws["!cols"] = header.map((label, index) => {
    const maxLen = Math.max(
      String(label ?? "").length,
      ...dataRows.map((row) => String(row[index] ?? "").length)
    );
    return { wch: Math.min(42, Math.max(10, maxLen + 2)) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer]), `${sanitizeFileName(filename)}.xlsx`);
}
