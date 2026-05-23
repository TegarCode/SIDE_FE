export type InvestmentBatchStatus =
  | "draft"
  | "validating"
  | "publishing"
  | "valid"
  | "invalid"
  | "approved"
  | "rejected"
  | "published"
  | "failed";

export type InvestmentSourceType = "manual" | "upload" | string;

export type InvestmentRowStatus =
  | "pending"
  | "valid"
  | "invalid"
  | "failed"
  | string;

export type InvestmentBatchRecord = {
  id: string;
  sourceType: InvestmentSourceType;
  originalFilename: string;
  uploadedBy: string;
  uploadedByName: string;
  note: string;
  status: InvestmentBatchStatus;
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

export type InvestmentValidationErrors = Record<string, string[]>;

export type InvestmentRowRecord = {
  id: string;
  kodeAlpha3Asal: string;
  originCountry: string;
  provinsiAsal: string;
  kotaAsal: string;
  kodeAlpha3Tujuan: string;
  destinationCountry: string;
  namaPerusahaan: string;
  tipeInvestasi: string;
  bulan: number | null;
  tahun: number | null;
  idSektor: number | null;
  sektor: string;
  nilaiInvestasi: number | null;
  nilaiProyek: number | null;
  kodeSumber: string;
  sumber: string;
  statusData: string;
  rowStatus: InvestmentRowStatus;
  validationErrors: InvestmentValidationErrors;
};

export type InvestmentCurrentRecord = Omit<
  InvestmentRowRecord,
  "rowStatus" | "validationErrors"
>;

export type InvestmentSummary = {
  totalBatch: number;
  pendingBatch: number;
  approvedBatch: number;
  publishedBatch: number;
  invalidBatch: number;
};

export type InvestmentListParams = {
  search?: string;
  status?: string;
  sourceType?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type InvestmentListResponse = {
  items: InvestmentBatchRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: InvestmentSummary;
};

export type InvestmentRowsMeta = {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  sortBy: string;
  sortDirection: "asc" | "desc" | string;
};

export type InvestmentCurrentListParams = {
  originCode?: string;
  destinationCode?: string;
  sourceCode?: string;
  status?: string;
  sectorId?: string;
  year?: string;
  month?: string;
  investmentType?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type InvestmentCurrentListResponse = {
  items: InvestmentCurrentRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
};

export type InvestmentDetailParams = {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type InvestmentDetailResponse = {
  data: InvestmentBatchRecord & {
    rows: InvestmentRowRecord[];
    rowsMeta: InvestmentRowsMeta;
  };
  message: string;
};

export type InvestmentMutationResponse = {
  data: InvestmentBatchRecord;
  message: string;
};

export type InvestmentOptionItem = {
  value: string;
  label: string;
  meta?: Record<string, unknown>;
};

export type InvestmentOptionsResponse = {
  countries: InvestmentOptionItem[];
  sources: InvestmentOptionItem[];
  sectors: InvestmentOptionItem[];
  statuses: InvestmentOptionItem[];
  investmentTypes: InvestmentOptionItem[];
  months: InvestmentOptionItem[];
};

export type InvestmentUploadPreviewResponse = {
  originalFilename: string;
  headers: string[];
  sampleRows: Record<string, unknown>[];
  sampleSize: number;
};

export type InvestmentPayloadRow = {
  Kode_Alpha3_Asal: string;
  Provinsi_Asal: string;
  Kota_Asal: string;
  Kode_Alpha3_Tujuan: string;
  Nama_Perusahaan: string;
  Tipe_Investasi: string;
  Bulan: number | null;
  Tahun: number | null;
  ID_Sektor: number | null;
  Nilai_Investasi: number | null;
  Nilai_Proyek: number | null;
  Kode_Sumber: string;
  Status: string;
};

export type InvestmentCreatePayload = {
  source_type: "manual" | "upload";
  original_filename?: string;
  note?: string;
  rows: InvestmentPayloadRow[];
};

export type InvestmentUpdateRowPayload = InvestmentPayloadRow;

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};
