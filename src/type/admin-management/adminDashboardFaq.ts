export type AdminFaqItemRecord = {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminFaqTopicRecord = {
  id: string;
  topic: string;
  summary: string;
  isFeatured: boolean;
  order: number;
  itemsCount: number;
  items: AdminFaqItemRecord[];
  createdAt: string;
  updatedAt: string;
};

export type AdminFaqSummary = {
  totalFaqTopic: number;
  faqFeatured: number;
  latestFaq: AdminFaqTopicRecord | null;
};

export type AdminFaqFormItemValues = {
  id: string;
  question: string;
  answer: string;
  order: string;
};

export type AdminFaqFormValues = {
  topic: string;
  summary: string;
  isFeatured: boolean;
  order: string;
  items: AdminFaqFormItemValues[];
};

export type AdminFaqPayloadItem = {
  question: string;
  answer: string;
  order?: number;
};

export type AdminFaqPayload = {
  topic: string;
  summary: string | null;
  is_featured: boolean;
  order: number;
  items: AdminFaqPayloadItem[];
};

export type AdminFaqFeaturedFilter = "all" | "true" | "false";

export type AdminFaqSortDirection = "asc" | "desc";

export type AdminFaqSortField = "topic" | "order" | "created_at" | "updated_at";

export type AdminFaqListParams = {
  search?: string;
  page?: number;
  perPage?: number;
  isFeatured?: boolean;
  sortBy?: AdminFaqSortField;
  sortDirection?: AdminFaqSortDirection;
};

export type AdminFaqListResponse = {
  items: AdminFaqTopicRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: AdminFaqSummary;
  sortBy: AdminFaqSortField;
  sortDirection: AdminFaqSortDirection;
};

export type AdminFaqDetailResponse = {
  data: AdminFaqTopicRecord;
  message: string;
};

export type AdminFaqMutationResponse = {
  data: AdminFaqTopicRecord;
  message: string;
};

export type BackendFaqItem = {
  id?: string | number | null;
  question?: string | null;
  answer?: string | null;
  order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BackendFaqTopic = {
  id?: string | number | null;
  topic?: string | null;
  summary?: string | null;
  is_featured?: boolean | null;
  order?: number | null;
  items_count?: number | null;
  items?: BackendFaqItem[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BackendFaqSummary = {
  total_faq_topic?: number | null;
  faq_featured?: number | null;
  faq_terbaru?: BackendFaqTopic | null;
};

export type BackendFaqMeta = {
  page?: number | null;
  per_page?: number | null;
  total?: number | null;
  last_page?: number | null;
  sort_by?: string | null;
  sort_direction?: string | null;
};

export type BackendFaqListPayload = {
  summary?: BackendFaqSummary;
  items?: BackendFaqTopic[] | null;
  meta?: BackendFaqMeta | null;
};

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};

export type BackendDeleteFaqResponse = BackendSuccessResponse<{
  id?: string | number | null;
}>;
