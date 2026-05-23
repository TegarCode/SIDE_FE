export type AdminAuthenticationLogUser = {
  id: string;
  name: string;
  email: string;
};

export type AdminAuthenticationLogRecord = {
  id: string;
  user: AdminAuthenticationLogUser | null;
  ipAddress: string;
  userAgent: string;
  loginAt: string;
  loginSuccessful: boolean;
  logoutAt: string;
  clearedByUser: boolean;
  location: string;
};

export type AdminAuthenticationLogSummary = {
  totalLog: number;
  loginBerhasil: number;
  logTerbaru: AdminAuthenticationLogRecord | null;
};

export type AdminAuthenticationLogSortField = "login_at" | "logout_at";
export type AdminAuthenticationLogSortDirection = "asc" | "desc";

export type AdminAuthenticationLogListParams = {
  search?: string;
  page?: number;
  perPage?: number;
  loginSuccessful?: boolean;
  clearedByUser?: boolean;
  sortBy?: AdminAuthenticationLogSortField;
  sortDirection?: AdminAuthenticationLogSortDirection;
};

export type AdminAuthenticationLogUpdatePayload = {
  clearedByUser: boolean;
};

export type AdminAuthenticationLogUpdateFormValues = {
  clearedByUser: "true" | "false";
};

export type AdminAuthenticationLogListResponse = {
  items: AdminAuthenticationLogRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: AdminAuthenticationLogSummary;
  sortBy: AdminAuthenticationLogSortField;
  sortDirection: AdminAuthenticationLogSortDirection;
};

export type AdminAuthenticationLogDetailResponse = {
  data: AdminAuthenticationLogRecord;
  message: string;
};

export type AdminAuthenticationLogMutationResponse = {
  data: AdminAuthenticationLogRecord;
  message: string;
};

export type BackendAuthenticationLogUser = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
};

export type BackendAuthenticationLogItem = {
  id?: string | null;
  user?: BackendAuthenticationLogUser | null;
  ip_address?: string | null;
  user_agent?: string | null;
  login_at?: string | null;
  login_successful?: boolean | null;
  logout_at?: string | null;
  cleared_by_user?: boolean | null;
  location?: string | null;
};

export type BackendAuthenticationLogSummaryPayload = {
  total_log?: number | null;
  login_berhasil?: number | null;
  log_terbaru?: BackendAuthenticationLogItem | null;
};

export type BackendAuthenticationLogMeta = {
  page?: number | null;
  per_page?: number | null;
  total?: number | null;
  last_page?: number | null;
  sort_by?: string | null;
  sort_direction?: string | null;
};

export type BackendAuthenticationLogsPayload = {
  summary?: BackendAuthenticationLogSummaryPayload | null;
  items?: BackendAuthenticationLogItem[] | null;
  meta?: BackendAuthenticationLogMeta | null;
};

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};

export type BackendDeleteAuthenticationLogResponse = BackendSuccessResponse<{
  id?: string | null;
}>;
