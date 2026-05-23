import type {
  AdminTutorialPlaylistDetailResponse,
  AdminTutorialPlaylistListResponse,
  AdminTutorialPlaylistMutationResponse,
  AdminTutorialPlaylistRecord,
  BackendSuccessResponse,
  BackendTutorialPlaylistItem,
  BackendTutorialPlaylistsPayload
} from "@/type/admin-management/adminDashboardTutorialPlaylist";

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

export function normalizeTutorialPlaylistItem(
  input: BackendTutorialPlaylistItem
): AdminTutorialPlaylistRecord {
  return {
    id: asString(input.id),
    title: asString(input.title),
    slug: asString(input.slug),
    description: asString(input.description || input.desc),
    url: asString(input.url),
    thumbnail: asString(input.thumbnail),
    thumbnailUrl: asString(input.thumbnail_url),
    createdAt: asString(input.created_at),
    updatedAt: asString(input.updated_at)
  };
}

export function normalizeTutorialPlaylistsResponse(
  payload: BackendSuccessResponse<BackendTutorialPlaylistsPayload>
): AdminTutorialPlaylistListResponse {
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
    items: items.map(normalizeTutorialPlaylistItem),
    total,
    page,
    perPage,
    lastPage,
    summary: {
      totalPlaylist: asNumber(summary?.total_playlist, total),
      latestPlaylist: summary?.playlist_terbaru
        ? normalizeTutorialPlaylistItem(summary.playlist_terbaru)
        : null
    },
    sortBy:
      asString(meta.sort_by, "updated_at") === "title" ||
      asString(meta.sort_by, "updated_at") === "slug" ||
      asString(meta.sort_by, "updated_at") === "created_at" ||
      asString(meta.sort_by, "updated_at") === "updated_at"
        ? (asString(meta.sort_by, "updated_at") as
            | "title"
            | "slug"
            | "created_at"
            | "updated_at")
        : "updated_at",
    sortDirection:
      asString(meta.sort_direction, "desc") === "asc" ? "asc" : "desc"
  };
}

export function normalizeTutorialPlaylistDetailResponse(
  payload: BackendSuccessResponse<BackendTutorialPlaylistItem>
): AdminTutorialPlaylistDetailResponse {
  return {
    data: normalizeTutorialPlaylistItem(unwrapPayload(payload)),
    message: asString(
      payload.message,
      "Detail Daftar Video Tutorial berhasil diambil."
    )
  };
}

export function normalizeTutorialPlaylistMutationResponse(
  payload: BackendSuccessResponse<BackendTutorialPlaylistItem>
): AdminTutorialPlaylistMutationResponse {
  return {
    data: normalizeTutorialPlaylistItem(unwrapPayload(payload)),
    message: asString(
      payload.message,
      "Operasi Daftar Video Tutorial berhasil."
    )
  };
}
