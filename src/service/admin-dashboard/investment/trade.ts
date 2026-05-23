import { apiClient } from "@/service/httpClient";
import type {
  BackendSuccessResponse,
  InvestmentCreatePayload,
  InvestmentCurrentListParams,
  InvestmentCurrentListResponse,
  InvestmentDetailParams,
  InvestmentDetailResponse,
  InvestmentListParams,
  InvestmentListResponse,
  InvestmentMutationResponse,
  InvestmentOptionsResponse,
  InvestmentUpdateRowPayload,
  InvestmentUploadPreviewResponse
} from "@/type/admin-management/adminDashboardInvestment";
import {
  assertSuccess,
  normalizeCurrentListResponse,
  normalizeDetailResponse,
  normalizeListResponse,
  normalizeMutationResponse,
  normalizeOptionsResponse,
  normalizeUploadPreviewResponse
} from "./shared";

const basePath = "/api/admin-dashboard/investasi";

export async function fetchAdminInvestmentList(
  params: InvestmentListParams = {}
): Promise<InvestmentListResponse> {
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

export async function fetchAdminInvestmentCurrentList(
  params: InvestmentCurrentListParams = {}
): Promise<InvestmentCurrentListResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    `${basePath}/current`,
    {
      params: {
        origin_code: params.originCode || undefined,
        destination_code: params.destinationCode || undefined,
        source_code: params.sourceCode || undefined,
        status: params.status || undefined,
        sector_id: params.sectorId || undefined,
        year: params.year || undefined,
        month: params.month || undefined,
        investment_type: params.investmentType || undefined,
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
        sort_by: params.sortBy || undefined,
        sort_direction: params.sortDirection || undefined
      }
    }
  );

  return normalizeCurrentListResponse(assertSuccess(response.data));
}

export async function fetchAdminInvestmentOptions(): Promise<InvestmentOptionsResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    `${basePath}/options`
  );

  return normalizeOptionsResponse(assertSuccess(response.data));
}

export async function fetchAdminInvestmentDetail(
  batchId: string,
  params: InvestmentDetailParams = {}
): Promise<InvestmentDetailResponse> {
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

export async function createAdminInvestment(
  payload: InvestmentCreatePayload
): Promise<InvestmentMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    basePath,
    payload
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function previewAdminInvestmentUpload(
  file: File,
  sampleSize = 8
): Promise<InvestmentUploadPreviewResponse> {
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

export async function createAdminInvestmentUpload(
  payload: FormData
): Promise<InvestmentMutationResponse> {
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

export async function updateAdminInvestmentRow(
  batchId: string,
  rowId: string,
  payload: InvestmentUpdateRowPayload
): Promise<InvestmentMutationResponse> {
  const response = await apiClient.put<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/rows/${rowId}`,
    payload
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function updateAdminInvestmentCurrentRow(
  rowId: string,
  payload: InvestmentUpdateRowPayload
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.put<BackendSuccessResponse<unknown>>(
    `${basePath}/current/${rowId}`,
    payload
  );

  return assertSuccess(response.data);
}

export async function deleteAdminInvestmentRow(
  batchId: string,
  rowId: string
): Promise<InvestmentMutationResponse> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/rows/${rowId}`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminInvestmentCurrentRow(
  rowId: string
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/current/${rowId}`
  );

  return assertSuccess(response.data);
}

export async function deleteAdminInvestmentCurrentRows(
  rowIds: string[]
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/current/bulk-delete`,
    { row_ids: rowIds }
  );

  return assertSuccess(response.data);
}

export async function deleteAdminInvestmentRows(
  batchId: string,
  rowIds: string[]
): Promise<InvestmentMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/rows/bulk-delete`,
    { row_ids: rowIds }
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function clearAdminInvestmentStaging(
  batchId: string
): Promise<InvestmentMutationResponse> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/staging`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function validateAdminInvestment(
  batchId: string
): Promise<InvestmentMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/validate`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function approveAdminInvestment(
  batchId: string
): Promise<InvestmentMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/approve`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function publishAdminInvestment(
  batchId: string
): Promise<InvestmentMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/publish`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function rejectAdminInvestment(
  batchId: string
): Promise<InvestmentMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/reject`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminInvestment(
  batchId: string
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}`
  );

  return assertSuccess(response.data);
}
