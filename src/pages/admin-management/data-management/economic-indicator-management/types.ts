import type {
  KinerjaEkonomiBatchRecord,
  KinerjaEkonomiPayloadRow
} from "@/type/admin-management/adminDashboardKinerjaEkonomi";
import type { SelectOption } from "@/type/indonesiaDiplomasi";

export type ActiveTab = "list" | "current" | "manual" | "upload";
export type WorkflowAction =
  | "validate"
  | "approve"
  | "publish"
  | "reject"
  | "delete";
export type ManualRow = {
  id: string;
  Kode_Alpha3: string;
  Bulan: string;
  Tahun: string;
  Nilai: string;
  Unit: string;
  Satuan: string;
  ID_Indikator: string;
  Komponen_Indikator: string;
  KodeSumber: string;
};

export type WorkflowTarget = {
  action: WorkflowAction;
  batch: KinerjaEkonomiBatchRecord;
} | null;

export const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "draft", label: "Draf" },
  { value: "validating", label: "Sedang Divalidasi" },
  { value: "publishing", label: "Sedang Dipublikasikan" },
  { value: "valid", label: "Valid" },
  { value: "invalid", label: "Tidak Valid" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "published", label: "Dipublikasi" },
  { value: "failed", label: "Gagal" }
];

export const SOURCE_OPTIONS: SelectOption[] = [
  { value: "all", label: "Semua Sumber" },
  { value: "manual", label: "Input Manual" },
  { value: "upload", label: "Unggah Berkas" }
];

export const ROW_SORT_OPTIONS: SelectOption[] = [
  { value: "id", label: "Urutan Input" },
  { value: "Kode_Alpha3", label: "Kode Negara" },
  { value: "Bulan", label: "Bulan" },
  { value: "Tahun", label: "Tahun" },
  { value: "Nilai", label: "Nilai" },
  { value: "Unit", label: "Unit" },
  { value: "Satuan", label: "Satuan" },
  { value: "ID_Indikator", label: "ID Indikator" },
  { value: "Komponen_Indikator", label: "Komponen Indikator" },
  { value: "KodeSumber", label: "Kode Sumber" },
  { value: "row_status", label: "Status Baris" },
  { value: "created_at", label: "Tanggal Dibuat" },
  { value: "updated_at", label: "Tanggal Diubah" }
];

export const SORT_DIRECTION_OPTIONS: SelectOption[] = [
  { value: "asc", label: "A-Z / Terkecil" },
  { value: "desc", label: "Z-A / Terbesar" }
];

export const CURRENT_ROW_SORT_OPTIONS: SelectOption[] = [
  { value: "Tahun", label: "Tahun" },
  { value: "Bulan", label: "Bulan" },
  { value: "Kode_Alpha3", label: "Kode Negara" },
  { value: "Nilai", label: "Nilai" },
  { value: "Unit", label: "Unit" },
  { value: "Satuan", label: "Satuan" },
  { value: "ID_Indikator", label: "ID Indikator" },
  { value: "Komponen_Indikator", label: "Komponen Indikator" },
  { value: "KodeSumber", label: "Kode Sumber" }
];

export const TARGET_FIELDS = [
  "Kode_Alpha3",
  "Bulan",
  "Tahun",
  "Nilai",
  "Unit",
  "Satuan",
  "ID_Indikator",
  "Komponen_Indikator",
  "KodeSumber"
] as const;

export const FIELD_LIMITS = {
  Kode_Alpha3: 3,
  Unit: 45,
  Satuan: 45,
  ID_Indikator: 5,
  Komponen_Indikator: 100,
  KodeSumber: 2
} as const;

export const MAX_UPLOAD_SIZE_LABEL = "1 GB";
export const RECOMMENDED_UPLOAD_SIZE_LABEL = "100 MB";

export const UPLOAD_FIELD_REQUIREMENTS = [
  {
    field: "Kode_Alpha3",
    required: "Wajib",
    format: "3 huruf kode negara, contoh: IDN, USA, CHN"
  },
  { field: "Bulan", required: "Opsional", format: "Angka 1 sampai 12" },
  {
    field: "Tahun",
    required: "Wajib",
    format: "4 digit tahun, contoh: 2026"
  },
  {
    field: "Nilai",
    required: "Wajib",
    format: "Angka desimal, gunakan titik untuk pecahan bila ada"
  },
  { field: "Unit", required: "Opsional", format: "Teks maksimal 45 karakter" },
  { field: "Satuan", required: "Wajib", format: "Teks maksimal 45 karakter" },
  {
    field: "ID_Indikator",
    required: "Wajib",
    format: "Kode indikator maksimal 5 karakter"
  },
  {
    field: "Komponen_Indikator",
    required: "Opsional",
    format: "Nama komponen maksimal 100 karakter"
  },
  { field: "KodeSumber", required: "Wajib", format: "Kode sumber 2 karakter" }
] as const;

