export type AdminSidePageViewUser = {
  id: string;
  name: string;
  email: string;
};

export type AdminSidePageViewModuleOption = {
  name: string;
};

export type AdminSidePageViewRecord = {
  id: number;
  path: string;
  module: string;
  user: AdminSidePageViewUser | null;
  userAgent: string;
  ipHash: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminSidePageViewSummary = {
  totalView: number;
  activeModuleCount: number;
  latestView: AdminSidePageViewRecord | null;
};

export type AdminSidePageViewListParams = {
  search?: string;
  page?: number;
  perPage?: number;
  module?: string;
  sortBy?: AdminSidePageViewSortField;
  sortDirection?: AdminSidePageViewSortDirection;
};

export type AdminSidePageViewSortField = "path" | "module" | "created_at";

export type AdminSidePageViewSortDirection = "asc" | "desc";

export type AdminSidePageViewListResponse = {
  items: AdminSidePageViewRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: AdminSidePageViewSummary;
  sortBy: AdminSidePageViewSortField;
  sortDirection: AdminSidePageViewSortDirection;
};

export type AdminSidePageViewDetailResponse = {
  data: AdminSidePageViewRecord;
  message: string;
};

export type BackendSidePageViewUser = {
  id?: string | number | null;
  name?: string | null;
  email?: string | null;
} | null;

export type BackendSidePageViewItem = {
  id?: string | number | null;
  path?: string | null;
  module?: string | null;
  user?: BackendSidePageViewUser;
  user_agent?: string | null;
  ip_hash?: string | null;
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

export type BackendSidePageViewsPayload = {
  summary?: {
    total_view?: number | null;
    module_aktif?: number | null;
    view_terbaru?: BackendSidePageViewItem | null;
  };
  items?: BackendSidePageViewItem[] | null;
  meta?: BackendPaginationMeta | null;
};

export type BackendSidePageViewModulesPayload = {
  items?: Array<{
    name?: string | null;
  }> | null;
};

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};
