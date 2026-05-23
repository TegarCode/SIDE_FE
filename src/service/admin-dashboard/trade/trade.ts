import { apiClient } from "@/service/httpClient";
import type {
  BackendSuccessResponse,
  TradeCreatePayload,
  TradeCurrentListParams,
  TradeCurrentListResponse,
  TradeDetailParams,
  TradeDetailResponse,
  TradeListParams,
  TradeListResponse,
  TradeMutationResponse,
  TradeOptionsResponse,
  TradeUpdateRowPayload,
  TradeUploadPreviewResponse
} from "@/type/admin-management/adminDashboardTrade";
import {
  assertSuccess,
  normalizeCurrentListResponse,
  normalizeDetailResponse,
  normalizeListResponse,
  normalizeMutationResponse,
  normalizeOptionsResponse,
  normalizeUploadPreviewResponse
} from "./shared";

const basePath = "/api/admin-dashboard/perdagangan";

export async function fetchAdminTradeList(
  params: TradeListParams = {}
): Promise<TradeListResponse> {
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

export async function fetchAdminTradeCurrentList(
  params: TradeCurrentListParams = {}
): Promise<TradeCurrentListResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    `${basePath}/current`,
    {
      params: {
        reporter_code: params.reporterCode || undefined,
        partner_code: params.partnerCode || undefined,
        source_code: params.sourceCode || undefined,
        status: params.status || undefined,
        sector_id: params.sectorId || undefined,
        year: params.year || undefined,
        hs_len: params.hsLen || undefined,
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
        sort_by: params.sortBy || undefined,
        sort_direction: params.sortDirection || undefined
      }
    }
  );

  return normalizeCurrentListResponse(assertSuccess(response.data));
}

export async function fetchAdminTradeOptions(): Promise<TradeOptionsResponse> {
  const response = await apiClient.get<BackendSuccessResponse<unknown>>(
    `${basePath}/options`
  );

  return normalizeOptionsResponse(assertSuccess(response.data));
}

export async function fetchAdminTradeDetail(
  batchId: string,
  params: TradeDetailParams = {}
): Promise<TradeDetailResponse> {
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

export async function createAdminTrade(
  payload: TradeCreatePayload
): Promise<TradeMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    basePath,
    payload
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function previewAdminTradeUpload(
  file: File,
  sampleSize = 8
): Promise<TradeUploadPreviewResponse> {
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

export async function createAdminTradeUpload(
  payload: FormData
): Promise<TradeMutationResponse> {
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

export async function updateAdminTradeRow(
  batchId: string,
  rowId: string,
  payload: TradeUpdateRowPayload
): Promise<TradeMutationResponse> {
  const response = await apiClient.put<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/rows/${rowId}`,
    payload
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function updateAdminTradeCurrentRow(
  rowId: string,
  payload: TradeUpdateRowPayload
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.put<BackendSuccessResponse<unknown>>(
    `${basePath}/current/${rowId}`,
    payload
  );

  return assertSuccess(response.data);
}

export async function deleteAdminTradeRow(
  batchId: string,
  rowId: string
): Promise<TradeMutationResponse> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/rows/${rowId}`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminTradeCurrentRow(
  rowId: string
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/current/${rowId}`
  );

  return assertSuccess(response.data);
}

export async function deleteAdminTradeCurrentRows(
  rowIds: string[]
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/current/bulk-delete`,
    { row_ids: rowIds }
  );

  return assertSuccess(response.data);
}

export async function deleteAdminTradeRows(
  batchId: string,
  rowIds: string[]
): Promise<TradeMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/rows/bulk-delete`,
    { row_ids: rowIds }
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function clearAdminTradeStaging(
  batchId: string
): Promise<TradeMutationResponse> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/staging`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function validateAdminTrade(
  batchId: string
): Promise<TradeMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/validate`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function approveAdminTrade(
  batchId: string
): Promise<TradeMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/approve`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function publishAdminTrade(
  batchId: string
): Promise<TradeMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/publish`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function rejectAdminTrade(
  batchId: string
): Promise<TradeMutationResponse> {
  const response = await apiClient.post<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}/reject`
  );

  return normalizeMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminTrade(
  batchId: string
): Promise<BackendSuccessResponse<unknown>> {
  const response = await apiClient.delete<BackendSuccessResponse<unknown>>(
    `${basePath}/${batchId}`
  );

  return assertSuccess(response.data);
}
