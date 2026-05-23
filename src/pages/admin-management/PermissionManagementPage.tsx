import {
  EllipsisHorizontalIcon,
  FolderIcon,
  KeyIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { useCallback, useMemo, useState } from "react";
import { PermissionFormModal } from "@/components/admin-dashboard/permission-management/PermissionFormModal";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Pagination } from "@/components/ui/Pagination";
import { PageTitle } from "@/components/ui/PageTitle";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/constants/app";
import { PERMISSIONS } from "@/constants/permissions";
import { usePermissionManagementPage } from "@/hooks/admin-dashboard/usePermissionManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  AdminPermissionFormValues,
  AdminPermissionRecord,
  AdminPermissionSortDirection,
  AdminPermissionSortField
} from "@/type/admin-management/adminDashboardPermission";
import { getUserAccessFromStorage, hasAnyPermission } from "@/utils/access";

export function AdminPermissionManagementPage() {
  useDocumentTitle(`Manajemen Hak Akses | ${APP_NAME}`);

  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AdminPermissionSortField>("updated_at");
  const [sortDirection, setSortDirection] =
    useState<AdminPermissionSortDirection>("desc");
  const [tableSortKey, setTableSortKey] = useState("updatedAt");
  const [tableSortDirection, setTableSortDirection] =
    useState<AdminPermissionSortDirection>("desc");
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedPermission, setSelectedPermission] =
    useState<AdminPermissionRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetPermission, setDeleteTargetPermission] =
    useState<AdminPermissionRecord | null>(null);
  const accessUser = getUserAccessFromStorage();

  const {
    permissionsQuery,
    permissionDetailQuery,
    createPermissionMutation,
    updatePermissionMutation,
    deletePermissionMutation
  } = usePermissionManagementPage(
    {
      search: query,
      page,
      perPage: limit === "ALL" ? 9999 : Number(limit),
      sortBy,
      sortDirection
    },
    modalMode === "update" ? selectedPermission?.id : null
  );

  const permissions = useMemo(
    () => permissionsQuery.data?.items ?? [],
    [permissionsQuery.data]
  );
  const activePermission =
    modalMode === "update"
      ? (permissionDetailQuery.data?.data ?? selectedPermission)
      : null;
  const canCreatePermission = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_PERMISSIONS_CREATE
  ]);
  const canUpdatePermission = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_PERMISSIONS_UPDATE
  ]);
  const canDeletePermission = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_PERMISSIONS_DELETE
  ]);

  const totalPermissions = permissionsQuery.data?.total ?? 0;
  const totalPages = permissionsQuery.data?.lastPage ?? 1;
  const currentPage = permissionsQuery.data?.page ?? page;
  const summary = permissionsQuery.data?.summary;

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Permission",
        value: String(summary?.totalPermission ?? totalPermissions),
        caption:
          "Seluruh permission yang tersedia untuk Dashboard dan Admin Management.",
        icon: KeyIcon
      },
      {
        title: "Kategori Aktif",
        value: String(summary?.kategoriAktif ?? 0),
        caption: "Jumlah kategori permission yang aktif pada seluruh data.",
        icon: FolderIcon
      },
      {
        title: "Permission Terbaru",
        value: summary?.permissionTerbaru?.displayName ?? "-",
        caption: "Permission terbaru berdasarkan ringkasan dari database.",
        icon: Squares2X2Icon
      }
    ],
    [summary, totalPermissions]
  );

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedPermission(null);
    setModalOpen(true);
  };

  const handleOpenUpdate = (permission: AdminPermissionRecord) => {
    setModalMode("update");
    setSelectedPermission(permission);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (
      createPermissionMutation.isPending ||
      updatePermissionMutation.isPending
    ) {
      return;
    }

    setModalOpen(false);
    setSelectedPermission(null);
  };

  const handleDeletePermission = useCallback(
    async (permission: AdminPermissionRecord) => {
      if (!canDeletePermission) return;

      try {
        await deletePermissionMutation.mutateAsync(permission.id);
        toast({
          title: "Permission berhasil dihapus",
          description: `Permission ${permission.displayName} telah dihapus.`,
          tone: "success"
        });
        setDeleteTargetPermission(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menghapus permission.";

        toast({
          title: "Gagal menghapus permission",
          description: message,
          tone: "error"
        });
      }
    },
    [canDeletePermission, deletePermissionMutation, toast]
  );

  const handleSubmit = async (values: AdminPermissionFormValues) => {
    try {
      if (modalMode === "create") {
        const result = await createPermissionMutation.mutateAsync(values);
        toast({
          title: "Permission berhasil ditambahkan",
          description: result.message,
          tone: "success"
        });
      } else if (selectedPermission) {
        const result = await updatePermissionMutation.mutateAsync({
          permissionId: selectedPermission.id,
          payload: values
        });
        toast({
          title: "Permission berhasil diperbarui",
          description: result.message,
          tone: "success"
        });
      }

      handleCloseModal();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan permission.";

      toast({
        title: "Gagal menyimpan data",
        description: message,
        tone: "error"
      });
    }
  };

  const isLoading = permissionsQuery.isLoading;
  const isModalLoading =
    createPermissionMutation.isPending ||
    updatePermissionMutation.isPending ||
    (modalMode === "update" && permissionDetailQuery.isLoading);

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
      setPage(1);
    },
    [searchInput]
  );

  const handleSortChange = useCallback(
    (sortKey: string, direction: "asc" | "desc") => {
      setTableSortKey(sortKey);
      setTableSortDirection(direction);

      const nextSortBy = mapTableSortKeyToBackend(sortKey);
      if (!nextSortBy) {
        return;
      }

      setSortBy(nextSortBy);
      setSortDirection(direction);
      setPage(1);
    },
    []
  );

  const tableColumns = [
    { key: "displayName", label: "Nama Permission", className: "min-w-56" },
    { key: "code", label: "Code", className: "min-w-48" },
    { key: "category", label: "Category", className: "min-w-44" },
    { key: "moduleGroup", label: "Modul", className: "min-w-36" },
    {
      key: "description",
      label: "Deskripsi",
      className: "min-w-64",
      sortable: false
    },
    { key: "updatedAt", label: "Terakhir Diubah", className: "min-w-40" },
    {
      key: "actions",
      label: "Aksi",
      className: "min-w-60",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    }
  ];

  const tableRows = useMemo(
    () =>
      permissions.map((permission) => ({
        displayName: {
          display: (
            <div className="min-w-0 font-semibold text-slate-900">
              {permission.displayName}
            </div>
          ),
          sortValue: permission.displayName
        },
        code: {
          display: (
            <code className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
              {permission.code}
            </code>
          ),
          sortValue: permission.code
        },
        category: {
          display: (
            <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-[#223B8F] ring-1 ring-blue-100">
              {permission.category}
            </span>
          ),
          sortValue: permission.category
        },
        moduleGroup: {
          display: (
            <span className="inline-flex rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
              {formatModuleGroup(permission.moduleGroup)}
            </span>
          ),
          sortValue: permission.moduleGroup
        },
        description: {
          display: (
            <div className="text-sm leading-relaxed text-slate-600">
              {permission.description || "-"}
            </div>
          ),
          sortValue: permission.description
        },
        updatedAt: {
          display: (
            <div className="text-xs leading-relaxed text-slate-600">
              {formatDateTime(permission.updatedAt)}
            </div>
          ),
          sortValue: permission.updatedAt
        },
        actions: {
          display:
            canUpdatePermission || canDeletePermission ? (
              <div className="flex items-center justify-center gap-2">
                {canUpdatePermission ? (
                  <Button
                    type="button"
                    variant="primary"
                    rounded="md"
                    className="gap-1.5 px-3 py-2 text-xs font-semibold"
                    onClick={() => handleOpenUpdate(permission)}
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    Update
                  </Button>
                ) : null}
                {canDeletePermission ? (
                  <Button
                    type="button"
                    variant="danger"
                    rounded="md"
                    className="gap-1.5 px-3 py-2 text-xs font-semibold shadow-sm"
                    onClick={() => setDeleteTargetPermission(permission)}
                    disabled={deletePermissionMutation.isPending}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                ) : null}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <EllipsisHorizontalIcon className="h-4 w-4" />
                Tidak ada aksi
              </span>
            ),
          sortValue: [
            canUpdatePermission ? "Update" : "",
            canDeletePermission ? "Delete" : ""
          ]
            .filter(Boolean)
            .join(" ")
        }
      })),
    [
      canDeletePermission,
      canUpdatePermission,
      deletePermissionMutation.isPending,
      permissions
    ]
  );

  return (
    <AdminManagementLayout
      title="Manajemen Hak Akses"
      description="Kelola daftar permission, kategori akses, modul, dan pembaruan hak akses aplikasi."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Manajemen Hak Akses"
          description="Kelola code permission, kategori, modul, dan deskripsi permission dalam satu halaman yang konsisten."
          actions={
            canCreatePermission ? (
              <Button
                type="button"
                variant="primary"
                rounded="md"
                className="gap-2 px-4 py-2 text-sm font-semibold"
                onClick={handleOpenCreate}
              >
                <PlusIcon className="h-4 w-4" />
                Tambah Permission
              </Button>
            ) : null
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
                  <div className="mt-2 text-2xl font-bold text-[#223B8F]">
                    {value}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
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
                Daftar Permission
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Tinjau permission yang tersedia, kategori akses, modul, dan
                lakukan pembaruan dari tabel berikut.
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,320px)_auto] md:items-center">
              <form
                className="flex items-center gap-2"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  id="permission-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Cari code permission, category, atau modul..."
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
              <div className="flex items-center gap-2">
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
                  itemLabel="permission"
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
                    <div className="h-4 w-40 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : permissions.length === 0 ? (
              <EmptyStatePanel
                title="Permission tidak ditemukan"
                description="Belum ada permission yang sesuai dengan pencarian saat ini."
                compact
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  className="max-h-140"
                  tableClassName="w-full min-w-[1160px] text-sm"
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

        <PermissionFormModal
          open={modalOpen}
          mode={modalMode}
          permission={activePermission}
          loading={isModalLoading}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <ConfirmationModal
          open={Boolean(deleteTargetPermission)}
          title="Hapus Permission"
          description={`Permission "${deleteTargetPermission?.displayName ?? "-"}" akan dihapus. Tindakan ini tidak dapat dibatalkan dari halaman ini.`}
          confirmLabel="Hapus Permission"
          confirmTone="danger"
          loading={deletePermissionMutation.isPending}
          onClose={() => setDeleteTargetPermission(null)}
          onConfirm={() => {
            if (!deleteTargetPermission) return;
            return handleDeletePermission(deleteTargetPermission);
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
): AdminPermissionSortField | null {
  switch (sortKey) {
    case "displayName":
    case "code":
      return "name";
    case "category":
      return "category";
    case "moduleGroup":
      return "module_group";
    case "description":
      return null;
    case "createdAt":
      return "created_at";
    case "updatedAt":
      return "updated_at";
    default:
      return "updated_at";
  }
}

function formatModuleGroup(value: "dashboard" | "admin_management") {
  return value === "admin_management" ? "Admin Management" : "Dashboard";
}
