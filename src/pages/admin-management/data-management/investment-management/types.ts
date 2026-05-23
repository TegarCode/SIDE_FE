import type {
  InvestmentBatchRecord,
  InvestmentPayloadRow
} from "@/type/admin-management/adminDashboardInvestment";
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
  Kode_Alpha3_Asal: string;
  Provinsi_Asal: string;
  Kota_Asal: string;
  Kode_Alpha3_Tujuan: string;
  Nama_Perusahaan: string;
  Tipe_Investasi: string;
  Bulan: string;
  Tahun: string;
  ID_Sektor: string;
  Nilai_Investasi: string;
  Nilai_Proyek: string;
  Kode_Sumber: string;
  Status: string;
};

export type WorkflowTarget = {
  action: WorkflowAction;
  batch: InvestmentBatchRecord;
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

export const INVESTMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: "", label: "Semua Status Arus" },
  { value: "Inbound", label: "Inbound" },
  { value: "Outbound", label: "Outbound" }
];

export const ROW_SORT_OPTIONS: SelectOption[] = [
  { value: "id", label: "Urutan Input" },
  { value: "Kode_Alpha3_Asal", label: "Kode Asal" },
  { value: "Kode_Alpha3_Tujuan", label: "Kode Tujuan" },
  { value: "Nama_Perusahaan", label: "Perusahaan" },
  { value: "Tipe_Investasi", label: "Tipe Investasi" },
  { value: "Bulan", label: "Bulan" },
  { value: "Tahun", label: "Tahun" },
  { value: "ID_Sektor", label: "Sektor" },
  { value: "Nilai_Investasi", label: "Nilai Investasi" },
  { value: "Nilai_Proyek", label: "Nilai Proyek" },
  { value: "Kode_Sumber", label: "Kode Sumber" },
  { value: "Status", label: "Status Arus" },
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
  { value: "Kode_Alpha3_Asal", label: "Kode Asal" },
  { value: "Kode_Alpha3_Tujuan", label: "Kode Tujuan" },
  { value: "Nama_Perusahaan", label: "Perusahaan" },
  { value: "Tipe_Investasi", label: "Tipe Investasi" },
  { value: "ID_Sektor", label: "Sektor" },
  { value: "Nilai_Investasi", label: "Nilai Investasi" },
  { value: "Nilai_Proyek", label: "Nilai Proyek" },
  { value: "Kode_Sumber", label: "Kode Sumber" },
  { value: "Status", label: "Status Arus" }
];

export const TARGET_FIELDS = [
  "Kode_Alpha3_Asal",
  "Provinsi_Asal",
  "Kota_Asal",
  "Kode_Alpha3_Tujuan",
  "Nama_Perusahaan",
  "Tipe_Investasi",
  "Bulan",
  "Tahun",
  "ID_Sektor",
  "Nilai_Investasi",
  "Nilai_Proyek",
  "Kode_Sumber",
  "Status"
] as const;

export const FIELD_LIMITS = {
  Kode_Alpha3_Asal: 3,
  Provinsi_Asal: 100,
  Kota_Asal: 100,
  Kode_Alpha3_Tujuan: 3,
  Nama_Perusahaan: 255,
  Tipe_Investasi: 100,
  Kode_Sumber: 50
} as const;

export const MAX_UPLOAD_SIZE_LABEL = "1 GB";
export const RECOMMENDED_UPLOAD_SIZE_LABEL = "100 MB";

