import {
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  UserCircleIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { useCallback, useMemo, useState } from "react";
import { UserFormModal } from "@/components/admin-dashboard/user-management/UserFormModal";
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
import { useUserManagementPage } from "@/hooks/admin-dashboard/useUserManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  AdminUserFormValues,
  AdminUserRecord,
  AdminUserSortDirection,
  AdminUserSortField
} from "@/type/admin-management/adminDashboardUser";
import { getUserAccessFromStorage, hasAnyPermission } from "@/utils/access";
import { cn } from "@/utils/cn";

const USER_STATUS_LABEL = {
  active: "Aktif",
  inactive: "Nonaktif"
} as const;

export function AdminUserManagementPage() {
  useDocumentTitle(`Manajemen Pengguna | ${APP_NAME}`);

  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AdminUserSortField>("updated_at");
  const [sortDirection, setSortDirection] =
    useState<AdminUserSortDirection>("desc");
  const [tableSortKey, setTableSortKey] = useState("updatedAt");
  const [tableSortDirection, setTableSortDirection] =
    useState<AdminUserSortDirection>("desc");
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] =
    useState<AdminUserRecord | null>(null);
  const accessUser = getUserAccessFromStorage();

  const {
    usersQuery,
    userDetailQuery,
    rolesQuery,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation
  } = useUserManagementPage(
    {
      search: query,
      page,
      perPage: limit === "ALL" ? 9999 : Number(limit),
      sortBy,
      sortDirection
    },
    modalMode === "update" ? selectedUser?.id : null
  );

  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data]);
  const roleOptions = useMemo(
    () =>
      (rolesQuery.data?.items ?? []).map((role) => ({
        value: role.value,
        label: role.label,
        slug: role.slug,
        description: role.description
      })),
    [rolesQuery.data]
  );
  const activeUser =
    modalMode === "update"
      ? (userDetailQuery.data?.data ?? selectedUser)
      : null;

  const canCreateUser = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_USERS_CREATE
  ]);
  const canUpdateUser = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_USERS_UPDATE
  ]);
  const canDeleteUser = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_USERS_DELETE
  ]);

  const totalUsers = usersQuery.data?.total ?? 0;
  const totalPages = usersQuery.data?.lastPage ?? 1;
  const currentPage = usersQuery.data?.page ?? page;
  const summary = usersQuery.data?.summary;

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Pengguna",
        value: String(summary?.totalUsers ?? totalUsers),
        caption: "Total akun admin yang saat ini tercatat di sistem.",
        icon: UserGroupIcon
      },
      {
        title: "Pengguna Aktif",
        value: String(users.filter((item) => item.status === "active").length),
        caption: "Jumlah akun aktif pada data halaman yang sedang ditampilkan.",
        icon: CheckCircleIcon
      },
      {
        title: "Role Aktif",
        value: String(summary?.activeRoleCount ?? 0),
        caption: "Jumlah role aktif berdasarkan ringkasan dari database.",
        icon: UserCircleIcon
      },
      {
        title: "Pengguna Terbaru",
        value: summary?.latestUser?.name ?? "-",
        caption: "Pengguna terbaru berdasarkan ringkasan dari database.",
        icon: UserCircleIcon
      }
    ],
    [summary, totalUsers, users]
  );

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleOpenUpdate = (user: AdminUserRecord) => {
    setModalMode("update");
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (createUserMutation.isPending || updateUserMutation.isPending) {
      return;
    }

    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = useCallback(
    async (user: AdminUserRecord) => {
      if (!canDeleteUser) return;

      try {
        await deleteUserMutation.mutateAsync(user.id);
        toast({
          title: "Pengguna berhasil dihapus",
          description: `Akun ${user.name} telah dihapus.`,
          tone: "success"
        });
        setDeleteTargetUser(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menghapus pengguna.";

        toast({
          title: "Gagal menghapus pengguna",
          description: message,
          tone: "error"
        });
      }
    },
    [canDeleteUser, deleteUserMutation, toast]
  );

  const handleSubmit = async (values: AdminUserFormValues) => {
    const payload = {
      name: values.name,
      email: values.email,
      status: values.status,
      roles: values.role ? [values.role] : [],
      ...(values.password ? { password: values.password } : {}),
      ...(values.passwordConfirmation
        ? { password_confirmation: values.passwordConfirmation }
        : {})
    };

    try {
      if (modalMode === "create") {
        const result = await createUserMutation.mutateAsync(payload);
        toast({
          title: "Pengguna berhasil ditambahkan",
          description: result.message,
          tone: "success"
        });
      } else if (selectedUser) {
        const result = await updateUserMutation.mutateAsync({
          userId: selectedUser.id,
          payload
        });
        toast({
          title: "Pengguna berhasil diperbarui",
          description: result.message,
          tone: "success"
        });
      }

      handleCloseModal();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan pengguna.";

      toast({
        title: "Gagal menyimpan data",
        description: message,
        tone: "error"
      });
    }
  };

  const isLoading = usersQuery.isLoading || rolesQuery.isLoading;
  const isModalLoading =
    createUserMutation.isPending ||
    updateUserMutation.isPending ||
    (modalMode === "update" && userDetailQuery.isLoading);

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
    { key: "name", label: "Nama", className: "min-w-56" },
    { key: "email", label: "Email", className: "min-w-52" },
    { key: "role", label: "Role", className: "min-w-40", sortable: false },
    {
      key: "status",
      label: "Status",
      className: "min-w-28",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    },
    { key: "updatedAt", label: "Terakhir Diubah", className: "min-w-40" },
    {
      key: "actions",
      label: "Aksi",
      className: "min-w-56",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    }
  ];

  const tableRows = useMemo(
    () =>
      users.map((user) => ({
        name: {
          display: (
            <div className="min-w-0 font-semibold text-slate-900">
              {user.name}
            </div>
          ),
          sortValue: user.name
        },
        email: {
          display: <span className="text-sm text-slate-700">{user.email}</span>,
          sortValue: user.email
        },
        role: {
          display: (
            <div className="flex flex-wrap gap-1.5">
              {user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <span
                    key={`${user.id}-${role}`}
                    className="inline-flex rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-[#223B8F] ring-1 ring-blue-100"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">-</span>
              )}
            </div>
          ),
          sortValue: user.roles.join(", ")
        },
        status: {
          display: (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                user.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {USER_STATUS_LABEL[user.status]}
            </span>
          ),
          sortValue: USER_STATUS_LABEL[user.status]
        },
        updatedAt: {
          display: (
            <div className="text-xs leading-relaxed text-slate-600">
              {formatDateTime(user.updatedAt)}
            </div>
          ),
          sortValue: user.updatedAt
        },
        actions: {
          display:
            canUpdateUser || canDeleteUser ? (
              <div className="flex items-center justify-center gap-2">
                {canUpdateUser ? (
                  <Button
                    type="button"
                    variant="primary"
                    rounded="md"
                    className="gap-1.5 px-3 py-2 text-xs font-semibold"
                    onClick={() => handleOpenUpdate(user)}
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    Update
                  </Button>
                ) : null}
                {canDeleteUser ? (
                  <Button
                    type="button"
                    variant="danger"
                    rounded="md"
                    className="gap-1.5 px-3 py-2 text-xs font-semibold shadow-sm"
                    onClick={() => setDeleteTargetUser(user)}
                    disabled={deleteUserMutation.isPending}
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
            canUpdateUser ? "Update" : "",
            canDeleteUser ? "Delete" : ""
          ]
            .filter(Boolean)
            .join(" ")
        }
      })),
    [canDeleteUser, canUpdateUser, deleteUserMutation.isPending, users]
  );

  return (
    <AdminManagementLayout
      title="Manajemen Pengguna"
      description="Kelola akun admin, peran, status akun, dan data pengguna terbaru."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Manajemen Pengguna"
          description="Kelola data pengguna admin, peran yang digunakan, dan status akun dalam satu halaman."
          actions={
            canCreateUser ? (
              <Button
                type="button"
                variant="primary"
                rounded="md"
                className="gap-2 px-4 py-2 text-sm font-semibold"
                onClick={handleOpenCreate}
              >
                <PlusIcon className="h-4 w-4" />
                Tambah Pengguna
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
                Daftar Pengguna
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Tinjau pengguna admin, role yang digunakan, status akun, dan
                data pembaruan terakhir dari tabel berikut.
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,320px)_auto] md:items-center">
              <form
                className="flex items-center gap-2"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  id="user-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Cari nama, email, atau role..."
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
                  itemLabel="pengguna"
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
            ) : users.length === 0 ? (
              <EmptyStatePanel
                title="Pengguna tidak ditemukan"
                description="Belum ada pengguna yang sesuai dengan pencarian saat ini."
                compact
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  className="max-h-140"
                  tableClassName="w-full min-w-[1040px] text-sm"
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

        <UserFormModal
          open={modalOpen}
          mode={modalMode}
          user={activeUser}
          roleOptions={roleOptions}
          loading={isModalLoading}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <ConfirmationModal
          open={Boolean(deleteTargetUser)}
          title="Hapus Pengguna"
          description={`Akun "${deleteTargetUser?.name ?? "-"}" akan dihapus. Tindakan ini tidak dapat dibatalkan dari halaman ini.`}
          confirmLabel="Hapus Pengguna"
          confirmTone="danger"
          loading={deleteUserMutation.isPending}
          onClose={() => setDeleteTargetUser(null)}
          onConfirm={() => {
            if (!deleteTargetUser) return;
            return handleDeleteUser(deleteTargetUser);
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

function mapTableSortKeyToBackend(sortKey: string): AdminUserSortField | null {
  switch (sortKey) {
    case "name":
      return "name";
    case "email":
      return "email";
    case "updatedAt":
      return "updated_at";
    case "role":
    case "status":
    case "actions":
    default:
      return null;
  }
}
