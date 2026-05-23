export type AdminApiClientRecord = {
  id: string;
  name: string;
  description: string;
  abilities: string[];
  allowedDomains: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminApiClientFormValues = {
  name: string;
  description: string;
  abilities: string[];
  allowedDomains: string[];
  active: boolean;
};

export type AdminApiClientPayload = {
  name: string;
  description: string;
  abilities: string[];
  allowed_domains: string[];
  active: boolean;
};

export type AdminApiClientRegenerateFormValues = {
  currentPassword: string;
};

export type AdminApiClientRegeneratePayload = {
  current_password: string;
};

export type AdminApiClientPermissionOption = {
  id: string;
  name: string;
  category: string;
  description: string;
};

export type AdminApiClientListParams = {
  search?: string;
  page?: number;
  perPage?: number;
  active?: boolean;
  sortBy?: AdminApiClientSortField;
  sortDirection?: AdminApiClientSortDirection;
};

export type AdminApiClientSortDirection = "asc" | "desc";

export type AdminApiClientSortField =
  | "name"
  | "active"
  | "created_at"
  | "updated_at";

export type AdminApiClientSummary = {
  totalClient: number;
  activeClientCount: number;
  latestClient: AdminApiClientRecord | null;
};

export type AdminApiClientListResponse = {
  items: AdminApiClientRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: AdminApiClientSummary;
  sortBy: AdminApiClientSortField;
  sortDirection: AdminApiClientSortDirection;
};

export type AdminApiClientDetailResponse = {
  data: AdminApiClientRecord;
  message: string;
};

export type AdminApiClientMutationResponse = {
  data: AdminApiClientRecord;
  message: string;
  plainTextApiKey: string | null;
  apiKeyNotice: string | null;
};

export type BackendApiClientItem = {
  id?: string | number | null;
  name?: string | null;
  description?: string | null;
  abilities?: string[] | null;
  allowed_domains?: string[] | null;
  active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BackendApiClientPermissionItem = {
  id?: string | number | null;
  name?: string | null;
  category?: string | null;
  description?: string | null;
};

export type BackendPaginationMeta = {
  page?: number | null;
  per_page?: number | null;
  total?: number | null;
  last_page?: number | null;
  sort_by?: string | null;
  sort_direction?: string | null;
};

export type BackendApiClientsPayload = {
  summary?: {
    total_client?: number | null;
    client_aktif?: number | null;
    client_terbaru?: BackendApiClientItem | null;
  };
  items?: BackendApiClientItem[] | null;
  meta?: BackendPaginationMeta | null;
};

export type BackendApiClientPermissionsPayload = {
  items?: BackendApiClientPermissionItem[] | null;
};

export type BackendSuccessResponse<TData, TMetadata = undefined> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  metadata?: TMetadata;
  errors?: Record<string, string[]> | null;
};

export type BackendDeleteApiClientResponse = BackendSuccessResponse<{
  id?: string | number | null;
}>;
