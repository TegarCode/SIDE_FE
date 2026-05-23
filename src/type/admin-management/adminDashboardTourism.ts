export type TourismBatchStatus =
  | "draft"
  | "validating"
  | "publishing"
  | "valid"
  | "invalid"
  | "approved"
  | "rejected"
  | "published"
  | "failed";

export type TourismSourceType = "manual" | "upload" | string;

export type TourismRowStatus =
  | "pending"
  | "valid"
  | "invalid"
  | "failed"
  | "published"
  | string;

export type TourismBatchRecord = {
  id: string;
  sourceType: TourismSourceType;
  originalFilename: string;
  uploadedBy: string;
  uploadedByName: string;
  note: string;
  status: TourismBatchStatus;
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

export type TourismValidationErrors = Record<string, string[]>;

export type TourismRowRecord = {
  id: string;
  kodeAlpha3Asal: string;
  originCountry: string;
  provinsiAsal: string;
  kotaAsal: string;
  kodeAlpha3Tujuan: string;
  destinationCountry: string;
  provinsiTujuan: string;
  kotaTujuan: string;
  tujuanPerjalanan: string;
  lamaPerjalanan: number | null;
  bulan: string;
  tahun: number | null;
  jumlahWisatawan: number | null;
  nilaiSpending: string;
  portEntry: string;
  kodeSumber: string;
  sumber: string;
  statusData: string;
  rowStatus: TourismRowStatus;
  validationErrors: TourismValidationErrors;
};

export type TourismCurrentRecord = Omit<
  TourismRowRecord,
  "rowStatus" | "validationErrors"
>;

export type TourismSummary = {
  totalBatch: number;
  pendingBatch: number;
  approvedBatch: number;
  publishedBatch: number;
  invalidBatch: number;
};

export type TourismListParams = {
  search?: string;
  status?: string;
  sourceType?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type TourismListResponse = {
  items: TourismBatchRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: TourismSummary;
};

export type TourismRowsMeta = {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  sortBy: string;
  sortDirection: "asc" | "desc" | string;
};

export type TourismCurrentListParams = {
  originCode?: string;
  destinationCode?: string;
  sourceCode?: string;
  status?: string;
  year?: string;
  month?: string;
  travelPurpose?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type TourismCurrentListResponse = {
  items: TourismCurrentRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
};

export type TourismDetailParams = {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type TourismDetailResponse = {
  data: TourismBatchRecord & {
    rows: TourismRowRecord[];
    rowsMeta: TourismRowsMeta;
  };
  message: string;
};

export type TourismMutationResponse = {
  data: TourismBatchRecord;
  message: string;
};

export type TourismOptionItem = {
  value: string;
  label: string;
  meta?: Record<string, unknown>;
};

export type TourismOptionsResponse = {
  countries: TourismOptionItem[];
  sources: TourismOptionItem[];
  statuses: TourismOptionItem[];
  travelPurposes: TourismOptionItem[];
  months: TourismOptionItem[];
};

export type TourismUploadPreviewResponse = {
  originalFilename: string;
  headers: string[];
  sampleRows: Record<string, unknown>[];
  sampleSize: number;
};

export type TourismPayloadRow = {
  Kode_Alpha3_Asal: string;
  Provinsi_Asal: string;
  Kota_Asal: string;
  Kode_Alpha3_Tujuan: string;
  Provinsi_Tujuan: string;
  Kota_Tujuan: string;
  Tujuan_Perjalanan: string;
  Lama_Perjalanan: number | null;
  Bulan: string;
  Tahun: number | null;
  Jumlah_Wisatawan: number | null;
  Nilai_Spending: string;
  Port_Entry: string;
  Kode_Sumber: string;
  Status: string;
};

export type TourismCreatePayload = {
  source_type: "manual" | "upload";
  original_filename?: string;
  note?: string;
  rows: TourismPayloadRow[];
};

export type TourismUpdateRowPayload = TourismPayloadRow;

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};
