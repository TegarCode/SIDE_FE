import {
  ArrowPathIcon,
  CheckBadgeIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/constants/app";
import { PERMISSIONS } from "@/constants/permissions";
import { getAdminTradeDetailPath } from "@/constants/routes";
import {
  useTradeCurrentDataPage,
  useTradeManagementPage
} from "@/hooks/admin-dashboard/useTradeManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { fetchAdminTradeDetail } from "@/service/admin-dashboard/trade";
import { fetchAdminUsers } from "@/service/admin-dashboard/user";
import type {
  TradeBatchRecord,
  TradeCreatePayload
} from "@/type/admin-management/adminDashboardTrade";
import { getUserAccessFromStorage, hasAnyPermission } from "@/utils/access";
import { getApiErrorMessage } from "@/utils/apiFormError";
import { CurrentDataSection } from "./current-data-section";
import { ListSection } from "./list-section";
import { ManualInputSection } from "./manual-input-section";
import {
  autoMapHeaders,
  createManualRow,
  getWorkflowConfirmLabel,
  getWorkflowDescription,
  getWorkflowTitle,
  toPayloadRow,
  type ActiveTab,
  type ManualRow,
  type WorkflowAction
} from "./types";
import { UploadSection } from "./upload-section";

function isProcessingStatus(status: string) {
  return status === "validating" || status === "publishing";
}

function notifyBatchStatusToast(
  toast: ReturnType<typeof useToast>["toast"],
  batch: Pick<
    TradeBatchRecord,
    "id" | "status" | "sourceType" | "originalFilename"
  >
) {
  const isUploadBatch = batch.sourceType === "upload";
  const batchLabel = batch.originalFilename || batch.id;

  if (batch.status === "published") {
    toast({
      title: "Publikasi batch selesai",
      description: `Batch ${batchLabel} berhasil dipublikasikan.`,
      tone: "success"
    });
    return;
  }

  if (batch.status === "draft") {
    toast({
      title: isUploadBatch
        ? "Unggahan selesai diproses"
        : "Batch kembali ke draf",
      description: isUploadBatch
        ? `File ${batchLabel} sudah masuk ke staging dan siap ditinjau.`
        : `Batch ${batchLabel} kembali ke status draf.`,
      tone: "success"
    });
    return;
  }

  if (batch.status === "valid") {
    toast({
      title: isUploadBatch
        ? "Unggahan selesai diproses"
        : "Validasi batch selesai",
      description: isUploadBatch
        ? `File ${batchLabel} berhasil diproses dan siap ditinjau.`
        : `Batch ${batchLabel} sudah valid dan siap ditinjau.`,
      tone: "success"
    });
    return;
  }

  if (batch.status === "invalid") {
    toast({
      title: isUploadBatch
        ? "Unggahan selesai dengan temuan"
        : "Validasi selesai dengan temuan",
      description: isUploadBatch
        ? `File ${batchLabel} selesai diproses, tetapi ada baris yang tidak valid.`
        : `Batch ${batchLabel} memiliki baris yang tidak valid.`,
      tone: "error"
    });
    return;
  }

  if (batch.status === "failed") {
    toast({
      title: isUploadBatch ? "Unggahan gagal diproses" : "Proses batch gagal",
      description: isUploadBatch
        ? `File ${batchLabel} gagal diproses.`
        : `Batch ${batchLabel} gagal diproses.`,
      tone: "error"
    });
  }
}

export function AdminTradeManagementPage() {
  useDocumentTitle(`Manajemen Perdagangan | ${APP_NAME}`);

  const { toast } = useToast();
  const navigate = useNavigate();
  const accessUser = getUserAccessFromStorage();
  const canReadBatch = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_READ
  ]);
  const canReadCurrent = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_CURRENT_READ
  ]);
  const canCreate = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_CREATE
  ]);
  const canUpdate = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_UPDATE
  ]);
  const canCurrentUpdate = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_CURRENT_UPDATE
  ]);
  const canApprove = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_APPROVE
  ]);
  const canPublish = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_PUBLISH
  ]);
  const canDelete = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_DELETE
  ]);
  const canCurrentDelete = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_CURRENT_DELETE
  ]);

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (canReadBatch) return "list";
    if (canReadCurrent) return "current";
    if (canCreate) return "manual";
    return "list";
  });

  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("all");
  const [statusInput, setStatusInput] = useState("all");
  const [sourceType, setSourceType] = useState("all");
  const [sourceTypeInput, setSourceTypeInput] = useState("all");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("uploaded_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [currentReporterFilter, setCurrentReporterFilter] = useState("");
  const [currentPartnerFilter, setCurrentPartnerFilter] = useState("");
  const [currentSourceFilter, setCurrentSourceFilter] = useState("");
  const [currentStatusFilter, setCurrentStatusFilter] = useState("");
  const [currentSectorFilter, setCurrentSectorFilter] = useState("");
  const [currentYearFilter, setCurrentYearFilter] = useState("");
  const [currentHsLenFilter, setCurrentHsLenFilter] = useState("");
  const [currentReporterInput, setCurrentReporterInput] = useState("");
  const [currentPartnerInput, setCurrentPartnerInput] = useState("");
  const [currentSourceInput, setCurrentSourceInput] = useState("");
  const [currentStatusInput, setCurrentStatusInput] = useState("");
  const [currentSectorInput, setCurrentSectorInput] = useState("");
  const [currentYearInput, setCurrentYearInput] = useState("");
  const [currentHsLenInput, setCurrentHsLenInput] = useState("");
  const [currentLimit, setCurrentLimit] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSortBy, setCurrentSortBy] = useState("Tahun");
  const [currentSortDirection, setCurrentSortDirection] = useState<
    "asc" | "desc"
  >("desc");

  const [manualNote, setManualNote] = useState("");
  const [manualRows, setManualRows] = useState<ManualRow[]>([
    createManualRow()
  ]);
  const [uploadNote, setUploadNote] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFilename, setUploadFilename] = useState("");
  const [uploadHeaders, setUploadHeaders] = useState<string[]>([]);
  const [uploadRows, setUploadRows] = useState<Record<string, unknown>[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [workflowTarget, setWorkflowTarget] = useState<{
    action: WorkflowAction;
    batch: TradeBatchRecord;
  } | null>(null);
  const [trackedBatchIds, setTrackedBatchIds] = useState<string[]>([]);
  const knownBatchStatusRef = useRef<Record<string, string>>({});
  const hasTrackedBatchStatusRef = useRef(false);

  const {
    batchesQuery,
    optionsQuery,
    createMutation,
    previewUploadMutation,
    createUploadMutation,
    validateMutation,
    approveMutation,
    publishMutation,
    rejectMutation,
    deleteMutation
  } = useTradeManagementPage(
    {
      search: query,
      status,
      sourceType,
      page,
      perPage: Number(limit),
      sortBy,
      sortDirection
    },
    undefined,
    {},
    {
      enableBatchesQuery: canReadBatch,
      enableOptionsQuery: canReadBatch || canReadCurrent || canCreate
    }
  );

  const {
    currentDataQuery,
    updateCurrentRowMutation,
    deleteCurrentRowMutation,
    deleteCurrentRowsMutation
  } = useTradeCurrentDataPage(
    {
      reporterCode: currentReporterFilter || undefined,
      partnerCode: currentPartnerFilter || undefined,
      sourceCode: currentSourceFilter || undefined,
      status: currentStatusFilter || undefined,
      sectorId: currentSectorFilter || undefined,
      year: currentYearFilter || undefined,
      hsLen: currentHsLenFilter || undefined,
      page: currentPage,
      perPage: Number(currentLimit),
      sortBy: currentSortBy,
      sortDirection: currentSortDirection
    },
    { enabled: canReadCurrent }
  );

  const batches = useMemo(
    () => batchesQuery.data?.items ?? [],
    [batchesQuery.data]
  );
  const usersQuery = useQuery({
    queryKey: ["admin-dashboard", "users", "trade-lookup"],
    queryFn: () =>
      fetchAdminUsers({
        page: 1,
        perPage: 9999,
        sortBy: "name",
        sortDirection: "asc"
      }),
    enabled: canReadBatch,
    staleTime: 5 * 60 * 1000
  });

  const summary = batchesQuery.data?.summary;
  const totalPages = batchesQuery.data?.lastPage ?? 1;
  const batchCurrentPage = batchesQuery.data?.page ?? page;
  const currentRows = currentDataQuery.data?.items ?? [];
  const currentDataTotalPages = currentDataQuery.data?.lastPage ?? 1;
  const currentDataPage = currentDataQuery.data?.page ?? currentPage;
  const options = optionsQuery.data;
  const uploaderNameById = useMemo(
    () =>
      Object.fromEntries(
        (usersQuery.data?.items ?? []).map((user) => [user.id, user.name])
      ),
    [usersQuery.data?.items]
  );

  const countryOptions = useMemo(
    () =>
      (options?.countries ?? []).map((item) => ({
        value: item.value,
        label: item.label
      })),
    [options?.countries]
  );
  const sectorOptions = useMemo(
    () =>
      (options?.sectors ?? []).map((item) => ({
        value: item.value,
        label: item.label
      })),
    [options?.sectors]
  );
  const sourceOptions = useMemo(
    () =>
      (options?.sources ?? []).map((item) => ({
        value: item.value,
        label: item.label
      })),
    [options?.sources]
  );
  const tradeStatusOptions = useMemo(
    () => [
      { value: "", label: "Semua Status Arus" },
      ...(options?.statuses ?? []).map((item) => ({
        value: item.value,
        label: item.label
      }))
    ],
    [options?.statuses]
  );
  const hsLenOptions = useMemo(
    () =>
      (options?.hsLevels ?? []).map((item) => ({
        value: item.value,
        label: item.label
      })),
    [options?.hsLevels]
  );

  useEffect(() => {
    if (!canReadBatch || !batchesQuery.isError) return;
    toast({
      title: "Gagal memuat perdagangan",
      description: getApiErrorMessage(
        batchesQuery.error,
        "Daftar batch perdagangan tidak berhasil dimuat."
      ),
      tone: "error"
    });
  }, [batchesQuery.error, batchesQuery.isError, canReadBatch, toast]);

  useEffect(() => {
    if (!canReadCurrent || !currentDataQuery.isError) return;
    toast({
      title: "Gagal memuat data aktif",
      description: getApiErrorMessage(
        currentDataQuery.error,
        "Data aktif perdagangan tidak berhasil dimuat."
      ),
      tone: "error"
    });
  }, [canReadCurrent, currentDataQuery.error, currentDataQuery.isError, toast]);

  useEffect(() => {
    if (trackedBatchIds.length === 0) return;

    const intervalId = window.setInterval(() => {
      void Promise.all(
        trackedBatchIds.map(async (batchId) => {
          try {
            const result = await fetchAdminTradeDetail(batchId);
            const batch = result.data;

            if (
              batch.status === "publishing" ||
              batch.status === "validating"
            ) {
              return;
            }

            setTrackedBatchIds((current) =>
              current.filter((currentBatchId) => currentBatchId !== batchId)
            );
            void batchesQuery.refetch();
          } catch {
            return;
          }
        })
      );
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [batchesQuery, trackedBatchIds]);

  useEffect(() => {
    if (batchesQuery.isLoading || batches.length === 0) return;

    const nextStatusById = Object.fromEntries(
      batches.map((batch) => [batch.id, batch.status])
    );

    if (!hasTrackedBatchStatusRef.current) {
      knownBatchStatusRef.current = nextStatusById;
      hasTrackedBatchStatusRef.current = true;
      return;
    }

    batches.forEach((batch) => {
      const previousStatus = knownBatchStatusRef.current[batch.id];

      if (!previousStatus || previousStatus === batch.status) return;
      if (!isProcessingStatus(previousStatus)) return;
      notifyBatchStatusToast(toast, batch);
    });

    knownBatchStatusRef.current = nextStatusById;
  }, [batches, batchesQuery.isLoading, toast]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(searchInput.trim());
    setStatus(statusInput);
    setSourceType(sourceTypeInput);
    setPage(1);
  };

  const handleCurrentSearchSubmit = () => {
    setCurrentReporterFilter(currentReporterInput);
    setCurrentPartnerFilter(currentPartnerInput);
    setCurrentSourceFilter(currentSourceInput);
    setCurrentStatusFilter(currentStatusInput);
    setCurrentSectorFilter(currentSectorInput);
    setCurrentYearFilter(currentYearInput);
    setCurrentHsLenFilter(currentHsLenInput);
    setCurrentPage(1);
  };

  const handleCreate = async (payload: TradeCreatePayload) => {
    try {
      const result = await createMutation.mutateAsync(payload);
      toast({
        title: "Batch berhasil dibuat",
        description: result.message,
        tone: "success"
      });
      setActiveTab("list");
      setManualRows([createManualRow()]);
      setManualNote("");
      setUploadNote("");
      setUploadFile(null);
      setUploadFilename("");
      setUploadHeaders([]);
      setUploadRows([]);
      setFieldMapping({});
    } catch (error) {
      toast({
        title: "Gagal membuat batch",
        description: getApiErrorMessage(
          error,
          "Data perdagangan tidak berhasil disimpan."
        ),
        tone: "error"
      });
    }
  };

  const handleWorkflowConfirm = async () => {
    if (!workflowTarget) return;

    const { action, batch } = workflowTarget;
    try {
      if (action === "validate") await validateMutation.mutateAsync(batch.id);
      if (action === "approve") await approveMutation.mutateAsync(batch.id);
      if (action === "publish") await publishMutation.mutateAsync(batch.id);
      if (action === "reject") await rejectMutation.mutateAsync(batch.id);
      if (action === "delete") await deleteMutation.mutateAsync(batch.id);

      if (action === "validate" || action === "publish") {
        setTrackedBatchIds((current) =>
          current.includes(batch.id) ? current : [...current, batch.id]
        );
      }

      toast({
        title:
          action === "validate"
            ? "Validasi masuk antrean"
            : action === "publish"
              ? "Publikasi masuk antrean"
              : "Tindakan berhasil",
        description:
          action === "validate"
            ? "Batch sedang divalidasi di latar belakang."
            : action === "publish"
              ? "Batch sedang dipublikasikan di latar belakang."
              : "Batch berhasil diproses.",
        tone: "success"
      });
      setWorkflowTarget(null);
    } catch (error) {
      toast({
        title: "Tindakan gagal",
        description: getApiErrorMessage(
          error,
          "Batch tidak berhasil diproses."
        ),
        tone: "error"
      });
    }
  };

  const handleManualSubmit = () => {
    const rows = manualRows
      .map(toPayloadRow)
      .filter(
        (row) =>
          row.Kode_Alpha3_Reporter && row.Kode_Alpha3_Partner && row.HsCode
      );

    if (!rows.length) {
      toast({
        title: "Baris belum lengkap",
        description:
          "Isi minimal satu baris dengan kode reporter, kode partner, dan HS Code sebelum dikirim.",
        tone: "error"
      });
      return;
    }

    void handleCreate({
      source_type: "manual",
      note: manualNote.trim(),
      rows
    });
  };

  const handleUploadSubmit = () => {
    if (!uploadFile) {
      toast({
        title: "File belum dipilih",
        description:
          "Pilih file CSV/Excel dan lakukan pemetaan kolom terlebih dahulu.",
        tone: "error"
      });
      return;
    }

    const formData = new FormData();
    formData.append("source_type", "upload");
    formData.append("file", uploadFile);
    formData.append("original_filename", uploadFilename || uploadFile.name);
    formData.append("note", uploadNote.trim());
    Object.entries(fieldMapping).forEach(([target, source]) => {
      if (source) {
        formData.append(`column_mapping[${target}]`, source);
      }
    });

    void createUploadMutation
      .mutateAsync(formData)
      .then((result) => {
        if (result.data?.id) {
          setTrackedBatchIds((current) =>
            current.includes(result.data.id)
              ? current
              : [...current, result.data.id]
          );
        }
        toast({
          title: "Unggahan diterima",
          description: result.message,
          tone: "success"
        });
        setActiveTab("list");
        setUploadNote("");
        setUploadFile(null);
        setUploadFilename("");
        setUploadHeaders([]);
        setUploadRows([]);
        setFieldMapping({});
      })
      .catch((error) => {
        toast({
          title: "Gagal mengirim unggahan",
          description: getApiErrorMessage(
            error,
            "Berkas unggahan tidak berhasil dikirim ke backend."
          ),
          tone: "error"
        });
      });
  };

  const summaryCards = [
    {
      title: "Total Batch",
      value: summary?.totalBatch ?? batchesQuery.data?.total ?? 0,
      caption: "Seluruh batch input dan impor yang tercatat.",
      icon: DocumentMagnifyingGlassIcon
    },
    {
      title: "Menunggu Proses",
      value: summary?.pendingBatch ?? 0,
      caption: "Batch yang masih menunggu validasi atau review.",
      icon: ArrowPathIcon
    },
    {
      title: "Disetujui",
      value: summary?.approvedBatch ?? 0,
      caption: "Batch yang sudah disetujui dan siap publikasi.",
      icon: CheckBadgeIcon
    },
    {
      title: "Dipublikasi",
      value: summary?.publishedBatch ?? 0,
      caption: "Batch yang sudah dipublikasi ke `tbtrade`.",
      icon: DocumentCheckIcon
    },
    {
      title: "Tidak Valid",
      value: summary?.invalidBatch ?? 0,
      caption: "Batch dengan baris tidak valid yang perlu diperbaiki.",
      icon: XCircleIcon
    }
  ];

  const availableTabs = [
    ...(canReadBatch ? (["list"] as ActiveTab[]) : []),
    ...(canReadCurrent ? (["current"] as ActiveTab[]) : []),
    ...(canCreate ? (["manual", "upload"] as ActiveTab[]) : [])
  ];

  const tabLabels: Record<ActiveTab, string> = {
    list: "Daftar Batch",
    current: "Data Aktif",
    manual: "Input Manual",
    upload: "Pemetaan Unggahan"
  };

  return (
    <AdminManagementLayout
      title="Manajemen Perdagangan"
      description="Kelola batch input dan impor data perdagangan sampai publikasi."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Manajemen Data Perdagangan"
          description="Tinjau batch staging, validasi baris, persetujuan, publikasi, input manual, dan unggah berkas hasil pemetaan."
        />

        {canReadBatch ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map(({ title, value, caption, icon: Icon }) => (
              <Card key={title} className="rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                      {title}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-[#223B8F]">
                      {value}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {caption}
                    </p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-blue-50 text-[#223B8F] ring-1 ring-blue-100">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {availableTabs.map((tab) => (
            <Button
              key={tab}
              type="button"
              variant={activeTab === tab ? "primary" : "outline"}
              rounded="md"
              className="px-4 py-2 text-sm font-semibold capitalize"
              onClick={() => setActiveTab(tab)}
            >
              {tabLabels[tab]}
            </Button>
          ))}
        </div>

        {activeTab === "list" ? (
          <ListSection
            batches={batches}
            uploaderNameById={uploaderNameById}
            isLoading={batchesQuery.isLoading}
            isError={batchesQuery.isError}
            error={batchesQuery.error}
            page={batchCurrentPage}
            totalPages={totalPages}
            limit={limit}
            searchInput={searchInput}
            statusInput={statusInput}
            sourceTypeInput={sourceTypeInput}
            canUpdate={canUpdate}
            canApprove={canApprove}
            canPublish={canPublish}
            canDelete={canDelete}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
            onSearchInputChange={setSearchInput}
            onStatusInputChange={setStatusInput}
            onSourceTypeInputChange={setSourceTypeInput}
            onSearchSubmit={handleSearchSubmit}
            onPageChange={(nextPage) =>
              setPage(Math.min(Math.max(nextPage, 1), totalPages))
            }
            onSortChange={(nextSortBy, nextSortDirection) => {
              setSortBy(nextSortBy);
              setSortDirection(nextSortDirection);
              setPage(1);
            }}
            onRefetch={() => void batchesQuery.refetch()}
            onSelectBatch={(batchId) =>
              navigate(getAdminTradeDetailPath(batchId))
            }
            onWorkflow={(action, batch) => setWorkflowTarget({ action, batch })}
          />
        ) : null}

        {activeTab === "current" ? (
          <CurrentDataSection
            rows={currentRows}
            isLoading={currentDataQuery.isLoading}
            isError={currentDataQuery.isError}
            error={currentDataQuery.error}
            page={currentDataPage}
            totalPages={currentDataTotalPages}
            limit={currentLimit}
            reporterInput={currentReporterInput}
            partnerInput={currentPartnerInput}
            sourceInput={currentSourceInput}
            statusInput={currentStatusInput}
            sectorInput={currentSectorInput}
            yearInput={currentYearInput}
            hsLenInput={currentHsLenInput}
            sortBy={currentSortBy}
            sortDirection={currentSortDirection}
            canUpdate={canCurrentUpdate}
            canDelete={canCurrentDelete}
            countryOptions={countryOptions}
            sectorOptions={sectorOptions}
            sourceOptions={sourceOptions}
            tradeStatusOptions={tradeStatusOptions}
            hsLenOptions={hsLenOptions}
            updateLoading={updateCurrentRowMutation.isPending}
            deleteLoading={deleteCurrentRowMutation.isPending}
            bulkDeleteLoading={deleteCurrentRowsMutation.isPending}
            onSearchSubmit={handleCurrentSearchSubmit}
            onLimitChange={(nextLimit) => {
              setCurrentLimit(nextLimit);
              setCurrentPage(1);
            }}
            onReporterInputChange={setCurrentReporterInput}
            onPartnerInputChange={setCurrentPartnerInput}
            onSourceInputChange={setCurrentSourceInput}
            onStatusInputChange={setCurrentStatusInput}
            onSectorInputChange={setCurrentSectorInput}
            onYearInputChange={setCurrentYearInput}
            onHsLenInputChange={setCurrentHsLenInput}
            onPageChange={(nextPage) =>
              setCurrentPage(
                Math.min(Math.max(nextPage, 1), currentDataTotalPages)
              )
            }
            onTableSortChange={(nextSortBy, nextSortDirection) => {
              setCurrentSortBy(nextSortBy);
              setCurrentSortDirection(nextSortDirection);
              setCurrentPage(1);
            }}
            onRefetch={() => void currentDataQuery.refetch()}
            onUpdateRow={async (row, payload) => {
              try {
                await updateCurrentRowMutation.mutateAsync({
                  rowId: row.id,
                  payload
                });
                toast({
                  title: "Data aktif berhasil diperbarui",
                  description:
                    "Perubahan pada data aktif perdagangan telah disimpan.",
                  tone: "success"
                });
              } catch (error) {
                toast({
                  title: "Gagal memperbarui data aktif",
                  description: getApiErrorMessage(
                    error,
                    "Data aktif perdagangan tidak berhasil disimpan."
                  ),
                  tone: "error"
                });
                throw error;
              }
            }}
            onDeleteRow={async (row) => {
              try {
                await deleteCurrentRowMutation.mutateAsync(row.id);
                if (currentRows.length === 1 && currentPage > 1) {
                  setCurrentPage((pageValue) => Math.max(1, pageValue - 1));
                }
                toast({
                  title: "Data aktif berhasil dihapus",
                  description: "Baris data aktif perdagangan telah dihapus.",
                  tone: "success"
                });
              } catch (error) {
                toast({
                  title: "Gagal menghapus data aktif",
                  description: getApiErrorMessage(
                    error,
                    "Data aktif perdagangan tidak berhasil dihapus."
                  ),
                  tone: "error"
                });
                throw error;
              }
            }}
            onDeleteRows={async (rows) => {
              try {
                await deleteCurrentRowsMutation.mutateAsync(
                  rows.map((row) => row.id)
                );
                if (rows.length === currentRows.length && currentPage > 1) {
                  setCurrentPage((pageValue) => Math.max(1, pageValue - 1));
                }
                toast({
                  title: "Data aktif berhasil dihapus",
                  description: `${rows.length} baris data aktif perdagangan telah dihapus.`,
                  tone: "success"
                });
              } catch (error) {
                toast({
                  title: "Gagal menghapus data aktif",
                  description: getApiErrorMessage(
                    error,
                    "Data aktif perdagangan tidak berhasil dihapus."
                  ),
                  tone: "error"
                });
                throw error;
              }
            }}
          />
        ) : null}

        {activeTab === "manual" ? (
          <ManualInputSection
            note={manualNote}
            rows={manualRows}
            countryOptions={countryOptions}
            sectorOptions={sectorOptions}
            sourceOptions={sourceOptions}
            statusOptions={tradeStatusOptions.filter((item) => item.value)}
            hsLenOptions={hsLenOptions}
            loading={createMutation.isPending || optionsQuery.isLoading}
            onNoteChange={setManualNote}
            onRowsChange={setManualRows}
            onSubmit={handleManualSubmit}
          />
        ) : null}

        {activeTab === "upload" ? (
          <UploadSection
            note={uploadNote}
            filename={uploadFilename}
            headers={uploadHeaders}
            rows={uploadRows}
            mapping={fieldMapping}
            countryOptions={countryOptions}
            sectorOptions={sectorOptions}
            sourceOptions={sourceOptions}
            statusOptions={tradeStatusOptions.filter((item) => item.value)}
            hsLenOptions={hsLenOptions}
            loading={createUploadMutation.isPending}
            previewLoading={previewUploadMutation.isPending}
            onNoteChange={setUploadNote}
            onFileSelected={async (file) => {
              setUploadFile(file);
              setUploadFilename(file.name);
              try {
                const preview = await previewUploadMutation.mutateAsync(file);
                setUploadFilename(preview.originalFilename || file.name);
                setUploadHeaders(preview.headers);
                setUploadRows(preview.sampleRows);
                setFieldMapping(autoMapHeaders(preview.headers));
              } catch (error) {
                setUploadHeaders([]);
                setUploadRows([]);
                setFieldMapping({});
                toast({
                  title: "Gagal membaca pratinjau",
                  description: getApiErrorMessage(
                    error,
                    "Pratinjau berkas tidak berhasil dibuat oleh backend."
                  ),
                  tone: "error"
                });
              }
            }}
            onMappingChange={setFieldMapping}
            onSubmit={handleUploadSubmit}
          />
        ) : null}

        <ConfirmationModal
          open={Boolean(workflowTarget)}
          title={getWorkflowTitle(workflowTarget?.action)}
          description={getWorkflowDescription(workflowTarget)}
          confirmLabel={getWorkflowConfirmLabel(workflowTarget?.action)}
          confirmTone={
            workflowTarget?.action === "delete" ||
            workflowTarget?.action === "reject"
              ? "danger"
              : "primary"
          }
          loading={
            validateMutation.isPending ||
            approveMutation.isPending ||
            publishMutation.isPending ||
            rejectMutation.isPending ||
            deleteMutation.isPending
          }
          onClose={() => setWorkflowTarget(null)}
          onConfirm={handleWorkflowConfirm}
        />
      </div>
    </AdminManagementLayout>
  );
}
