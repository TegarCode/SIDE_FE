import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAdminKinerjaEkonomi,
  clearAdminKinerjaEkonomiStaging,
  createAdminKinerjaEkonomi,
  createAdminKinerjaEkonomiUpload,
  deleteAdminKinerjaEkonomi,
  deleteAdminKinerjaEkonomiCurrentRows,
  deleteAdminKinerjaEkonomiCurrentRow,
  deleteAdminKinerjaEkonomiRow,
  deleteAdminKinerjaEkonomiRows,
  fetchAdminKinerjaEkonomiCurrentList,
  fetchAdminKinerjaEkonomiDetail,
  fetchAdminKinerjaEkonomiList,
  fetchAdminKinerjaEkonomiOptions,
  publishAdminKinerjaEkonomi,
  rejectAdminKinerjaEkonomi,
  updateAdminKinerjaEkonomiCurrentRow,
  updateAdminKinerjaEkonomiRow,
  validateAdminKinerjaEkonomi,
  previewAdminKinerjaEkonomiUpload
} from "@/service/admin-dashboard/kinerja-ekonomi";
import type {
  KinerjaEkonomiCreatePayload,
  KinerjaEkonomiCurrentListParams,
  KinerjaEkonomiDetailParams,
  KinerjaEkonomiListParams,
  KinerjaEkonomiUpdateRowPayload
} from "@/type/admin-management/adminDashboardKinerjaEkonomi";

type UpdateRowInput = {
  batchId: string;
  rowId: string;
  payload: KinerjaEkonomiUpdateRowPayload;
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

function invalidateKinerjaEkonomi(
  queryClient: ReturnType<typeof useQueryClient>
) {
  return queryClient.invalidateQueries({
    queryKey: ["admin-dashboard", "kinerja-ekonomi"]
  });
}

export function useKinerjaEkonomiManagementPage(
  params: KinerjaEkonomiListParams,
  selectedBatchId?: string | null,
  detailParams: KinerjaEkonomiDetailParams = {},
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
    queryKey: ["admin-dashboard", "kinerja-ekonomi", params],
    queryFn: () => fetchAdminKinerjaEkonomiList(params),
    enabled: enableBatchesQuery,
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some((batch) => isBatchProcessing(batch.status))
        ? 5000
        : false;
    }
  });

  const optionsQuery = useQuery({
    queryKey: ["admin-dashboard", "kinerja-ekonomi", "options"],
    queryFn: fetchAdminKinerjaEkonomiOptions,
    enabled: enableOptionsQuery
  });

  const detailQuery = useQuery({
    queryKey: [
      "admin-dashboard",
      "kinerja-ekonomi",
      "detail",
      selectedBatchId,
      detailParams
    ],
    queryFn: () =>
      fetchAdminKinerjaEkonomiDetail(selectedBatchId as string, detailParams),
    enabled: enableDetailQuery && Boolean(selectedBatchId),
    refetchInterval: (query) =>
      isBatchProcessing(query.state.data?.data?.status) ? 5000 : false
  });

  const createMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "create"],
    mutationFn: (payload: KinerjaEkonomiCreatePayload) =>
      createAdminKinerjaEkonomi(payload),
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
  });

  const previewUploadMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "preview-upload"],
    mutationFn: (file: File) => previewAdminKinerjaEkonomiUpload(file)
  });

  const createUploadMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "create-upload"],
    mutationFn: (payload: FormData) => createAdminKinerjaEkonomiUpload(payload),
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
  });

  const updateRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "update-row"],
    mutationFn: ({ batchId, rowId, payload }: UpdateRowInput) =>
      updateAdminKinerjaEkonomiRow(batchId, rowId, payload),
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
  });

  const deleteRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "delete-row"],
    mutationFn: ({ batchId, rowId }: DeleteRowInput) =>
      deleteAdminKinerjaEkonomiRow(batchId, rowId),
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
  });

  const deleteRowsMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "delete-rows"],
    mutationFn: ({ batchId, rowIds }: DeleteRowsInput) =>
      deleteAdminKinerjaEkonomiRows(batchId, rowIds),
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
  });

  const clearStagingMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "clear-staging"],
    mutationFn: clearAdminKinerjaEkonomiStaging,
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
  });

  const validateMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "validate"],
    mutationFn: validateAdminKinerjaEkonomi,
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
  });

  const approveMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "approve"],
    mutationFn: approveAdminKinerjaEkonomi,
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
  });

  const publishMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "publish"],
    mutationFn: publishAdminKinerjaEkonomi,
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
  });

  const rejectMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "reject"],
    mutationFn: rejectAdminKinerjaEkonomi,
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
  });

  const deleteMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "delete"],
    mutationFn: deleteAdminKinerjaEkonomi,
    onSuccess: async () => invalidateKinerjaEkonomi(queryClient)
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

export function useKinerjaEkonomiCurrentDataPage(
  params: KinerjaEkonomiCurrentListParams,
  {
    enabled = true
  }: {
    enabled?: boolean;
  } = {}
) {
  const queryClient = useQueryClient();

  const currentDataQuery = useQuery({
    queryKey: ["admin-dashboard", "kinerja-ekonomi", "current", params],
    queryFn: () => fetchAdminKinerjaEkonomiCurrentList(params),
    enabled
  });

  const invalidateCurrentData = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin-dashboard", "kinerja-ekonomi", "current"]
    });

  const updateCurrentRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "current", "update"],
    mutationFn: ({
      rowId,
      payload
    }: {
      rowId: string;
      payload: KinerjaEkonomiUpdateRowPayload;
    }) => updateAdminKinerjaEkonomiCurrentRow(rowId, payload),
    onSuccess: async () => invalidateCurrentData()
  });

  const deleteCurrentRowMutation = useMutation({
    mutationKey: ["admin-dashboard", "kinerja-ekonomi", "current", "delete"],
    mutationFn: deleteAdminKinerjaEkonomiCurrentRow,
    onSuccess: async () => invalidateCurrentData()
  });

  const deleteCurrentRowsMutation = useMutation({
    mutationKey: [
      "admin-dashboard",
      "kinerja-ekonomi",
      "current",
      "bulk-delete"
    ],
    mutationFn: deleteAdminKinerjaEkonomiCurrentRows,
    onSuccess: async () => invalidateCurrentData()
  });

  return {
    currentDataQuery,
    updateCurrentRowMutation,
    deleteCurrentRowMutation,
    deleteCurrentRowsMutation
  };
}
