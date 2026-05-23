export type AdminCacheRecord = {
  id: string;
  key: string;
  category: string;
  categoryParent: string;
  categoryChild: string;
  expiration: string;
  expirationTimestamp: number;
  value?: AdminCacheValue;
};

export type AdminCacheValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | unknown[];

export type AdminCacheSummary = {
  totalCache: number;
  kategoriAktif: number;
  cacheTerbaru: AdminCacheRecord | null;
};

export type AdminCacheListParams = {
  search?: string;
  page?: number;
  perPage?: number;
  category?: string;
  sortBy?: AdminCacheSortField;
  sortDirection?: AdminCacheSortDirection;
};

export type AdminCacheSortField = "key" | "expiration";
export type AdminCacheSortDirection = "asc" | "desc";

export type AdminCacheUpdatePayload = {
  expirationAt: string;
};

export type AdminCacheUpdateFormValues = {
  expirationAt: string;
};

export type AdminCacheListResponse = {
  items: AdminCacheRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: AdminCacheSummary;
  sortBy: AdminCacheSortField;
  sortDirection: AdminCacheSortDirection;
};

export type AdminCacheDetailResponse = {
  data: AdminCacheRecord;
  message: string;
};

export type AdminCacheMutationResponse = {
  data: AdminCacheRecord;
  message: string;
};

export type BackendCacheItem = {
  id?: string | null;
  key?: string | null;
  category?: string | null;
  category_parent?: string | null;
  category_child?: string | null;
  expiration?: string | null;
  expiration_timestamp?: number | null;
  value?: unknown;
};

export type BackendCacheSummaryPayload = {
  total_cache?: number | null;
  kategori_aktif?: number | null;
  cache_terbaru?: BackendCacheItem | null;
};

export type BackendCacheMeta = {
  page?: number | null;
  per_page?: number | null;
  total?: number | null;
  last_page?: number | null;
  sort_by?: string | null;
  sort_direction?: string | null;
};

export type BackendCachesPayload = {
  summary?: BackendCacheSummaryPayload | null;
  items?: BackendCacheItem[] | null;
  meta?: BackendCacheMeta | null;
};

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};

export type BackendDeleteCacheResponse = BackendSuccessResponse<{
  id?: string | null;
  key?: string | null;
}>;
