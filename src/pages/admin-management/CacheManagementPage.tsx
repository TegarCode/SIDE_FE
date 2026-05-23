import {
  ClockIcon,
  EyeIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { CacheExpirationModal } from "@/components/admin-dashboard/cache-management/CacheExpirationModal";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { PageTitle } from "@/components/ui/PageTitle";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/constants/app";
import { PERMISSIONS } from "@/constants/permissions";
import { useCacheManagementPage } from "@/hooks/admin-dashboard/useCacheManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  AdminCacheRecord,
  AdminCacheSortDirection,
  AdminCacheSortField,
  AdminCacheValue,
  AdminCacheUpdateFormValues
} from "@/type/admin-management/adminDashboardCache";
import { getApiErrorMessage } from "@/utils/apiFormError";
import { getUserAccessFromStorage, hasAnyPermission } from "@/utils/access";

export function AdminCacheManagementPage() {
  useDocumentTitle(`Manajemen Cache | ${APP_NAME}`);

  const { toast } = useToast();
  const accessUser = getUserAccessFromStorage();
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AdminCacheSortField>("expiration");
  const [sortDirection, setSortDirection] =
    useState<AdminCacheSortDirection>("desc");
  const [tableSortKey, setTableSortKey] = useState("expiration");
  const [tableSortDirection, setTableSortDirection] =
    useState<AdminCacheSortDirection>("desc");
  const [selectedCache, setSelectedCache] = useState<AdminCacheRecord | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTargetCache, setDeleteTargetCache] =
    useState<AdminCacheRecord | null>(null);

  const {
    cachesQuery,
    cacheDetailQuery,
    updateCacheMutation,
    deleteCacheMutation
  } = useCacheManagementPage(
    {
      search: query,
      page,
      perPage: limit === "ALL" ? 9999 : Number(limit),
      sortBy,
      sortDirection
    },
    detailOpen || editOpen ? selectedCache?.key : null
  );

  const caches = useMemo(
    () => cachesQuery.data?.items ?? [],
    [cachesQuery.data]
  );
  const activeCache = cacheDetailQuery.data?.data ?? selectedCache;
  const summary = cachesQuery.data?.summary;
  const totalCaches = cachesQuery.data?.total ?? 0;
  const totalPages = cachesQuery.data?.lastPage ?? 1;
  const currentPage = cachesQuery.data?.page ?? page;
  const canUpdateCache = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_CACHES_UPDATE
  ]);
  const canDeleteCache = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_CACHES_DELETE
  ]);

  useEffect(() => {
    if (!cachesQuery.isError) return;

    toast({
      title: "Gagal memuat cache",
      description: getApiErrorMessage(
        cachesQuery.error,
        "Daftar cache belum dapat diambil dari server."
      ),
      tone: "error"
    });
  }, [cachesQuery.error, cachesQuery.isError, toast]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Cache",
        value: String(summary?.totalCache ?? totalCaches),
        caption:
          "Total cache dengan prefix side_cache yang tercatat di sistem.",
        icon: ClockIcon
      },
      {
        title: "Kategori Aktif",
        value: String(summary?.kategoriAktif ?? 0),
        caption: "Jumlah kategori cache aktif hasil parsing key cache sistem.",
        icon: FolderIcon
      },
      {
        title: "Cache Terbaru",
        value: summary?.cacheTerbaru?.category ?? "-",
        caption: summary?.cacheTerbaru?.expiration
          ? `Expired ${formatDateTime(summary.cacheTerbaru.expiration)}`
          : "Belum ada data cache terbaru dari sistem.",
        icon: EyeIcon
      }
    ],
    [summary, totalCaches]
  );

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(searchInput.trim());
    setPage(1);
  };

  const handleSortChange = (sortKey: string, direction: "asc" | "desc") => {
    const nextSortBy = mapTableSortKeyToBackend(sortKey);
    if (!nextSortBy) return;

    setTableSortKey(sortKey);
    setTableSortDirection(direction);
    setSortBy(nextSortBy);
    setSortDirection(direction);
    setPage(1);
  };

  const handleUpdateExpiration = async (values: AdminCacheUpdateFormValues) => {
    if (!selectedCache) return;

    try {
      const result = await updateCacheMutation.mutateAsync({
        cacheKey: selectedCache.key,
        payload: {
          expirationAt: toBackendDatetime(values.expirationAt)
        }
      });

      toast({
        title: "Expiration cache berhasil diperbarui",
        description: result.message,
        tone: "success"
      });
      setEditOpen(false);
    } catch (error) {
      toast({
        title: "Gagal memperbarui expiration cache",
        description: getApiErrorMessage(
          error,
          "Expiration cache tidak berhasil diperbarui."
        ),
        tone: "error"
      });
      throw error;
    }
  };

  const handleDeleteCache = async (cacheItem: AdminCacheRecord) => {
    try {
      await deleteCacheMutation.mutateAsync(cacheItem.key);
      toast({
        title: "Cache berhasil dihapus",
        description:
          "Cache dipindahkan dari daftar. Data akan dibuat ulang saat endpoint sumber dipanggil aplikasi.",
        tone: "success"
      });
      setDeleteTargetCache(null);
    } catch (error) {
      toast({
        title: "Gagal menghapus cache",
        description: getApiErrorMessage(error, "Cache tidak berhasil dihapus."),
        tone: "error"
      });
    }
  };

  const tableColumns = [
    { key: "key", label: "Key", className: "min-w-[360px]" },
    { key: "category", label: "Category", className: "min-w-52" },
    { key: "expiration", label: "Expiration", className: "min-w-40" },
    {
      key: "actions",
      label: "Aksi",
      className: "min-w-[280px]",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    }
  ];

  const tableRows = caches.map((cacheItem) => ({
    key: {
      display: (
        <div className="max-w-[420px] break-all font-semibold text-slate-900">
          {cacheItem.key}
        </div>
      ),
      sortValue: cacheItem.key
    },
    category: {
      display: (
        <div className="space-y-1">
          <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-[#223B8F] ring-1 ring-blue-100">
            {cacheItem.category || "-"}
          </span>
          <div className="text-[11px] text-slate-500">
            Parent: {cacheItem.categoryParent || "-"} | Child:{" "}
            {cacheItem.categoryChild || "-"}
          </div>
        </div>
      ),
      sortValue: cacheItem.category
    },
    expiration: {
      display: (
        <div className="space-y-1 text-xs leading-relaxed text-slate-600">
          <div>{formatDateTime(cacheItem.expiration)}</div>
          {renderExpirationNotice(cacheItem.expiration)}
          <div className="text-[11px] text-slate-500">
            Unix: {cacheItem.expirationTimestamp || "-"}
          </div>
        </div>
      ),
      sortValue: cacheItem.expiration
    },
    actions: {
      display: (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            rounded="md"
            className="gap-1.5 px-3 py-2 text-xs font-semibold"
            onClick={() => {
              setSelectedCache(cacheItem);
              setDetailOpen(true);
            }}
          >
            <EyeIcon className="h-3.5 w-3.5" />
            Detail
          </Button>
          {canUpdateCache ? (
            <Button
              type="button"
              variant="primary"
              rounded="md"
              className="gap-1.5 px-3 py-2 text-xs font-semibold"
              onClick={() => {
                setSelectedCache(cacheItem);
                setEditOpen(true);
              }}
            >
              <PencilSquareIcon className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : null}
          {canDeleteCache ? (
            <Button
              type="button"
              variant="danger"
              rounded="md"
              className="gap-1.5 px-3 py-2 text-xs font-semibold"
              onClick={() => setDeleteTargetCache(cacheItem)}
              disabled={deleteCacheMutation.isPending}
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </Button>
          ) : null}
        </div>
      ),
      sortValue: cacheItem.key
    }
  }));

  const isLoading = cachesQuery.isLoading;

  return (
    <AdminManagementLayout
      title="Manajemen Cache"
      description="Tinjau cache side_cache, perbarui expiration, dan hapus cache agar aplikasi membangun ulang data saat dibutuhkan."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Manajemen Cache"
          description="Kelola daftar cache dengan prefix side_cache, filter kategori, update waktu expiration, dan hapus cache dari satu halaman admin."
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
                Daftar Cache
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Tinjau key cache, kategori hasil parsing key, expiration aktif,
                dan lakukan aksi pengelolaan dari tabel berikut.
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form
                className="grid gap-3 lg:flex-1 lg:grid-cols-[minmax(0,380px)_auto] lg:items-center"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  id="cache-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Cari key atau kategori cache..."
                  className="h-8 rounded-md py-1 text-xs"
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
                  itemLabel="cache"
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
                    <div className="h-4 w-56 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : cachesQuery.isError ? (
              <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
                <div>
                  <div className="text-sm font-semibold text-rose-700">
                    Gagal memuat daftar cache
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-rose-700">
                    {getApiErrorMessage(
                      cachesQuery.error,
                      "Data cache belum dapat diambil dari server."
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  rounded="md"
                  className="px-4 py-2 text-sm font-semibold"
                  onClick={() => void cachesQuery.refetch()}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : caches.length === 0 ? (
              <EmptyStatePanel
                title="Cache tidak ditemukan"
                description="Belum ada data cache yang sesuai dengan filter saat ini."
                compact
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  className="max-h-140"
                  tableClassName="w-full min-w-[1120px] text-sm"
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

        <CacheDetailModal
          open={detailOpen}
          cacheItem={activeCache ?? null}
          loading={detailOpen && cacheDetailQuery.isLoading}
          onClose={() => {
            setDetailOpen(false);
            setSelectedCache(null);
          }}
        />

        <CacheExpirationModal
          open={editOpen}
          cacheItem={activeCache ?? null}
          loading={
            updateCacheMutation.isPending ||
            (editOpen && cacheDetailQuery.isLoading)
          }
          onClose={() => {
            if (updateCacheMutation.isPending) return;
            setEditOpen(false);
            setSelectedCache(null);
          }}
          onSubmit={handleUpdateExpiration}
        />

        <ConfirmationModal
          open={Boolean(deleteTargetCache)}
          title="Hapus Cache"
          description={`Cache "${deleteTargetCache?.key ?? "-"}" akan dihapus. Nilai cache akan dibangun ulang saat endpoint sumber dipanggil aplikasi.`}
          confirmLabel="Hapus Cache"
          confirmTone="danger"
          loading={deleteCacheMutation.isPending}
          onClose={() => setDeleteTargetCache(null)}
          onConfirm={() => {
            if (!deleteTargetCache) return;
            return handleDeleteCache(deleteTargetCache);
          }}
        />
      </div>
    </AdminManagementLayout>
  );
}

function CacheDetailModal({
  open,
  cacheItem,
  loading,
  onClose
}: {
  open: boolean;
  cacheItem: AdminCacheRecord | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Cache"
      subtitle="Tinjau informasi cache lengkap yang diterima dari sistem."
      size="lg"
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : !cacheItem ? (
        <EmptyStatePanel
          title="Detail tidak tersedia"
          description="Data cache belum dapat ditampilkan."
          compact
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <DetailItem label="Key" value={cacheItem.key} fullWidth />
            <DetailItem label="Category" value={cacheItem.category || "-"} />
            <DetailItem
              label="Category Parent"
              value={cacheItem.categoryParent || "-"}
            />
            <DetailItem
              label="Category Child"
              value={cacheItem.categoryChild || "-"}
            />
            <DetailItem
              label="Expiration"
              value={formatDateTime(cacheItem.expiration)}
            />
            <DetailItem
              label="Expiration Timestamp"
              value={String(cacheItem.expirationTimestamp || "-")}
            />
          </div>

          <DetailValueBlock label="Value" value={cacheItem.value} />

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

function DetailItem({
  label,
  value,
  fullWidth = false
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-slate-50 p-4 ${fullWidth ? "md:col-span-2" : ""}`}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-all text-sm font-medium text-slate-900">
        {value}
      </div>
    </div>
  );
}

function DetailValueBlock({
  label,
  value
}: {
  label: string;
  value: AdminCacheValue | undefined;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </div>
      <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md bg-white p-3 text-xs leading-relaxed text-slate-800">
        {formatCacheValue(value)}
      </pre>
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

function mapTableSortKeyToBackend(sortKey: string): AdminCacheSortField | null {
  switch (sortKey) {
    case "key":
      return "key";
    case "expiration":
      return "expiration";
    default:
      return null;
  }
}

function toBackendDatetime(value: string) {
  if (!value) return "";

  const normalized = value.includes("T") ? value.replace("T", " ") : value;
  return normalized.length === 16 ? `${normalized}:00` : normalized;
}

function formatCacheValue(value: AdminCacheValue | undefined) {
  if (value === undefined) return "-";
  if (typeof value === "string") return value || "-";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function renderExpirationNotice(value: string) {
  const expirationTime = new Date(value).getTime();
  if (Number.isNaN(expirationTime)) {
    return null;
  }

  const now = Date.now();
  const diffMs = expirationTime - now;

  if (diffMs <= 0) {
    return (
      <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
        Cache sudah expired
      </span>
    );
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  if (diffMs >= oneDayMs) {
    return null;
  }

  const hours = Math.max(1, Math.ceil(diffMs / (60 * 60 * 1000)));

  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
      Expired {hours} jam lagi
    </span>
  );
}
