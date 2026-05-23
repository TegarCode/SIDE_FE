import { apiClient } from "@/service/httpClient";
import type {
  BackendSuccessResponse,
  KinerjaEkonomiCreatePayload,
  KinerjaEkonomiCurrentListParams,
  KinerjaEkonomiCurrentListResponse,
  KinerjaEkonomiDetailParams,
  KinerjaEkonomiDetailResponse,
  KinerjaEkonomiListParams,
  KinerjaEkonomiListResponse,
  KinerjaEkonomiMutationResponse,
  KinerjaEkonomiOptionsResponse,
  KinerjaEkonomiUploadPreviewResponse,
  KinerjaEkonomiUpdateRowPayload
} from "@/type/admin-management/adminDashboardKinerjaEkonomi";
import {
  assertSuccess,
  normalizeCurrentListResponse,
  normalizeDetailResponse,
  normalizeListResponse,
  normalizeMutationResponse,
  normalizeOptionsResponse,
  normalizeUploadPreviewResponse
} from "./shared";

export async function fetchAdminKinerjaEkonomiList(
  params: KinerjaEkonomiListParams = {}
): Promise<KinerjaEkonomiListResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    "/api/admin-dashboard/kinerja-ekonomi",
    {
      params: {
        search: params.search?.trim() || undefined,
        status:
          params.status && params.status !== "all" ? params.status : undefined,
        source_type:
          params.sourceType && params.sourceType !== "all"
            ? params.sourceType
            : undefined,
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
        sort_by: params.sortBy || undefined,
        sort_direction: params.sortDirection || undefined
      }
    }
  );

  return normalizeListResponse(assertSuccess(response.data));
}

export async function fetchAdminKinerjaEkonomiCurrentList(
  params: KinerjaEkonomiCurrentListParams = {}
): Promise<KinerjaEkonomiCurrentListResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    "/api/admin-dashboard/kinerja-ekonomi/current",
    {
      params: {
        country_code: params.countryCode || undefined,
        indicator_id: params.indicatorId || undefined,
        source_code: params.sourceCode || undefined,
        year: params.year || undefined,
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
        sort_by: params.sortBy || undefined,
        sort_direction: params.sortDirection || undefined
      }
    }
  );

  return normalizeCurrentListResponse(assertSuccess(response.data));
}

export async function fetchAdminKinerjaEkonomiOptions(): Promise<KinerjaEkonomiOptionsResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    "/api/admin-dashboard/kinerja-ekonomi/options"
  );

  return normalizeOptionsResponse(assertSuccess(response.data));
}

export async function fetchAdminKinerjaEkonomiDetail(
  batchId: string,
  params: KinerjaEkonomiDetailParams = {}
): Promise<KinerjaEkonomiDetailResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/${batchId}`,
    {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 25,
        sort_by: params.sortBy || undefined,
        sort_direction: params.sortDirection || undefined
      }
    }
  );

  return normalizeDetailResponse(assertSuccess(response.data));
}

export async function createAdminKinerjaEkonomi(
  payload: KinerjaEkonomiCreatePayload
): Promise<KinerjaEkonomiMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    "/api/admin-dashboard/kinerja-ekonomi",
    payload
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function previewAdminKinerjaEkonomiUpload(
  file: File,
  sampleSize = 8
): Promise<KinerjaEkonomiUploadPreviewResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sample_size", String(sampleSize));

  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    "/api/admin-dashboard/kinerja-ekonomi/preview",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return normalizeUploadPreviewResponse(assertSuccess(response.data));
}

export async function createAdminKinerjaEkonomiUpload(
  payload: FormData
): Promise<KinerjaEkonomiMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    "/api/admin-dashboard/kinerja-ekonomi",
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function updateAdminKinerjaEkonomiRow(
  batchId: string,
  rowId: string,
  payload: KinerjaEkonomiUpdateRowPayload
): Promise<KinerjaEkonomiMutationResponse> {
  const response = await apiClient.put<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/${batchId}/rows/${rowId}`,
    payload
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function updateAdminKinerjaEkonomiCurrentRow(
  rowId: string,
  payload: KinerjaEkonomiUpdateRowPayload
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.put<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/current/${rowId}`,
    payload
  );

  return assertSuccess(response.data);
}

export async function deleteAdminKinerjaEkonomiRow(
  batchId: string,
  rowId: string
): Promise<KinerjaEkonomiMutationResponse> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/${batchId}/rows/${rowId}`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminKinerjaEkonomiCurrentRow(
  rowId: string
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/current/${rowId}`
  );

  return assertSuccess(response.data);
}

export async function deleteAdminKinerjaEkonomiCurrentRows(
  rowIds: string[]
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    "/api/admin-dashboard/kinerja-ekonomi/current/bulk-delete",
    {
      row_ids: rowIds
    }
  );

  return assertSuccess(response.data);
}

export async function deleteAdminKinerjaEkonomiRows(
  batchId: string,
  rowIds: string[]
): Promise<KinerjaEkonomiMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/${batchId}/rows/bulk-delete`,
    {
      row_ids: rowIds
    }
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function clearAdminKinerjaEkonomiStaging(
  batchId: string
): Promise<KinerjaEkonomiMutationResponse> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/${batchId}/staging`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function validateAdminKinerjaEkonomi(
  batchId: string
): Promise<KinerjaEkonomiMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/${batchId}/validate`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function approveAdminKinerjaEkonomi(
  batchId: string
): Promise<KinerjaEkonomiMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/${batchId}/approve`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function publishAdminKinerjaEkonomi(
  batchId: string
): Promise<KinerjaEkonomiMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/${batchId}/publish`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function rejectAdminKinerjaEkonomi(
  batchId: string
): Promise<KinerjaEkonomiMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/${batchId}/reject`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminKinerjaEkonomi(
  batchId: string
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `/api/admin-dashboard/kinerja-ekonomi/${batchId}`
  );

  return assertSuccess(response.data);
}
