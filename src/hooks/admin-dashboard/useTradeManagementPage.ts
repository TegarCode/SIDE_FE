import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAdminTrade,
  clearAdminTradeStaging,
  createAdminTrade,
  createAdminTradeUpload,
  deleteAdminTrade,
  deleteAdminTradeCurrentRows,
  deleteAdminTradeCurrentRow,
  deleteAdminTradeRow,
  deleteAdminTradeRows,
  fetchAdminTradeCurrentList,
  fetchAdminTradeDetail,
  fetchAdminTradeList,
  fetchAdminTradeOptions,
  publishAdminTrade,
  rejectAdminTrade,
  updateAdminTradeCurrentRow,
  updateAdminTradeRow,
  validateAdminTrade,
  previewAdminTradeUpload
} from "@/service/admin-dashboard/trade";
import type {
  TradeCreatePayload,
  TradeCurrentListParams,
  TradeDetailParams,
  TradeListParams,
  TradeUpdateRowPayload
} from "@/type/admin-management/adminDashboardTrade";

type UpdateRowInput = {
  batchId: string;
  rowId: string;
  payload: TradeUpdateRowPayload;
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

function invalidateTrade(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: ["admin-dashboard", "trade"]
  });
}

export function useTradeManagementPage(
  params: TradeListParams,
  selectedBatchId?: string | null,
  detailParams: TradeDetailParams = {},
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
    queryKey: ["admin-dashboard", "trade", params],
    queryFn: () => fetchAdminTradeList(params),
    enabled: enableBatchesQuery,
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some((batch) => isBatchProcessing(batch.status))
        ? 5000
        : false;
    }
  });

  const optionsQuery = useQuery({
    queryKey: ["admin-dashboard", "trade", "options"],
    queryFn: fetchAdminTradeOptions,
    enabled: enableOptionsQuery
  });

  const detailQuery = useQuery({
    queryKey: [
      "admin-dashboard",
      "trade",
      "detail",
      selectedBatchId,
      detailParams
    ],
    queryFn: () =>
      fetchAdminTradeDetail(selectedBatchId as string, detailParams),
    enabled: enableDetailQuery && Boolean(selectedBatchId),
    refetchInterval: (query) =>
      isBatchProcessing(query.state.data?.data?.status) ? 5000 : false
  });

  const createMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "create"],
    mutationFn: (payload: TradeCreatePayload) => createAdminTrade(payload),
    onSuccess: async () => invalidateTrade(queryClient)
  });

  const previewUploadMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "preview-upload"],
    mutationFn: (file: File) => previewAdminTradeUpload(file)
  });

  const createUploadMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "create-upload"],
    mutationFn: (payload: FormData) => createAdminTradeUpload(payload),
    onSuccess: async () => invalidateTrade(queryClient)
  });

  const updateRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "update-row"],
    mutationFn: ({ batchId, rowId, payload }: UpdateRowInput) =>
      updateAdminTradeRow(batchId, rowId, payload),
    onSuccess: async () => invalidateTrade(queryClient)
  });

  const deleteRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "delete-row"],
    mutationFn: ({ batchId, rowId }: DeleteRowInput) =>
      deleteAdminTradeRow(batchId, rowId),
    onSuccess: async () => invalidateTrade(queryClient)
  });

  const deleteRowsMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "delete-rows"],
    mutationFn: ({ batchId, rowIds }: DeleteRowsInput) =>
      deleteAdminTradeRows(batchId, rowIds),
    onSuccess: async () => invalidateTrade(queryClient)
  });

  const clearStagingMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "clear-staging"],
    mutationFn: clearAdminTradeStaging,
    onSuccess: async () => invalidateTrade(queryClient)
  });

  const validateMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "validate"],
    mutationFn: validateAdminTrade,
    onSuccess: async () => invalidateTrade(queryClient)
  });

  const approveMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "approve"],
    mutationFn: approveAdminTrade,
    onSuccess: async () => invalidateTrade(queryClient)
  });

  const publishMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "publish"],
    mutationFn: publishAdminTrade,
    onSuccess: async () => invalidateTrade(queryClient)
  });

  const rejectMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "reject"],
    mutationFn: rejectAdminTrade,
    onSuccess: async () => invalidateTrade(queryClient)
  });

  const deleteMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "delete"],
    mutationFn: deleteAdminTrade,
    onSuccess: async () => invalidateTrade(queryClient)
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

export function useTradeCurrentDataPage(
  params: TradeCurrentListParams,
  {
    enabled = true
  }: {
    enabled?: boolean;
  } = {}
) {
  const queryClient = useQueryClient();

  const currentDataQuery = useQuery({
    queryKey: ["admin-dashboard", "trade", "current", params],
    queryFn: () => fetchAdminTradeCurrentList(params),
    enabled
  });

  const invalidateCurrentData = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin-dashboard", "trade", "current"]
    });

  const updateCurrentRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "current", "update"],
    mutationFn: ({
      rowId,
      payload
    }: {
      rowId: string;
      payload: TradeUpdateRowPayload;
    }) => updateAdminTradeCurrentRow(rowId, payload),
    onSuccess: async () => invalidateCurrentData()
  });

  const deleteCurrentRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "current", "delete"],
    mutationFn: deleteAdminTradeCurrentRow,
    onSuccess: async () => invalidateCurrentData()
  });

  const deleteCurrentRowsMutation = useMutation({
    mutationKey: ["admin-dashboard", "trade", "current", "bulk-delete"],
    mutationFn: deleteAdminTradeCurrentRows,
    onSuccess: async () => invalidateCurrentData()
  });

  return {
    currentDataQuery,
    updateCurrentRowMutation,
    deleteCurrentRowMutation,
    deleteCurrentRowsMutation
  };
}
