import { apiClient } from "@/service/httpClient";
import type {
  AdminApiClientDetailResponse,
  AdminApiClientListParams,
  AdminApiClientListResponse,
  AdminApiClientMutationResponse,
  AdminApiClientPayload,
  AdminApiClientRegeneratePayload,
  BackendApiClientItem,
  BackendApiClientPermissionsPayload,
  BackendApiClientsPayload,
  BackendDeleteApiClientResponse,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardApiClient";
import {
  assertSuccess,
  normalizeApiClientDetailResponse,
  normalizeApiClientMutationResponse,
  normalizeApiClientPermissionsResponse,
  normalizeApiClientsResponse
} from "./shared";

export async function fetchAdminApiClients(
  params: AdminApiClientListParams = {}
): Promise<AdminApiClientListResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendApiClientsPayload>
  >("/api/admin-dashboard/api-clients", {
    params: {
      search: params.search?.trim() || undefined,
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      active:
        typeof params.active === "boolean" ? String(params.active) : undefined,
      sort_by: params.sortBy ?? "created_at",
      sort_direction: params.sortDirection ?? "desc"
    }
  });

  return normalizeApiClientsResponse(assertSuccess(response.data));
}

export async function fetchAdminApiClientDetail(
  apiClientId: string
): Promise<AdminApiClientDetailResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendApiClientItem>
  >(`/api/admin-dashboard/api-clients/${apiClientId}`);

  return normalizeApiClientDetailResponse(assertSuccess(response.data));
}

export async function fetchAdminApiClientPermissions() {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendApiClientPermissionsPayload>
  >("/api/admin-dashboard/api-client-permissions");

  return normalizeApiClientPermissionsResponse(assertSuccess(response.data));
}

export async function createAdminApiClient(
  payload: AdminApiClientPayload
): Promise<AdminApiClientMutationResponse> {
  const response = await apiClient.post<
    BackendSuccessResponse<
      BackendApiClientItem,
      {
        plain_text_api_key?: string | null;
        api_key_notice?: string | null;
      }
    >
  >("/api/admin-dashboard/api-clients", payload);

  return normalizeApiClientMutationResponse(assertSuccess(response.data));
}

export async function updateAdminApiClient(
  apiClientId: string,
  payload: AdminApiClientPayload
): Promise<AdminApiClientMutationResponse> {
  const response = await apiClient.put<
    BackendSuccessResponse<BackendApiClientItem>
  >(`/api/admin-dashboard/api-clients/${apiClientId}`, payload);

  return normalizeApiClientMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminApiClient(
  apiClientId: string
): Promise<BackendDeleteApiClientResponse> {
  const response = await apiClient.delete<BackendDeleteApiClientResponse>(
    `/api/admin-dashboard/api-clients/${apiClientId}`
  );

  return assertSuccess(response.data);
}

export async function regenerateAdminApiClientKey(
  apiClientId: string,
  payload: AdminApiClientRegeneratePayload
): Promise<AdminApiClientMutationResponse> {
  const response = await apiClient.post<
    BackendSuccessResponse<
      BackendApiClientItem,
      {
        plain_text_api_key?: string | null;
        api_key_notice?: string | null;
      }
    >
  >(`/api/admin-dashboard/api-clients/${apiClientId}/regenerate-key`, payload);

  return normalizeApiClientMutationResponse(assertSuccess(response.data));
}
