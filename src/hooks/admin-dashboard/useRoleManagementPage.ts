import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminRole,
  deleteAdminRole,
  fetchAdminPermissionCatalog,
  fetchAdminRoles,
  updateAdminRole
} from "@/service/admin-dashboard/role";
import type {
  AdminRoleListParams,
  AdminRolePayload
} from "@/type/admin-management/adminDashboardRole";

type UpdateAdminRoleInput = {
  roleId: string;
  payload: AdminRolePayload;
};

export function useRoleManagementPage(params: AdminRoleListParams) {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ["admin-dashboard", "roles", params],
    queryFn: () => fetchAdminRoles(params)
  });

  const permissionsQuery = useQuery({
    queryKey: ["admin-dashboard", "permissions"],
    queryFn: fetchAdminPermissionCatalog
  });

  const createRoleMutation = useMutation({
    mutationKey: ["admin-dashboard", "roles", "create"],
    mutationFn: createAdminRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "roles"]
      });
    }
  });

  const updateRoleMutation = useMutation({
    mutationKey: ["admin-dashboard", "roles", "update"],
    mutationFn: ({ roleId, payload }: UpdateAdminRoleInput) =>
      updateAdminRole(roleId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "roles"]
      });
    }
  });

  const deleteRoleMutation = useMutation({
    mutationKey: ["admin-dashboard", "roles", "delete"],
    mutationFn: deleteAdminRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "roles"]
      });
    }
  });

  return {
    rolesQuery,
    permissionsQuery,
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation
  };
}
