import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminCache,
  fetchAdminCacheDetail,
  fetchAdminCaches,
  updateAdminCache
} from "@/service/admin-dashboard/cache";
import type {
  AdminCacheListParams,
  AdminCacheUpdatePayload
} from "@/type/admin-management/adminDashboardCache";

type UpdateAdminCacheInput = {
  cacheKey: string;
  payload: AdminCacheUpdatePayload;
};

export function useCacheManagementPage(
  params: AdminCacheListParams,
  selectedCacheKey?: string | null
) {
  const queryClient = useQueryClient();

  const cachesQuery = useQuery({
    queryKey: ["admin-dashboard", "caches", params],
    queryFn: () => fetchAdminCaches(params)
  });

  const cacheDetailQuery = useQuery({
    queryKey: ["admin-dashboard", "caches", "detail", selectedCacheKey],
    queryFn: () => fetchAdminCacheDetail(selectedCacheKey as string),
    enabled: Boolean(selectedCacheKey)
  });

  const updateCacheMutation = useMutation({
    mutationKey: ["admin-dashboard", "caches", "update"],
    mutationFn: ({ cacheKey, payload }: UpdateAdminCacheInput) =>
      updateAdminCache(cacheKey, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "caches"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "caches", "detail", variables.cacheKey]
      });
    }
  });

  const deleteCacheMutation = useMutation({
    mutationKey: ["admin-dashboard", "caches", "delete"],
    mutationFn: deleteAdminCache,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "caches"]
      });
    }
  });

  return {
    cachesQuery,
    cacheDetailQuery,
    updateCacheMutation,
    deleteCacheMutation
  };
}
