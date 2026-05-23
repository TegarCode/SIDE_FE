export type AdminPermissionRecord = {
  id: string;
  code: string;
  displayName: string;
  category: string;
  moduleGroup: "dashboard" | "admin_management";
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminPermissionFormValues = {
  name: string;
  category: string;
  moduleGroup: "dashboard" | "admin_management" | "";
  description: string;
};

export type AdminPermissionPayload = AdminPermissionFormValues;

export type AdminPermissionListParams = {
  search?: string;
  page?: number;
  perPage?: number;
  category?: string;
  moduleGroup?: "dashboard" | "admin_management";
  sortBy?: AdminPermissionSortField;
  sortDirection?: AdminPermissionSortDirection;
};

export type AdminPermissionSortDirection = "asc" | "desc";

export type AdminPermissionSortField =
  | "name"
  | "category"
  | "module_group"
  | "created_at"
  | "updated_at";

export type AdminPermissionSummary = {
  totalPermission: number;
  kategoriAktif: number;
  permissionTerbaru: AdminPermissionRecord | null;
};

export type AdminPermissionListResponse = {
  items: AdminPermissionRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: AdminPermissionSummary;
  sortBy: AdminPermissionSortField;
  sortDirection: AdminPermissionSortDirection;
};

export type AdminPermissionMutationResponse = {
  data: AdminPermissionRecord;
  message: string;
};

export type AdminPermissionDetailResponse = {
  data: AdminPermissionRecord;
  message: string;
};

export type BackendPermissionItem = {
  id: string | number | null;
  name?: string | null;
  category?: string | null;
  module_group?: string | null;
  description?: string | null;
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

export type BackendPermissionsPayload = {
  summary?: {
    total_permission?: number | null;
    kategori_aktif?: number | null;
    permission_terbaru?: BackendPermissionItem | null;
  };
  items?: BackendPermissionItem[];
  meta?: BackendPaginationMeta;
};

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
};

export type BackendDeletePermissionResponse = BackendSuccessResponse<{
  id?: string | number | null;
}>;
