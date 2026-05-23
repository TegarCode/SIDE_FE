import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminPermission,
  deleteAdminPermission,
  fetchAdminPermissionDetail,
  fetchAdminPermissions,
  updateAdminPermission
} from "@/service/admin-dashboard/permission";
import type {
  AdminPermissionListParams,
  AdminPermissionPayload
} from "@/type/admin-management/adminDashboardPermission";

type UpdateAdminPermissionInput = {
  permissionId: string;
  payload: AdminPermissionPayload;
};

export function usePermissionManagementPage(
  params: AdminPermissionListParams,
  selectedPermissionId?: string | null
) {
  const queryClient = useQueryClient();

  const permissionsQuery = useQuery({
    queryKey: ["admin-dashboard", "permissions-management", params],
    queryFn: () => fetchAdminPermissions(params)
  });

  const permissionDetailQuery = useQuery({
    queryKey: [
      "admin-dashboard",
      "permissions-management",
      "detail",
      selectedPermissionId
    ],
    queryFn: () => fetchAdminPermissionDetail(selectedPermissionId as string),
    enabled: Boolean(selectedPermissionId)
  });

  const createPermissionMutation = useMutation({
    mutationKey: ["admin-dashboard", "permissions-management", "create"],
    mutationFn: createAdminPermission,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "permissions-management"]
      });
    }
  });

  const updatePermissionMutation = useMutation({
    mutationKey: ["admin-dashboard", "permissions-management", "update"],
    mutationFn: ({ permissionId, payload }: UpdateAdminPermissionInput) =>
      updateAdminPermission(permissionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "permissions-management"]
      });
    }
  });

  const deletePermissionMutation = useMutation({
    mutationKey: ["admin-dashboard", "permissions-management", "delete"],
    mutationFn: deleteAdminPermission,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "permissions-management"]
      });
    }
  });

  return {
    permissionsQuery,
    permissionDetailQuery,
    createPermissionMutation,
    updatePermissionMutation,
    deletePermissionMutation
  };
}
