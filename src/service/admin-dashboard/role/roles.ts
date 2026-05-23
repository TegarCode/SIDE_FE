import { apiClient } from "@/service/httpClient";
import type {
  AdminRoleListParams,
  AdminRoleListResponse,
  AdminRoleMutationResponse,
  AdminRolePayload,
  BackendDeleteRoleResponse,
  BackendRoleItem,
  BackendRolesPayload,
  BackendSuccessResponse,
  RoleManagementEndpointSpec
} from "@/type/admin-management/adminDashboardRole";
import {
  assertSuccess,
  normalizeRoleMutationResponse,
  normalizeRolesResponse
} from "./shared";

export const ROLE_MANAGEMENT_ENDPOINTS: RoleManagementEndpointSpec[] = [
  {
    method: "GET",
    path: "/api/admin-dashboard/roles",
    response:
      "{ success: boolean, message: string, data: { items: AdminRoleRecord[], meta: { page, per_page, total, last_page } } }"
  },
  {
    method: "GET",
    path: "/api/admin-dashboard/permissions",
    response:
      "{ success: boolean, message: string, data: { items: RolePermissionItem[] } }"
  },
  {
    method: "POST",
    path: "/api/admin-dashboard/roles",
    request:
      "{ name: string, slug: string, description: string, status: 'active' | 'inactive', permissions: string[] }",
    response: "{ success: boolean, message: string, data: AdminRoleRecord }"
  },
  {
    method: "PUT",
    path: "/api/admin-dashboard/roles/:id",
    request:
      "{ name: string, slug: string, description: string, status: 'active' | 'inactive', permissions: string[] }",
    response: "{ success: boolean, message: string, data: AdminRoleRecord }"
  },
  {
    method: "DELETE",
    path: "/api/admin-dashboard/roles/:id",
    response: "{ success: boolean, message: string, data: { id: string } }"
  }
];

function toBackendPayload(payload: AdminRolePayload) {
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    status: payload.status,
    permissions: payload.permissions
  };
}

export async function fetchAdminRoles(
  params: AdminRoleListParams = {}
): Promise<AdminRoleListResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendRolesPayload>
  >("/api/admin-dashboard/roles", {
    params: {
      search: params.search?.trim() || undefined,
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      status: params.status ?? undefined
    }
  });

  return normalizeRolesResponse(assertSuccess(response.data));
}

export async function createAdminRole(
  payload: AdminRolePayload
): Promise<AdminRoleMutationResponse> {
  const response = await apiClient.post<
    BackendSuccessResponse<BackendRoleItem>
  >("/api/admin-dashboard/roles", toBackendPayload(payload));

  return normalizeRoleMutationResponse(assertSuccess(response.data));
}

export async function updateAdminRole(
  roleId: string,
  payload: AdminRolePayload
): Promise<AdminRoleMutationResponse> {
  const response = await apiClient.put<BackendSuccessResponse<BackendRoleItem>>(
    `/api/admin-dashboard/roles/${roleId}`,
    toBackendPayload(payload)
  );

  return normalizeRoleMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminRole(
  roleId: string
): Promise<BackendDeleteRoleResponse> {
  const response = await apiClient.delete<BackendDeleteRoleResponse>(
    `/api/admin-dashboard/roles/${roleId}`
  );
  return assertSuccess(response.data);
}
