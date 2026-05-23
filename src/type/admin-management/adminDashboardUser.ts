export type AdminUserStatus = "active" | "inactive";

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserSummary = {
  totalUsers: number;
  activeRoleCount: number;
  latestUser: AdminUserRecord | null;
};

export type AdminUserFormValues = {
  name: string;
  email: string;
  role: string;
  status: AdminUserStatus;
  password: string;
  passwordConfirmation: string;
};

export type AdminUserPayload = {
  name: string;
  email: string;
  status: AdminUserStatus;
  roles: string[];
  password?: string;
  password_confirmation?: string;
};

export type AdminUserListParams = {
  search?: string;
  page?: number;
  perPage?: number;
  status?: AdminUserStatus;
  role?: string;
  sortBy?: AdminUserSortField;
  sortDirection?: AdminUserSortDirection;
};

export type AdminUserSortDirection = "asc" | "desc";

export type AdminUserSortField = "name" | "email" | "created_at" | "updated_at";

export type AdminUserListResponse = {
  items: AdminUserRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: AdminUserSummary;
};

export type AdminUserMutationResponse = {
  data: AdminUserRecord;
  message: string;
};

export type AdminUserDetailResponse = {
  data: AdminUserRecord;
  message: string;
};

export type AdminUserRoleOption = {
  value: string;
  label: string;
  slug: string;
  description: string;
};

export type BackendAdminUserItem = {
  id: string | number | null;
  name?: string | null;
  email?: string | null;
  status?: string | null;
  roles?: Array<string | number> | null;
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

export type BackendAdminUsersPayload = {
  summary?: {
    total_user?: number | null;
    role_aktif?: number | null;
    user_terbaru?: BackendAdminUserItem | null;
  };
  items?: BackendAdminUserItem[];
  meta?: BackendPaginationMeta;
};

export type BackendAdminUserRoleItem = {
  id: string | number | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
};

export type BackendAdminUserRolesPayload = {
  items?: BackendAdminUserRoleItem[];
};

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};

export type BackendDeleteUserResponse = BackendSuccessResponse<{
  id?: string | number | null;
}>;
