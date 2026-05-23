import { apiClient } from "@/service/httpClient";
import type {
  BackendSuccessResponse,
  TourismCreatePayload,
  TourismCurrentListParams,
  TourismCurrentListResponse,
  TourismDetailParams,
  TourismDetailResponse,
  TourismListParams,
  TourismListResponse,
  TourismMutationResponse,
  TourismOptionsResponse,
  TourismUpdateRowPayload,
  TourismUploadPreviewResponse
} from "@/type/admin-management/adminDashboardTourism";
import {
  assertSuccess,
  normalizeCurrentListResponse,
  normalizeDetailResponse,
  normalizeListResponse,
  normalizeMutationResponse,
  normalizeOptionsResponse,
  normalizeUploadPreviewResponse
} from "./shared";

const basePath = "/api/admin-dashboard/pariwisata";

export async function fetchAdminTourismList(
  params: TourismListParams = {}
): Promise<TourismListResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    basePath,
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

export async function fetchAdminTourismCurrentList(
  params: TourismCurrentListParams = {}
): Promise<TourismCurrentListResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    `${basePath}/current`,
    {
      params: {
        origin_code: params.originCode || undefined,
        destination_code: params.destinationCode || undefined,
        source_code: params.sourceCode || undefined,
        status: params.status || undefined,
        year: params.year || undefined,
        month: params.month || undefined,
        travel_purpose: params.travelPurpose || undefined,
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
        sort_by: params.sortBy || undefined,
        sort_direction: params.sortDirection || undefined
      }
    }
  );

  return normalizeCurrentListResponse(assertSuccess(response.data));
}

export async function fetchAdminTourismOptions(): Promise<TourismOptionsResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    `${basePath}/options`
  );

  return normalizeOptionsResponse(assertSuccess(response.data));
}

export async function fetchAdminTourismDetail(
  batchId: string,
  params: TourismDetailParams = {}
): Promise<TourismDetailResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}`,
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

export async function createAdminTourism(
  payload: TourismCreatePayload
): Promise<TourismMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    basePath,
    payload
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function previewAdminTourismUpload(
  file: File,
  sampleSize = 8
): Promise<TourismUploadPreviewResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sample_size", String(sampleSize));

  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/preview`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return normalizeUploadPreviewResponse(assertSuccess(response.data));
}

export async function createAdminTourismUpload(
  payload: FormData
): Promise<TourismMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    basePath,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function updateAdminTourismRow(
  batchId: string,
  rowId: string,
  payload: TourismUpdateRowPayload
): Promise<TourismMutationResponse> {
  const response = await apiClient.put<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/rows/${rowId}`,
    payload
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function updateAdminTourismCurrentRow(
  rowId: string,
  payload: TourismUpdateRowPayload
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.put<BackendSuccessResponse<unknown>>(
    `${basePath}/current/${rowId}`,
    payload
  );

  return assertSuccess(response.data);
}

export async function deleteAdminTourismRow(
  batchId: string,
  rowId: string
): Promise<TourismMutationResponse> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/rows/${rowId}`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminTourismCurrentRow(
  rowId: string
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/current/${rowId}`
  );

  return assertSuccess(response.data);
}

export async function deleteAdminTourismCurrentRows(
  rowIds: string[]
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/current/bulk-delete`,
    { row_ids: rowIds }
  );

  return assertSuccess(response.data);
}

export async function deleteAdminTourismRows(
  batchId: string,
  rowIds: string[]
): Promise<TourismMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/rows/bulk-delete`,
    { row_ids: rowIds }
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function clearAdminTourismStaging(
  batchId: string
): Promise<TourismMutationResponse> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/staging`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function validateAdminTourism(
  batchId: string
): Promise<TourismMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/validate`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function approveAdminTourism(
  batchId: string
): Promise<TourismMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/approve`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function publishAdminTourism(
  batchId: string
): Promise<TourismMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/publish`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function rejectAdminTourism(
  batchId: string
): Promise<TourismMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/reject`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminTourism(
  batchId: string
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}`
  );

  return assertSuccess(response.data);
}
