import type {
  AdminPermissionDetailResponse,
  AdminPermissionListResponse,
  AdminPermissionMutationResponse,
  AdminPermissionRecord,
  BackendPermissionItem,
  BackendPermissionsPayload,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardPermission";

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

function derivePermissionLabel(code: string) {
  return code
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

export function normalizePermissionItem(
  input: BackendPermissionItem
): AdminPermissionRecord {
  const code = asString(input.name);

  return {
    id: asString(input.id),
    code,
    displayName: derivePermissionLabel(code),
    category: asString(input.category, "-"),
    moduleGroup:
      asString(input.module_group) === "admin_management"
        ? "admin_management"
        : "dashboard",
    description: asString(input.description),
    createdAt: asString(input.created_at),
    updatedAt: asString(input.updated_at)
  };
}

export function normalizePermissionsResponse(
  payload: BackendSuccessResponse<BackendPermissionsPayload>
): AdminPermissionListResponse {
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
  const latestPermission = summary?.permission_terbaru
    ? normalizePermissionItem(summary.permission_terbaru)
    : null;

  return {
    items: items.map(normalizePermissionItem),
    total,
    page,
    perPage,
    lastPage,
    summary: {
      totalPermission: asNumber(summary?.total_permission, total),
      kategoriAktif: asNumber(summary?.kategori_aktif, 0),
      permissionTerbaru: latestPermission
    },
    sortBy:
      asString(meta.sort_by, "updated_at") === "name" ||
      asString(meta.sort_by, "updated_at") === "category" ||
      asString(meta.sort_by, "updated_at") === "module_group" ||
      asString(meta.sort_by, "updated_at") === "created_at" ||
      asString(meta.sort_by, "updated_at") === "updated_at"
        ? (asString(meta.sort_by, "updated_at") as
            | "name"
            | "category"
            | "module_group"
            | "created_at"
            | "updated_at")
        : "updated_at",
    sortDirection:
      asString(meta.sort_direction, "desc") === "asc" ? "asc" : "desc"
  };
}

export function normalizePermissionMutationResponse(
  payload: BackendSuccessResponse<BackendPermissionItem>
): AdminPermissionMutationResponse {
  return {
    data: normalizePermissionItem(unwrapPayload(payload)),
    message: asString(payload.message, "Operasi permission berhasil.")
  };
}

export function normalizePermissionDetailResponse(
  payload: BackendSuccessResponse<BackendPermissionItem>
): AdminPermissionDetailResponse {
  return {
    data: normalizePermissionItem(unwrapPayload(payload)),
    message: asString(payload.message, "Detail permission berhasil diambil.")
  };
}
