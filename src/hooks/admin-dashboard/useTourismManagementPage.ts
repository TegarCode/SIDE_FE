import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAdminTourism,
  clearAdminTourismStaging,
  createAdminTourism,
  createAdminTourismUpload,
  deleteAdminTourism,
  deleteAdminTourismCurrentRows,
  deleteAdminTourismCurrentRow,
  deleteAdminTourismRow,
  deleteAdminTourismRows,
  fetchAdminTourismCurrentList,
  fetchAdminTourismDetail,
  fetchAdminTourismList,
  fetchAdminTourismOptions,
  publishAdminTourism,
  rejectAdminTourism,
  updateAdminTourismCurrentRow,
  updateAdminTourismRow,
  validateAdminTourism,
  previewAdminTourismUpload
} from "@/service/admin-dashboard/tourism";
import type {
  TourismCreatePayload,
  TourismCurrentListParams,
  TourismDetailParams,
  TourismListParams,
  TourismUpdateRowPayload
} from "@/type/admin-management/adminDashboardTourism";

type UpdateRowInput = {
  batchId: string;
  rowId: string;
  payload: TourismUpdateRowPayload;
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

function invalidateTourism(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: ["admin-dashboard", "tourism"]
  });
}

export function useTourismManagementPage(
  params: TourismListParams,
  selectedBatchId?: string | null,
  detailParams: TourismDetailParams = {},
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
    queryKey: ["admin-dashboard", "tourism", params],
    queryFn: () => fetchAdminTourismList(params),
    enabled: enableBatchesQuery,
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some((batch) => isBatchProcessing(batch.status))
        ? 5000
        : false;
    }
  });

  const optionsQuery = useQuery({
    queryKey: ["admin-dashboard", "tourism", "options"],
    queryFn: fetchAdminTourismOptions,
    enabled: enableOptionsQuery
  });

  const detailQuery = useQuery({
    queryKey: [
      "admin-dashboard",
      "tourism",
      "detail",
      selectedBatchId,
      detailParams
    ],
    queryFn: () =>
      fetchAdminTourismDetail(selectedBatchId as string, detailParams),
    enabled: enableDetailQuery && Boolean(selectedBatchId),
    refetchInterval: (query) =>
      isBatchProcessing(query.state.data?.data?.status) ? 5000 : false
  });

  const createMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "create"],
    mutationFn: (payload: TourismCreatePayload) => createAdminTourism(payload),
    onSuccess: async () => invalidateTourism(queryClient)
  });

  const previewUploadMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "preview-upload"],
    mutationFn: (file: File) => previewAdminTourismUpload(file)
  });

  const createUploadMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "create-upload"],
    mutationFn: (payload: FormData) => createAdminTourismUpload(payload),
    onSuccess: async () => invalidateTourism(queryClient)
  });

  const updateRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "update-row"],
    mutationFn: ({ batchId, rowId, payload }: UpdateRowInput) =>
      updateAdminTourismRow(batchId, rowId, payload),
    onSuccess: async () => invalidateTourism(queryClient)
  });

  const deleteRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "delete-row"],
    mutationFn: ({ batchId, rowId }: DeleteRowInput) =>
      deleteAdminTourismRow(batchId, rowId),
    onSuccess: async () => invalidateTourism(queryClient)
  });

  const deleteRowsMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "delete-rows"],
    mutationFn: ({ batchId, rowIds }: DeleteRowsInput) =>
      deleteAdminTourismRows(batchId, rowIds),
    onSuccess: async () => invalidateTourism(queryClient)
  });

  const clearStagingMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "clear-staging"],
    mutationFn: clearAdminTourismStaging,
    onSuccess: async () => invalidateTourism(queryClient)
  });

  const validateMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "validate"],
    mutationFn: validateAdminTourism,
    onSuccess: async () => invalidateTourism(queryClient)
  });

  const approveMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "approve"],
    mutationFn: approveAdminTourism,
    onSuccess: async () => invalidateTourism(queryClient)
  });

  const publishMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "publish"],
    mutationFn: publishAdminTourism,
    onSuccess: async () => invalidateTourism(queryClient)
  });

  const rejectMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "reject"],
    mutationFn: rejectAdminTourism,
    onSuccess: async () => invalidateTourism(queryClient)
  });

  const deleteMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "delete"],
    mutationFn: deleteAdminTourism,
    onSuccess: async () => invalidateTourism(queryClient)
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

export function useTourismCurrentDataPage(
  params: TourismCurrentListParams,
  {
    enabled = true
  }: {
    enabled?: boolean;
  } = {}
) {
  const queryClient = useQueryClient();

  const currentDataQuery = useQuery({
    queryKey: ["admin-dashboard", "tourism", "current", params],
    queryFn: () => fetchAdminTourismCurrentList(params),
    enabled
  });

  const invalidateCurrentData = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin-dashboard", "tourism", "current"]
    });

  const updateCurrentRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "current", "update"],
    mutationFn: ({
      rowId,
      payload
    }: {
      rowId: string;
      payload: TourismUpdateRowPayload;
    }) => updateAdminTourismCurrentRow(rowId, payload),
    onSuccess: async () => invalidateCurrentData()
  });

  const deleteCurrentRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "current", "delete"],
    mutationFn: deleteAdminTourismCurrentRow,
    onSuccess: async () => invalidateCurrentData()
  });

  const deleteCurrentRowsMutation = useMutation({
    mutationKey: ["admin-dashboard", "tourism", "current", "bulk-delete"],
    mutationFn: deleteAdminTourismCurrentRows,
    onSuccess: async () => invalidateCurrentData()
  });

  return {
    currentDataQuery,
    updateCurrentRowMutation,
    deleteCurrentRowMutation,
    deleteCurrentRowsMutation
  };
}
