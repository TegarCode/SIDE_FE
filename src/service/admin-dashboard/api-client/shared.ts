import type {
  AdminApiClientDetailResponse,
  AdminApiClientListResponse,
  AdminApiClientMutationResponse,
  AdminApiClientPermissionOption,
  AdminApiClientRecord,
  BackendApiClientItem,
  BackendApiClientPermissionItem,
  BackendApiClientPermissionsPayload,
  BackendApiClientsPayload,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardApiClient";

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

function asBoolean(value: boolean | null | undefined, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export function unwrapPayload<TData, TMetadata = undefined>(
  payload: BackendSuccessResponse<TData, TMetadata> | TData
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

export function assertSuccess<TData, TMetadata = undefined>(
  payload: BackendSuccessResponse<TData, TMetadata>
): BackendSuccessResponse<TData, TMetadata> {
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

export function normalizeApiClientItem(
  input: BackendApiClientItem
): AdminApiClientRecord {
  return {
    id: asString(input.id),
    name: asString(input.name),
    description: asString(input.description),
    abilities: Array.isArray(input.abilities)
      ? input.abilities
          .map((ability) => asString(ability))
          .filter((ability) => ability.trim().length > 0)
      : [],
    allowedDomains: Array.isArray(input.allowed_domains)
      ? input.allowed_domains
          .map((domain) => asString(domain))
          .filter((domain) => domain.trim().length > 0)
      : [],
    active: asBoolean(input.active, false),
    createdAt: asString(input.created_at),
    updatedAt: asString(input.updated_at)
  };
}

export function normalizeApiClientsResponse(
  payload: BackendSuccessResponse<BackendApiClientsPayload>
): AdminApiClientListResponse {
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
    items: items.map(normalizeApiClientItem),
    total,
    page,
    perPage,
    lastPage,
    summary: {
      totalClient: asNumber(summary?.total_client, total),
      activeClientCount: asNumber(summary?.client_aktif, 0),
      latestClient: summary?.client_terbaru
        ? normalizeApiClientItem(summary.client_terbaru)
        : null
    },
    sortBy:
      asString(meta.sort_by, "created_at") === "name" ||
      asString(meta.sort_by, "created_at") === "active" ||
      asString(meta.sort_by, "created_at") === "created_at" ||
      asString(meta.sort_by, "created_at") === "updated_at"
        ? (asString(meta.sort_by, "created_at") as
            | "name"
            | "active"
            | "created_at"
            | "updated_at")
        : "created_at",
    sortDirection:
      asString(meta.sort_direction, "desc") === "asc" ? "asc" : "desc"
  };
}

export function normalizeApiClientDetailResponse(
  payload: BackendSuccessResponse<BackendApiClientItem, unknown>
): AdminApiClientDetailResponse {
  return {
    data: normalizeApiClientItem(unwrapPayload(payload)),
    message: asString(payload.message, "Detail API client berhasil diambil.")
  };
}

export function normalizeApiClientMutationResponse(
  payload: BackendSuccessResponse<BackendApiClientItem, unknown>
): AdminApiClientMutationResponse {
  const metadata =
    typeof payload.metadata === "object" && payload.metadata !== null
      ? (payload.metadata as {
          plain_text_api_key?: string | null;
          api_key_notice?: string | null;
        })
      : {};

  return {
    data: normalizeApiClientItem(unwrapPayload(payload)),
    message: asString(payload.message, "Operasi API client berhasil."),
    plainTextApiKey: asString(metadata.plain_text_api_key) || null,
    apiKeyNotice: asString(metadata.api_key_notice) || null
  };
}

export function normalizeApiClientPermissionOption(
  input: BackendApiClientPermissionItem
): AdminApiClientPermissionOption {
  return {
    id: asString(input.id),
    name: asString(input.name),
    category: asString(input.category, "Lainnya"),
    description: asString(input.description)
  };
}

export function normalizeApiClientPermissionsResponse(
  payload: BackendSuccessResponse<BackendApiClientPermissionsPayload>
) {
  const unwrapped = unwrapPayload(payload);
  const items = Array.isArray(unwrapped.items) ? unwrapped.items : [];

  return {
    items: items.map(normalizeApiClientPermissionOption),
    message: asString(payload.message, "Daftar permission berhasil diambil.")
  };
}
