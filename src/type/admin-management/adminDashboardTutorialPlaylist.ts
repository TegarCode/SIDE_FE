export type AdminTutorialPlaylistRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  url: string;
  thumbnail: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminTutorialPlaylistSummary = {
  totalPlaylist: number;
  latestPlaylist: AdminTutorialPlaylistRecord | null;
};

export type AdminTutorialPlaylistFormValues = {
  title: string;
  slug: string;
  description: string;
  url: string;
  thumbnailFile: File | null;
  thumbnailPreview: string;
};

export type AdminTutorialPlaylistListParams = {
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: AdminTutorialPlaylistSortField;
  sortDirection?: AdminTutorialPlaylistSortDirection;
};

export type AdminTutorialPlaylistSortField =
  | "title"
  | "slug"
  | "created_at"
  | "updated_at";

export type AdminTutorialPlaylistSortDirection = "asc" | "desc";

export type AdminTutorialPlaylistListResponse = {
  items: AdminTutorialPlaylistRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: AdminTutorialPlaylistSummary;
  sortBy: AdminTutorialPlaylistSortField;
  sortDirection: AdminTutorialPlaylistSortDirection;
};

export type AdminTutorialPlaylistDetailResponse = {
  data: AdminTutorialPlaylistRecord;
  message: string;
};

export type AdminTutorialPlaylistMutationResponse = {
  data: AdminTutorialPlaylistRecord;
  message: string;
};

export type BackendTutorialPlaylistItem = {
  id?: string | number | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  desc?: string | null;
  url?: string | null;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BackendPaginationMeta = {
  page?: number | null;
  per_page?: number | null;
  total?: number | null;
  last_page?: number | null;
  sort_by?: string | null;
  sort_direction?: string | null;
};

export type BackendTutorialPlaylistsPayload = {
  summary?: {
    total_playlist?: number | null;
    playlist_terbaru?: BackendTutorialPlaylistItem | null;
  };
  items?: BackendTutorialPlaylistItem[] | null;
  meta?: BackendPaginationMeta | null;
};

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};

export type BackendDeleteTutorialPlaylistResponse = BackendSuccessResponse<{
  id?: string | number | null;
}>;
