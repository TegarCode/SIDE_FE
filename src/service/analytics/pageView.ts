import { apiClient } from "@/service/httpClient";

export type StorePageViewPayload = {
  path?: string;
  module?: string;
};

export async function storePageView(payload: StorePageViewPayload) {
  await apiClient.post("/api/analytics/page-view", payload);
}
