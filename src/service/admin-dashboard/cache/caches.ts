import { apiClient } from "@/service/httpClient";
import type {
  AdminCacheDetailResponse,
  AdminCacheListParams,
  AdminCacheListResponse,
  AdminCacheMutationResponse,
  AdminCacheUpdatePayload,
  BackendCacheItem,
  BackendCachesPayload,
  BackendDeleteCacheResponse,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardCache";
import {
  assertSuccess,
  normalizeCacheDetailResponse,
  normalizeCacheMutationResponse,
  normalizeCachesResponse
} from "./shared";

function encodeCacheKey(cacheKey: string) {
  return encodeURIComponent(cacheKey);
}

function toBackendPayload(payload: AdminCacheUpdatePayload) {
  return {
    expiration_at: payload.expirationAt
  };
}

export async function fetchAdminCaches(
  params: AdminCacheListParams = {}
): Promise<AdminCacheListResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendCachesPayload>
  >("/api/admin-dashboard/caches", {
    params: {
      search: params.search?.trim() || undefined,
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      category: params.category?.trim() || undefined,
      sort_by: params.sortBy ?? "expiration",
      sort_direction: params.sortDirection ?? "desc"
    }
  });

  return normalizeCachesResponse(assertSuccess(response.data));
}

export async function fetchAdminCacheDetail(
  cacheKey: string
): Promise<AdminCacheDetailResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendCacheItem>
  >(`/api/admin-dashboard/caches/${encodeCacheKey(cacheKey)}`);

  return normalizeCacheDetailResponse(assertSuccess(response.data));
}

export async function updateAdminCache(
  cacheKey: string,
  payload: AdminCacheUpdatePayload
): Promise<AdminCacheMutationResponse> {
  const response = await apiClient.put<
    BackendSuccessResponse<BackendCacheItem>
  >(
    `/api/admin-dashboard/caches/${encodeCacheKey(cacheKey)}`,
    toBackendPayload(payload)
  );

  return normalizeCacheMutationResponse(assertSuccess(response.data));
}

export async function deleteAdminCache(
  cacheKey: string
): Promise<BackendDeleteCacheResponse> {
  const response = await apiClient.delete<BackendDeleteCacheResponse>(
    `/api/admin-dashboard/caches/${encodeCacheKey(cacheKey)}`
  );

  return assertSuccess(response.data);
}
