import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Pagination } from "@/components/ui/Pagination";
import {
  SortableDataTable,
  type SortDirection
} from "@/components/ui/SortableDataTable";
import type {
  TourismCurrentRecord,
  TourismPayloadRow
} from "@/type/admin-management/adminDashboardTourism";
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
  originInput,
  destinationInput,
  sourceInput,
  statusInput,
  yearInput,
  monthInput,
  travelPurposeInput,
  sortBy,
  sortDirection,
  canUpdate,
  canDelete,
  countryOptions,
  sourceOptions,
  statusOptions,
  travelPurposeOptions,
  monthOptions,
  updateLoading,
  deleteLoading,
  bulkDeleteLoading,
  onSearchSubmit,
  onLimitChange,
  onOriginInputChange,
  onDestinationInputChange,
  onSourceInputChange,
  onStatusInputChange,
  onYearInputChange,
  onMonthInputChange,
  onTravelPurposeInputChange,
  onPageChange,
  onTableSortChange,
  onRefetch,
  onUpdateRow,
  onDeleteRow,
  onDeleteRows
}: {
  rows: TourismCurrentRecord[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  page: number;
  totalPages: number;
  limit: string;
  originInput: string;
  destinationInput: string;
  sourceInput: string;
  statusInput: string;
  yearInput: string;
  monthInput: string;
  travelPurposeInput: string;
  sortBy: string;
  sortDirection: SortDirection;
  canUpdate: boolean;
  canDelete: boolean;
  countryOptions: SelectOption[];
  sourceOptions: SelectOption[];
  statusOptions: SelectOption[];
  travelPurposeOptions: SelectOption[];
  monthOptions: SelectOption[];
  updateLoading: boolean;
  deleteLoading: boolean;
  bulkDeleteLoading: boolean;
  onSearchSubmit: () => void;
  onLimitChange: (value: string) => void;
  onOriginInputChange: (value: string) => void;
  onDestinationInputChange: (value: string) => void;
  onSourceInputChange: (value: string) => void;
  onStatusInputChange: (value: string) => void;
  onYearInputChange: (value: string) => void;
  onMonthInputChange: (value: string) => void;
  onTravelPurposeInputChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onTableSortChange: (sortBy: string, sortDirection: SortDirection) => void;
  onRefetch: () => void;
  onUpdateRow: (
    row: TourismCurrentRecord,
    payload: TourismPayloadRow
  ) => void | Promise<void>;
  onDeleteRow: (row: TourismCurrentRecord) => void | Promise<void>;
  onDeleteRows: (rows: TourismCurrentRecord[]) => void | Promise<void>;
}) {
  const [editingRow, setEditingRow] = useState<TourismCurrentRecord | null>(
    null
  );
  const [deletingRow, setDeletingRow] = useState<TourismCurrentRecord | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const visibleRowIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const activeSelectedIds = useMemo(
    () => selectedIds.filter((id) => visibleRowIds.includes(id)),
    [selectedIds, visibleRowIds]
  );
  const selectedRows = useMemo(
    () => rows.filter((row) => activeSelectedIds.includes(row.id)),
    [activeSelectedIds, rows]
  );

  const columns = [
    ...(canDelete
      ? [
          {
            key: "select",
            label: "Pilih",
            sortable: false,
            className: "min-w-16"
          }
        ]
      : []),
    { key: "Kode_Alpha3_Asal", label: "Kode Asal", className: "min-w-24" },
    { key: "origin_country", label: "Negara Asal", className: "min-w-32" },
    { key: "Provinsi_Asal", label: "Provinsi Asal", className: "min-w-32" },
    { key: "Kota_Asal", label: "Kota Asal", className: "min-w-32" },
    {
      key: "Kode_Alpha3_Tujuan",
      label: "Kode Tujuan",
      className: "min-w-24"
    },
    {
      key: "destination_country",
      label: "Negara Tujuan",
      className: "min-w-32"
    },
    {
      key: "Provinsi_Tujuan",
      label: "Provinsi Tujuan",
      className: "min-w-32"
    },
    { key: "Kota_Tujuan", label: "Kota Tujuan", className: "min-w-32" },
    {
      key: "Tujuan_Perjalanan",
      label: "Tujuan Perjalanan",
      className: "min-w-36"
    },
    {
      key: "Lama_Perjalanan",
      label: "Lama Perjalanan",
      className: "min-w-28"
    },
    { key: "Bulan", label: "Bulan", className: "min-w-20" },
    { key: "Tahun", label: "Tahun", className: "min-w-20" },
    {
      key: "Jumlah_Wisatawan",
      label: "Jumlah Wisatawan",
      className: "min-w-32"
    },
    {
      key: "Nilai_Spending",
      label: "Nilai Spending",
      className: "min-w-32"
    },
    { key: "Port_Entry", label: "Port Entry", className: "min-w-32" },
    { key: "Kode_Sumber", label: "Kode Sumber", className: "min-w-24" },
    { key: "sumber", label: "Sumber", className: "min-w-32" },
    { key: "Status", label: "Status", className: "min-w-24" },
    ...(canUpdate || canDelete
      ? [
          {
            key: "actions",
            label: "Aksi",
            sortable: false,
            className: "min-w-32"
          }
        ]
      : [])
  ];

  const tableRows = rows.map((row) => ({
    ...(canDelete
      ? {
          select: {
            display: (
              <input
                type="checkbox"
                checked={selectedIds.includes(row.id)}
                onChange={(event) =>
                  setSelectedIds((current) =>
                    event.target.checked
                      ? [...new Set([...current, row.id])]
                      : current.filter((id) => id !== row.id)
                  )
                }
              />
            ),
            sortValue: row.id
          }
        }
      : {}),
    Kode_Alpha3_Asal: row.kodeAlpha3Asal || "-",
    origin_country: row.originCountry || "-",
    Provinsi_Asal: row.provinsiAsal || "-",
    Kota_Asal: row.kotaAsal || "-",
    Kode_Alpha3_Tujuan: row.kodeAlpha3Tujuan || "-",
    destination_country: row.destinationCountry || "-",
    Provinsi_Tujuan: row.provinsiTujuan || "-",
    Kota_Tujuan: row.kotaTujuan || "-",
    Tujuan_Perjalanan: row.tujuanPerjalanan || "-",
    Lama_Perjalanan: row.lamaPerjalanan ?? "-",
    Bulan: row.bulan || "-",
    Tahun: row.tahun ?? "-",
    Jumlah_Wisatawan: row.jumlahWisatawan ?? "-",
    Nilai_Spending: row.nilaiSpending || "-",
    Port_Entry: row.portEntry || "-",
    Kode_Sumber: row.kodeSumber || "-",
    sumber: row.sumber || "-",
    Status: row.statusData || "-",
    ...(canUpdate || canDelete
      ? {
          actions: {
            display: (
              <div className="flex gap-2">
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
              Data Aktif Pariwisata
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Tinjau data aktif `tbtourism` berdasarkan asal, tujuan, sumber,
              status, tujuan perjalanan, bulan, dan tahun.
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

        <form
          className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 xl:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <Select
            value={originInput}
            options={[{ value: "", label: "Semua Asal" }, ...countryOptions]}
            onChange={onOriginInputChange}
            size="sm"
          />
          <Select
            value={destinationInput}
            options={[{ value: "", label: "Semua Tujuan" }, ...countryOptions]}
            onChange={onDestinationInputChange}
            size="sm"
          />
          <Select
            value={sourceInput}
            options={[{ value: "", label: "Semua Sumber" }, ...sourceOptions]}
            onChange={onSourceInputChange}
            size="sm"
          />
          <Select
            value={statusInput}
            options={[{ value: "", label: "Semua Status" }, ...statusOptions]}
            onChange={onStatusInputChange}
            size="sm"
          />
          <Select
            value={travelPurposeInput}
            options={[
              { value: "", label: "Semua Tujuan Perjalanan" },
              ...travelPurposeOptions
            ]}
            onChange={onTravelPurposeInputChange}
            size="sm"
          />
          <Select
            value={monthInput}
            options={[{ value: "", label: "Semua Bulan" }, ...monthOptions]}
            onChange={onMonthInputChange}
            size="sm"
          />
          <Input
            value={yearInput}
            onChange={(event) => onYearInputChange(event.target.value)}
            placeholder="Tahun"
            inputMode="numeric"
            className="h-8 rounded-[5px] border-slate-300 px-3 py-1.5 text-xs"
          />
          <Button
            type="submit"
            variant="primary"
            rounded="md"
            className="w-full px-4 py-2 text-sm font-semibold xl:col-span-1"
          >
            Cari
          </Button>
        </form>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="text-sm text-slate-500">Memuat data aktif...</div>
        ) : isError ? (
          <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
            <div className="text-sm text-rose-700">
              {getApiErrorMessage(
                error,
                "Data aktif pariwisata belum dapat diambil dari server."
              )}
            </div>
            <Button type="button" variant="outline" onClick={onRefetch}>
              Muat Ulang
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <EmptyStatePanel
            title="Data aktif tidak ditemukan"
            description="Belum ada data aktif pariwisata yang sesuai dengan filter saat ini."
            compact
          />
        ) : (
          <div className="space-y-3">
            {canDelete ? (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-sm text-slate-600">
                  {activeSelectedIds.length > 0
                    ? `${activeSelectedIds.length} data dipilih pada halaman ini.`
                    : "Pilih satu atau beberapa data untuk hapus sekaligus."}
                </div>
                <Button
                  type="button"
                  variant="danger"
                  rounded="lg"
                  className="gap-2 px-4 py-2 text-sm font-semibold"
                  onClick={() => setBulkDeleting(true)}
                  disabled={activeSelectedIds.length === 0}
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
        sourceOptions={sourceOptions}
        statusOptions={statusOptions}
        loading={updateLoading}
        onClose={() => setEditingRow(null)}
        onSubmit={async (row, payload) => {
          await onUpdateRow(row as TourismCurrentRecord, payload);
          setEditingRow(null);
        }}
      />

      <ConfirmationModal
        open={Boolean(deletingRow)}
        title="Hapus Data Aktif"
        subtitle="Konfirmasi penghapusan satu baris data dari tabel utama pariwisata."
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
        subtitle="Konfirmasi penghapusan beberapa baris data dari tabel utama pariwisata."
        description={`${activeSelectedIds.length} baris data aktif yang dipilih akan dihapus dari tabel utama dan tidak lagi tersedia di daftar ini.`}
        confirmLabel="Hapus Terpilih"
        confirmTone="danger"
        loading={bulkDeleteLoading}
        onClose={() => setBulkDeleting(false)}
        onConfirm={async () => {
          if (selectedRows.length === 0) return;
          await onDeleteRows(selectedRows);
          setSelectedIds([]);
          setBulkDeleting(false);
        }}
      />
    </Card>
  );
}
