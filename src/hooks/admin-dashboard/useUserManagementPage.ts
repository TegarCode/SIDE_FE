import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUserDetail,
  fetchAdminUserRoles,
  fetchAdminUsers,
  updateAdminUser
} from "@/service/admin-dashboard/user";
import type {
  AdminUserListParams,
  AdminUserPayload
} from "@/type/admin-management/adminDashboardUser";

type UpdateAdminUserInput = {
  userId: string;
  payload: AdminUserPayload;
};

export function useUserManagementPage(
  params: AdminUserListParams,
  selectedUserId?: string | null
) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin-dashboard", "users", params],
    queryFn: () => fetchAdminUsers(params)
  });

  const userDetailQuery = useQuery({
    queryKey: ["admin-dashboard", "users", "detail", selectedUserId],
    queryFn: () => fetchAdminUserDetail(selectedUserId as string),
    enabled: Boolean(selectedUserId)
  });

  const rolesQuery = useQuery({
    queryKey: ["admin-dashboard", "users", "roles"],
    queryFn: fetchAdminUserRoles
  });

  const createUserMutation = useMutation({
    mutationKey: ["admin-dashboard", "users", "create"],
    mutationFn: createAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "users"]
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationKey: ["admin-dashboard", "users", "update"],
    mutationFn: ({ userId, payload }: UpdateAdminUserInput) =>
      updateAdminUser(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "users"]
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationKey: ["admin-dashboard", "users", "delete"],
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "users"]
      });
    }
  });

  return {
    usersQuery,
    userDetailQuery,
    rolesQuery,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation
  };
}
