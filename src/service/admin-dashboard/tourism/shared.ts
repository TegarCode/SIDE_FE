import type {
  BackendSuccessResponse,
  TourismBatchRecord,
  TourismCurrentListResponse,
  TourismCurrentRecord,
  TourismDetailResponse,
  TourismListResponse,
  TourismMutationResponse,
  TourismOptionsResponse,
  TourismRowRecord,
  TourismRowsMeta,
  TourismSummary,
  TourismUploadPreviewResponse,
  TourismValidationErrors
} from "@/type/admin-management/adminDashboardTourism";

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

export function normalizeBatch(input: unknown): TourismBatchRecord {
  const record = isRecord(input) ? input : {};

  return {
    id: asString(pick(record, "id", "uuid", "batch_id")),
    sourceType: asString(pick(record, "source_type", "sourceType")),
    originalFilename: asString(
      pick(record, "original_filename", "originalFilename")
    ),
    uploadedBy: asString(pick(record, "uploaded_by", "uploadedBy")),
    uploadedByName: asString(
      pick(record, "uploaded_by_name", "uploadedByName", "uploader_name")
    ),
    note: asString(record.note),
    status: asString(record.status, "draft") as TourismBatchRecord["status"],
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

function normalizeValidationErrors(input: unknown): TourismValidationErrors {
  if (Array.isArray(input)) {
    return input.reduce<TourismValidationErrors>((carry, item) => {
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

  return Object.entries(input).reduce<TourismValidationErrors>(
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

function normalizeTourismFields(record: UnknownRecord) {
  return {
    id: asString(pick(record, "id", "row_id")),
    kodeAlpha3Asal: asString(
      pick(record, "kode_alpha3_asal", "Kode_Alpha3_Asal", "kodeAlpha3Asal")
    ),
    originCountry: asString(
      pick(record, "origin_country", "originCountry", "negara_asal")
    ),
    provinsiAsal: asString(pick(record, "provinsi_asal", "Provinsi_Asal")),
    kotaAsal: asString(pick(record, "kota_asal", "Kota_Asal")),
    kodeAlpha3Tujuan: asString(
      pick(
        record,
        "kode_alpha3_tujuan",
        "Kode_Alpha3_Tujuan",
        "kodeAlpha3Tujuan"
      )
    ),
    destinationCountry: asString(
      pick(record, "destination_country", "destinationCountry", "negara_tujuan")
    ),
    provinsiTujuan: asString(
      pick(record, "provinsi_tujuan", "Provinsi_Tujuan")
    ),
    kotaTujuan: asString(pick(record, "kota_tujuan", "Kota_Tujuan")),
    tujuanPerjalanan: asString(
      pick(record, "tujuan_perjalanan", "Tujuan_Perjalanan")
    ),
    lamaPerjalanan: asNullableNumber(
      pick(record, "lama_perjalanan", "Lama_Perjalanan")
    ),
    bulan: asString(pick(record, "bulan", "Bulan")),
    tahun: asNullableNumber(pick(record, "tahun", "Tahun")),
    jumlahWisatawan: asNullableNumber(
      pick(record, "jumlah_wisatawan", "Jumlah_Wisatawan")
    ),
    nilaiSpending: asString(pick(record, "nilai_spending", "Nilai_Spending")),
    portEntry: asString(pick(record, "port_entry", "Port_Entry")),
    kodeSumber: asString(pick(record, "kode_sumber", "Kode_Sumber")),
    sumber: asString(pick(record, "sumber")),
    statusData: asString(pick(record, "status_data", "Status"))
  };
}

export function normalizeRow(input: unknown): TourismRowRecord {
  const record = isRecord(input) ? input : {};

  return {
    ...normalizeTourismFields(record),
    rowStatus: asString(pick(record, "row_status", "rowStatus"), "pending"),
    validationErrors: normalizeValidationErrors(
      pick(record, "validation_errors", "validationErrors")
    )
  };
}

export function normalizeCurrentRow(input: unknown): TourismCurrentRecord {
  const record = isRecord(input) ? input : {};
  return normalizeTourismFields(record);
}

function normalizeRowsMeta(
  input: unknown,
  fallbackTotal: number,
  fallbackLength: number
): TourismRowsMeta {
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

function normalizeSummary(input: unknown, total: number): TourismSummary {
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
): TourismListResponse {
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
    items: items.map((item) => normalizeBatch(item)),
    total,
    page,
    perPage,
    lastPage,
    summary: normalizeSummary(record.summary, total)
  };
}

export function normalizeCurrentListResponse(
  payload: BackendSuccessResponse<unknown>
): TourismCurrentListResponse {
  const data = unwrapData(payload);
  const record = isRecord(data) ? data : {};
  const items = asArray(pick(record, "items", "data"));
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
    items: items.map((item) => normalizeCurrentRow(item)),
    total,
    page,
    perPage,
    lastPage
  };
}

export function normalizeDetailResponse(
  payload: BackendSuccessResponse<unknown>
): TourismDetailResponse {
  const data = unwrapData(payload);
  const record = isRecord(data) ? data : {};
  const batch = normalizeBatch(record);
  const rowsContainer = isRecord(record.rows) ? record.rows : null;
  const rowsSource = rowsContainer
    ? pick(rowsContainer, "items", "data")
    : pick(record, "rows", "items");
  const rows = asArray(rowsSource).map((item) => normalizeRow(item));
  const rowsMetaSource = rowsContainer
    ? pick(rowsContainer, "meta", "rows_meta")
    : (record.rows_meta ?? record.meta);

  return {
    message: asString(payload.message),
    data: {
      ...batch,
      rows,
      rowsMeta: normalizeRowsMeta(rowsMetaSource, rows.length, rows.length)
    }
  };
}

export function normalizeMutationResponse(
  payload: BackendSuccessResponse<unknown>
): TourismMutationResponse {
  const data = unwrapData(payload);
  return {
    message: asString(payload.message),
    data: normalizeBatch(data)
  };
}

function normalizeOptionItems(input: unknown) {
  return asArray(input).map((item) => {
    const record = isRecord(item) ? item : {};
    return {
      value: asString(record.value),
      label: asString(record.label)
    };
  });
}

export function normalizeOptionsResponse(
  payload: BackendSuccessResponse<unknown>
): TourismOptionsResponse {
  const data = unwrapData(payload);
  const record = isRecord(data) ? data : {};

  return {
    countries: normalizeOptionItems(record.countries),
    sources: normalizeOptionItems(record.sources),
    statuses: normalizeOptionItems(record.statuses),
    travelPurposes: normalizeOptionItems(
      pick(record, "travel_purposes", "travelPurposes")
    ),
    months: normalizeOptionItems(record.months)
  };
}

export function normalizeUploadPreviewResponse(
  payload: BackendSuccessResponse<unknown>
): TourismUploadPreviewResponse {
  const data = unwrapData(payload);
  const record = isRecord(data) ? data : {};

  return {
    originalFilename: asString(
      pick(record, "original_filename", "originalFilename")
    ),
    headers: asArray(record.headers).map((header) => asString(header)),
    sampleRows: asArray(pick(record, "sample_rows", "sampleRows", "rows")).map(
      (row) => (isRecord(row) ? row : {})
    ),
    sampleSize: asNumber(pick(record, "sample_size", "sampleSize"))
  };
}
