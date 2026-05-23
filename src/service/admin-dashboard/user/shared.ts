import type {
  AdminUserDetailResponse,
  AdminUserListResponse,
  AdminUserMutationResponse,
  AdminUserRecord,
  BackendAdminUserItem,
  BackendAdminUsersPayload,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardUser";

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

function toStringArray(value: Array<string | number> | null | undefined) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
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

export function normalizeAdminUserItem(
  input: BackendAdminUserItem
): AdminUserRecord {
  return {
    id: asString(input.id),
    name: asString(input.name),
    email: asString(input.email),
    roles: toStringArray(input.roles),
    status: asString(input.status) === "inactive" ? "inactive" : "active",
    createdAt: asString(input.created_at),
    updatedAt: asString(input.updated_at)
  };
}

export function normalizeAdminUsersResponse(
  payload: BackendSuccessResponse<BackendAdminUsersPayload>
): AdminUserListResponse {
  const unwrapped = unwrapPayload(payload);
  const items = Array.isArray(unwrapped.items) ? unwrapped.items : [];
  const meta = unwrapped.meta ?? {};
  const normalizedItems = items.map(normalizeAdminUserItem);
  const total = asNumber(meta.total, normalizedItems.length);
  const page = asNumber(meta.page, 1);
  const perPage = asNumber(meta.per_page, normalizedItems.length || 10);
  const lastPage = asNumber(
    meta.last_page,
    Math.max(1, Math.ceil(total / Math.max(perPage, 1)))
  );
  const summary = unwrapped.summary;
  const latestUser = summary?.user_terbaru
    ? normalizeAdminUserItem(summary.user_terbaru)
    : null;

  return {
    items: normalizedItems,
    total,
    page,
    perPage,
    lastPage,
    summary: {
      totalUsers: asNumber(summary?.total_user, total),
      activeRoleCount: asNumber(summary?.role_aktif, 0),
      latestUser
    }
  };
}

export function normalizeAdminUserMutationResponse(
  payload: BackendSuccessResponse<BackendAdminUserItem>
): AdminUserMutationResponse {
  return {
    data: normalizeAdminUserItem(unwrapPayload(payload)),
    message: asString(payload.message, "Operasi pengguna berhasil.")
  };
}

export function normalizeAdminUserDetailResponse(
  payload: BackendSuccessResponse<BackendAdminUserItem>
): AdminUserDetailResponse {
  return {
    data: normalizeAdminUserItem(unwrapPayload(payload)),
    message: asString(payload.message, "Detail pengguna berhasil diambil.")
  };
}
