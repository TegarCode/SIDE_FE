import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAdminInvestment,
  clearAdminInvestmentStaging,
  createAdminInvestment,
  createAdminInvestmentUpload,
  deleteAdminInvestment,
  deleteAdminInvestmentCurrentRows,
  deleteAdminInvestmentCurrentRow,
  deleteAdminInvestmentRow,
  deleteAdminInvestmentRows,
  fetchAdminInvestmentCurrentList,
  fetchAdminInvestmentDetail,
  fetchAdminInvestmentList,
  fetchAdminInvestmentOptions,
  publishAdminInvestment,
  rejectAdminInvestment,
  updateAdminInvestmentCurrentRow,
  updateAdminInvestmentRow,
  validateAdminInvestment,
  previewAdminInvestmentUpload
} from "@/service/admin-dashboard/investment";
import type {
  InvestmentCreatePayload,
  InvestmentCurrentListParams,
  InvestmentDetailParams,
  InvestmentListParams,
  InvestmentUpdateRowPayload
} from "@/type/admin-management/adminDashboardInvestment";

type UpdateRowInput = {
  batchId: string;
  rowId: string;
  payload: InvestmentUpdateRowPayload;
};

type DeleteRowInput = {
  batchId: string;
  rowId: string;
};

type DeleteRowsInput = {
  batchId: string;
  rowIds: string[];
};

function isBatchProcessing(status?: string | null) {
  return status === "validating" || status === "publishing";
}

function invalidateInvestment(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: ["admin-dashboard", "investment"]
  });
}

export function useInvestmentManagementPage(
  params: InvestmentListParams,
  selectedBatchId?: string | null,
  detailParams: InvestmentDetailParams = {},
  {
    enableBatchesQuery = true,
    enableOptionsQuery = true,
    enableDetailQuery = true
  }: {
    enableBatchesQuery?: boolean;
    enableOptionsQuery?: boolean;
    enableDetailQuery?: boolean;
  } = {}
) {
  const queryClient = useQueryClient();

  const batchesQuery = useQuery({
    queryKey: ["admin-dashboard", "investment", params],
    queryFn: () => fetchAdminInvestmentList(params),
    enabled: enableBatchesQuery,
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some((batch) => isBatchProcessing(batch.status))
        ? 5000
        : false;
    }
  });

  const optionsQuery = useQuery({
    queryKey: ["admin-dashboard", "investment", "options"],
    queryFn: fetchAdminInvestmentOptions,
    enabled: enableOptionsQuery
  });

  const detailQuery = useQuery({
    queryKey: [
      "admin-dashboard",
      "investment",
      "detail",
      selectedBatchId,
      detailParams
    ],
    queryFn: () =>
      fetchAdminInvestmentDetail(selectedBatchId as string, detailParams),
    enabled: enableDetailQuery && Boolean(selectedBatchId),
    refetchInterval: (query) =>
      isBatchProcessing(query.state.data?.data?.status) ? 5000 : false
  });

  const createMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "create"],
    mutationFn: (payload: InvestmentCreatePayload) =>
      createAdminInvestment(payload),
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  const previewUploadMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "preview-upload"],
    mutationFn: (file: File) => previewAdminInvestmentUpload(file)
  });

  const createUploadMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "create-upload"],
    mutationFn: (payload: FormData) => createAdminInvestmentUpload(payload),
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  const updateRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "update-row"],
    mutationFn: ({ batchId, rowId, payload }: UpdateRowInput) =>
      updateAdminInvestmentRow(batchId, rowId, payload),
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  const deleteRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "delete-row"],
    mutationFn: ({ batchId, rowId }: DeleteRowInput) =>
      deleteAdminInvestmentRow(batchId, rowId),
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  const deleteRowsMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "delete-rows"],
    mutationFn: ({ batchId, rowIds }: DeleteRowsInput) =>
      deleteAdminInvestmentRows(batchId, rowIds),
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  const clearStagingMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "clear-staging"],
    mutationFn: clearAdminInvestmentStaging,
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  const validateMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "validate"],
    mutationFn: validateAdminInvestment,
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  const approveMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "approve"],
    mutationFn: approveAdminInvestment,
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  const publishMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "publish"],
    mutationFn: publishAdminInvestment,
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  const rejectMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "reject"],
    mutationFn: rejectAdminInvestment,
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  const deleteMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "delete"],
    mutationFn: deleteAdminInvestment,
    onSuccess: async () => invalidateInvestment(queryClient)
  });

  return {
    batchesQuery,
    optionsQuery,
    detailQuery,
    createMutation,
    previewUploadMutation,
    createUploadMutation,
    updateRowMutation,
    deleteRowMutation,
    deleteRowsMutation,
    clearStagingMutation,
    validateMutation,
    approveMutation,
    publishMutation,
    rejectMutation,
    deleteMutation
  };
}

export function useInvestmentCurrentDataPage(
  params: InvestmentCurrentListParams,
  {
    enabled = true
  }: {
    enabled?: boolean;
  } = {}
) {
  const queryClient = useQueryClient();

  const currentDataQuery = useQuery({
    queryKey: ["admin-dashboard", "investment", "current", params],
    queryFn: () => fetchAdminInvestmentCurrentList(params),
    enabled
  });

  const invalidateCurrentData = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin-dashboard", "investment", "current"]
    });

  const updateCurrentRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "current", "update"],
    mutationFn: ({
      rowId,
      payload
    }: {
      rowId: string;
      payload: InvestmentUpdateRowPayload;
    }) => updateAdminInvestmentCurrentRow(rowId, payload),
    onSuccess: async () => invalidateCurrentData()
  });

  const deleteCurrentRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "current", "delete"],
    mutationFn: deleteAdminInvestmentCurrentRow,
    onSuccess: async () => invalidateCurrentData()
  });

  const deleteCurrentRowsMutation = useMutation({
    mutationKey: ["admin-dashboard", "investment", "current", "bulk-delete"],
    mutationFn: deleteAdminInvestmentCurrentRows,
    onSuccess: async () => invalidateCurrentData()
  });

  return {
    currentDataQuery,
    updateCurrentRowMutation,
    deleteCurrentRowMutation,
    deleteCurrentRowsMutation
  };
}
