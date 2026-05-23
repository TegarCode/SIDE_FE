import type {
  TradeBatchRecord,
  TradePayloadRow
} from "@/type/admin-management/adminDashboardTrade";
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
  Kode_Alpha3_Reporter: string;
  Provinsi_Reporter: string;
  Kota_Reporter: string;
  Kode_Alpha3_Partner: string;
  Provinsi_Partner: string;
  Kota_Partner: string;
  Bulan: string;
  Tahun: string;
  HsCode: string;
  ID_Sektor: string;
  Vol: string;
  Satuan: string;
  Tarif: string;
  Nilai: string;
  Kode_Sumber: string;
  Status: string;
  Berat_Bersih: string;
  Pelabuhan: string;
  hs_len: string;
};

export type WorkflowTarget = {
  action: WorkflowAction;
  batch: TradeBatchRecord;
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

export const TRADE_STATUS_OPTIONS: SelectOption[] = [
  { value: "", label: "Semua Jenis Arus" },
  { value: "Export", label: "Export" },
  { value: "Import", label: "Import" }
];

export const ROW_SORT_OPTIONS: SelectOption[] = [
  { value: "id", label: "Urutan Input" },
  { value: "Kode_Alpha3_Reporter", label: "Kode Reporter" },
  { value: "Kode_Alpha3_Partner", label: "Kode Partner" },
  { value: "Bulan", label: "Bulan" },
  { value: "Tahun", label: "Tahun" },
  { value: "HsCode", label: "HS Code" },
  { value: "ID_Sektor", label: "Sektor" },
  { value: "Vol", label: "Volume" },
  { value: "Tarif", label: "Tarif" },
  { value: "Nilai", label: "Nilai" },
  { value: "Kode_Sumber", label: "Kode Sumber" },
  { value: "Status", label: "Status Arus" },
  { value: "Berat_Bersih", label: "Berat Bersih" },
  { value: "Pelabuhan", label: "Pelabuhan" },
  { value: "hs_len", label: "Panjang HS" },
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
  { value: "Kode_Alpha3_Reporter", label: "Kode Reporter" },
  { value: "Kode_Alpha3_Partner", label: "Kode Partner" },
  { value: "HsCode", label: "HS Code" },
  { value: "ID_Sektor", label: "Sektor" },
  { value: "Vol", label: "Volume" },
  { value: "Tarif", label: "Tarif" },
  { value: "Nilai", label: "Nilai" },
  { value: "Kode_Sumber", label: "Kode Sumber" },
  { value: "Status", label: "Status Arus" },
  { value: "Berat_Bersih", label: "Berat Bersih" },
  { value: "Pelabuhan", label: "Pelabuhan" },
  { value: "hs_len", label: "Panjang HS" }
];

export const TARGET_FIELDS = [
  "Kode_Alpha3_Reporter",
  "Provinsi_Reporter",
  "Kota_Reporter",
  "Kode_Alpha3_Partner",
  "Provinsi_Partner",
  "Kota_Partner",
  "Bulan",
  "Tahun",
  "HsCode",
  "ID_Sektor",
  "Vol",
  "Satuan",
  "Tarif",
  "Nilai",
  "Kode_Sumber",
  "Status",
  "Berat_Bersih",
  "Pelabuhan",
  "hs_len"
] as const;

export const FIELD_LIMITS = {
  Kode_Alpha3_Reporter: 3,
  Provinsi_Reporter: 255,
  Kota_Reporter: 255,
  Kode_Alpha3_Partner: 3,
  Provinsi_Partner: 255,
  Kota_Partner: 255,
  Bulan: 15,
  HsCode: 9,
  ID_Sektor: 15,
  Satuan: 25,
  Kode_Sumber: 2,
  Pelabuhan: 150
} as const;

export const MAX_UPLOAD_SIZE_LABEL = "1 GB";
export const RECOMMENDED_UPLOAD_SIZE_LABEL = "100 MB";

export const UPLOAD_FIELD_REQUIREMENTS = [
  {
    field: "Kode_Alpha3_Reporter",
    required: "Wajib",
    format: "3 huruf kode negara reporter, contoh: IDN"
  },
  {
    field: "Kode_Alpha3_Partner",
    required: "Wajib",
    format: "3 huruf kode negara partner, contoh: CHN"
  },
  {
    field: "Provinsi_Reporter",
    required: "Opsional",
    format: "Teks maksimal 255 karakter"
  },
  {
    field: "Kota_Reporter",
    required: "Opsional",
    format: "Teks maksimal 255 karakter"
  },
  {
    field: "Provinsi_Partner",
    required: "Opsional",
    format: "Teks maksimal 255 karakter"
  },
  {
    field: "Kota_Partner",
    required: "Opsional",
    format: "Teks maksimal 255 karakter"
  },
  {
    field: "Bulan",
    required: "Opsional",
    format: "Nama bulan/periode maksimal 15 karakter"
  },
  { field: "Tahun", required: "Wajib", format: "4 digit tahun, contoh: 2026" },
  { field: "HsCode", required: "Wajib", format: "Kode HS maksimal 9 digit" },
  {
    field: "ID_Sektor",
    required: "Opsional",
    format: "Kode sektor maksimal 15 karakter"
  },
  { field: "Vol", required: "Opsional", format: "Bilangan bulat" },
  {
    field: "Satuan",
    required: "Opsional",
    format: "Teks maksimal 25 karakter"
  },
  { field: "Tarif", required: "Opsional", format: "Bilangan desimal" },
  { field: "Nilai", required: "Wajib", format: "Bilangan desimal" },
  { field: "Kode_Sumber", required: "Wajib", format: "Kode sumber 2 karakter" },
  {
    field: "Status",
    required: "Wajib",
    format: "Isi dengan Export atau Import"
  },
  { field: "Berat_Bersih", required: "Opsional", format: "Bilangan desimal" },
  {
    field: "Pelabuhan",
    required: "Opsional",
    format: "Teks maksimal 150 karakter"
  },
  {
    field: "hs_len",
    required: "Wajib",
    format: "Angka 1 sampai 9 dan harus sesuai panjang HsCode"
  }
] as const;

export const REQUIRED_ROW_FIELDS = [
  "Kode_Alpha3_Reporter",
  "Kode_Alpha3_Partner",
  "Tahun",
  "HsCode",
  "Nilai",
  "Kode_Sumber",
  "Status",
  "hs_len"
] as const;

export function isRequiredRowField(field: string) {
  return REQUIRED_ROW_FIELDS.some((requiredField) => requiredField === field);
}

export const EMPTY_MANUAL_ROW: ManualRow = {
  id: "",
  Kode_Alpha3_Reporter: "",
  Provinsi_Reporter: "",
  Kota_Reporter: "",
  Kode_Alpha3_Partner: "",
  Provinsi_Partner: "",
  Kota_Partner: "",
  Bulan: "",
  Tahun: "",
  HsCode: "",
  ID_Sektor: "",
  Vol: "",
  Satuan: "",
  Tarif: "",
  Nilai: "",
  Kode_Sumber: "",
  Status: "Export",
  Berat_Bersih: "",
  Pelabuhan: "",
  hs_len: ""
};

export function createManualRow(): ManualRow {
  return {
    ...EMPTY_MANUAL_ROW,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`
  };
}

export function toPayloadRow(row: ManualRow): TradePayloadRow {
  return {
    Kode_Alpha3_Reporter: normalizeFixedText(
      row.Kode_Alpha3_Reporter,
      FIELD_LIMITS.Kode_Alpha3_Reporter
    ),
    Provinsi_Reporter: normalizeText(
      row.Provinsi_Reporter,
      FIELD_LIMITS.Provinsi_Reporter
    ),
    Kota_Reporter: normalizeText(row.Kota_Reporter, FIELD_LIMITS.Kota_Reporter),
    Kode_Alpha3_Partner: normalizeFixedText(
      row.Kode_Alpha3_Partner,
      FIELD_LIMITS.Kode_Alpha3_Partner
    ),
    Provinsi_Partner: normalizeText(
      row.Provinsi_Partner,
      FIELD_LIMITS.Provinsi_Partner
    ),
    Kota_Partner: normalizeText(row.Kota_Partner, FIELD_LIMITS.Kota_Partner),
    Bulan: normalizeText(row.Bulan, FIELD_LIMITS.Bulan),
    Tahun: parseInteger(row.Tahun),
    HsCode: normalizeHsCode(row.HsCode),
    ID_Sektor: normalizeText(row.ID_Sektor, FIELD_LIMITS.ID_Sektor) || null,
    Vol: parseInteger(row.Vol),
    Satuan: normalizeText(row.Satuan, FIELD_LIMITS.Satuan),
    Tarif: parseDecimal(row.Tarif, 2),
    Nilai: parseDecimal(row.Nilai, 2),
    Kode_Sumber: normalizeFixedText(row.Kode_Sumber, FIELD_LIMITS.Kode_Sumber),
    Status: normalizeTradeStatus(row.Status),
    Berat_Bersih: parseDecimal(row.Berat_Bersih, 2),
    Pelabuhan: normalizeText(row.Pelabuhan, FIELD_LIMITS.Pelabuhan),
    hs_len: parseInteger(row.hs_len)
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

export function normalizeHsCode(value: unknown) {
  return normalizeText(value, FIELD_LIMITS.HsCode).replace(/\s+/g, "");
}

export function normalizeTradeStatus(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "import") return "Import";
  return "Export";
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

export function canValidate(batch: TradeBatchRecord) {
  return ["draft", "invalid", "failed", "rejected"].includes(batch.status);
}

export function canApproveBatch(batch: TradeBatchRecord) {
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
