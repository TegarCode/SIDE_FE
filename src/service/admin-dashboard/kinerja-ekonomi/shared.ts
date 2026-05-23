import type {
  BackendSuccessResponse,
  KinerjaEkonomiBatchRecord,
  KinerjaEkonomiCurrentListResponse,
  KinerjaEkonomiCurrentRecord,
  KinerjaEkonomiDetailResponse,
  KinerjaEkonomiListResponse,
  KinerjaEkonomiMutationResponse,
  KinerjaEkonomiOptionItem,
  KinerjaEkonomiOptionsResponse,
  KinerjaEkonomiUploadPreviewResponse,
  KinerjaEkonomiRowRecord,
  KinerjaEkonomiRowsMeta,
  KinerjaEkonomiSummary,
  KinerjaEkonomiValidationErrors
} from "@/type/admin-management/adminDashboardKinerjaEkonomi";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function pick(input: UnknownRecord, ...keys: string[]) {
  for (const key of keys) {
    if (input[key] !== undefined) return input[key];
  }
  return undefined;
}

export function assertSuccess<TData>(
  payload: BackendSuccessResponse<TData>
): BackendSuccessResponse<TData> {
  if (payload.success === false) {
    const firstError = payload.errors
      ? Object.values(payload.errors)
          .flat()
          .find((message): message is string => typeof message === "string")
      : null;

    throw new Error(
      firstError || payload.message || "Permintaan tidak berhasil diproses."
    );
  }

  return payload;
}

function unwrapData<TData>(payload: BackendSuccessResponse<TData> | TData) {
  if (isRecord(payload) && "data" in payload && payload.data !== undefined) {
    return payload.data as TData;
  }

  return payload as TData;
}

export function normalizeBatch(input: unknown): KinerjaEkonomiBatchRecord {
  const record = isRecord(input) ? input : {};

  return {
    id: asString(pick(record, "id", "batch_id")),
    sourceType: asString(pick(record, "source_type", "sourceType")),
    originalFilename: asString(
      pick(record, "original_filename", "originalFilename")
    ),
    uploadedBy: asString(pick(record, "uploaded_by", "uploadedBy")),
    uploadedByName: asString(
      pick(
        record,
        "uploaded_by_name",
        "uploadedByName",
        "uploader_name",
        "uploaderName"
      )
    ),
    note: asString(record.note),
    status: asString(
      record.status,
      "draft"
    ) as KinerjaEkonomiBatchRecord["status"],
    totalRows: asNumber(pick(record, "total_rows", "totalRows")),
    validRows: asNumber(pick(record, "valid_rows", "validRows")),
    invalidRows: asNumber(pick(record, "invalid_rows", "invalidRows")),
    uploadedAt: asString(pick(record, "uploaded_at", "uploadedAt")),
    validatedAt: asString(pick(record, "validated_at", "validatedAt")),
    approvedAt: asString(pick(record, "approved_at", "approvedAt")),
    publishedAt: asString(pick(record, "published_at", "publishedAt")),
    createdAt: asString(pick(record, "created_at", "createdAt")),
    updatedAt: asString(pick(record, "updated_at", "updatedAt"))
  };
}

function normalizeValidationErrors(
  input: unknown
): KinerjaEkonomiValidationErrors {
  if (Array.isArray(input)) {
    return input.reduce<KinerjaEkonomiValidationErrors>((carry, item) => {
      if (typeof item === "string") {
        carry.row = [...(carry.row ?? []), item];
        return carry;
      }

      if (!isRecord(item)) return carry;

      const field = asString(pick(item, "field", "key", "attribute"), "row");
      const message = asString(pick(item, "message", "error", "text"));
      if (!message) return carry;

      carry[field] = [...(carry[field] ?? []), message];
      return carry;
    }, {});
  }

  if (!isRecord(input)) return {};

  return Object.entries(input).reduce<KinerjaEkonomiValidationErrors>(
    (carry, [field, messages]) => {
      if (Array.isArray(messages)) {
        carry[field] = messages
          .map((message) => asString(message))
          .filter(Boolean);
      } else if (messages) {
        carry[field] = [asString(messages)];
      }
      return carry;
    },
    {}
  );
}

