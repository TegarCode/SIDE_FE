import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminFaq,
  deleteAdminFaq,
  fetchAdminFaqDetail,
  fetchAdminFaqs,
  updateAdminFaq
} from "@/service/admin-dashboard/faq";
import type {
  AdminFaqListParams,
  AdminFaqPayload
} from "@/type/admin-management/adminDashboardFaq";

type UpdateAdminFaqInput = {
  faqId: string;
  payload: AdminFaqPayload;
};

export function useFaqManagementPage(
  params: AdminFaqListParams,
  selectedFaqId?: string | null
) {
  const queryClient = useQueryClient();

  const faqsQuery = useQuery({
    queryKey: ["admin-dashboard", "faqs-management", params],
    queryFn: () => fetchAdminFaqs(params)
  });

  const faqDetailQuery = useQuery({
    queryKey: ["admin-dashboard", "faqs-management", "detail", selectedFaqId],
    queryFn: () => fetchAdminFaqDetail(selectedFaqId as string),
    enabled: Boolean(selectedFaqId)
  });

  const createFaqMutation = useMutation({
    mutationKey: ["admin-dashboard", "faqs-management", "create"],
    mutationFn: createAdminFaq,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "faqs-management"]
      });
    }
  });

  const updateFaqMutation = useMutation({
    mutationKey: ["admin-dashboard", "faqs-management", "update"],
    mutationFn: ({ faqId, payload }: UpdateAdminFaqInput) =>
      updateAdminFaq(faqId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "faqs-management"]
      });
    }
  });

  const deleteFaqMutation = useMutation({
    mutationKey: ["admin-dashboard", "faqs-management", "delete"],
    mutationFn: deleteAdminFaq,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "faqs-management"]
      });
    }
  });

  return {
    faqsQuery,
    faqDetailQuery,
    createFaqMutation,
    updateFaqMutation,
    deleteFaqMutation
  };
}
