import type { ApiResponse } from "@/type/common";
import { env } from "@/constants/env";
import axios, { type Method } from "axios";

type RequestOptions = {
  method?: Method;
  body?: unknown;
  headers?: Record<string, string>;
};

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json"
  }
});

export async function httpRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const response = await apiClient.request<T>({
    url: endpoint,
    method: options.method ?? "GET",
    data: options.body,
    headers: options.headers
  });

  return {
    data: response.data,
    status: response.status,
    success: response.status >= 200 && response.status < 300
  };
}