export function normalizeRow(input: unknown): KinerjaEkonomiRowRecord {
  const record = isRecord(input) ? input : {};

  return {
    id: asString(pick(record, "id", "row_id")),
    kodeAlpha3: asString(pick(record, "kode_alpha3", "Kode_Alpha3")),
    negara: asString(record.negara),
    bulan: asNullableNumber(pick(record, "bulan", "Bulan")),
    tahun: asNullableNumber(pick(record, "tahun", "Tahun")),
    nilai: asNullableNumber(pick(record, "nilai", "Nilai")),
    unit: asString(pick(record, "unit", "Unit")),
    satuan: asString(pick(record, "satuan", "Satuan")),
    idIndikator: asString(pick(record, "id_indikator", "ID_Indikator")),
    indikator: asString(record.indikator),
    komponenIndikator: asString(
      pick(record, "komponen_indikator", "Komponen_Indikator")
    ),
    kodeSumber: asString(pick(record, "kode_sumber", "KodeSumber")),
    sumber: asString(record.sumber),
    rowStatus: asString(pick(record, "row_status", "rowStatus"), "pending"),
    validationErrors: normalizeValidationErrors(
      pick(record, "validation_errors", "validationErrors")
    )
  };
}

export function normalizeCurrentRow(
  input: unknown
): KinerjaEkonomiCurrentRecord {
  const record = isRecord(input) ? input : {};

  return {
    id: asString(pick(record, "id", "row_id")),
    kodeAlpha3: asString(pick(record, "kode_alpha3", "Kode_Alpha3")),
    negara: asString(record.negara),
    bulan: asNullableNumber(pick(record, "bulan", "Bulan")),
    tahun: asNullableNumber(pick(record, "tahun", "Tahun")),
    nilai: asNullableNumber(pick(record, "nilai", "Nilai")),
    unit: asString(pick(record, "unit", "Unit")),
    satuan: asString(pick(record, "satuan", "Satuan")),
    idIndikator: asString(pick(record, "id_indikator", "ID_Indikator")),
    indikator: asString(record.indikator),
    komponenIndikator: asString(
      pick(record, "komponen_indikator", "Komponen_Indikator")
    ),
    kodeSumber: asString(pick(record, "kode_sumber", "KodeSumber")),
    sumber: asString(record.sumber)
  };
}

function normalizeRowsMeta(
  input: unknown,
  fallbackTotal: number,
  fallbackLength: number
): KinerjaEkonomiRowsMeta {
  const record = isRecord(input) ? input : {};
  const total = asNumber(record.total, fallbackTotal);
  const page = asNumber(pick(record, "page", "current_page"), 1);
  const perPage = asNumber(
    pick(record, "per_page", "perPage"),
    fallbackLength || 25
  );

  return {
    page,
    perPage,
    total,
    lastPage: asNumber(
      pick(record, "last_page", "lastPage"),
      Math.max(1, Math.ceil(total / Math.max(perPage, 1)))
    ),
    sortBy: asString(pick(record, "sort_by", "sortBy"), "id"),
    sortDirection: asString(
      pick(record, "sort_direction", "sortDirection"),
      "asc"
    )
  };
}
function normalizeSummary(
  input: unknown,
  total: number
): KinerjaEkonomiSummary {
  const record = isRecord(input) ? input : {};

  return {
    totalBatch: asNumber(pick(record, "total_batch", "totalBatch"), total),
    pendingBatch: asNumber(pick(record, "pending_batch", "pendingBatch")),
    approvedBatch: asNumber(pick(record, "approved_batch", "approvedBatch")),
    publishedBatch: asNumber(pick(record, "published_batch", "publishedBatch")),
    invalidBatch: asNumber(pick(record, "invalid_batch", "invalidBatch"))
  };
}

