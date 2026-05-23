import { apiClient } from "@/service/httpClient";
import type {
  AdminAuthenticationLogDetailResponse,
  AdminAuthenticationLogListParams,
  AdminAuthenticationLogListResponse,
  AdminAuthenticationLogMutationResponse,
  AdminAuthenticationLogUpdatePayload,
  BackendAuthenticationLogItem,
  BackendAuthenticationLogsPayload,
  BackendDeleteAuthenticationLogResponse,
  BackendSuccessResponse
} from "@/type/admin-management/adminDashboardAuthenticationLog";
import {
  assertSuccess,
  normalizeAuthenticationLogDetailResponse,
  normalizeAuthenticationLogMutationResponse,
  normalizeAuthenticationLogsResponse
} from "./shared";

function toBackendPayload(payload: AdminAuthenticationLogUpdatePayload) {
  return {
    cleared_by_user: payload.clearedByUser
  };
}

export async function fetchAdminAuthenticationLogs(
  params: AdminAuthenticationLogListParams = {}
): Promise<AdminAuthenticationLogListResponse> {
  const requestParams: Record<string, string | number | boolean | undefined> = {
    search: params.search?.trim() || undefined,
    page: params.page ?? 1,
    per_page: params.perPage ?? 10,
    sort_by: params.sortBy ?? "login_at",
    sort_direction: params.sortDirection ?? "desc"
  };

  if (typeof params.loginSuccessful === "boolean") {
    requestParams.login_successful = params.loginSuccessful;
  }

  if (typeof params.clearedByUser === "boolean") {
    requestParams.cleared_by_user = params.clearedByUser;
  }

  const response = await apiClient.get<
    BackendSuccessResponse<BackendAuthenticationLogsPayload>
  >("/api/admin-dashboard/authentication-logs", {
    params: requestParams
  });

  return normalizeAuthenticationLogsResponse(assertSuccess(response.data));
}

export async function fetchAdminAuthenticationLogDetail(
  logId: string
): Promise<AdminAuthenticationLogDetailResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendAuthenticationLogItem>
  >(`/api/admin-dashboard/authentication-logs/${logId}`);

  return normalizeAuthenticationLogDetailResponse(assertSuccess(response.data));
}

export async function updateAdminAuthenticationLog(
  logId: string,
  payload: AdminAuthenticationLogUpdatePayload
): Promise<AdminAuthenticationLogMutationResponse> {
  const response = await apiClient.put<
    BackendSuccessResponse<BackendAuthenticationLogItem>
  >(
    `/api/admin-dashboard/authentication-logs/${logId}`,
    toBackendPayload(payload)
  );

  return normalizeAuthenticationLogMutationResponse(
    assertSuccess(response.data)
  );
}

export async function deleteAdminAuthenticationLog(
  logId: string
): Promise<BackendDeleteAuthenticationLogResponse> {
  const response =
    await apiClient.delete<BackendDeleteAuthenticationLogResponse>(
      `/api/admin-dashboard/authentication-logs/${logId}`
    );

  return assertSuccess(response.data);
}
