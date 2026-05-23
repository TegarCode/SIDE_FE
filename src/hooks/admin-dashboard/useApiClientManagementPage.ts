import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminApiClient,
  deleteAdminApiClient,
  fetchAdminApiClientDetail,
  fetchAdminApiClientPermissions,
  fetchAdminApiClients,
  regenerateAdminApiClientKey,
  updateAdminApiClient
} from "@/service/admin-dashboard/api-client";
import type {
  AdminApiClientListParams,
  AdminApiClientPayload,
  AdminApiClientRegeneratePayload
} from "@/type/admin-management/adminDashboardApiClient";

type UpdateAdminApiClientInput = {
  apiClientId: string;
  payload: AdminApiClientPayload;
};

type RegenerateAdminApiClientInput = {
  apiClientId: string;
  payload: AdminApiClientRegeneratePayload;
};

export function useApiClientManagementPage(
  params: AdminApiClientListParams,
  selectedApiClientId?: string | null
) {
  const queryClient = useQueryClient();

  const apiClientsQuery = useQuery({
    queryKey: ["admin-dashboard", "api-clients", params],
    queryFn: () => fetchAdminApiClients(params)
  });

  const apiClientDetailQuery = useQuery({
    queryKey: ["admin-dashboard", "api-clients", "detail", selectedApiClientId],
    queryFn: () => fetchAdminApiClientDetail(selectedApiClientId as string),
    enabled: Boolean(selectedApiClientId)
  });

  const permissionsQuery = useQuery({
    queryKey: ["admin-dashboard", "api-clients", "permissions"],
    queryFn: fetchAdminApiClientPermissions
  });

  const createApiClientMutation = useMutation({
    mutationKey: ["admin-dashboard", "api-clients", "create"],
    mutationFn: createAdminApiClient,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "api-clients"]
      });
    }
  });

  const updateApiClientMutation = useMutation({
    mutationKey: ["admin-dashboard", "api-clients", "update"],
    mutationFn: ({ apiClientId, payload }: UpdateAdminApiClientInput) =>
      updateAdminApiClient(apiClientId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "api-clients"]
      });
      await queryClient.invalidateQueries({
        queryKey: [
          "admin-dashboard",
          "api-clients",
          "detail",
          variables.apiClientId
        ]
      });
    }
  });

  const deleteApiClientMutation = useMutation({
    mutationKey: ["admin-dashboard", "api-clients", "delete"],
    mutationFn: deleteAdminApiClient,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "api-clients"]
      });
    }
  });

  const regenerateApiClientKeyMutation = useMutation({
    mutationKey: ["admin-dashboard", "api-clients", "regenerate-key"],
    mutationFn: ({ apiClientId, payload }: RegenerateAdminApiClientInput) =>
      regenerateAdminApiClientKey(apiClientId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "api-clients"]
      });
      await queryClient.invalidateQueries({
        queryKey: [
          "admin-dashboard",
          "api-clients",
          "detail",
          variables.apiClientId
        ]
      });
    }
  });

  return {
    apiClientsQuery,
    apiClientDetailQuery,
    permissionsQuery,
    createApiClientMutation,
    updateApiClientMutation,
    deleteApiClientMutation,
    regenerateApiClientKeyMutation
  };
}