export function normalizeListResponse(
  payload: BackendSuccessResponse<unknown>
): KinerjaEkonomiListResponse {
  const data = unwrapData(payload);
  const record = isRecord(data) ? data : {};
  const items = asArray(pick(record, "items", "data", "batches"));
  const meta = isRecord(record.meta) ? record.meta : {};
  const total = asNumber(meta.total, items.length);
  const page = asNumber(pick(meta, "page", "current_page"), 1);
  const perPage = asNumber(
    pick(meta, "per_page", "perPage"),
    items.length || 10
  );
  const lastPage = asNumber(
    pick(meta, "last_page", "lastPage"),
    Math.max(1, Math.ceil(total / Math.max(perPage, 1)))
  );

  return {
    items: items.map(normalizeBatch),
    total,
    page,
    perPage,
    lastPage,
    summary: normalizeSummary(record.summary, total)
  };
}

export function normalizeCurrentListResponse(
  payload: BackendSuccessResponse<unknown>
): KinerjaEkonomiCurrentListResponse {
  const data = unwrapData(payload);
  const record = isRecord(data) ? data : {};
  const items = asArray(pick(record, "items", "data", "rows"));
  const meta = isRecord(record.meta) ? record.meta : {};
  const total = asNumber(meta.total, items.length);
  const page = asNumber(pick(meta, "page", "current_page"), 1);
  const perPage = asNumber(
    pick(meta, "per_page", "perPage"),
    items.length || 10
  );
  const lastPage = asNumber(
    pick(meta, "last_page", "lastPage"),
    Math.max(1, Math.ceil(total / Math.max(perPage, 1)))
  );

  return {
    items: items.map(normalizeCurrentRow),
    total,
    page,
    perPage,
    lastPage
  };
}

export function normalizeDetailResponse(
  payload: BackendSuccessResponse<unknown>
): KinerjaEkonomiDetailResponse {
  const data = unwrapData(payload);
  const record = isRecord(data) ? data : {};
  const rowsPayload = record.rows;
  const rowsRecord = isRecord(rowsPayload) ? rowsPayload : {};
  const rowItems = isRecord(rowsPayload)
    ? asArray(pick(rowsRecord, "items", "data", "rows"))
    : asArray(rowsPayload);
  const rowsMeta = normalizeRowsMeta(
    isRecord(rowsPayload) ? rowsRecord.meta : null,
    rowItems.length,
    rowItems.length
  );

  return {
    data: {
      ...normalizeBatch(record),
      rows: rowItems.map(normalizeRow),
      rowsMeta
    },
    message: asString(payload.message, "Detail batch berhasil diambil.")
  };
}

export function normalizeMutationResponse(
  payload: BackendSuccessResponse<unknown>
): KinerjaEkonomiMutationResponse {
  return {
    data: normalizeBatch(unwrapData(payload)),
    message: asString(payload.message, "Operasi kinerja ekonomi berhasil.")
  };
}

function normalizeOption(input: unknown): KinerjaEkonomiOptionItem {
  const record = isRecord(input) ? input : {};
  const value = asString(
    pick(record, "value", "id", "code", "kode", "KodeSumber")
  );
  const label = asString(
    pick(record, "label", "name", "nama", "negara", "indikator", "sumber"),
    value
  );

  return { value, label, meta: record };
}

export function normalizeOptionsResponse(
  payload: BackendSuccessResponse<unknown>
): KinerjaEkonomiOptionsResponse {
  const data = unwrapData(payload);
  const record = isRecord(data) ? data : {};

  return {
    indicators: asArray(record.indicators).map(normalizeOption),
    countries: asArray(record.countries).map(normalizeOption),
    sources: asArray(record.sources).map(normalizeOption)
  };
}

export function normalizeUploadPreviewResponse(
  payload: BackendSuccessResponse<unknown>
): KinerjaEkonomiUploadPreviewResponse {
  const data = unwrapData(payload);
  const record = isRecord(data) ? data : {};

  return {
    originalFilename: asString(
      pick(record, "original_filename", "originalFilename")
    ),
    headers: asArray(record.headers).map((item) => asString(item)),
    sampleRows: asArray(pick(record, "sample_rows", "sampleRows")).filter(
      isRecord
    ),
    sampleSize: asNumber(pick(record, "sample_size", "sampleSize"))
  };
}
