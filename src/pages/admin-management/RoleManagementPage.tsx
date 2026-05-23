import {
  EllipsisHorizontalIcon,
  KeyIcon,
  PencilSquareIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { useCallback, useMemo, useState } from "react";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { RoleFormModal } from "@/components/admin-dashboard/role-management/RoleFormModal";
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
import { useRoleManagementPage } from "@/hooks/admin-dashboard/useRoleManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  AdminRoleFormValues,
  AdminRoleRecord
} from "@/type/admin-management/adminDashboardRole";
import { getUserAccessFromStorage, hasAnyPermission } from "@/utils/access";
import { cn } from "@/utils/cn";

const ROLE_STATUS_LABEL = {
  active: "Aktif",
  inactive: "Nonaktif"
} as const;

export function AdminRoleManagementPage() {
  useDocumentTitle(`Manajemen Peran | ${APP_NAME}`);

  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedRole, setSelectedRole] = useState<AdminRoleRecord | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetRole, setDeleteTargetRole] =
    useState<AdminRoleRecord | null>(null);
  const accessUser = getUserAccessFromStorage();

  const {
    rolesQuery,
    permissionsQuery,
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation
  } = useRoleManagementPage({
    search: query,
    page,
    perPage: limit === "ALL" ? 9999 : Number(limit)
  });

  const roles = useMemo(() => rolesQuery.data?.items ?? [], [rolesQuery.data]);
  const permissions = useMemo(
    () => permissionsQuery.data?.items ?? [],
    [permissionsQuery.data]
  );
  const canCreateRole = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_ROLES_CREATE
  ]);
  const canUpdateRole = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_ROLES_UPDATE
  ]);
  const canDeleteRole = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_ROLES_DELETE
  ]);

  const totalRoles = rolesQuery.data?.total ?? 0;
  const totalPages = rolesQuery.data?.lastPage ?? 1;
  const currentPage = rolesQuery.data?.page ?? page;

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Role",
        value: String(totalRoles),
        caption: "Total role yang saat ini tersedia pada Beranda Admin.",
        icon: ShieldCheckIcon
      },
      {
        title: "Role Aktif",
        value: String(roles.filter((item) => item.status === "active").length),
        caption: "Role aktif pada data halaman yang sedang ditampilkan.",
        icon: ShieldCheckIcon
      },
      {
        title: "Permission Tersedia",
        value: String(permissions.length),
        caption: "Daftar permission yang dapat disematkan ke dalam role.",
        icon: KeyIcon
      },
      {
        title: "Total User Terhubung",
        value: String(roles.reduce((total, item) => total + item.userCount, 0)),
        caption: "Akumulasi user yang sudah terhubung dengan seluruh role.",
        icon: UserGroupIcon
      }
    ],
    [permissions.length, roles, totalRoles]
  );

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedRole(null);
    setModalOpen(true);
  };

  const handleOpenUpdate = (role: AdminRoleRecord) => {
    setModalMode("update");
    setSelectedRole(role);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (createRoleMutation.isPending || updateRoleMutation.isPending) {
      return;
    }

    setModalOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = useCallback(
    async (role: AdminRoleRecord) => {
      if (role.userCount > 0 || !canDeleteRole) return;

      try {
        await deleteRoleMutation.mutateAsync(role.id);
        toast({
          title: "Role berhasil dihapus",
          description: `Role ${role.name} telah dihapus.`,
          tone: "success"
        });
        setDeleteTargetRole(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menghapus role.";

        toast({
          title: "Gagal menghapus role",
          description: message,
          tone: "error"
        });
      }
    },
    [canDeleteRole, deleteRoleMutation, toast]
  );

  const handleSubmit = async (values: AdminRoleFormValues) => {
    try {
      if (modalMode === "create") {
        const result = await createRoleMutation.mutateAsync(values);
        toast({
          title: "Role berhasil ditambahkan",
          description: result.message,
          tone: "success"
        });
      } else if (selectedRole) {
        const result = await updateRoleMutation.mutateAsync({
          roleId: selectedRole.id,
          payload: values
        });
        toast({
          title: "Role berhasil diperbarui",
          description: result.message,
          tone: "success"
        });
      }

      handleCloseModal();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan role.";

      toast({
        title: "Gagal menyimpan data",
        description: message,
        tone: "error"
      });
    }
  };

  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(Math.min(Math.max(nextPage, 1), totalPages));
    },
    [totalPages]
  );

  const tableColumns = [
    {
      key: "name",
      label: "Role",
      className: "min-w-64"
    },
    {
      key: "slug",
      label: "Slug",
      className: "min-w-44"
    },
    {
      key: "status",
      label: "Status",
      className: "min-w-28",
      headerClassName: "text-center",
      align: "center" as const
    },
    {
      key: "permissionsCount",
      label: "Jumlah Permission",
      className: "min-w-36",
      headerClassName: "text-center",
      align: "center" as const
    },
    {
      key: "userCount",
      label: "Jumlah User",
      className: "min-w-32",
      headerClassName: "text-center",
      align: "center" as const
    },
    {
      key: "updatedAt",
      label: "Terakhir Diubah",
      className: "min-w-40"
    },
    {
      key: "actions",
      label: "Aksi",
      className: "min-w-60",
      headerClassName: "text-center",
      align: "center" as const
    }
  ];

  const tableRows = useMemo(
    () =>
      roles.map((role) => ({
        name: {
          display: (
            <div className="min-w-0">
              <div className="font-semibold text-slate-900">{role.name}</div>
              <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                {role.description || "-"}
              </div>
            </div>
          ),
          sortValue: role.name
        },
        slug: {
          display: (
            <code className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
              {role.slug}
            </code>
          ),
          sortValue: role.slug
        },
        status: {
          display: (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                role.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {ROLE_STATUS_LABEL[role.status]}
            </span>
          ),
          sortValue: ROLE_STATUS_LABEL[role.status]
        },
        permissionsCount: {
          display: (
            <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-[#223B8F]">
              <KeyIcon className="h-3.5 w-3.5" />
              {role.permissionsCount}
            </div>
          ),
          sortValue: role.permissionsCount
        },
        userCount: {
          display: (
            <div className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
              <UserGroupIcon className="h-3.5 w-3.5" />
              {role.userCount}
            </div>
          ),
          sortValue: role.userCount
        },
        updatedAt: {
          display: (
            <div className="text-xs leading-relaxed text-slate-600">
              {formatDateTime(role.updatedAt)}
            </div>
          ),
          sortValue: role.updatedAt
        },
        actions: {
          display:
            canUpdateRole || canDeleteRole ? (
              <div className="flex items-center justify-center gap-2">
                {canUpdateRole ? (
                  <Button
                    type="button"
                    variant="primary"
                    rounded="md"
                    className="gap-1.5 px-3 py-2 text-xs font-semibold"
                    onClick={() => handleOpenUpdate(role)}
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    Update
                  </Button>
                ) : null}
                {canDeleteRole && role.userCount === 0 ? (
                  <Button
                    type="button"
                    variant="danger"
                    rounded="md"
                    className="gap-1.5 px-3 py-2 text-xs font-semibold shadow-sm"
                    onClick={() => setDeleteTargetRole(role)}
                    disabled={deleteRoleMutation.isPending}
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
            canUpdateRole ? "Update" : "",
            canDeleteRole ? "Delete" : ""
          ]
            .filter(Boolean)
            .join(" ")
        }
      })),
    [canDeleteRole, canUpdateRole, deleteRoleMutation.isPending, roles]
  );

  return (
    <AdminManagementLayout
      title="Manajemen Peran"
      description="Kelola role dan assign permission untuk Beranda Admin."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Manajemen Peran"
          description="Kelola struktur role admin, permission yang digunakan, dan distribusi akses user dalam satu halaman."
          actions={
            canCreateRole ? (
              <Button
                type="button"
                variant="primary"
                rounded="md"
                className="gap-2 px-4 py-2 text-sm font-semibold"
                onClick={handleOpenCreate}
              >
                <PlusIcon className="h-4 w-4" />
                Tambah Role
              </Button>
            ) : null
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                Daftar Role
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Tinjau role yang tersedia, jumlah permission, jumlah user, dan
                lakukan pembaruan akses dari tabel berikut.
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_auto] md:items-center">
              <Input
                id="role-search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama role, slug, atau status..."
                className="h-8 rounded-md py-1 text-xs"
              />
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
                  itemLabel="role"
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
            ) : roles.length === 0 ? (
              <EmptyStatePanel
                title="Role tidak ditemukan"
                description="Belum ada role yang sesuai dengan pencarian saat ini."
                compact
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  className="max-h-140"
                  tableClassName="w-full min-w-[980px] text-sm"
                  disableDefaultMinWidth
                  showRowNumber
                  initialSortKey="updatedAt"
                  initialSortDirection="desc"
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

        <RoleFormModal
          open={modalOpen}
          mode={modalMode}
          role={selectedRole}
          permissions={permissions}
          loading={createRoleMutation.isPending || updateRoleMutation.isPending}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <ConfirmationModal
          open={Boolean(deleteTargetRole)}
          title="Hapus Role"
          description={`Role "${deleteTargetRole?.name ?? "-"}" akan dihapus. Tindakan ini tidak dapat dibatalkan dari halaman ini.`}
          confirmLabel="Hapus Role"
          confirmTone="danger"
          loading={deleteRoleMutation.isPending}
          onClose={() => setDeleteTargetRole(null)}
          onConfirm={() => {
            if (!deleteTargetRole) return;
            return handleDeleteRole(deleteTargetRole);
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
