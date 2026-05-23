import { apiClient } from "@/service/httpClient";
import type {
  AdminUserDetailResponse,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserMutationResponse,
  AdminUserPayload,
  AdminUserRoleOption,
  BackendAdminUserItem,
  BackendAdminUserRolesPayload,
  BackendAdminUsersPayload,
  BackendDeleteUserResponse,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardUser";
import {
  assertSuccess,
  normalizeAdminUserDetailResponse,
  normalizeAdminUserMutationResponse,
  normalizeAdminUsersResponse
} from "./shared";

function toBackendPayload(payload: AdminUserPayload) {
  return {
    name: payload.name,
    email: payload.email,
    status: payload.status,
    roles: payload.roles,
    ...(payload.password ? { password: payload.password } : {}),
    ...(payload.password_confirmation
      ? { password_confirmation: payload.password_confirmation }
      : {})
  };
}

export async function fetchAdminUsers(
  params: AdminUserListParams = {}
): Promise<AdminUserListResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendAdminUsersPayload>
  >("/api/admin-dashboard/users", {
    params: {
      search: params.search?.trim() || undefined,
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      status: params.status ?? undefined,
      role: params.role?.trim() || undefined,
      sort_by: params.sortBy ?? "updated_at",
      sort_direction: params.sortDirection ?? "desc"
    }
  });

  return normalizeAdminUsersResponse(assertSuccess(response.data));
}

export async function fetchAdminUserDetail(
  userId: string
): Promise<AdminUserDetailResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendAdminUserItem>
  >(`/api/admin-dashboard/users/${userId}`);

  return normalizeAdminUserDetailResponse(assertSuccess(response.data));
}

export async function createAdminUser(
  payload: AdminUserPayload
): Promise<AdminUserMutationResponse> {
  const response = await apiClient.post<
    BackendSuccessResponse<BackendAdminUserItem>
  >("/api/admin-dashboard/users", toBackendPayload(payload));

  return normalizeAdminUserMutationResponse(assertSuccess(response.data));
}

export async function updateAdminUser(
  userId: string,
  payload: AdminUserPayload
): Promise<AdminUserMutationResponse> {
  const response = await apiClient.put<
    BackendSuccessResponse<BackendAdminUserItem>
  >(`/api/admin-dashboard/users/${userId}`, toBackendPayload(payload));

  return normalizeAdminUserMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminUser(
  userId: string
): Promise<BackendDeleteUserResponse> {
  const response = await apiClient.delete<BackendDeleteUserResponse>(
    `/api/admin-dashboard/users/${userId}`
  );

  return assertSuccess(response.data);
}

export async function fetchAdminUserRoles(): Promise<{
  items: AdminUserRoleOption[];
}> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendAdminUserRolesPayload>
  >("/api/admin-dashboard/user-roles");
  const payload = assertSuccess(response.data).data;
  const items = Array.isArray(payload?.items) ? payload.items : [];

  return {
    items: items.map((item) => ({
      value: String(item.name ?? item.slug ?? ""),
      label: String(item.name ?? item.slug ?? ""),
      slug: String(item.slug ?? ""),
      description: String(item.description ?? "")
    }))
  };
}
