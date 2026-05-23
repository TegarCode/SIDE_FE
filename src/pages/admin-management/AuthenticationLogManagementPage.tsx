import {
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Modal } from "@/components/ui/Modal";
import { PageTitle } from "@/components/ui/PageTitle";
import { Pagination } from "@/components/ui/Pagination";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/constants/app";
import { PERMISSIONS } from "@/constants/permissions";
import { useAuthenticationLogManagementPage } from "@/hooks/admin-dashboard/useAuthenticationLogManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  AdminAuthenticationLogRecord,
  AdminAuthenticationLogSortDirection,
  AdminAuthenticationLogSortField
} from "@/type/admin-management/adminDashboardAuthenticationLog";
import { getUserAccessFromStorage, hasAnyPermission } from "@/utils/access";
import { getApiErrorMessage } from "@/utils/apiFormError";

const BOOLEAN_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "true", label: "Ya" },
  { value: "false", label: "Tidak" }
] as const;

export function AdminAuthenticationLogManagementPage() {
  useDocumentTitle(`Manajemen Authentication Log | ${APP_NAME}`);

  const { toast } = useToast();
  const accessUser = getUserAccessFromStorage();

  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loginSuccessfulFilter, setLoginSuccessfulFilter] = useState<
    boolean | undefined
  >(undefined);
  const [loginSuccessfulInput, setLoginSuccessfulInput] = useState<
    "all" | "true" | "false"
  >("all");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] =
    useState<AdminAuthenticationLogSortField>("login_at");
  const [sortDirection, setSortDirection] =
    useState<AdminAuthenticationLogSortDirection>("desc");
  const [tableSortKey, setTableSortKey] = useState("loginAt");
  const [tableSortDirection, setTableSortDirection] =
    useState<AdminAuthenticationLogSortDirection>("desc");
  const [selectedLog, setSelectedLog] =
    useState<AdminAuthenticationLogRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTargetLog, setDeleteTargetLog] =
    useState<AdminAuthenticationLogRecord | null>(null);

  const {
    authenticationLogsQuery,
    authenticationLogDetailQuery,
    deleteAuthenticationLogMutation
  } = useAuthenticationLogManagementPage(
    {
      search: query,
      page,
      perPage: limit === "ALL" ? 9999 : Number(limit),
      loginSuccessful: loginSuccessfulFilter,
      sortBy,
      sortDirection
    },
    detailOpen ? selectedLog?.id : null
  );

  const logs = useMemo(
    () => authenticationLogsQuery.data?.items ?? [],
    [authenticationLogsQuery.data]
  );

  const activeLog = authenticationLogDetailQuery.data?.data ?? selectedLog;
  const summary = authenticationLogsQuery.data?.summary;
  const totalLogs = authenticationLogsQuery.data?.total ?? 0;
  const totalPages = authenticationLogsQuery.data?.lastPage ?? 1;
  const currentPage = authenticationLogsQuery.data?.page ?? page;
  const canDeleteLog = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_AUTHENTICATION_LOGS_DELETE
  ]);

  useEffect(() => {
    if (!authenticationLogsQuery.isError) return;

    toast({
      title: "Gagal memuat authentication log",
      description: getApiErrorMessage(
        authenticationLogsQuery.error,
        "Daftar authentication log tidak berhasil dimuat."
      ),
      tone: "error"
    });
  }, [authenticationLogsQuery.error, authenticationLogsQuery.isError, toast]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Log",
        value: String(summary?.totalLog ?? totalLogs),
        caption:
          "Total log authentication yang tercatat dari sistem login admin.",
        icon: ShieldCheckIcon
      },
      {
        title: "Login Berhasil",
        value: String(summary?.loginBerhasil ?? 0),
        caption:
          "Jumlah login yang berhasil diproses oleh sistem authentication.",
        icon: CheckCircleIcon
      },
      {
        title: "Log Terbaru",
        value: summary?.logTerbaru?.user?.name || "Pengguna tidak tersedia",
        caption: summary?.logTerbaru?.loginAt
          ? `Login ${formatDateTime(summary.logTerbaru.loginAt)}`
          : "Belum ada data authentication log terbaru.",
        icon: EyeIcon
      }
    ],
    [summary, totalLogs]
  );

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(searchInput.trim());
    setLoginSuccessfulFilter(toBooleanFilter(loginSuccessfulInput));
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

  const handleDeleteLog = async (logItem: AdminAuthenticationLogRecord) => {
    try {
      await deleteAuthenticationLogMutation.mutateAsync(logItem.id);

      toast({
        title: "Authentication log berhasil dihapus",
        description: "Data log telah dihapus dari daftar.",
        tone: "success"
      });

      setDeleteTargetLog(null);
    } catch (error) {
      toast({
        title: "Gagal menghapus authentication log",
        description: getApiErrorMessage(
          error,
          "Authentication log tidak berhasil dihapus."
        ),
        tone: "error"
      });
    }
  };

  const tableColumns = [
    { key: "userName", label: "User", className: "min-w-44" },
    { key: "userEmail", label: "Email", className: "min-w-52" },
    {
      key: "ipAddress",
      label: "IP Address",
      className: "min-w-36",
      sortable: false
    },
    {
      key: "userAgent",
      label: "User Agent",
      className: "min-w-64",
      sortable: false
    },
    { key: "loginAt", label: "Login At", className: "min-w-40" },
    { key: "logoutAt", label: "Logout At", className: "min-w-40" },
    {
      key: "loginSuccessful",
      label: "Login Berhasil",
      className: "min-w-32",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    },
    {
      key: "location",
      label: "Location",
      className: "min-w-40",
      sortable: false
    },
    {
      key: "actions",
      label: "Aksi",
      className: "min-w-72",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    }
  ];

  const tableRows = logs.map((logItem) => ({
    userName: {
      display: (
        <div className="font-semibold text-slate-900">
          {logItem.user?.name || "Pengguna tidak tersedia"}
        </div>
      ),
      sortValue: logItem.user?.name || ""
    },
    userEmail: {
      display: (
        <div className="text-sm text-slate-700">
          {logItem.user?.email || "-"}
        </div>
      ),
      sortValue: logItem.user?.email || ""
    },
    ipAddress: {
      display: (
        <div className="text-sm text-slate-700">{logItem.ipAddress || "-"}</div>
      ),
      sortValue: logItem.ipAddress
    },
    userAgent: {
      display: (
        <div className="max-w-xl break-words text-sm leading-relaxed text-slate-600">
          <span className="line-clamp-2">{logItem.userAgent || "-"}</span>
        </div>
      ),
      sortValue: logItem.userAgent
    },
    loginAt: {
      display: (
        <div className="text-xs leading-relaxed text-slate-600">
          {formatDateTime(logItem.loginAt)}
        </div>
      ),
      sortValue: logItem.loginAt
    },
    logoutAt: {
      display: (
        <div className="text-xs leading-relaxed text-slate-600">
          {formatDateTime(logItem.logoutAt)}
        </div>
      ),
      sortValue: logItem.logoutAt
    },
    loginSuccessful: {
      display: (
        <StatusPill
          active={logItem.loginSuccessful}
          activeLabel="Berhasil"
          inactiveLabel="Gagal"
        />
      ),
      sortValue: logItem.loginSuccessful ? "Berhasil" : "Gagal"
    },
    location: {
      display: (
        <div className="max-w-xs break-words text-sm text-slate-600">
          <span className="line-clamp-2">{logItem.location || "-"}</span>
        </div>
      ),
      sortValue: logItem.location
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
              setSelectedLog(logItem);
              setDetailOpen(true);
            }}
          >
            <EyeIcon className="h-3.5 w-3.5" />
            Detail
          </Button>

          {canDeleteLog ? (
            <Button
              type="button"
              variant="danger"
              rounded="md"
              className="gap-1.5 px-3 py-2 text-xs font-semibold"
              onClick={() => setDeleteTargetLog(logItem)}
              disabled={deleteAuthenticationLogMutation.isPending}
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </Button>
          ) : null}

          {!canDeleteLog ? (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <EllipsisHorizontalIcon className="h-4 w-4" />
              Tidak ada aksi tambahan
            </span>
          ) : null}
        </div>
      ),
      sortValue: logItem.id
    }
  }));

  const isLoading = authenticationLogsQuery.isLoading;

  return (
    <AdminManagementLayout
      title="Manajemen Authentication Log"
      description="Tinjau histori login admin, ubah status clear, dan hapus log yang tidak diperlukan dari satu halaman admin."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Manajemen Authentication Log"
          description="Kelola authentication log sistem login admin dengan filter pencarian, status login, status clear, detail, dan aksi pembaruan."
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
          <div className="border-b border-slate-200 pb-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-slate-900">
                  Daftar Authentication Log
                </div>
                <div className="mt-1 text-sm leading-relaxed text-slate-500">
                  Tinjau histori login admin, status berhasil login, status
                  clear, dan lakukan tindak lanjut dari tabel berikut.
                </div>
              </div>

              <div className="shrink-0">
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
                    itemLabel="log"
                    className="w-28"
                  />
                </div>
              </div>
            </div>

            <form
              className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_auto]"
              onSubmit={handleSearchSubmit}
            >
              <Input
                id="authentication-log-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Cari user, email, IP, atau lokasi..."
                className="h-8 rounded-md py-1 text-xs"
              />

              <Select
                value={loginSuccessfulInput}
                options={BOOLEAN_FILTER_OPTIONS.map((item) => ({
                  value: item.value,
                  label:
                    item.value === "all"
                      ? "Semua Login"
                      : item.value === "true"
                        ? "Login Berhasil"
                        : "Login Gagal"
                }))}
                onChange={(nextValue) =>
                  setLoginSuccessfulInput(nextValue as "all" | "true" | "false")
                }
                size="sm"
                isSearchable={false}
                className="min-w-55"
              />

              <Button
                type="submit"
                variant="primary"
                rounded="md"
                className="h-8 shrink-0 gap-1.5 px-4 text-xs font-semibold md:w-fit"
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                Cari
              </Button>
            </form>
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
            ) : authenticationLogsQuery.isError ? (
              <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
                <div>
                  <div className="text-sm font-semibold text-rose-700">
                    Gagal memuat authentication log
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-rose-700">
                    {getApiErrorMessage(
                      authenticationLogsQuery.error,
                      "Data authentication log belum dapat diambil dari server."
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  rounded="md"
                  className="px-4 py-2 text-sm font-semibold"
                  onClick={() => void authenticationLogsQuery.refetch()}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : logs.length === 0 ? (
              <EmptyStatePanel
                title="Authentication log tidak ditemukan"
                description="Belum ada data authentication log yang sesuai dengan filter saat ini."
                compact
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  className="max-h-140"
                  tableClassName="w-full min-w-[1680px] text-sm"
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

        <AuthenticationLogDetailModal
          open={detailOpen}
          logItem={activeLog ?? null}
          loading={detailOpen && authenticationLogDetailQuery.isLoading}
          onClose={() => {
            setDetailOpen(false);
            setSelectedLog(null);
          }}
        />

        <ConfirmationModal
          open={Boolean(deleteTargetLog)}
          title="Hapus Authentication Log"
          description={`Authentication log "${
            deleteTargetLog?.user?.name || deleteTargetLog?.id || "-"
          }" akan dihapus. Tindakan ini tidak dapat dibatalkan dari halaman ini.`}
          confirmLabel="Hapus Log"
          confirmTone="danger"
          loading={deleteAuthenticationLogMutation.isPending}
          onClose={() => setDeleteTargetLog(null)}
          onConfirm={() => {
            if (!deleteTargetLog) return;
            return handleDeleteLog(deleteTargetLog);
          }}
        />
      </div>
    </AdminManagementLayout>
  );
}

function AuthenticationLogDetailModal({
  open,
  logItem,
  loading,
  onClose
}: {
  open: boolean;
  logItem: AdminAuthenticationLogRecord | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Authentication Log"
      subtitle="Tinjau data lengkap histori login dari sistem authentication."
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
      ) : !logItem ? (
        <EmptyStatePanel
          title="Detail tidak tersedia"
          description="Data authentication log belum dapat ditampilkan."
          compact
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <DetailItem
              label="Nama Pengguna"
              value={logItem.user?.name || "Pengguna tidak tersedia"}
            />
            <DetailItem
              label="Email Pengguna"
              value={logItem.user?.email || "-"}
            />
            <DetailItem label="IP Address" value={logItem.ipAddress || "-"} />
            <DetailItem label="Location" value={logItem.location || "-"} />
            <DetailItem
              label="Login At"
              value={formatDateTime(logItem.loginAt)}
            />
            <DetailItem
              label="Logout At"
              value={formatDateTime(logItem.logoutAt)}
            />
            <DetailItem
              label="Login Successful"
              value={logItem.loginSuccessful ? "Berhasil" : "Gagal"}
            />
          </div>

          <DetailBlock label="User Agent" value={logItem.userAgent || "-"} />

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

function StatusPill({
  active,
  activeLabel,
  inactiveLabel
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={
        active
          ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
          : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
      }
    >
      {active ? activeLabel : inactiveLabel}
    </span>
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
): AdminAuthenticationLogSortField | null {
  switch (sortKey) {
    case "loginAt":
      return "login_at";
    case "logoutAt":
      return "logout_at";
    default:
      return null;
  }
}

function toBooleanFilter(value: "all" | "true" | "false") {
  if (value === "all") return undefined;
  return value === "true";
}
