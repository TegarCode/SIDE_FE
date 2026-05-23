import type {
  AdminSidePageViewDetailResponse,
  AdminSidePageViewListResponse,
  AdminSidePageViewModuleOption,
  AdminSidePageViewRecord,
  AdminSidePageViewUser,
  BackendSidePageViewItem,
  BackendSidePageViewModulesPayload,
  BackendSidePageViewsPayload,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardSidePageView";

function asString(
  value: string | number | null | undefined,
  fallback = ""
): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
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

function normalizeSidePageViewUser(
  input: BackendSidePageViewItem["user"]
): AdminSidePageViewUser | null {
  if (!input || typeof input !== "object") return null;

  return {
    id: asString(input.id),
    name: asString(input.name, "Guest"),
    email: asString(input.email, "-")
  };
}

export function normalizeSidePageViewItem(
  input: BackendSidePageViewItem
): AdminSidePageViewRecord {
  return {
    id: asNumber(input.id, 0),
    path: asString(input.path),
    module: asString(input.module, "-"),
    user: normalizeSidePageViewUser(input.user),
    userAgent: asString(input.user_agent),
    ipHash: asString(input.ip_hash),
    createdAt: asString(input.created_at),
    updatedAt: asString(input.updated_at)
  };
}

export function normalizeSidePageViewsResponse(
  payload: BackendSuccessResponse<BackendSidePageViewsPayload>
): AdminSidePageViewListResponse {
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
    items: items.map(normalizeSidePageViewItem),
    total,
    page,
    perPage,
    lastPage,
    summary: {
      totalView: asNumber(summary?.total_view, total),
      activeModuleCount: asNumber(summary?.module_aktif, 0),
      latestView: summary?.view_terbaru
        ? normalizeSidePageViewItem(summary.view_terbaru)
        : null
    },
    sortBy:
      asString(meta.sort_by, "created_at") === "path" ||
      asString(meta.sort_by, "created_at") === "module" ||
      asString(meta.sort_by, "created_at") === "created_at"
        ? (asString(meta.sort_by, "created_at") as
            | "path"
            | "module"
            | "created_at")
        : "created_at",
    sortDirection:
      asString(meta.sort_direction, "desc") === "asc" ? "asc" : "desc"
  };
}

export function normalizeSidePageViewDetailResponse(
  payload: BackendSuccessResponse<BackendSidePageViewItem>
): AdminSidePageViewDetailResponse {
  return {
    data: normalizeSidePageViewItem(unwrapPayload(payload)),
    message: asString(payload.message, "Detail page view berhasil diambil.")
  };
}

export function normalizeSidePageViewModulesResponse(
  payload: BackendSuccessResponse<BackendSidePageViewModulesPayload>
) {
  const unwrapped = unwrapPayload(payload);
  const items = Array.isArray(unwrapped.items) ? unwrapped.items : [];

  return {
    items: items.reduce<AdminSidePageViewModuleOption[]>(
      (accumulator, item) => {
        const name = asString(item.name);
        if (name) {
          accumulator.push({ name });
        }
        return accumulator;
      },
      []
    ),
    message: asString(payload.message, "Daftar module berhasil diambil.")
  };
}
