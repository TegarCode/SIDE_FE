import {
  ChartBarSquareIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  QueueListIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { PageTitle } from "@/components/ui/PageTitle";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/constants/app";
import { useSidePageViewManagementPage } from "@/hooks/admin-dashboard/useSidePageViewManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  AdminSidePageViewRecord,
  AdminSidePageViewSortDirection,
  AdminSidePageViewSortField
} from "@/type/admin-management/adminDashboardSidePageView";
import { getApiErrorMessage } from "@/utils/apiFormError";

export function AdminSidePageViewManagementPage() {
  useDocumentTitle(`Pengunjung Halaman SIDE | ${APP_NAME}`);

  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [moduleInput, setModuleInput] = useState("all");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] =
    useState<AdminSidePageViewSortField>("created_at");
  const [sortDirection, setSortDirection] =
    useState<AdminSidePageViewSortDirection>("desc");
  const [tableSortKey, setTableSortKey] = useState("createdAt");
  const [tableSortDirection, setTableSortDirection] =
    useState<AdminSidePageViewSortDirection>("desc");
  const [selectedPageView, setSelectedPageView] =
    useState<AdminSidePageViewRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    sidePageViewsQuery,
    sidePageViewDetailQuery,
    sidePageViewModulesQuery
  } = useSidePageViewManagementPage(
    {
      search: query,
      page,
      perPage: limit === "ALL" ? 9999 : Number(limit),
      module: moduleFilter || undefined,
      sortBy,
      sortDirection
    },
    detailOpen ? (selectedPageView?.id ?? null) : null
  );

  const pageViews = useMemo(
    () => sidePageViewsQuery.data?.items ?? [],
    [sidePageViewsQuery.data]
  );
  const moduleOptions = useMemo(
    () => [
      { value: "all", label: "Semua Module" },
      ...(sidePageViewModulesQuery.data?.items ?? []).map((item) => ({
        value: item.name,
        label: item.name
      }))
    ],
    [sidePageViewModulesQuery.data]
  );
  const activePageView = sidePageViewDetailQuery.data?.data ?? selectedPageView;
  const summary = sidePageViewsQuery.data?.summary;
  const totalViews = sidePageViewsQuery.data?.total ?? 0;
  const totalPages = sidePageViewsQuery.data?.lastPage ?? 1;
  const currentPage = sidePageViewsQuery.data?.page ?? page;

  useEffect(() => {
    if (!sidePageViewsQuery.isError) return;

    toast({
      title: "Gagal memuat Pengunjung Halaman SIDE",
      description: getApiErrorMessage(
        sidePageViewsQuery.error,
        "Daftar Pengunjung Halaman SIDE tidak berhasil dimuat."
      ),
      tone: "error"
    });
  }, [sidePageViewsQuery.error, sidePageViewsQuery.isError, toast]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Total View",
        value: String(summary?.totalView ?? totalViews),
        caption: "Total kunjungan halaman SIDE yang tercatat dari sistem.",
        icon: ChartBarSquareIcon
      },
      {
        title: "Module Aktif",
        value: String(summary?.activeModuleCount ?? 0),
        caption: "Jumlah module yang memiliki traffic pada data tracking.",
        icon: QueueListIcon
      },
      {
        title: "View Terbaru",
        value: summary?.latestView?.path || "-",
        caption:
          summary?.latestView?.module || "Belum ada data kunjungan terbaru.",
        icon: UserCircleIcon
      }
    ],
    [summary, totalViews]
  );

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
      setModuleFilter(moduleInput === "all" ? "" : moduleInput);
      setPage(1);
    },
    [moduleInput, searchInput]
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
    { key: "path", label: "Path", className: "min-w-44" },
    { key: "module", label: "Module", className: "min-w-36" },
    { key: "userName", label: "Nama Pengguna", className: "min-w-40" },
    { key: "userEmail", label: "Email Pengguna", className: "min-w-52" },
    {
      key: "userAgent",
      label: "User Agent",
      className: "min-w-64",
      sortable: false
    },
    { key: "createdAt", label: "Waktu View", className: "min-w-40" },
    {
      key: "actions",
      label: "Aksi",
      className: "min-w-36",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    }
  ];

  const tableRows = useMemo(
    () =>
      pageViews.map((item) => ({
        path: {
          display: (
            <div className="font-semibold text-slate-900">{item.path}</div>
          ),
          sortValue: item.path
        },
        module: {
          display: (
            <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-[#223B8F] ring-1 ring-blue-100">
              {item.module}
            </span>
          ),
          sortValue: item.module
        },
        userName: {
          display: (
            <div className="text-sm text-slate-700">
              {item.user?.name || "Guest"}
            </div>
          ),
          sortValue: item.user?.name || "Guest"
        },
        userEmail: {
          display: (
            <div className="text-sm text-slate-600">
              {item.user?.email || "-"}
            </div>
          ),
          sortValue: item.user?.email || "-"
        },
        userAgent: {
          display: (
            <div className="max-w-xl break-words text-sm leading-relaxed text-slate-600">
              <span className="line-clamp-2">{item.userAgent || "-"}</span>
            </div>
          ),
          sortValue: item.userAgent
        },
        createdAt: {
          display: (
            <div className="text-xs leading-relaxed text-slate-600">
              {formatDateTime(item.createdAt)}
            </div>
          ),
          sortValue: item.createdAt
        },
        actions: {
          display: (
            <div className="flex items-center justify-center">
              <Button
                type="button"
                variant="outline"
                rounded="md"
                className="gap-1.5 px-3 py-2 text-xs font-semibold"
                onClick={() => {
                  setSelectedPageView(item);
                  setDetailOpen(true);
                }}
              >
                <EyeIcon className="h-3.5 w-3.5" />
                Detail
              </Button>
            </div>
          ),
          sortValue: item.path
        }
      })),
    [pageViews]
  );

  return (
    <AdminManagementLayout
      title="Pengunjung Halaman SIDE"
      description="Tinjau data tracking kunjungan halaman SIDE secara read-only berdasarkan path, module, pengguna, dan waktu akses."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Pengunjung Halaman SIDE"
          description="Pantau page view SIDE dengan filter pencarian, module, sorting backend, dan detail kunjungan dalam satu halaman."
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
                Daftar Pengunjung Halaman SIDE
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Tinjau data tracking berdasarkan path, module, pengguna, user
                agent, dan waktu kunjungan.
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form
                className="grid gap-3 lg:flex-1 lg:grid-cols-[minmax(0,260px)_220px_auto] lg:items-center"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  id="side-page-view-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Cari path, module, user, atau user agent..."
                  className="h-8 rounded-md py-1 text-xs"
                />
                <Select
                  value={moduleInput}
                  options={moduleOptions}
                  onChange={(nextValue) => setModuleInput(nextValue)}
                  isLoading={sidePageViewModulesQuery.isLoading}
                  isSearchable={false}
                  size="sm"
                  className="min-w-[220px]"
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
                  itemLabel="view"
                  className="w-28"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            {sidePageViewsQuery.isLoading ? (
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
            ) : sidePageViewsQuery.isError ? (
              <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
                <div>
                  <div className="text-sm font-semibold text-rose-700">
                    Gagal memuat daftar Pengunjung Halaman SIDE
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-rose-700">
                    {getApiErrorMessage(
                      sidePageViewsQuery.error,
                      "Data Pengunjung Halaman SIDE belum dapat diambil dari server."
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  rounded="md"
                  className="px-4 py-2 text-sm font-semibold"
                  onClick={() => void sidePageViewsQuery.refetch()}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : pageViews.length === 0 ? (
              <EmptyStatePanel
                title="Pengunjung Halaman SIDE tidak ditemukan"
                description="Belum ada data tracking yang sesuai dengan filter saat ini."
                compact
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  className="max-h-140"
                  tableClassName="w-full min-w-[1220px] text-sm"
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

        <SidePageViewDetailModal
          open={detailOpen}
          pageView={activePageView ?? null}
          loading={detailOpen && sidePageViewDetailQuery.isLoading}
          onClose={() => {
            setDetailOpen(false);
            setSelectedPageView(null);
          }}
        />
      </div>
    </AdminManagementLayout>
  );
}

function SidePageViewDetailModal({
  open,
  pageView,
  loading,
  onClose
}: {
  open: boolean;
  pageView: AdminSidePageViewRecord | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Detail Pengunjung Halaman SIDE ${pageView ? `#${pageView.id}` : ""}`}
      subtitle="Tinjau data lengkap page view tanpa aksi perubahan data."
      size="lg"
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : !pageView ? (
        <EmptyStatePanel
          title="Detail tidak tersedia"
          description="Data Pengunjung Halaman SIDE belum dapat ditampilkan."
          compact
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <DetailItem label="ID" value={String(pageView.id)} />
            <DetailItem label="Path" value={pageView.path || "-"} />
            <DetailItem label="Module" value={pageView.module || "-"} />
            <DetailItem
              label="Nama Pengguna"
              value={pageView.user?.name || "Guest"}
            />
            <DetailItem
              label="Email Pengguna"
              value={pageView.user?.email || "-"}
            />
            <DetailItem label="IP Hash" value={pageView.ipHash || "-"} />
          </div>

          <DetailBlock label="User Agent" value={pageView.userAgent || "-"} />

          <div className="grid gap-3 md:grid-cols-2">
            <DetailItem
              label="Created At"
              value={formatDateTime(pageView.createdAt)}
            />
            <DetailItem
              label="Updated At"
              value={formatDateTime(pageView.updatedAt)}
            />
          </div>

          <div className="flex justify-end border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="outline"
              rounded="md"
              className="px-4 py-2 text-sm font-semibold"
              onClick={onClose}
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-medium text-slate-900">
        {value}
      </div>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-words text-sm leading-relaxed text-slate-900">
        {value}
      </div>
    </div>
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
): AdminSidePageViewSortField | null {
  switch (sortKey) {
    case "path":
      return "path";
    case "module":
      return "module";
    case "createdAt":
      return "created_at";
    default:
      return null;
  }
}
