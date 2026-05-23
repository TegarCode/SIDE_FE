import { apiClient } from "@/service/httpClient";
import type {
  AdminFaqDetailResponse,
  AdminFaqListParams,
  AdminFaqListResponse,
  AdminFaqMutationResponse,
  AdminFaqPayload,
  BackendDeleteFaqResponse,
  BackendFaqListPayload,
  BackendFaqTopic,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardFaq";
import {
  assertSuccess,
  normalizeFaqDetailResponse,
  normalizeFaqMutationResponse,
  normalizeFaqsResponse
} from "./shared";

export async function fetchAdminFaqs(
  params: AdminFaqListParams = {}
): Promise<AdminFaqListResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendFaqListPayload>
  >("/api/admin-dashboard/faqs", {
    params: {
      search: params.search?.trim() || undefined,
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      isFeatured: params.isFeatured,
      sort_by: params.sortBy ?? "order",
      sort_direction: params.sortDirection ?? "desc"
    }
  });

  return normalizeFaqsResponse(assertSuccess(response.data));
}

export async function fetchAdminFaqDetail(
  faqId: string
): Promise<AdminFaqDetailResponse> {
  const response = await apiClient.get<BackendSuccessResponse<BackendFaqTopic>>(
    `/api/admin-dashboard/faqs/${faqId}`
  );

  return normalizeFaqDetailResponse(assertSuccess(response.data));
}

export async function createAdminFaq(
  payload: AdminFaqPayload
): Promise<AdminFaqMutationResponse> {
  const response = await apiClient.post<
    BackendSuccessResponse<BackendFaqTopic>
  >("/api/admin-dashboard/faqs", payload);

  return normalizeFaqMutationResponse(assertSuccess(response.data));
}

export async function updateAdminFaq(
  faqId: string,
  payload: AdminFaqPayload
): Promise<AdminFaqMutationResponse> {
  const response = await apiClient.put<BackendSuccessResponse<BackendFaqTopic>>(
    `/api/admin-dashboard/faqs/${faqId}`,
    payload
  );

  return normalizeFaqMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminFaq(
  faqId: string
): Promise<BackendDeleteFaqResponse> {
  const response = await apiClient.delete<BackendDeleteFaqResponse>(
    `/api/admin-dashboard/faqs/${faqId}`
  );

  return assertSuccess(response.data);
}
