export type KinerjaEkonomiBatchStatus =
  | "draft"
  | "validating"
  | "publishing"
  | "valid"
  | "invalid"
  | "approved"
  | "rejected"
  | "published"
  | "failed";

export type KinerjaEkonomiSourceType = "manual" | "upload" | string;

export type KinerjaEkonomiRowStatus =
  | "pending"
  | "valid"
  | "invalid"
  | "failed"
  | string;

export type KinerjaEkonomiBatchRecord = {
  id: string;
  sourceType: KinerjaEkonomiSourceType;
  originalFilename: string;
  uploadedBy: string;
  uploadedByName: string;
  note: string;
  status: KinerjaEkonomiBatchStatus;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  uploadedAt: string;
  validatedAt: string;
  approvedAt: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type KinerjaEkonomiValidationErrors = Record<string, string[]>;

export type KinerjaEkonomiRowRecord = {
  id: string;
  kodeAlpha3: string;
  negara: string;
  bulan: number | null;
  tahun: number | null;
  nilai: number | null;
  unit: string;
  satuan: string;
  idIndikator: string;
  indikator: string;
  komponenIndikator: string;
  kodeSumber: string;
  sumber: string;
  rowStatus: KinerjaEkonomiRowStatus;
  validationErrors: KinerjaEkonomiValidationErrors;
};

export type KinerjaEkonomiCurrentRecord = {
  id: string;
  kodeAlpha3: string;
  negara: string;
  bulan: number | null;
  tahun: number | null;
  nilai: number | null;
  unit: string;
  satuan: string;
  idIndikator: string;
  indikator: string;
  komponenIndikator: string;
  kodeSumber: string;
  sumber: string;
};

export type KinerjaEkonomiSummary = {
  totalBatch: number;
  pendingBatch: number;
  approvedBatch: number;
  publishedBatch: number;
  invalidBatch: number;
};

export type KinerjaEkonomiListParams = {
  search?: string;
  status?: string;
  sourceType?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type KinerjaEkonomiListResponse = {
  items: KinerjaEkonomiBatchRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: KinerjaEkonomiSummary;
};

export type KinerjaEkonomiRowsMeta = {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  sortBy: string;
  sortDirection: "asc" | "desc" | string;
};

export type KinerjaEkonomiCurrentListParams = {
  countryCode?: string;
  indicatorId?: string;
  sourceCode?: string;
  year?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type KinerjaEkonomiCurrentListResponse = {
  items: KinerjaEkonomiCurrentRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
};

export type KinerjaEkonomiDetailParams = {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type KinerjaEkonomiDetailResponse = {
  data: KinerjaEkonomiBatchRecord & {
    rows: KinerjaEkonomiRowRecord[];
    rowsMeta: KinerjaEkonomiRowsMeta;
  };
  message: string;
};

export type KinerjaEkonomiMutationResponse = {
  data: KinerjaEkonomiBatchRecord;
  message: string;
};

export type KinerjaEkonomiOptionItem = {
  value: string;
  label: string;
  meta?: Record<string, unknown>;
};

export type KinerjaEkonomiOptionsResponse = {
  indicators: KinerjaEkonomiOptionItem[];
  countries: KinerjaEkonomiOptionItem[];
  sources: KinerjaEkonomiOptionItem[];
};

export type KinerjaEkonomiUploadPreviewResponse = {
  originalFilename: string;
  headers: string[];
  sampleRows: Record<string, unknown>[];
  sampleSize: number;
};

export type KinerjaEkonomiPayloadRow = {
  Kode_Alpha3: string;
  Bulan: number | null;
  Tahun: number | null;
  Nilai: number | null;
  Unit: string;
  Satuan: string;
  ID_Indikator: string | null;
  Komponen_Indikator: string | null;
  KodeSumber: string;
};

export type KinerjaEkonomiCreatePayload = {
  source_type: "manual" | "upload";
  original_filename?: string;
  note?: string;
  rows: KinerjaEkonomiPayloadRow[];
};

export type KinerjaEkonomiUpdateRowPayload = KinerjaEkonomiPayloadRow;

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};
