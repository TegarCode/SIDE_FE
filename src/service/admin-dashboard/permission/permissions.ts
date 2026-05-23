import { apiClient } from "@/service/httpClient";
import type {
  AdminPermissionDetailResponse,
  AdminPermissionListParams,
  AdminPermissionListResponse,
  AdminPermissionMutationResponse,
  AdminPermissionPayload,
  BackendDeletePermissionResponse,
  BackendPermissionItem,
  BackendPermissionsPayload,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardPermission";
import {
  assertSuccess,
  normalizePermissionDetailResponse,
  normalizePermissionMutationResponse,
  normalizePermissionsResponse
} from "./shared";

function toBackendPayload(payload: AdminPermissionPayload) {
  return {
    name: payload.name,
    category: payload.category,
    module_group: payload.moduleGroup,
    description: payload.description
  };
}

export async function fetchAdminPermissions(
  params: AdminPermissionListParams = {}
): Promise<AdminPermissionListResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendPermissionsPayload>
  >("/api/admin-dashboard/permissions", {
    params: {
      search: params.search?.trim() || undefined,
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      category: params.category?.trim() || undefined,
      module_group: params.moduleGroup ?? undefined,
      sort_by: params.sortBy ?? "updated_at",
      sort_direction: params.sortDirection ?? "desc"
    }
  });

  return normalizePermissionsResponse(assertSuccess(response.data));
}

export async function fetchAdminPermissionDetail(
  permissionId: string
): Promise<AdminPermissionDetailResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendPermissionItem>
  >(`/api/admin-dashboard/permissions/${permissionId}`);

  return normalizePermissionDetailResponse(assertSuccess(response.data));
}

export async function createAdminPermission(
  payload: AdminPermissionPayload
): Promise<AdminPermissionMutationResponse> {
  const response = await apiClient.post<
    BackendSuccessResponse<BackendPermissionItem>
  >("/api/admin-dashboard/permissions", toBackendPayload(payload));

  return normalizePermissionMutationResponse(assertSuccess(response.data));
}

export async function updateAdminPermission(
  permissionId: string,
  payload: AdminPermissionPayload
): Promise<AdminPermissionMutationResponse> {
  const response = await apiClient.put<
    BackendSuccessResponse<BackendPermissionItem>
  >(
    `/api/admin-dashboard/permissions/${permissionId}`,
    toBackendPayload(payload)
  );

  return normalizePermissionMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminPermission(
  permissionId: string
): Promise<BackendDeletePermissionResponse> {
  const response = await apiClient.delete<BackendDeletePermissionResponse>(
    `/api/admin-dashboard/permissions/${permissionId}`
  );

  return assertSuccess(response.data);
}
