import type { ContactMessageType } from "@/type/home";

export type AdminContactRecord = {
  id: string;
  name: string;
  email: string;
  type: ContactMessageType;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminContactSummary = {
  totalContact: number;
  activeTypeCount: number;
  latestContact: AdminContactRecord | null;
};

export type AdminContactFormValues = {
  name: string;
  email: string;
  type: ContactMessageType;
  message: string;
};

export type AdminContactPayload = {
  nama: string;
  email: string;
  jenis: ContactMessageType;
  pesan: string;
};

export type AdminContactSortDirection = "asc" | "desc";

export type AdminContactSortField =
  | "nama"
  | "email"
  | "jenis"
  | "created_at"
  | "updated_at";

export type AdminContactListParams = {
  search?: string;
  page?: number;
  perPage?: number;
  jenis?: ContactMessageType;
  sortBy?: AdminContactSortField;
  sortDirection?: AdminContactSortDirection;
};

export type AdminContactListResponse = {
  items: AdminContactRecord[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  summary: AdminContactSummary;
  sortBy: AdminContactSortField;
  sortDirection: AdminContactSortDirection;
};

export type AdminContactDetailResponse = {
  data: AdminContactRecord;
  message: string;
};

export type AdminContactMutationResponse = {
  data: AdminContactRecord;
  message: string;
};

export type BackendContactItem = {
  id?: string | number | null;
  nama?: string | null;
  email?: string | null;
  jenis?: string | null;
  pesan?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BackendContactsPayload = {
  summary?: {
    total_contact?: number | null;
    jenis_aktif?: number | null;
    contact_terbaru?: BackendContactItem | null;
  };
  items?: BackendContactItem[] | null;
  meta?: {
    page?: number | null;
    per_page?: number | null;
    total?: number | null;
    last_page?: number | null;
    sort_by?: string | null;
    sort_direction?: string | null;
  } | null;
};

export type BackendSuccessResponse<TData> = {
  success?: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: Record<string, string[] | null> | null;
};

export type BackendDeleteContactResponse = BackendSuccessResponse<{
  id?: string | number | null;
}>;
