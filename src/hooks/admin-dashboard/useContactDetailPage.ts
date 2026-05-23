import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminContact,
  fetchAdminContactDetail,
  updateAdminContact
} from "@/service/admin-dashboard/contact";
import type { AdminContactPayload } from "@/type/admin-management/adminDashboardContact";

type UpdateAdminContactInput = {
  contactId: string;
  payload: AdminContactPayload;
};

export function useContactDetailPage(contactId?: string | null) {
  const queryClient = useQueryClient();

  const contactDetailQuery = useQuery({
    queryKey: ["admin-dashboard", "contacts-management", "detail", contactId],
    queryFn: () => fetchAdminContactDetail(contactId as string),
    enabled: Boolean(contactId)
  });

  const updateContactMutation = useMutation({
    mutationKey: ["admin-dashboard", "contacts-management", "detail-update"],
    mutationFn: ({ contactId, payload }: UpdateAdminContactInput) =>
      updateAdminContact(contactId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "contacts-management"]
      });
      await queryClient.invalidateQueries({
        queryKey: [
          "admin-dashboard",
          "contacts-management",
          "detail",
          variables.contactId
        ]
      });
    }
  });

  const deleteContactMutation = useMutation({
    mutationKey: ["admin-dashboard", "contacts-management", "detail-delete"],
    mutationFn: deleteAdminContact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "contacts-management"]
      });
    }
  });

  return {
    contactDetailQuery,
    updateContactMutation,
    deleteContactMutation
  };
}
