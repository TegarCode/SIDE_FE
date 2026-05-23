import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ServerStackIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Select } from "@/components/ui/Form/Select";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { Pagination } from "@/components/ui/Pagination";
import { PageTitle } from "@/components/ui/PageTitle";
import {
  SortableDataTable,
  type SortDirection
} from "@/components/ui/SortableDataTable";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/constants/app";
import { PERMISSIONS } from "@/constants/permissions";
import { useTradeManagementPage } from "@/hooks/admin-dashboard/useTradeManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  TradeBatchRecord,
  TradeRowRecord
} from "@/type/admin-management/adminDashboardTrade";
import { getUserAccessFromStorage, hasAnyPermission } from "@/utils/access";
import { getApiErrorMessage } from "@/utils/apiFormError";
import { cn } from "@/utils/cn";
import { EditRowModal } from "./manual-input-section";
import {
  formatDateTime,
  ROW_SORT_OPTIONS,
  SORT_DIRECTION_OPTIONS
} from "./types";

export function AdminTradeDetailPage() {
  useDocumentTitle(`Detail Batch Perdagangan | ${APP_NAME}`);

  const { batchId = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const accessUser = getUserAccessFromStorage();
  const [rowPage, setRowPage] = useState(1);
  const [rowLimit, setRowLimit] = useState("25");
  const [rowSortBy, setRowSortBy] = useState("row_status");
  const [rowSortDirection, setRowSortDirection] = useState<"asc" | "desc">(
    "asc"
  );
  const [editingRow, setEditingRow] = useState<TradeRowRecord | null>(null);
  const [deletingRow, setDeletingRow] = useState<TradeRowRecord | null>(null);
  const [selectedRowsState, setSelectedRowsState] = useState<{
    scope: string;
    ids: Set<string>;
  }>(() => ({ scope: "", ids: new Set() }));
  const [bulkDeleteScope, setBulkDeleteScope] = useState<string | null>(null);
  const [clearStagingOpen, setClearStagingOpen] = useState(false);

  const canUpdate = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_UPDATE
  ]);
  const canDelete = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_TRADE_DELETE
  ]);

  const {
    detailQuery,
    optionsQuery,
    updateRowMutation,
    deleteRowMutation,
    deleteRowsMutation,
    clearStagingMutation
  } = useTradeManagementPage({ page: 1, perPage: 1 }, batchId, {
    page: rowPage,
    perPage: Number(rowLimit),
    sortBy: rowSortBy,
    sortDirection: rowSortDirection
  });

  const batch = detailQuery.data?.data ?? null;
  const rowsMeta = batch?.rowsMeta;
  const canMutateRows =
    (canUpdate || canDelete) && batch
      ? !["approved", "published"].includes(batch.status)
      : false;
  const canEditRows = canUpdate && canMutateRows;
  const canDeleteRows = canDelete && canMutateRows;
  const canClearPublishedStaging =
    canDelete && batch?.status === "published" && (batch.rows?.length ?? 0) > 0;
  const tableScope = `${batchId}:${rowPage}:${rowLimit}:${rowSortBy}:${rowSortDirection}`;
  const selectedRowIds =
    selectedRowsState.scope === tableScope
      ? selectedRowsState.ids
      : new Set<string>();
  const visibleRowIds = useMemo(
    () => batch?.rows.map((row) => row.id) ?? [],
    [batch?.rows]
  );
  const selectedRowsCount = selectedRowIds.size;
  const bulkDeleteOpen = bulkDeleteScope === tableScope;
  const allVisibleRowsSelected =
    visibleRowIds.length > 0 &&
    visibleRowIds.every((rowId) => selectedRowIds.has(rowId));

  const setSelectedRowIds = (
    updater: Set<string> | ((current: Set<string>) => Set<string>)
  ) => {
    setSelectedRowsState((current) => {
      const currentIds =
        current.scope === tableScope ? current.ids : new Set<string>();
      return {
        scope: tableScope,
        ids: typeof updater === "function" ? updater(currentIds) : updater
      };
    });
  };

  const toggleRowSelection = (rowId: string) => {
    setSelectedRowIds((current) => {
      const next = new Set(current);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const toggleVisibleRowSelection = () => {
    setSelectedRowIds((current) => {
      if (allVisibleRowsSelected) return new Set();
      const next = new Set(current);
      visibleRowIds.forEach((rowId) => next.add(rowId));
      return next;
    });
  };

  const countryOptions = useMemo(
    () =>
      (optionsQuery.data?.countries ?? []).map((item) => ({
        value: item.value,
        label: item.label
      })),
    [optionsQuery.data?.countries]
  );
  const sectorOptions = useMemo(
    () =>
      (optionsQuery.data?.sectors ?? []).map((item) => ({
        value: item.value,
        label: item.label
      })),
    [optionsQuery.data?.sectors]
  );
  const sourceOptions = useMemo(
    () =>
      (optionsQuery.data?.sources ?? []).map((item) => ({
        value: item.value,
        label: item.label
      })),
    [optionsQuery.data?.sources]
  );
  const tradeStatusOptions = useMemo(
    () =>
      (optionsQuery.data?.statuses ?? []).map((item) => ({
        value: item.value,
        label: item.label
      })),
    [optionsQuery.data?.statuses]
  );
  const hsLenOptions = useMemo(
    () =>
      (optionsQuery.data?.hsLevels ?? []).map((item) => ({
        value: item.value,
        label: item.label
      })),
    [optionsQuery.data?.hsLevels]
  );

  const columns = [
    ...(canDeleteRows
      ? [
          {
            key: "select",
            label: "Pilih",
            className: "w-16",
            sortable: false,
            align: "center" as const
          }
        ]
      : []),
    { key: "Kode_Alpha3_Reporter", label: "Reporter", className: "min-w-20" },
    {
      key: "reporter_country",
      label: "Negara Reporter",
      className: "min-w-36",
      sortable: false
    },
    {
      key: "Provinsi_Reporter",
      label: "Provinsi Reporter",
      className: "min-w-36"
    },
    { key: "Kota_Reporter", label: "Kota Reporter", className: "min-w-32" },
    { key: "Kode_Alpha3_Partner", label: "Partner", className: "min-w-20" },
    {
      key: "partner_country",
      label: "Negara Partner",
      className: "min-w-36",
      sortable: false
    },
    {
      key: "Provinsi_Partner",
      label: "Provinsi Partner",
      className: "min-w-36"
    },
    { key: "Kota_Partner", label: "Kota Partner", className: "min-w-32" },
    { key: "Bulan", label: "Bulan", className: "min-w-20" },
    { key: "Tahun", label: "Tahun", className: "min-w-20" },
    { key: "HsCode", label: "HS Code", className: "min-w-24" },
    {
      key: "hs_description",
      label: "Deskripsi HS",
      className: "min-w-64",
      sortable: false
    },
    { key: "ID_Sektor", label: "ID Sektor", className: "min-w-24" },
    { key: "sektor", label: "Sektor", className: "min-w-40", sortable: false },
    { key: "Vol", label: "Volume", className: "min-w-24" },
    { key: "Satuan", label: "Satuan", className: "min-w-24" },
    { key: "Tarif", label: "Tarif", className: "min-w-24" },
    { key: "Nilai", label: "Nilai", className: "min-w-28" },
    { key: "Kode_Sumber", label: "Kode Sumber", className: "min-w-24" },
    { key: "sumber", label: "Sumber", className: "min-w-36", sortable: false },
    { key: "Status", label: "Status", className: "min-w-24" },
    { key: "Berat_Bersih", label: "Berat Bersih", className: "min-w-28" },
    { key: "Pelabuhan", label: "Pelabuhan", className: "min-w-40" },
    { key: "hs_len", label: "Panjang HS", className: "min-w-20" },
    { key: "row_status", label: "Status Baris", className: "min-w-28" },
    {
      key: "validation_errors",
      label: "Error Validasi",
      className: "min-w-80",
      sortable: false
    },
    ...(canEditRows || canDeleteRows
      ? [
          {
            key: "actions",
            label: "Aksi",
            className: "min-w-20",
            sortable: false
          }
        ]
      : [])
  ];

  const rows =
    batch?.rows.map((row) => ({
      ...(canDeleteRows
        ? {
            select: {
              display: (
                <input
                  type="checkbox"
                  aria-label="Pilih baris"
                  checked={selectedRowIds.has(row.id)}
                  onChange={() => toggleRowSelection(row.id)}
                  className="h-4 w-4 rounded border-slate-300 text-[#223B8F] focus:ring-[#223B8F]"
                />
              ),
              sortValue: selectedRowIds.has(row.id) ? 1 : 0
            }
          }
        : {}),
      Kode_Alpha3_Reporter: row.kodeAlpha3Reporter || "-",
      reporter_country: row.reporterCountry || "-",
      Provinsi_Reporter: row.provinsiReporter || "-",
      Kota_Reporter: row.kotaReporter || "-",
      Kode_Alpha3_Partner: row.kodeAlpha3Partner || "-",
      partner_country: row.partnerCountry || "-",
      Provinsi_Partner: row.provinsiPartner || "-",
      Kota_Partner: row.kotaPartner || "-",
      Bulan: row.bulan || "-",
      Tahun: row.tahun ?? "-",
      HsCode: row.hsCode || "-",
      hs_description: row.hsDescription || "-",
      ID_Sektor: row.idSektor || "-",
      sektor: row.sektor || "-",
      Vol: row.vol ?? "-",
      Satuan: row.satuan || "-",
      Tarif: row.tarif ?? "-",
      Nilai: row.nilai ?? "-",
      Kode_Sumber: row.kodeSumber || "-",
      sumber: row.sumber || "-",
      Status: row.statusData || "-",
      Berat_Bersih: row.beratBersih ?? "-",
      Pelabuhan: row.pelabuhan || "-",
      hs_len: row.hsLen ?? "-",
      row_status: {
        display: <RowStatusBadge status={row.rowStatus} />,
        sortValue: row.rowStatus
      },
      validation_errors: {
        display: <ValidationErrors errors={row.validationErrors} />,
        sortValue: Object.keys(row.validationErrors).length
      },
      ...(canEditRows || canDeleteRows
        ? {
            actions: {
              display: (
                <div className="flex items-center gap-2">
                  {canEditRows ? (
                    <Button
                      type="button"
                      variant="warning"
                      rounded="md"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingRow(row)}
                      aria-label="Ubah baris"
                      title="Ubah baris"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {canDeleteRows ? (
                    <Button
                      type="button"
                      variant="danger"
                      rounded="md"
                      className="h-8 w-8 p-0"
                      onClick={() => setDeletingRow(row)}
                      aria-label="Hapus baris"
                      title="Hapus baris"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              ),
              sortValue: row.id
            }
          }
        : {})
    })) ?? [];

  return (
    <AdminManagementLayout
      title="Detail Batch Perdagangan"
      description="Tinjau rincian batch data perdagangan, status validasi, dan daftar baris data yang masuk ke proses pengelolaan."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Detail Batch Perdagangan"
          description="Halaman ini menampilkan ringkasan batch, status proses, waktu pemrosesan, serta baris data perdagangan yang dapat diperiksa, diubah, atau dihapus sesuai hak akses."
          actions={
            <div className="flex flex-wrap gap-2">
              {canClearPublishedStaging ? (
                <Button
                  type="button"
                  variant="danger"
                  rounded="md"
                  className="gap-2 px-4 py-2 text-sm font-semibold"
                  onClick={() => setClearStagingOpen(true)}
                >
                  <TrashIcon className="h-4 w-4" />
                  Hapus Data Staging
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                rounded="md"
                className="gap-2 px-4 py-2 text-sm font-semibold"
                onClick={() => navigate(-1)}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Kembali
              </Button>
            </div>
          }
        />

        {detailQuery.isLoading ? (
          <LoadingRows />
        ) : !batch ? (
          <EmptyStatePanel
            title="Detail tidak ditemukan"
            description="Detail batch perdagangan belum berhasil dimuat atau data tidak tersedia."
            compact
          />
        ) : (
          <div className="space-y-4">
            <BatchSummaryCards batch={batch} />

            <Card className="rounded-lg p-5 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    Daftar Baris Data Perdagangan
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Data ditampilkan per halaman dengan pengurutan dari server
                    agar pemeriksaan tetap ringan.
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                  {canDeleteRows ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        rounded="md"
                        className="px-3 py-1.5 text-xs font-semibold"
                        onClick={toggleVisibleRowSelection}
                        disabled={visibleRowIds.length === 0}
                      >
                        {allVisibleRowsSelected
                          ? "Batal Pilih Halaman Ini"
                          : "Pilih Halaman Ini"}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        rounded="md"
                        className="gap-1.5 px-3 py-1.5 text-xs font-semibold"
                        onClick={() => setBulkDeleteScope(tableScope)}
                        disabled={selectedRowsCount === 0}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Hapus Terpilih
                      </Button>
                    </div>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Select
                      value={rowSortBy}
                      options={ROW_SORT_OPTIONS}
                      onChange={(value) => {
                        setRowSortBy(value);
                        setRowPage(1);
                      }}
                      size="sm"
                    />
                    <Select
                      value={rowSortDirection}
                      options={SORT_DIRECTION_OPTIONS}
                      onChange={(value) => {
                        setRowSortDirection(value as "asc" | "desc");
                        setRowPage(1);
                      }}
                      size="sm"
                    />
                    <DataLimitSelect
                      value={rowLimit}
                      onChange={(value) => {
                        setRowLimit(value);
                        setRowPage(1);
                      }}
                      options={["10", "25", "50", "100"]}
                      itemLabel="baris"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={columns}
                  rows={rows}
                  className="max-h-[62vh]"
                  tableClassName="w-full min-w-[3200px] text-sm"
                  disableDefaultMinWidth
                  showRowNumber
                  rowNumberOffset={
                    ((rowsMeta?.page ?? rowPage) - 1) *
                    (rowsMeta?.perPage ?? Number(rowLimit))
                  }
                  controlledSortKey={rowSortBy}
                  controlledSortDirection={rowSortDirection}
                  onSortChange={(nextSortBy, nextSortDirection) => {
                    setRowSortBy(nextSortBy);
                    setRowSortDirection(nextSortDirection as SortDirection);
                    setRowPage(1);
                  }}
                  manualSorting
                />
              </div>
              <div className="mt-4">
                <Pagination
                  page={rowsMeta?.page ?? rowPage}
                  totalPages={rowsMeta?.lastPage ?? 1}
                  onPageChange={setRowPage}
                  showWhenSinglePage
                />
              </div>
            </Card>
          </div>
        )}

        <EditRowModal
          row={editingRow}
          countryOptions={countryOptions}
          sectorOptions={sectorOptions}
          sourceOptions={sourceOptions}
          statusOptions={tradeStatusOptions}
          hsLenOptions={hsLenOptions}
          loading={updateRowMutation.isPending}
          onClose={() => setEditingRow(null)}
          onSubmit={async (row, payload) => {
            try {
              await updateRowMutation.mutateAsync({
                batchId,
                rowId: row.id,
                payload
              });
              toast({
                title: "Baris data berhasil diperbarui",
                description:
                  "Perubahan pada baris data perdagangan telah disimpan.",
                tone: "success"
              });
              setEditingRow(null);
            } catch (error) {
              toast({
                title: "Gagal memperbarui baris data",
                description: getApiErrorMessage(
                  error,
                  "Baris data perdagangan tidak berhasil disimpan."
                ),
                tone: "error"
              });
            }
          }}
        />

        <ConfirmationModal
          open={Boolean(deletingRow)}
          title="Hapus Baris Data Perdagangan"
          subtitle="Konfirmasi penghapusan satu baris data dari batch perdagangan."
          description="Baris data yang dipilih akan dihapus dari batch ini dan tidak lagi muncul pada daftar pemeriksaan."
          confirmLabel="Hapus"
          confirmTone="danger"
          loading={deleteRowMutation.isPending}
          onClose={() => setDeletingRow(null)}
          onConfirm={async () => {
            if (!deletingRow) return;
            try {
              await deleteRowMutation.mutateAsync({
                batchId,
                rowId: deletingRow.id
              });
              toast({
                title: "Baris data berhasil dihapus",
                description: "Baris data perdagangan telah dihapus dari batch.",
                tone: "success"
              });
              setDeletingRow(null);
              setSelectedRowIds((current) => {
                const next = new Set(current);
                next.delete(deletingRow.id);
                return next;
              });
            } catch (error) {
              toast({
                title: "Gagal menghapus baris data",
                description: getApiErrorMessage(
                  error,
                  "Baris data perdagangan tidak berhasil dihapus."
                ),
                tone: "error"
              });
            }
          }}
        />

        <ConfirmationModal
          open={bulkDeleteOpen}
          title="Hapus Baris Data Terpilih"
          subtitle="Konfirmasi penghapusan beberapa baris data dari batch perdagangan."
          description={`${selectedRowsCount} baris data terpilih akan dihapus dari batch ini. Pastikan pilihan sudah sesuai sebelum melanjutkan.`}
          confirmLabel="Hapus"
          confirmTone="danger"
          loading={deleteRowsMutation.isPending}
          onClose={() => setBulkDeleteScope(null)}
          onConfirm={async () => {
            const rowIds = Array.from(selectedRowIds);
            if (!rowIds.length) return;
            try {
              await deleteRowsMutation.mutateAsync({
                batchId,
                rowIds
              });
              toast({
                title: "Baris data berhasil dihapus",
                description: `${rowIds.length} baris data perdagangan telah dihapus dari batch.`,
                tone: "success"
              });
              setSelectedRowIds(new Set());
              setBulkDeleteScope(null);
            } catch (error) {
              toast({
                title: "Gagal menghapus baris data",
                description: getApiErrorMessage(
                  error,
                  "Baris data perdagangan tidak berhasil dihapus."
                ),
                tone: "error"
              });
            }
          }}
        />

        <ConfirmationModal
          open={clearStagingOpen}
          title="Hapus Data Staging"
          subtitle="Konfirmasi penghapusan seluruh data staging untuk batch yang sudah dipublikasi."
          description="Data staging batch ini akan dihapus, tetapi data yang sudah dipublikasikan ke tabel target tetap dipertahankan."
          confirmLabel="Hapus Staging"
          confirmTone="danger"
          loading={clearStagingMutation.isPending}
          onClose={() => setClearStagingOpen(false)}
          onConfirm={async () => {
            try {
              await clearStagingMutation.mutateAsync(batchId);
              toast({
                title: "Data staging berhasil dihapus",
                description:
                  "Seluruh data staging untuk batch yang sudah dipublikasi telah dibersihkan.",
                tone: "success"
              });
              setClearStagingOpen(false);
            } catch (error) {
              toast({
                title: "Gagal menghapus data staging",
                description: getApiErrorMessage(
                  error,
                  "Data staging tidak berhasil dihapus."
                ),
                tone: "error"
              });
            }
          }}
        />
      </div>
    </AdminManagementLayout>
  );
}

function BatchSummaryCards({ batch }: { batch: TradeBatchRecord }) {
  const cards: Array<{
    label: string;
    value: ReactNode;
    description: string;
    icon: typeof ServerStackIcon;
    tone: string;
  }> = [
    {
      label: "Sumber Data",
      value: getSourceTypeLabel(batch.sourceType),
      description: "Asal input batch perdagangan",
      icon: ServerStackIcon,
      tone: "bg-blue-50 text-[#223B8F] ring-blue-100"
    },
    {
      label: "Nama Berkas",
      value: batch.originalFilename || "-",
      description: "Berkas referensi yang digunakan",
      icon: DocumentTextIcon,
      tone: "bg-slate-100 text-slate-700 ring-slate-200"
    },
    {
      label: "Status Batch",
      value: <StatusBadge status={batch.status} />,
      description: "Tahap proses data saat ini",
      icon: CheckBadgeIcon,
      tone: "bg-emerald-50 text-emerald-700 ring-emerald-100"
    },
    {
      label: "Jumlah Baris",
      value: `${batch.totalRows} baris / ${batch.invalidRows} tidak valid`,
      description: `${batch.validRows} baris valid untuk diproses`,
      icon: DocumentTextIcon,
      tone: "bg-amber-50 text-amber-700 ring-amber-100"
    },
    {
      label: "Waktu Unggah",
      value: formatDateTime(batch.uploadedAt || batch.createdAt),
      description: "Waktu batch masuk ke sistem",
      icon: CloudArrowUpIcon,
      tone: "bg-cyan-50 text-cyan-700 ring-cyan-100"
    },
    {
      label: "Waktu Validasi",
      value: formatDateTime(batch.validatedAt),
      description: "Waktu pemeriksaan data selesai",
      icon: ClockIcon,
      tone: "bg-violet-50 text-violet-700 ring-violet-100"
    },
    {
      label: "Waktu Persetujuan",
      value: formatDateTime(batch.approvedAt),
      description: "Waktu batch disetujui",
      icon: CheckBadgeIcon,
      tone: "bg-teal-50 text-teal-700 ring-teal-100"
    },
    {
      label: "Waktu Publikasi",
      value: formatDateTime(batch.publishedAt),
      description: "Waktu batch dipublikasikan",
      icon: CalendarDaysIcon,
      tone: "bg-indigo-50 text-indigo-700 ring-indigo-100"
    }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone
}: {
  label: string;
  value: ReactNode;
  description: string;
  icon: typeof ServerStackIcon;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </div>
          <div className="mt-2 wrap-break-word text-sm font-semibold leading-snug text-slate-900">
            {value}
          </div>
        </div>
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-lg ring-1",
            tone
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 text-xs leading-relaxed text-slate-500">
        {description}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    validating: "bg-amber-100 text-amber-800",
    valid: "bg-emerald-100 text-emerald-800",
    invalid: "bg-rose-100 text-rose-800",
    approved: "bg-blue-100 text-[#223B8F]",
    rejected: "bg-orange-100 text-orange-800",
    published: "bg-violet-100 text-violet-800",
    failed: "bg-red-100 text-red-800"
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
        styles[status] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function RowStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
        status === "invalid"
          ? "bg-rose-100 text-rose-800"
          : status === "valid"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-slate-100 text-slate-700"
      )}
    >
      {getRowStatusLabel(status)}
    </span>
  );
}

function getSourceTypeLabel(sourceType: string) {
  if (sourceType === "manual") return "Input Manual";
  if (sourceType === "upload") return "Unggah Berkas";
  return sourceType || "-";
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Draf",
    validating: "Sedang Divalidasi",
    valid: "Valid",
    invalid: "Tidak Valid",
    approved: "Disetujui",
    rejected: "Ditolak",
    published: "Dipublikasi",
    failed: "Gagal"
  };

  return labels[status] ?? status ?? "-";
}

function getRowStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    valid: "Valid",
    invalid: "Tidak Valid",
    failed: "Gagal"
  };

  return labels[status] ?? status ?? "-";
}

function ValidationErrors({ errors }: { errors: Record<string, string[]> }) {
  const entries = Object.entries(errors);
  if (!entries.length) return <span className="text-slate-400">-</span>;

  return (
    <div className="space-y-1 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
      {entries.map(([field, messages]) => (
        <div key={field}>
          <span className="font-semibold">{field}: </span>
          <span>{messages.join(", ")}</span>
        </div>
      ))}
    </div>
  );
}

function LoadingRows() {
  return (
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
  );
}
