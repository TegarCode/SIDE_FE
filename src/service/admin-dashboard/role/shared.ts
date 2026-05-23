import type {
  BackendPermissionItem,
  BackendRoleItem,
  BackendSuccessResponse,
  AdminRoleListResponse,
  AdminRoleMutationResponse,
  AdminRoleRecord,
  BackendRolesPayload,
  RolePermissionItem
} from "@/type/admin-management/adminDashboardRole";

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
    throw new Error(payload.message || "Permintaan tidak berhasil diproses.");
  }

  return payload;
}

export function normalizeRoleItem(input: BackendRoleItem): AdminRoleRecord {
  const permissions = toStringArray(input.permissions);

  return {
    id: asString(input.id),
    name: asString(input.name),
    slug: asString(input.slug),
    description: asString(input.description),
    status: asString(input.status) === "inactive" ? "inactive" : "active",
    userCount: asNumber(input.user_count),
    permissionsCount: asNumber(input.permissions_count, permissions.length),
    permissions,
    createdAt: asString(input.created_at),
    updatedAt: asString(input.updated_at)
  };
}

export function normalizePermissionItem(
  input: BackendPermissionItem
): RolePermissionItem {
  const code = asString(input.code || input.name);
  const derivedLabel = code
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const category = asString(input.category || input.group) || "Beranda Admin";
  const moduleGroup =
    asString(input.module_group) === "admin_management" ||
    code === "view_admin_dashboard" ||
    code.includes("_admin_")
      ? "admin_management"
      : "dashboard";

  return {
    id: asString(input.id),
    code,
    name: derivedLabel || code,
    description: asString(input.description),
    category: category || "Beranda Admin",
    moduleGroup
  };
}

export function normalizeRolesResponse(
  payload: BackendSuccessResponse<BackendRolesPayload>
): AdminRoleListResponse {
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

  return {
    items: items.map(normalizeRoleItem),
    total,
    page,
    perPage,
    lastPage
  };
}

export function normalizeRoleMutationResponse(
  payload: BackendSuccessResponse<BackendRoleItem>
): AdminRoleMutationResponse {
  return {
    data: normalizeRoleItem(unwrapPayload(payload)),
    message: asString(payload.message, "Operasi role berhasil.")
  };
}
