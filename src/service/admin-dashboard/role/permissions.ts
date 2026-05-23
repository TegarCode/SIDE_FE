import { apiClient } from "@/service/httpClient";
import type {
  AdminPermissionCatalogResponse,
  BackendPermissionsPayload,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardRole";
import {
  assertSuccess,
  normalizePermissionItem,
  unwrapPayload
} from "./shared";

export async function fetchAdminPermissionCatalog(): Promise<AdminPermissionCatalogResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendPermissionsPayload>
  >("/api/admin-dashboard/role-permissions");
  const unwrapped = unwrapPayload(assertSuccess(response.data));
  const items = Array.isArray(unwrapped.items) ? unwrapped.items : [];

  return {
    items: items.map(normalizePermissionItem),
    total: items.length
  };
}
