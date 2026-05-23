export type TradeBatchStatus =
  | "draft"
  | "validating"
  | "publishing"
  | "valid"
  | "invalid"
  | "approved"
  | "rejected"
  | "published"
  | "failed";

export type TradeSourceType = "manual" | "upload" | string;

export type TradeRowStatus =
  | "pending"
  | "valid"
  | "invalid"
  | "failed"
  | string;

export type TradeBatchRecord = {
  id: string;
  sourceType: TradeSourceType;
  originalFilename: string;
  uploadedBy: string;
  uploadedByName: string;
  note: string;
  status: TradeBatchStatus;
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

export type TradeValidationErrors = Record<string, string[]>;

export type TradeRowRecord = {
  id: string;
  kodeAlpha3Reporter: string;
  reporterCountry: string;
  provinsiReporter: string;
  kotaReporter: string;
  kodeAlpha3Partner: string;
  partnerCountry: string;
  provinsiPartner: string;
  kotaPartner: string;
  bulan: string;
  tahun: number | null;
  hsCode: string;
  hsDescription: string;
  idSektor: string;
  sektor: string;
  vol: number | null;
  satuan: string;
  tarif: number | null;
  nilai: number | null;
  kodeSumber: string;
  sumber: string;
  statusData: string;
  beratBersih: number | null;
  pelabuhan: string;
  hsLen: number | null;
  rowStatus: TradeRowStatus;
  validationErrors: TradeValidationErrors;
};

export type TradeCurrentRecord = Omit<
  TradeRowRecord,
  "rowStatus" | "validationErrors"
>;

export type TradeSummary = {
  totalBatch: number;
  pendingBatch: number;
  approvedBatch: number;
  publishedBatch: number;
  invalidBatch: number;
};

export type TradeListParams = {
  search?: string;
  status?: string;
  sourceType?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type TradeListResponse = {
  items: TradeBatchRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: TradeSummary;
};

export type TradeRowsMeta = {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  sortBy: string;
  sortDirection: "asc" | "desc" | string;
};

export type TradeCurrentListParams = {
  reporterCode?: string;
  partnerCode?: string;
  sourceCode?: string;
  status?: string;
  sectorId?: string;
  year?: string;
  hsLen?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type TradeCurrentListResponse = {
  items: TradeCurrentRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
};

export type TradeDetailParams = {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
};

export type TradeDetailResponse = {
  data: TradeBatchRecord & {
    rows: TradeRowRecord[];
    rowsMeta: TradeRowsMeta;
  };
  message: string;
};

export type TradeMutationResponse = {
  data: TradeBatchRecord;
  message: string;
};

export type TradeOptionItem = {
  value: string;
  label: string;
  meta?: Record<string, unknown>;
};

export type TradeOptionsResponse = {
  countries: TradeOptionItem[];
  sources: TradeOptionItem[];
  sectors: TradeOptionItem[];
  statuses: TradeOptionItem[];
  hsLevels: TradeOptionItem[];
};

export type TradeUploadPreviewResponse = {
  originalFilename: string;
  headers: string[];
  sampleRows: Record<string, unknown>[];
  sampleSize: number;
};

export type TradePayloadRow = {
  Kode_Alpha3_Reporter: string;
  Provinsi_Reporter: string;
  Kota_Reporter: string;
  Kode_Alpha3_Partner: string;
  Provinsi_Partner: string;
  Kota_Partner: string;
  Bulan: string;
  Tahun: number | null;
  HsCode: string;
  ID_Sektor: string | null;
  Vol: number | null;
  Satuan: string;
  Tarif: number | null;
  Nilai: number | null;
  Kode_Sumber: string;
  Status: string;
  Berat_Bersih: number | null;
  Pelabuhan: string;
  hs_len: number | null;
};

export type TradeCreatePayload = {
  source_type: "manual" | "upload";
  original_filename?: string;
  note?: string;
  rows: TradePayloadRow[];
};

export type TradeUpdateRowPayload = TradePayloadRow;

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};
