import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminContact,
  fetchAdminContactDetail,
  fetchAdminContacts,
  updateAdminContact
} from "@/service/admin-dashboard/contact";
import type {
  AdminContactListParams,
  AdminContactPayload
} from "@/type/admin-management/adminDashboardContact";

type UpdateAdminContactInput = {
  contactId: string;
  payload: AdminContactPayload;
};

export function useContactManagementPage(
  params: AdminContactListParams,
  selectedContactId?: string | null
) {
  const queryClient = useQueryClient();

  const contactsQuery = useQuery({
    queryKey: ["admin-dashboard", "contacts-management", params],
    queryFn: () => fetchAdminContacts(params)
  });

  const contactDetailQuery = useQuery({
    queryKey: [
      "admin-dashboard",
      "contacts-management",
      "detail",
      selectedContactId
    ],
    queryFn: () => fetchAdminContactDetail(selectedContactId as string),
    enabled: Boolean(selectedContactId)
  });

  const updateContactMutation = useMutation({
    mutationKey: ["admin-dashboard", "contacts-management", "update"],
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
    mutationKey: ["admin-dashboard", "contacts-management", "delete"],
    mutationFn: deleteAdminContact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "contacts-management"]
      });
    }
  });

  return {
    contactsQuery,
    contactDetailQuery,
    updateContactMutation,
    deleteContactMutation
  };
}