export const REQUIRED_ROW_FIELDS = [
  "Kode_Alpha3",
  "Tahun",
  "Nilai",
  "Satuan",
  "ID_Indikator",
  "KodeSumber"
] as const;

export function isRequiredRowField(field: string) {
  return REQUIRED_ROW_FIELDS.some((requiredField) => requiredField === field);
}

export const EMPTY_MANUAL_ROW: ManualRow = {
  id: "",
  Kode_Alpha3: "",
  Bulan: "",
  Tahun: "",
  Nilai: "",
  Unit: "",
  Satuan: "",
  ID_Indikator: "",
  Komponen_Indikator: "",
  KodeSumber: ""
};

export function createManualRow(): ManualRow {
  return {
    ...EMPTY_MANUAL_ROW,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`
  };
}

export function toPayloadRow(row: ManualRow): KinerjaEkonomiPayloadRow {
  return {
    Kode_Alpha3: normalizeFixedText(row.Kode_Alpha3, FIELD_LIMITS.Kode_Alpha3),
    Bulan: parseInteger(row.Bulan),
    Tahun: parseInteger(row.Tahun),
    Nilai: parseDecimal(row.Nilai, 2),
    Unit: normalizeText(row.Unit, FIELD_LIMITS.Unit),
    Satuan: normalizeText(row.Satuan, FIELD_LIMITS.Satuan),
    ID_Indikator:
      normalizeText(row.ID_Indikator, FIELD_LIMITS.ID_Indikator) || null,
    Komponen_Indikator:
      normalizeText(row.Komponen_Indikator, FIELD_LIMITS.Komponen_Indikator) ||
      null,
    KodeSumber: normalizeFixedText(row.KodeSumber, FIELD_LIMITS.KodeSumber)
  };
}

export function parseInteger(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseDecimal(value: unknown, decimals: number) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const factor = 10 ** decimals;
  return Math.round(parsed * factor) / factor;
}

export function normalizeText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

export function normalizeFixedText(value: unknown, maxLength: number) {
  return normalizeText(value, maxLength).toUpperCase();
}

export function autoMapHeaders(headers: string[]) {
  return TARGET_FIELDS.reduce<Record<string, string>>((carry, field) => {
    const normalizedField = normalizeHeader(field);
    carry[field] =
      headers.find((header) => normalizeHeader(header) === normalizedField) ??
      "";
    return carry;
  }, {});
}

export function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function canValidate(batch: KinerjaEkonomiBatchRecord) {
  return ["draft", "invalid", "failed", "rejected"].includes(batch.status);
}

export function canApproveBatch(batch: KinerjaEkonomiBatchRecord) {
  return batch.status === "valid";
}

export function getWorkflowTitle(action?: WorkflowAction) {
  if (action === "validate") return "Validasi Batch";
  if (action === "approve") return "Setujui Batch";
  if (action === "publish") return "Publikasikan Batch";
  if (action === "reject") return "Tolak Batch";
  if (action === "delete") return "Hapus Batch";
  return "Konfirmasi Tindakan";
}

export function getWorkflowConfirmLabel(action?: WorkflowAction) {
  if (action === "validate") return "Validasi";
  if (action === "approve") return "Setujui";
  if (action === "publish") return "Publikasikan";
  if (action === "reject") return "Tolak";
  if (action === "delete") return "Hapus";
  return "Konfirmasi";
}

export function getWorkflowDescription(target: WorkflowTarget) {
  if (!target) return "Tindakan ini akan diproses.";

  const actionLabels: Record<WorkflowAction, string> = {
    validate: "divalidasi",
    approve: "disetujui",
    publish: "dipublikasikan",
    reject: "ditolak",
    delete: "dihapus"
  };

  return `Batch dengan status ${getBatchStatusLabel(target.batch.status)} akan ${actionLabels[target.action]}.`;
}

export function getBatchStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Draf",
    validating: "Sedang Divalidasi",
    publishing: "Sedang Dipublikasikan",
    valid: "Valid",
    invalid: "Tidak Valid",
    approved: "Disetujui",
    rejected: "Ditolak",
    published: "Dipublikasi",
    failed: "Gagal"
  };

  return labels[status] ?? status ?? "-";
}

export function getSourceTypeLabel(sourceType: string) {
  if (sourceType === "manual") return "Input Manual";
  if (sourceType === "upload") return "Unggah Berkas";
  return sourceType || "-";
}

export function formatDateTime(value: string) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}
