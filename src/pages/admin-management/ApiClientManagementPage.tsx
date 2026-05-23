import {
  ArrowPathIcon,
  CheckCircleIcon,
  EyeIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  ServerStackIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiClientFormModal,
  ApiClientRegenerateKeyModal,
  ApiClientSuccessModal
} from "@/components/admin-dashboard/api-client-management/ApiClientFormModal";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Pagination } from "@/components/ui/Pagination";
import { PageTitle } from "@/components/ui/PageTitle";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/constants/app";
import { useApiClientManagementPage } from "@/hooks/admin-dashboard/useApiClientManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  AdminApiClientFormValues,
  AdminApiClientRegenerateFormValues,
  AdminApiClientRecord,
  AdminApiClientSortDirection,
  AdminApiClientSortField
} from "@/type/admin-management/adminDashboardApiClient";
import type { GroupedFilterOptionGroup } from "@/type/komoditasUtama";
import { getApiErrorMessage } from "@/utils/apiFormError";

const ACTIVE_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "true", label: "Aktif" },
  { value: "false", label: "Nonaktif" }
] as const;

export function AdminApiClientManagementPage() {
  useDocumentTitle(`Manajemen API Client | ${APP_NAME}`);

  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [activeFilterInput, setActiveFilterInput] = useState<
    "all" | "true" | "false"
  >("all");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AdminApiClientSortField>("updated_at");
  const [sortDirection, setSortDirection] =
    useState<AdminApiClientSortDirection>("desc");
  const [tableSortKey, setTableSortKey] = useState("updatedAt");
  const [tableSortDirection, setTableSortDirection] =
    useState<AdminApiClientSortDirection>("desc");
  const [modalMode, setModalMode] = useState<"create" | "update" | "detail">(
    "create"
  );
  const [selectedApiClient, setSelectedApiClient] =
    useState<AdminApiClientRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetApiClient, setDeleteTargetApiClient] =
    useState<AdminApiClientRecord | null>(null);
  const [regenerateTargetApiClient, setRegenerateTargetApiClient] =
    useState<AdminApiClientRecord | null>(null);
  const [successApiKey, setSuccessApiKey] = useState<{
    clientName: string;
    apiKey: string | null;
    notice: string | null;
  } | null>(null);

  const {
    apiClientsQuery,
    apiClientDetailQuery,
    permissionsQuery,
    createApiClientMutation,
    updateApiClientMutation,
    deleteApiClientMutation,
    regenerateApiClientKeyMutation
  } = useApiClientManagementPage(
    {
      search: query,
      page,
      perPage: limit === "ALL" ? 9999 : Number(limit),
      active: activeFilter,
      sortBy,
      sortDirection
    },
    modalOpen && modalMode !== "create" ? selectedApiClient?.id : null
  );

  const apiClients = useMemo(
    () => apiClientsQuery.data?.items ?? [],
    [apiClientsQuery.data]
  );
  const activeApiClient =
    modalMode === "create"
      ? null
      : (apiClientDetailQuery.data?.data ?? selectedApiClient);
  const summary = apiClientsQuery.data?.summary;
  const totalApiClients = apiClientsQuery.data?.total ?? 0;
  const totalPages = apiClientsQuery.data?.lastPage ?? 1;
  const currentPage = apiClientsQuery.data?.page ?? page;

  useEffect(() => {
    if (!apiClientsQuery.isError) return;

    toast({
      title: "Gagal memuat API client",
      description: getApiErrorMessage(
        apiClientsQuery.error,
        "Daftar API client tidak berhasil dimuat."
      ),
      tone: "error"
    });
  }, [apiClientsQuery.error, apiClientsQuery.isError, toast]);

  const abilityGroups = useMemo<GroupedFilterOptionGroup[]>(() => {
    const groupedMap = new Map<string, GroupedFilterOptionGroup>();
    const sourceItems = permissionsQuery.data?.items ?? [];

    sourceItems.forEach((permission) => {
      const category = permission.category || "Lainnya";
      if (!groupedMap.has(category)) {
        groupedMap.set(category, {
          label: category,
          optionCount: 0,
          options: []
        });
      }

      const group = groupedMap.get(category);
      if (!group) return;

      group.options.push({
        value: permission.name,
        label: permission.name,
        code: permission.name,
        description: permission.description || permission.name,
        groupLabel: category
      });
      group.optionCount = group.options.length;
    });

    if (
      !Array.from(groupedMap.values()).some((group) =>
        group.options.some((option) => option.value === "*")
      )
    ) {
      groupedMap.set("Akses Penuh", {
        label: "Akses Penuh",
        optionCount: 1,
        options: [
          {
            value: "*",
            label: "*",
            code: "*",
            description:
              "Akses penuh ke seluruh endpoint yang diizinkan backend",
            groupLabel: "Akses Penuh"
          }
        ]
      });
    }

    const selectedAbilities = new Set(activeApiClient?.abilities ?? []);
    selectedAbilities.forEach((ability) => {
      const exists = Array.from(groupedMap.values()).some((group) =>
        group.options.some((option) => option.value === ability)
      );

      if (!exists) {
        const fallbackLabel = "Ability Tersimpan";
        if (!groupedMap.has(fallbackLabel)) {
          groupedMap.set(fallbackLabel, {
            label: fallbackLabel,
            optionCount: 0,
            options: []
          });
        }

        const group = groupedMap.get(fallbackLabel);
        if (!group) return;

        group.options.push({
          value: ability,
          label: ability,
          code: ability,
          description: ability,
          groupLabel: fallbackLabel
        });
        group.optionCount = group.options.length;
      }
    });

    return Array.from(groupedMap.values()).sort((left, right) =>
      left.label.localeCompare(right.label, "id")
    );
  }, [activeApiClient?.abilities, permissionsQuery.data]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Total API Client",
        value: String(summary?.totalClient ?? totalApiClients),
        caption:
          "Total API client yang saat ini tercatat pada Admin Dashboard.",
        icon: ServerStackIcon
      },
      {
        title: "Client Aktif",
        value: String(summary?.activeClientCount ?? 0),
        caption: "Jumlah API client yang masih aktif dan dapat digunakan.",
        icon: CheckCircleIcon
      },
      {
        title: "Client Terbaru",
        value: summary?.latestClient?.name ?? "-",
        caption:
          summary?.latestClient?.description ||
          "Belum ada API client terbaru dari backend.",
        icon: KeyIcon
      }
    ],
    [summary, totalApiClients]
  );

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedApiClient(null);
    setModalOpen(true);
  };

  const handleOpenUpdate = (apiClient: AdminApiClientRecord) => {
    setModalMode("update");
    setSelectedApiClient(apiClient);
    setModalOpen(true);
  };

  const handleOpenDetail = (apiClient: AdminApiClientRecord) => {
    setModalMode("detail");
    setSelectedApiClient(apiClient);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (
      createApiClientMutation.isPending ||
      updateApiClientMutation.isPending
    ) {
      return;
    }

    setModalOpen(false);
    setSelectedApiClient(null);
  };

  const handleDeleteApiClient = useCallback(
    async (apiClient: AdminApiClientRecord) => {
      try {
        await deleteApiClientMutation.mutateAsync(apiClient.id);
        toast({
          title: "API client berhasil dihapus",
          description: `API client ${apiClient.name} telah dihapus.`,
          tone: "success"
        });
        setDeleteTargetApiClient(null);
      } catch (error) {
        toast({
          title: "Gagal menghapus API client",
          description: getApiErrorMessage(
            error,
            "API client tidak berhasil dihapus."
          ),
          tone: "error"
        });
      }
    },
    [deleteApiClientMutation, toast]
  );

  const handleSubmit = async (values: AdminApiClientFormValues) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      abilities: values.abilities,
      allowed_domains: values.allowedDomains
        .map((item) => item.trim())
        .filter(Boolean),
      active: values.active
    };

    try {
      if (modalMode === "create") {
        const result = await createApiClientMutation.mutateAsync(payload);
        toast({
          title: "API client berhasil ditambahkan",
          description: result.message,
          tone: "success"
        });
        setSuccessApiKey({
          clientName: result.data.name,
          apiKey: result.plainTextApiKey,
          notice: result.apiKeyNotice
        });
      } else if (selectedApiClient) {
        const result = await updateApiClientMutation.mutateAsync({
          apiClientId: selectedApiClient.id,
          payload
        });
        toast({
          title: "API client berhasil diperbarui",
          description: result.message,
          tone: "success"
        });
      }

      handleCloseModal();
    } catch (error) {
      toast({
        title: "Gagal menyimpan API client",
        description: getApiErrorMessage(
          error,
          "Perubahan API client tidak berhasil disimpan."
        ),
        tone: "error"
      });
      throw error;
    }
  };

  const handleRegenerateSubmit = async (
    values: AdminApiClientRegenerateFormValues
  ) => {
    if (!regenerateTargetApiClient) return;

    try {
      const result = await regenerateApiClientKeyMutation.mutateAsync({
        apiClientId: regenerateTargetApiClient.id,
        payload: {
          current_password: values.currentPassword
        }
      });

      toast({
        title: "API key berhasil diperbarui",
        description: result.message,
        tone: "success"
      });
      setRegenerateTargetApiClient(null);
      setSuccessApiKey({
        clientName: result.data.name,
        apiKey: result.plainTextApiKey,
        notice: result.apiKeyNotice
      });
    } catch (error) {
      toast({
        title: "Gagal regenerate API key",
        description: getApiErrorMessage(
          error,
          "API key baru tidak berhasil diterbitkan."
        ),
        tone: "error"
      });
      throw error;
    }
  };

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(Math.min(Math.max(nextPage, 1), totalPages));
    },
    [totalPages]
  );

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setQuery(searchInput.trim());
      setActiveFilter(
        activeFilterInput === "all"
          ? undefined
          : activeFilterInput === "true"
            ? true
            : false
      );
      setPage(1);
    },
    [activeFilterInput, searchInput]
  );

  const handleSortChange = useCallback(
    (sortKey: string, direction: "asc" | "desc") => {
      const nextSortBy = mapTableSortKeyToBackend(sortKey);
      if (!nextSortBy) return;

      setTableSortKey(sortKey);
      setTableSortDirection(direction);
      setSortBy(nextSortBy);
      setSortDirection(direction);
      setPage(1);
    },
    []
  );

  const tableColumns = [
    { key: "name", label: "Nama", className: "min-w-48" },
    {
      key: "description",
      label: "Deskripsi",
      className: "min-w-64",
      sortable: false
    },
    {
      key: "abilities",
      label: "Abilities",
      className: "min-w-56",
      sortable: false
    },
    {
      key: "allowedDomains",
      label: "Domain Diizinkan",
      className: "min-w-56",
      sortable: false
    },
    {
      key: "active",
      label: "Status",
      className: "min-w-28",
      headerClassName: "text-center",
      align: "center" as const
    },
    { key: "updatedAt", label: "Terakhir Diubah", className: "min-w-40" },
    {
      key: "actions",
      label: "Aksi",
      className: "min-w-[420px]",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    }
  ];

  const tableRows = useMemo(
    () =>
      apiClients.map((apiClient) => ({
        name: {
          display: (
            <div className="min-w-0 font-semibold text-slate-900">
              {apiClient.name}
            </div>
          ),
          sortValue: apiClient.name
        },
        description: {
          display: (
            <div className="max-w-xl break-words text-sm leading-relaxed text-slate-600">
              <span className="line-clamp-3">
                {apiClient.description || "-"}
              </span>
            </div>
          ),
          sortValue: apiClient.description
        },
        abilities: {
          display: (
            <div className="flex max-w-md flex-wrap gap-1.5">
              {apiClient.abilities.length > 0 ? (
                <>
                  {apiClient.abilities.slice(0, 2).map((ability) => (
                    <span
                      key={`${apiClient.id}-${ability}`}
                      className="inline-flex rounded-md bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-[#223B8F] ring-1 ring-blue-100"
                      title={ability}
                    >
                      <span className="max-w-[180px] truncate">{ability}</span>
                    </span>
                  ))}
                  {apiClient.abilities.length > 2 ? (
                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                      +{apiClient.abilities.length - 2} lainnya
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-xs text-slate-400">-</span>
              )}
            </div>
          ),
          sortValue: apiClient.abilities.join(", ")
        },
        allowedDomains: {
          display: (
            <div className="space-y-1">
              {apiClient.allowedDomains.length > 0 ? (
                <>
                  {apiClient.allowedDomains.slice(0, 2).map((domain) => (
                    <div
                      key={`${apiClient.id}-${domain}`}
                      className="max-w-md truncate text-xs text-slate-600"
                      title={domain}
                    >
                      {domain}
                    </div>
                  ))}
                  {apiClient.allowedDomains.length > 2 ? (
                    <div className="text-[11px] font-medium text-slate-500">
                      +{apiClient.allowedDomains.length - 2} domain lainnya
                    </div>
                  ) : null}
                </>
              ) : (
                <span className="text-xs text-slate-400">Tanpa pembatasan</span>
              )}
            </div>
          ),
          sortValue: apiClient.allowedDomains.join(", ")
        },
        active: {
          display: (
            <span
              className={
                apiClient.active
                  ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                  : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
              }
            >
              {apiClient.active ? "Aktif" : "Nonaktif"}
            </span>
          ),
          sortValue: apiClient.active ? "Aktif" : "Nonaktif"
        },
        updatedAt: {
          display: (
            <div className="text-xs leading-relaxed text-slate-600">
              {formatDateTime(apiClient.updatedAt)}
            </div>
          ),
          sortValue: apiClient.updatedAt
        },
        actions: {
          display: (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                rounded="md"
                className="gap-1.5 px-3 py-2 text-xs font-semibold"
                onClick={() => handleOpenDetail(apiClient)}
              >
                <EyeIcon className="h-3.5 w-3.5" />
                Detail
              </Button>
              <Button
                type="button"
                variant="primary"
                rounded="md"
                className="gap-1.5 px-3 py-2 text-xs font-semibold"
                onClick={() => handleOpenUpdate(apiClient)}
              >
                <PencilSquareIcon className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                variant="warning"
                rounded="md"
                className="gap-1.5 px-3 py-2 text-xs font-semibold"
                onClick={() => setRegenerateTargetApiClient(apiClient)}
                disabled={regenerateApiClientKeyMutation.isPending}
              >
                <ArrowPathIcon className="h-3.5 w-3.5" />
                Regenerate Key
              </Button>
              <Button
                type="button"
                variant="danger"
                rounded="md"
                className="gap-1.5 px-3 py-2 text-xs font-semibold shadow-sm"
                onClick={() => setDeleteTargetApiClient(apiClient)}
                disabled={deleteApiClientMutation.isPending}
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          ),
          sortValue: apiClient.name
        }
      })),
    [
      apiClients,
      deleteApiClientMutation.isPending,
      regenerateApiClientKeyMutation.isPending
    ]
  );

  const isLoading = apiClientsQuery.isLoading;
  const isModalLoading =
    createApiClientMutation.isPending ||
    updateApiClientMutation.isPending ||
    (modalOpen && modalMode !== "create" && apiClientDetailQuery.isLoading);

  return (
    <AdminManagementLayout
      title="Manajemen API Client"
      description="Kelola API client, abilities untuk akses endpoint backend, domain yang diizinkan, dan status aktif dalam satu area admin."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Manajemen API Client"
          description="Kelola API client untuk akses backend melalui header X-API-KEY dengan daftar abilities yang sesuai kebutuhan integrasi."
          actions={
            <Button
              type="button"
              variant="primary"
              rounded="md"
              className="gap-2 px-4 py-2 text-sm font-semibold"
              onClick={handleOpenCreate}
            >
              <PlusIcon className="h-4 w-4" />
              Tambah API Client
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map(({ title, value, caption, icon: Icon }) => (
            <Card key={title} className="rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    {title}
                  </div>
                  <div className="mt-2 break-words text-2xl font-bold text-[#223B8F]">
                    {value}
                  </div>
                  <p className="mt-2 break-words text-sm leading-relaxed text-slate-500">
                    {caption}
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-blue-50 text-[#223B8F] ring-1 ring-blue-100">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="rounded-lg p-5 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">
                Daftar API Client
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Tinjau API client, daftar abilities, domain yang diizinkan, dan
                status aktif dari tabel berikut.
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form
                className="grid gap-3 lg:flex-1 lg:grid-cols-[minmax(0,280px)_180px_auto] lg:items-center"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  id="api-client-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Cari nama atau deskripsi API client..."
                  className="h-8 rounded-md py-1 text-xs"
                />
                <Select
                  value={activeFilterInput}
                  options={ACTIVE_FILTER_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label
                  }))}
                  onChange={(nextValue) =>
                    setActiveFilterInput(nextValue as "all" | "true" | "false")
                  }
                  size="sm"
                  isSearchable={false}
                  className="min-w-[180px]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  rounded="md"
                  className="h-8 shrink-0 gap-1.5 px-3 text-xs font-semibold"
                >
                  <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                  Cari
                </Button>
              </form>

              <div className="flex items-center gap-2 lg:shrink-0 lg:justify-end">
                <label className="text-[11px] font-medium text-slate-500">
                  Tampilkan
                </label>
                <DataLimitSelect
                  value={limit}
                  onChange={(nextLimit) => {
                    setLimit(nextLimit);
                    setPage(1);
                  }}
                  options={["10", "25", "50", "100", "ALL"]}
                  itemLabel="client"
                  className="w-28"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="h-4 w-44 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : apiClientsQuery.isError ? (
              <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
                <div>
                  <div className="text-sm font-semibold text-rose-700">
                    Gagal memuat daftar API client
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-rose-700">
                    {getApiErrorMessage(
                      apiClientsQuery.error,
                      "Data API client belum dapat diambil dari server."
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  rounded="md"
                  className="px-4 py-2 text-sm font-semibold"
                  onClick={() => void apiClientsQuery.refetch()}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : apiClients.length === 0 ? (
              <EmptyStatePanel
                title="API client tidak ditemukan"
                description="Belum ada data API client yang sesuai dengan filter saat ini."
                compact
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  className="max-h-140"
                  tableClassName="w-full min-w-[1320px] text-sm"
                  disableDefaultMinWidth
                  showRowNumber
                  controlledSortKey={tableSortKey}
                  controlledSortDirection={tableSortDirection}
                  onSortChange={handleSortChange}
                />
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  showWhenSinglePage
                />
              </div>
            )}
          </div>
        </Card>

        <ApiClientFormModal
          open={modalOpen}
          mode={modalMode}
          apiClient={activeApiClient ?? null}
          abilityGroups={abilityGroups}
          loading={isModalLoading}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <ApiClientSuccessModal
          open={Boolean(successApiKey)}
          apiKey={successApiKey?.apiKey ?? null}
          notice={successApiKey?.notice}
          clientName={successApiKey?.clientName}
          onClose={() => setSuccessApiKey(null)}
        />

        <ApiClientRegenerateKeyModal
          open={Boolean(regenerateTargetApiClient)}
          apiClient={regenerateTargetApiClient}
          loading={regenerateApiClientKeyMutation.isPending}
          onClose={() => setRegenerateTargetApiClient(null)}
          onSubmit={handleRegenerateSubmit}
        />

        <ConfirmationModal
          open={Boolean(deleteTargetApiClient)}
          title="Hapus API Client"
          description={`API client "${deleteTargetApiClient?.name ?? "-"}" akan dihapus. Tindakan ini tidak dapat dibatalkan dari halaman ini.`}
          confirmLabel="Hapus API Client"
          confirmTone="danger"
          loading={deleteApiClientMutation.isPending}
          onClose={() => setDeleteTargetApiClient(null)}
          onConfirm={() => {
            if (!deleteTargetApiClient) return;
            return handleDeleteApiClient(deleteTargetApiClient);
          }}
        />
      </div>
    </AdminManagementLayout>
  );
}

function formatDateTime(value: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

function mapTableSortKeyToBackend(
  sortKey: string
): AdminApiClientSortField | null {
  switch (sortKey) {
    case "name":
      return "name";
    case "active":
      return "active";
    case "updatedAt":
      return "updated_at";
    case "createdAt":
      return "created_at";
    default:
      return null;
  }
}
