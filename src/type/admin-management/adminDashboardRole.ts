export type RolePermissionItem = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  moduleGroup: "dashboard" | "admin_management";
};

export type AdminRoleStatus = "active" | "inactive";

export type BackendRoleStatus = AdminRoleStatus | string | null;

export type AdminRoleRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: AdminRoleStatus;
  userCount: number;
  permissionsCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
};

export type AdminRoleFormValues = {
  name: string;
  slug: string;
  description: string;
  status: AdminRoleStatus;
  permissions: string[];
};

export type AdminRolePayload = {
  name: string;
  slug: string;
  description: string;
  status: AdminRoleStatus;
  permissions: string[];
};

export type AdminRoleListResponse = {
  items: AdminRoleRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
};

export type AdminRoleListParams = {
  search?: string;
  page?: number;
  perPage?: number;
  status?: AdminRoleStatus;
};

export type AdminPermissionCatalogResponse = {
  items: RolePermissionItem[];
  total: number;
};

export type AdminRoleMutationResponse = {
  data: AdminRoleRecord;
  message: string;
};

export type RoleManagementEndpointSpec = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  request?: string;
  response: string;
};

export type BackendPermissionItem = {
  id: string | number | null;
  code?: string | null;
  name?: string | null;
  description?: string | null;
  group?: string | null;
  category?: string | null;
  module_group?: string | null;
};

export type BackendRoleItem = {
  id: string | number | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  status?: BackendRoleStatus;
  user_count?: number | null;
  permissions_count?: number | null;
  permissions?: Array<string | number> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BackendPaginationMeta = {
  page?: number | null;
  per_page?: number | null;
  total?: number | null;
  last_page?: number | null;
};

export type BackendPermissionsPayload = {
  items?: BackendPermissionItem[];
};

export type BackendRolesPayload = {
  items?: BackendRoleItem[];
  meta?: BackendPaginationMeta;
};

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
};

export type BackendDeleteRoleResponse = BackendSuccessResponse<{
  id?: string | number | null;
}>;