export const UPLOAD_FIELD_REQUIREMENTS = [
  {
    field: "Kode_Alpha3_Asal",
    required: "Wajib",
    format: "3 huruf kode negara asal, contoh: IDN"
  },
  {
    field: "Kode_Alpha3_Tujuan",
    required: "Wajib",
    format: "3 huruf kode negara tujuan, contoh: SGP"
  },
  {
    field: "Provinsi_Asal",
    required: "Opsional",
    format: "Teks maksimal 100 karakter"
  },
  {
    field: "Kota_Asal",
    required: "Opsional",
    format: "Teks maksimal 100 karakter"
  },
  {
    field: "Nama_Perusahaan",
    required: "Opsional",
    format: "Teks maksimal 255 karakter"
  },
  {
    field: "Tipe_Investasi",
    required: "Opsional",
    format: "Teks maksimal 100 karakter"
  },
  { field: "Bulan", required: "Opsional", format: "Angka 1 sampai 12" },
  { field: "Tahun", required: "Wajib", format: "4 digit tahun" },
  { field: "ID_Sektor", required: "Opsional", format: "ID sektor numerik" },
  {
    field: "Nilai_Investasi",
    required: "Wajib",
    format: "Bilangan desimal"
  },
  { field: "Nilai_Proyek", required: "Opsional", format: "Bilangan bulat" },
  {
    field: "Kode_Sumber",
    required: "Wajib",
    format: "Kode sumber maksimal 50 karakter"
  },
  {
    field: "Status",
    required: "Wajib",
    format: "Isi dengan Inbound atau Outbound"
  }
] as const;

export const REQUIRED_ROW_FIELDS = [
  "Kode_Alpha3_Asal",
  "Kode_Alpha3_Tujuan",
  "Tahun",
  "Nilai_Investasi",
  "Kode_Sumber",
  "Status"
] as const;

export function isRequiredRowField(field: string) {
  return REQUIRED_ROW_FIELDS.some((requiredField) => requiredField === field);
}

export const EMPTY_MANUAL_ROW: ManualRow = {
  id: "",
  Kode_Alpha3_Asal: "",
  Provinsi_Asal: "",
  Kota_Asal: "",
  Kode_Alpha3_Tujuan: "",
  Nama_Perusahaan: "",
  Tipe_Investasi: "",
  Bulan: "",
  Tahun: "",
  ID_Sektor: "",
  Nilai_Investasi: "",
  Nilai_Proyek: "",
  Kode_Sumber: "",
  Status: "Inbound"
};

export function createManualRow(): ManualRow {
  return {
    ...EMPTY_MANUAL_ROW,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`
  };
}

export function toPayloadRow(row: ManualRow): InvestmentPayloadRow {
  return {
    Kode_Alpha3_Asal: normalizeFixedText(
      row.Kode_Alpha3_Asal,
      FIELD_LIMITS.Kode_Alpha3_Asal
    ),
    Provinsi_Asal: normalizeText(row.Provinsi_Asal, FIELD_LIMITS.Provinsi_Asal),
    Kota_Asal: normalizeText(row.Kota_Asal, FIELD_LIMITS.Kota_Asal),
    Kode_Alpha3_Tujuan: normalizeFixedText(
      row.Kode_Alpha3_Tujuan,
      FIELD_LIMITS.Kode_Alpha3_Tujuan
    ),
    Nama_Perusahaan: normalizeText(
      row.Nama_Perusahaan,
      FIELD_LIMITS.Nama_Perusahaan
    ),
    Tipe_Investasi: normalizeText(
      row.Tipe_Investasi,
      FIELD_LIMITS.Tipe_Investasi
    ),
    Bulan: parseInteger(row.Bulan),
    Tahun: parseInteger(row.Tahun),
    ID_Sektor: parseInteger(row.ID_Sektor),
    Nilai_Investasi: parseDecimal(row.Nilai_Investasi, 2),
    Nilai_Proyek: parseInteger(row.Nilai_Proyek),
    Kode_Sumber: normalizeFixedText(row.Kode_Sumber, FIELD_LIMITS.Kode_Sumber),
    Status: normalizeInvestmentStatus(row.Status)
  };
}

export function parseInteger(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseDecimal(value: unknown, decimals: number) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(/,/g, ""));
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

export function normalizeInvestmentStatus(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "outbound") return "Outbound";
  return "Inbound";
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

export function canValidate(batch: InvestmentBatchRecord) {
  return ["draft", "invalid", "failed", "rejected"].includes(batch.status);
}

export function canApproveBatch(batch: InvestmentBatchRecord) {
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
