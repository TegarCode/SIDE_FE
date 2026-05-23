import type {
  AdminAuthenticationLogDetailResponse,
  AdminAuthenticationLogListResponse,
  AdminAuthenticationLogMutationResponse,
  AdminAuthenticationLogRecord,
  AdminAuthenticationLogUser,
  BackendAuthenticationLogItem,
  BackendAuthenticationLogsPayload,
  BackendAuthenticationLogUser,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardAuthenticationLog";

function asString(
  value: string | number | null | undefined,
  fallback = ""
): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asBoolean(value: boolean | null | undefined, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: number | null | undefined, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
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

function normalizeUser(
  input: BackendAuthenticationLogUser | null | undefined
): AdminAuthenticationLogUser | null {
  if (!input) return null;

  const id = asString(input.id);
  const name = asString(input.name);
  const email = asString(input.email);

  if (!id && !name && !email) {
    return null;
  }

  return {
    id,
    name,
    email
  };
}

export function normalizeAuthenticationLogItem(
  input: BackendAuthenticationLogItem
): AdminAuthenticationLogRecord {
  return {
    id: asString(input.id),
    user: normalizeUser(input.user),
    ipAddress: asString(input.ip_address, "-"),
    userAgent: asString(input.user_agent, "-"),
    loginAt: asString(input.login_at),
    loginSuccessful: asBoolean(input.login_successful, false),
    logoutAt: asString(input.logout_at),
    clearedByUser: asBoolean(input.cleared_by_user, false),
    location: asString(input.location, "-")
  };
}

export function normalizeAuthenticationLogsResponse(
  payload: BackendSuccessResponse<BackendAuthenticationLogsPayload>
): AdminAuthenticationLogListResponse {
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
    items: items.map(normalizeAuthenticationLogItem),
    total,
    page,
    perPage,
    lastPage,
    summary: {
      totalLog: asNumber(summary?.total_log, total),
      loginBerhasil: asNumber(summary?.login_berhasil, 0),
      logTerbaru: summary?.log_terbaru
        ? normalizeAuthenticationLogItem(summary.log_terbaru)
        : null
    },
    sortBy:
      asString(meta.sort_by, "login_at") === "logout_at"
        ? "logout_at"
        : "login_at",
    sortDirection:
      asString(meta.sort_direction, "desc") === "asc" ? "asc" : "desc"
  };
}

export function normalizeAuthenticationLogDetailResponse(
  payload: BackendSuccessResponse<BackendAuthenticationLogItem>
): AdminAuthenticationLogDetailResponse {
  return {
    data: normalizeAuthenticationLogItem(unwrapPayload(payload)),
    message: asString(
      payload.message,
      "Detail authentication log berhasil diambil."
    )
  };
}

export function normalizeAuthenticationLogMutationResponse(
  payload: BackendSuccessResponse<BackendAuthenticationLogItem>
): AdminAuthenticationLogMutationResponse {
  return {
    data: normalizeAuthenticationLogItem(unwrapPayload(payload)),
    message: asString(
      payload.message,
      "Perubahan authentication log berhasil disimpan."
    )
  };
}
