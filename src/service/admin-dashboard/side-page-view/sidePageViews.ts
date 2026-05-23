import { apiClient } from "@/service/httpClient";
import type {
  AdminSidePageViewDetailResponse,
  AdminSidePageViewListParams,
  AdminSidePageViewListResponse,
  BackendSidePageViewItem,
  BackendSidePageViewModulesPayload,
  BackendSidePageViewsPayload,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardSidePageView";
import {
  assertSuccess,
  normalizeSidePageViewDetailResponse,
  normalizeSidePageViewModulesResponse,
  normalizeSidePageViewsResponse
} from "./shared";

export async function fetchAdminSidePageViews(
  params: AdminSidePageViewListParams = {}
): Promise<AdminSidePageViewListResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendSidePageViewsPayload>
  >("/api/admin-dashboard/side-page-views", {
    params: {
      search: params.search?.trim() || undefined,
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      module: params.module?.trim() || undefined,
      sort_by: params.sortBy ?? "created_at",
      sort_direction: params.sortDirection ?? "desc"
    }
  });

  return normalizeSidePageViewsResponse(assertSuccess(response.data));
}

export async function fetchAdminSidePageViewDetail(
  pageViewId: number
): Promise<AdminSidePageViewDetailResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendSidePageViewItem>
  >(`/api/admin-dashboard/side-page-views/${pageViewId}`);

  return normalizeSidePageViewDetailResponse(assertSuccess(response.data));
}

export async function fetchAdminSidePageViewModules() {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendSidePageViewModulesPayload>
  >("/api/admin-dashboard/side-page-view-modules");

  return normalizeSidePageViewModulesResponse(assertSuccess(response.data));
}
