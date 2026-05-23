import type {
  AdminCacheDetailResponse,
  AdminCacheListResponse,
  AdminCacheMutationResponse,
  AdminCacheRecord,
  AdminCacheValue,
  BackendCacheItem,
  BackendCachesPayload,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardCache";

function asString(
  value: string | number | null | undefined,
  fallback = ""
): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumber(value: number | null | undefined, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeCacheValue(value: unknown): AdminCacheValue | undefined {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    Array.isArray(value)
  ) {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return undefined;
}

export function unwrapPayload<TData>(
  payload: BackendSuccessResponse<TData> | TData
): TData {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    payload.data !== undefined
  ) {
    return payload.data as TData;
  }

  return payload as TData;
}

export function assertSuccess<TData>(
  payload: BackendSuccessResponse<TData>
): BackendSuccessResponse<TData> {
  if (payload.success === false) {
    throw new Error(payload.message || "Permintaan tidak berhasil diproses.");
  }

  return payload;
}

export function normalizeCacheItem(input: BackendCacheItem): AdminCacheRecord {
  const key = asString(input.key || input.id);

  return {
    id: asString(input.id || key),
    key,
    category: asString(input.category, "-"),
    categoryParent: asString(input.category_parent, "-"),
    categoryChild: asString(input.category_child, "-"),
    expiration: asString(input.expiration),
    expirationTimestamp: asNumber(input.expiration_timestamp, 0),
    value: normalizeCacheValue(input.value)
  };
}

export function normalizeCachesResponse(
  payload: BackendSuccessResponse<BackendCachesPayload>
): AdminCacheListResponse {
  const unwrapped = unwrapPayload(payload);
  const items = Array.isArray(unwrapped.items) ? unwrapped.items : [];
  const meta = unwrapped.meta ?? {};
  const total = asNumber(meta.total, items.length);
  const page = asNumber(meta.page, 1);
  const perPage = asNumber(meta.per_page, items.length || 10);
  const lastPage = asNumber(
    meta.last_page,
    Math.max(1, Math.ceil(total / Math.max(perPage, 1)))
  );
  const summary = unwrapped.summary;

  return {
    items: items.map(normalizeCacheItem),
    total,
    page,
    perPage,
    lastPage,
    summary: {
      totalCache: asNumber(summary?.total_cache, total),
      kategoriAktif: asNumber(summary?.kategori_aktif, 0),
      cacheTerbaru: summary?.cache_terbaru
        ? normalizeCacheItem(summary.cache_terbaru)
        : null
    },
    sortBy:
      asString(meta.sort_by, "expiration") === "key" ? "key" : "expiration",
    sortDirection:
      asString(meta.sort_direction, "desc") === "asc" ? "asc" : "desc"
  };
}

export function normalizeCacheDetailResponse(
  payload: BackendSuccessResponse<BackendCacheItem>
): AdminCacheDetailResponse {
  return {
    data: normalizeCacheItem(unwrapPayload(payload)),
    message: asString(payload.message, "Detail cache berhasil diambil.")
  };
}

export function normalizeCacheMutationResponse(
  payload: BackendSuccessResponse<BackendCacheItem>
): AdminCacheMutationResponse {
  return {
    data: normalizeCacheItem(unwrapPayload(payload)),
    message: asString(payload.message, "Perubahan cache berhasil disimpan.")
  };
}
