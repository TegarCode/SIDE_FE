import type {
  AdminContactDetailResponse,
  AdminContactListResponse,
  AdminContactMutationResponse,
  AdminContactRecord,
  BackendContactItem,
  BackendContactsPayload,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardContact";
import type { ContactMessageType } from "@/type/home";

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

function asContactType(value: string | null | undefined): ContactMessageType {
  switch (value) {
    case "MASUKAN":
      return "MASUKAN";
    case "SARAN":
      return "SARAN";
    case "PERTANYAAN":
    default:
      return "PERTANYAAN";
  }
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

export function normalizeContactItem(
  input: BackendContactItem
): AdminContactRecord {
  return {
    id: asString(input.id),
    name: asString(input.nama),
    email: asString(input.email),
    type: asContactType(asString(input.jenis)),
    message: asString(input.pesan),
    createdAt: asString(input.created_at),
    updatedAt: asString(input.updated_at)
  };
}

export function normalizeContactsResponse(
  payload: BackendSuccessResponse<BackendContactsPayload>
): AdminContactListResponse {
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
    items: items.map(normalizeContactItem),
    total,
    page,
    perPage,
    lastPage,
    summary: {
      totalContact: asNumber(summary?.total_contact, total),
      activeTypeCount: asNumber(summary?.jenis_aktif, 0),
      latestContact: summary?.contact_terbaru
        ? normalizeContactItem(summary.contact_terbaru)
        : null
    },
    sortBy:
      asString(meta.sort_by, "created_at") === "nama" ||
      asString(meta.sort_by, "created_at") === "email" ||
      asString(meta.sort_by, "created_at") === "jenis" ||
      asString(meta.sort_by, "created_at") === "created_at" ||
      asString(meta.sort_by, "created_at") === "updated_at"
        ? (asString(meta.sort_by, "created_at") as
            | "nama"
            | "email"
            | "jenis"
            | "created_at"
            | "updated_at")
        : "created_at",
    sortDirection:
      asString(meta.sort_direction, "desc") === "asc" ? "asc" : "desc"
  };
}

export function normalizeContactDetailResponse(
  payload: BackendSuccessResponse<BackendContactItem>
): AdminContactDetailResponse {
  return {
    data: normalizeContactItem(unwrapPayload(payload)),
    message: asString(payload.message, "Detail contact berhasil diambil.")
  };
}

export function normalizeContactMutationResponse(
  payload: BackendSuccessResponse<BackendContactItem>
): AdminContactMutationResponse {
  return {
    data: normalizeContactItem(unwrapPayload(payload)),
    message: asString(payload.message, "Operasi contact berhasil.")
  };
}
