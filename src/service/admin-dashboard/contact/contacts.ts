import { apiClient } from "@/service/httpClient";
import type {
  AdminContactDetailResponse,
  AdminContactListParams,
  AdminContactListResponse,
  AdminContactMutationResponse,
  AdminContactPayload,
  BackendContactItem,
  BackendContactsPayload,
  BackendDeleteContactResponse,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardContact";
import {
  assertSuccess,
  normalizeContactDetailResponse,
  normalizeContactMutationResponse,
  normalizeContactsResponse
} from "./shared";

export async function fetchAdminContacts(
  params: AdminContactListParams = {}
): Promise<AdminContactListResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendContactsPayload>
  >("/api/admin-dashboard/contacts", {
    params: {
      search: params.search?.trim() || undefined,
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      jenis: params.jenis ?? undefined,
      sort_by: params.sortBy ?? "created_at",
      sort_direction: params.sortDirection ?? "desc"
    }
  });

  return normalizeContactsResponse(assertSuccess(response.data));
}

export async function fetchAdminContactDetail(
  contactId: string
): Promise<AdminContactDetailResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendContactItem>
  >(`/api/admin-dashboard/contacts/${contactId}`);

  return normalizeContactDetailResponse(assertSuccess(response.data));
}

export async function updateAdminContact(
  contactId: string,
  payload: AdminContactPayload
): Promise<AdminContactMutationResponse> {
  const response = await apiClient.put<
    BackendSuccessResponse<BackendContactItem>
  >(`/api/admin-dashboard/contacts/${contactId}`, payload);

  return normalizeContactMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminContact(
  contactId: string
): Promise<BackendDeleteContactResponse> {
  const response = await apiClient.delete<BackendDeleteContactResponse>(
    `/api/admin-dashboard/contacts/${contactId}`
  );

  return assertSuccess(response.data);
}
