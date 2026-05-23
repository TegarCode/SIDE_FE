import type {
  AdminFaqDetailResponse,
  AdminFaqListResponse,
  AdminFaqMutationResponse,
  AdminFaqTopicRecord,
  BackendFaqItem,
  BackendFaqListPayload,
  BackendFaqTopic,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardFaq";

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

export function normalizeFaqItem(input: BackendFaqItem) {
  return {
    id: asString(input.id),
    question: asString(input.question),
    answer: asString(input.answer),
    order: asNumber(input.order, 0),
    createdAt: asString(input.created_at),
    updatedAt: asString(input.updated_at)
  };
}

export function normalizeFaqTopic(input: BackendFaqTopic): AdminFaqTopicRecord {
  const items = Array.isArray(input.items) ? input.items : [];

  return {
    id: asString(input.id),
    topic: asString(input.topic),
    summary: asString(input.summary),
    isFeatured: asBoolean(input.is_featured, false),
    order: asNumber(input.order, 0),
    itemsCount: asNumber(input.items_count, items.length),
    items: items.map(normalizeFaqItem),
    createdAt: asString(input.created_at),
    updatedAt: asString(input.updated_at)
  };
}

export function normalizeFaqsResponse(
  payload: BackendSuccessResponse<BackendFaqListPayload>
): AdminFaqListResponse {
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
    items: items.map(normalizeFaqTopic),
    total,
    page,
    perPage,
    lastPage,
    summary: {
      totalFaqTopic: asNumber(summary?.total_faq_topic, total),
      faqFeatured: asNumber(summary?.faq_featured, 0),
      latestFaq: summary?.faq_terbaru
        ? normalizeFaqTopic(summary.faq_terbaru)
        : null
    },
    sortBy:
      asString(meta.sort_by, "order") === "topic" ||
      asString(meta.sort_by, "order") === "order" ||
      asString(meta.sort_by, "order") === "created_at" ||
      asString(meta.sort_by, "order") === "updated_at"
        ? (asString(meta.sort_by, "order") as
            | "topic"
            | "order"
            | "created_at"
            | "updated_at")
        : "order",
    sortDirection:
      asString(meta.sort_direction, "desc") === "asc" ? "asc" : "desc"
  };
}

export function normalizeFaqDetailResponse(
  payload: BackendSuccessResponse<BackendFaqTopic>
): AdminFaqDetailResponse {
  return {
    data: normalizeFaqTopic(unwrapPayload(payload)),
    message: asString(payload.message, "Detail FAQ berhasil diambil.")
  };
}

export function normalizeFaqMutationResponse(
  payload: BackendSuccessResponse<BackendFaqTopic>
): AdminFaqMutationResponse {
  return {
    data: normalizeFaqTopic(unwrapPayload(payload)),
    message: asString(payload.message, "Operasi FAQ berhasil.")
  };
}
