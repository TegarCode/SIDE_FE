import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminAuthenticationLog,
  fetchAdminAuthenticationLogDetail,
  fetchAdminAuthenticationLogs,
  updateAdminAuthenticationLog
} from "@/service/admin-dashboard/authentication-log";
import type {
  AdminAuthenticationLogListParams,
  AdminAuthenticationLogUpdatePayload
} from "@/type/admin-management/adminDashboardAuthenticationLog";

type UpdateAdminAuthenticationLogInput = {
  logId: string;
  payload: AdminAuthenticationLogUpdatePayload;
};

export function useAuthenticationLogManagementPage(
  params: AdminAuthenticationLogListParams,
  selectedLogId?: string | null
) {
  const queryClient = useQueryClient();

  const authenticationLogsQuery = useQuery({
    queryKey: ["admin-dashboard", "authentication-logs", params],
    queryFn: () => fetchAdminAuthenticationLogs(params)
  });

  const authenticationLogDetailQuery = useQuery({
    queryKey: [
      "admin-dashboard",
      "authentication-logs",
      "detail",
      selectedLogId
    ],
    queryFn: () => fetchAdminAuthenticationLogDetail(selectedLogId as string),
    enabled: Boolean(selectedLogId)
  });

  const updateAuthenticationLogMutation = useMutation({
    mutationKey: ["admin-dashboard", "authentication-logs", "update"],
    mutationFn: ({ logId, payload }: UpdateAdminAuthenticationLogInput) =>
      updateAdminAuthenticationLog(logId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "authentication-logs"]
      });
      await queryClient.invalidateQueries({
        queryKey: [
          "admin-dashboard",
          "authentication-logs",
          "detail",
          variables.logId
        ]
      });
    }
  });

  const deleteAuthenticationLogMutation = useMutation({
    mutationKey: ["admin-dashboard", "authentication-logs", "delete"],
    mutationFn: deleteAdminAuthenticationLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "authentication-logs"]
      });
    }
  });

  return {
    authenticationLogsQuery,
    authenticationLogDetailQuery,
    updateAuthenticationLogMutation,
    deleteAuthenticationLogMutation
  };
}
