import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { Pagination } from "@/components/ui/Pagination";
import {
  SortableDataTable,
  type SortDirection
} from "@/components/ui/SortableDataTable";
import type {
  TradeCurrentRecord,
  TradePayloadRow
} from "@/type/admin-management/adminDashboardTrade";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import { getApiErrorMessage } from "@/utils/apiFormError";
import { EditRowModal } from "./manual-input-section";

export function CurrentDataSection({
  rows,
  isLoading,
  isError,
  error,
  page,
  totalPages,
  limit,
  reporterInput,
  partnerInput,
  sourceInput,
  statusInput,
  sectorInput,
  yearInput,
  hsLenInput,
  sortBy,
  sortDirection,
  canUpdate,
  canDelete,
  countryOptions,
  sectorOptions,
  sourceOptions,
  tradeStatusOptions,
  hsLenOptions,
  updateLoading,
  deleteLoading,
  bulkDeleteLoading,
  onSearchSubmit,
  onLimitChange,
  onReporterInputChange,
  onPartnerInputChange,
  onSourceInputChange,
  onStatusInputChange,
  onSectorInputChange,
  onYearInputChange,
  onHsLenInputChange,
  onPageChange,
  onTableSortChange,
  onRefetch,
  onUpdateRow,
  onDeleteRow,
  onDeleteRows
}: {
  rows: TradeCurrentRecord[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  page: number;
  totalPages: number;
  limit: string;
  reporterInput: string;
  partnerInput: string;
  sourceInput: string;
  statusInput: string;
  sectorInput: string;
  yearInput: string;
  hsLenInput: string;
  sortBy: string;
  sortDirection: SortDirection;
  canUpdate: boolean;
  canDelete: boolean;
  countryOptions: SelectOption[];
  sectorOptions: SelectOption[];
  sourceOptions: SelectOption[];
  tradeStatusOptions: SelectOption[];
  hsLenOptions: SelectOption[];
  updateLoading: boolean;
  deleteLoading: boolean;
  bulkDeleteLoading: boolean;
  onSearchSubmit: () => void;
  onLimitChange: (value: string) => void;
  onReporterInputChange: (value: string) => void;
  onPartnerInputChange: (value: string) => void;
  onSourceInputChange: (value: string) => void;
  onStatusInputChange: (value: string) => void;
  onSectorInputChange: (value: string) => void;
  onYearInputChange: (value: string) => void;
  onHsLenInputChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onTableSortChange: (sortBy: string, sortDirection: SortDirection) => void;
  onRefetch: () => void;
  onUpdateRow: (
    row: TradeCurrentRecord,
    payload: TradePayloadRow
  ) => void | Promise<void>;
  onDeleteRow: (row: TradeCurrentRecord) => void | Promise<void>;
  onDeleteRows: (rows: TradeCurrentRecord[]) => void | Promise<void>;
}) {
  const [editingRow, setEditingRow] = useState<TradeCurrentRecord | null>(null);
  const [deletingRow, setDeletingRow] = useState<TradeCurrentRecord | null>(
    null
  );
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const canMutate = canUpdate || canDelete;
  const visibleRowIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const activeSelectedRowIds = useMemo(
    () => selectedRowIds.filter((rowId) => visibleRowIds.includes(rowId)),
    [selectedRowIds, visibleRowIds]
  );
  const selectedRows = useMemo(
    () => rows.filter((row) => activeSelectedRowIds.includes(row.id)),
    [activeSelectedRowIds, rows]
  );
  const allVisibleSelected =
    canDelete &&
    visibleRowIds.length > 0 &&
    visibleRowIds.every((rowId) => activeSelectedRowIds.includes(rowId));

  const columns = [
    ...(canDelete
      ? [
          {
            key: "select",
            label: (
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#384AA0] focus:ring-[#384AA0]"
                  checked={allVisibleSelected}
                  onChange={(event) => {
                    setSelectedRowIds(
                      event.target.checked ? [...visibleRowIds] : []
                    );
                  }}
                  aria-label="Pilih semua data aktif"
                />
              </div>
            ),
            className: "w-12",
            headerClassName: "text-center",
            align: "center" as const,
            sortable: false
          }
        ]
      : []),
    { key: "Kode_Alpha3_Reporter", label: "Reporter", className: "min-w-24" },
    {
      key: "reporter_country",
      label: "Negara Reporter",
      className: "min-w-40",
      sortable: false
    },
    { key: "Kode_Alpha3_Partner", label: "Partner", className: "min-w-24" },
    {
      key: "partner_country",
      label: "Negara Partner",
      className: "min-w-40",
      sortable: false
    },
    { key: "Bulan", label: "Bulan", className: "min-w-24" },
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
    ...(canMutate
      ? [
          {
            key: "actions",
            label: "Aksi",
            className: "min-w-36",
            headerClassName: "text-center",
            align: "center" as const,
            sortable: false
          }
        ]
      : [])
  ];

  const tableRows = rows.map((row) => ({
    ...(canDelete
      ? {
          select: {
            display: (
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#384AA0] focus:ring-[#384AA0]"
                  checked={selectedRowIds.includes(row.id)}
                  onChange={(event) => {
                    setSelectedRowIds((current) =>
                      event.target.checked
                        ? Array.from(new Set([...current, row.id]))
                        : current.filter((item) => item !== row.id)
                    );
                  }}
                  aria-label={`Pilih data aktif ${row.kodeAlpha3Reporter || row.id}`}
                />
              </div>
            ),
            sortValue: row.id
          }
        }
      : {}),
    Kode_Alpha3_Reporter: row.kodeAlpha3Reporter || "-",
    reporter_country: row.reporterCountry || "-",
    Kode_Alpha3_Partner: row.kodeAlpha3Partner || "-",
    partner_country: row.partnerCountry || "-",
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
    ...(canMutate
      ? {
          actions: {
            display: (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {canUpdate ? (
                  <Button
                    type="button"
                    variant="primary"
                    rounded="md"
                    className="gap-1.5 px-3 py-1.5 text-xs font-semibold"
                    onClick={() => setEditingRow(row)}
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    Ubah
                  </Button>
                ) : null}
                {canDelete ? (
                  <Button
                    type="button"
                    variant="danger"
                    rounded="md"
                    className="gap-1.5 px-3 py-1.5 text-xs font-semibold"
                    onClick={() => setDeletingRow(row)}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Hapus
                  </Button>
                ) : null}
              </div>
            ),
            sortValue: row.id
          }
        }
      : {})
  }));

  return (
    <Card className="rounded-lg p-5 shadow-sm">
      <div className="space-y-4 border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              Data Aktif Perdagangan
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Tinjau data aktif `tbtrade` berdasarkan reporter, partner, sumber,
              sektor, status arus, tahun, dan panjang HS.
            </div>
          </div>
          <div className="w-full lg:max-w-40">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tampilkan
            </label>
            <DataLimitSelect
              value={limit}
              onChange={onLimitChange}
              options={["10", "25", "50", "100"]}
              itemLabel="data"
              className="w-full"
            />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Filter Data Aktif
          </div>
          <form
            className="mt-3 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit();
            }}
          >
            <div className="grid gap-3 xl:grid-cols-4">
              <Select
                value={reporterInput}
                options={[
                  { value: "", label: "Semua Reporter" },
                  ...countryOptions
                ]}
                onChange={onReporterInputChange}
                size="sm"
              />
              <Select
                value={partnerInput}
                options={[
                  { value: "", label: "Semua Partner" },
                  ...countryOptions
                ]}
                onChange={onPartnerInputChange}
                size="sm"
              />
              <Select
                value={sourceInput}
                options={[
                  { value: "", label: "Semua Sumber" },
                  ...sourceOptions
                ]}
                onChange={onSourceInputChange}
                size="sm"
              />
              <Select
                value={statusInput}
                options={tradeStatusOptions}
                onChange={onStatusInputChange}
                size="sm"
              />
              <Select
                value={sectorInput}
                options={[
                  { value: "", label: "Semua Sektor" },
                  ...sectorOptions
                ]}
                onChange={onSectorInputChange}
                size="sm"
              />
              <Input
                value={yearInput}
                onChange={(event) => onYearInputChange(event.target.value)}
                placeholder="Tahun"
                inputMode="numeric"
                className="h-8 rounded-[5px] border-slate-300 px-3 py-1.5 text-xs"
              />
              <Select
                value={hsLenInput}
                options={[
                  { value: "", label: "Semua Panjang HS" },
                  ...hsLenOptions
                ]}
                onChange={onHsLenInputChange}
                size="sm"
              />
              <Button
                type="submit"
                variant="primary"
                rounded="md"
                className="w-full px-4 py-2 text-sm font-semibold"
              >
                Cari
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <ErrorPanel error={error} onRefetch={onRefetch} />
        ) : rows.length === 0 ? (
          <EmptyStatePanel
            title="Data aktif tidak ditemukan"
            description="Belum ada data aktif perdagangan yang sesuai dengan filter saat ini."
            compact
          />
        ) : (
          <div className="space-y-3">
            {canDelete ? (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                  {activeSelectedRowIds.length > 0
                    ? `${activeSelectedRowIds.length} data dipilih pada halaman ini.`
                    : "Pilih satu atau beberapa data untuk hapus sekaligus."}
                </div>
                <Button
                  type="button"
                  variant="danger"
                  rounded="lg"
                  className="gap-2 px-4 py-2 text-sm font-semibold"
                  onClick={() => setBulkDeleting(true)}
                  disabled={activeSelectedRowIds.length === 0}
                >
                  <TrashIcon className="h-4 w-4" />
                  Hapus Terpilih
                </Button>
              </div>
            ) : null}
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <SortableDataTable
                columns={columns}
                rows={tableRows}
                className="max-h-150"
                tableClassName="w-full min-w-[2600px] text-sm"
                disableDefaultMinWidth
                showRowNumber
                rowNumberOffset={(page - 1) * Number(limit)}
                controlledSortKey={sortBy}
                controlledSortDirection={sortDirection}
                onSortChange={onTableSortChange}
                manualSorting
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showWhenSinglePage
              />
            </div>
          </div>
        )}
      </div>

      <EditRowModal
        row={editingRow}
        countryOptions={countryOptions}
        sectorOptions={sectorOptions}
        sourceOptions={sourceOptions}
        statusOptions={tradeStatusOptions.filter((option) => option.value)}
        hsLenOptions={hsLenOptions}
        loading={updateLoading}
        onClose={() => setEditingRow(null)}
        onSubmit={async (row, payload) => {
          await onUpdateRow(row as TradeCurrentRecord, payload);
          setEditingRow(null);
        }}
      />

      <ConfirmationModal
        open={Boolean(deletingRow)}
        title="Hapus Data Aktif"
        subtitle="Konfirmasi penghapusan satu baris data dari tabel utama perdagangan."
        description="Baris data aktif yang dipilih akan dihapus dari tabel utama dan tidak lagi tersedia di daftar ini."
        confirmLabel="Hapus"
        confirmTone="danger"
        loading={deleteLoading}
        onClose={() => setDeletingRow(null)}
        onConfirm={async () => {
          if (!deletingRow) return;
          await onDeleteRow(deletingRow);
          setDeletingRow(null);
        }}
      />

      <ConfirmationModal
        open={bulkDeleting}
        title="Hapus Data Aktif Terpilih"
        subtitle="Konfirmasi penghapusan beberapa baris data dari tabel utama perdagangan."
        description={`${activeSelectedRowIds.length} baris data aktif yang dipilih akan dihapus dari tabel utama dan tidak lagi tersedia di daftar ini.`}
        confirmLabel="Hapus Terpilih"
        confirmTone="danger"
        loading={bulkDeleteLoading}
        onClose={() => setBulkDeleting(false)}
        onConfirm={async () => {
          if (selectedRows.length === 0) return;
          await onDeleteRows(selectedRows);
          setSelectedRowIds([]);
          setBulkDeleting(false);
        }}
      />
    </Card>
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

function ErrorPanel({
  error,
  onRefetch
}: {
  error: unknown;
  onRefetch: () => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
      <div>
        <div className="text-sm font-semibold text-rose-700">
          Gagal memuat data aktif
        </div>
        <div className="mt-1 text-sm leading-relaxed text-rose-700">
          {getApiErrorMessage(
            error,
            "Data aktif belum dapat diambil dari server."
          )}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        rounded="md"
        className="px-4 py-2 text-sm font-semibold"
        onClick={onRefetch}
      >
        Muat Ulang
      </Button>
    </div>
  );
}
