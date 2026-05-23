import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Modal } from "@/components/ui/Modal";
import type {
  TourismCurrentRecord,
  TourismPayloadRow,
  TourismRowRecord
} from "@/type/admin-management/adminDashboardTourism";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import {
  createManualRow,
  FIELD_LIMITS,
  isRequiredRowField,
  type ManualRow,
  toPayloadRow
} from "./types";

type SharedProps = {
  countryOptions: SelectOption[];
  sourceOptions: SelectOption[];
  statusOptions: SelectOption[];
};

export function ManualInputSection({
  note,
  rows,
  countryOptions,
  sourceOptions,
  statusOptions,
  loading,
  onNoteChange,
  onRowsChange,
  onSubmit
}: SharedProps & {
  note: string;
  rows: ManualRow[];
  loading: boolean;
  onNoteChange: (value: string) => void;
  onRowsChange: (rows: ManualRow[]) => void;
  onSubmit: () => void;
}) {
  return (
    <Card className="rounded-lg p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">
            Input Manual
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Tambahkan beberapa baris lalu kirim sebagai batch draf dari input
            manual.
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          rounded="md"
          className="gap-2 px-4 py-2 text-sm font-semibold"
          onClick={() => onRowsChange([...rows, createManualRow()])}
        >
          <PlusIcon className="h-4 w-4" />
          Tambah Baris
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Catatan batch..."
          className="min-h-22 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#384AA0] focus:outline-none focus:ring-2 focus:ring-[#384AA0]/30"
        />

        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">
                  Baris {index + 1}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  rounded="md"
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700"
                  onClick={() =>
                    onRowsChange(rows.filter((item) => item.id !== row.id))
                  }
                  disabled={rows.length === 1}
                >
                  Hapus
                </Button>
              </div>

              <ManualRowFields
                values={row}
                countryOptions={countryOptions}
                sourceOptions={sourceOptions}
                statusOptions={statusOptions}
                onChange={(next) =>
                  onRowsChange(
                    rows.map((item) => (item.id === row.id ? next : item))
                  )
                }
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="primary"
            rounded="md"
            className="px-5 py-2 text-sm font-semibold"
            disabled={loading}
            onClick={onSubmit}
          >
            {loading ? "Menyimpan..." : "Kirim Batch Manual"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ManualRowFields({
  values,
  countryOptions,
  sourceOptions,
  statusOptions,
  onChange
}: SharedProps & {
  values: ManualRow;
  onChange: (values: ManualRow) => void;
}) {
  const update = (key: keyof ManualRow, value: string) =>
    onChange({ ...values, [key]: value });

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <FieldSelect
        label="Kode Asal"
        value={values.Kode_Alpha3_Asal}
        options={countryOptions}
        required={isRequiredRowField("Kode_Alpha3_Asal")}
        onChange={(value) => update("Kode_Alpha3_Asal", value)}
      />
      <Input
        label="Provinsi Asal"
        value={values.Provinsi_Asal}
        maxLength={FIELD_LIMITS.Provinsi_Asal}
        onChange={(event) => update("Provinsi_Asal", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Kota Asal"
        value={values.Kota_Asal}
        maxLength={FIELD_LIMITS.Kota_Asal}
        onChange={(event) => update("Kota_Asal", event.target.value)}
        className="rounded-md"
      />
      <FieldSelect
        label="Kode Tujuan"
        value={values.Kode_Alpha3_Tujuan}
        options={countryOptions}
        required={isRequiredRowField("Kode_Alpha3_Tujuan")}
        onChange={(value) => update("Kode_Alpha3_Tujuan", value)}
      />
      <Input
        label="Provinsi Tujuan"
        value={values.Provinsi_Tujuan}
        maxLength={FIELD_LIMITS.Provinsi_Tujuan}
        onChange={(event) => update("Provinsi_Tujuan", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Kota Tujuan"
        value={values.Kota_Tujuan}
        maxLength={FIELD_LIMITS.Kota_Tujuan}
        onChange={(event) => update("Kota_Tujuan", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Tujuan Perjalanan"
        value={values.Tujuan_Perjalanan}
        maxLength={FIELD_LIMITS.Tujuan_Perjalanan}
        onChange={(event) => update("Tujuan_Perjalanan", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Lama Perjalanan"
        value={values.Lama_Perjalanan}
        inputMode="numeric"
        onChange={(event) => update("Lama_Perjalanan", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Bulan"
        value={values.Bulan}
        maxLength={FIELD_LIMITS.Bulan}
        onChange={(event) => update("Bulan", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Tahun"
        value={values.Tahun}
        inputMode="numeric"
        required={isRequiredRowField("Tahun")}
        onChange={(event) => update("Tahun", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Jumlah Wisatawan"
        value={values.Jumlah_Wisatawan}
        inputMode="numeric"
        required={isRequiredRowField("Jumlah_Wisatawan")}
        onChange={(event) => update("Jumlah_Wisatawan", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Nilai Spending"
        value={values.Nilai_Spending}
        maxLength={FIELD_LIMITS.Nilai_Spending}
        onChange={(event) => update("Nilai_Spending", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Port Entry"
        value={values.Port_Entry}
        maxLength={FIELD_LIMITS.Port_Entry}
        onChange={(event) => update("Port_Entry", event.target.value)}
        className="rounded-md"
      />
      <FieldSelect
        label="Kode Sumber"
        value={values.Kode_Sumber}
        options={sourceOptions}
        required={isRequiredRowField("Kode_Sumber")}
        onChange={(value) => update("Kode_Sumber", value)}
      />
      <FieldSelect
        label="Status"
        value={values.Status}
        options={statusOptions}
        required={isRequiredRowField("Status")}
        onChange={(value) => update("Status", value)}
      />
    </div>
  );
}

function toEditableRowData(
  row: TourismRowRecord | TourismCurrentRecord
): ManualRow {
  return {
    id: row.id,
    Kode_Alpha3_Asal: row.kodeAlpha3Asal,
    Provinsi_Asal: row.provinsiAsal,
    Kota_Asal: row.kotaAsal,
    Kode_Alpha3_Tujuan: row.kodeAlpha3Tujuan,
    Provinsi_Tujuan: row.provinsiTujuan,
    Kota_Tujuan: row.kotaTujuan,
    Tujuan_Perjalanan: row.tujuanPerjalanan,
    Lama_Perjalanan:
      row.lamaPerjalanan == null ? "" : String(row.lamaPerjalanan),
    Bulan: row.bulan || "",
    Tahun: row.tahun == null ? "" : String(row.tahun),
    Jumlah_Wisatawan:
      row.jumlahWisatawan == null ? "" : String(row.jumlahWisatawan),
    Nilai_Spending: row.nilaiSpending || "",
    Port_Entry: row.portEntry || "",
    Kode_Sumber: row.kodeSumber,
    Status: row.statusData || ""
  };
}

export function EditRowModal({
  row,
  countryOptions,
  sourceOptions,
  statusOptions,
  loading,
  onClose,
  onSubmit
}: SharedProps & {
  row: TourismRowRecord | TourismCurrentRecord | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    row: TourismRowRecord | TourismCurrentRecord,
    payload: TourismPayloadRow
  ) => void | Promise<void>;
}) {
  const values = row ? toEditableRowData(row) : null;

  return (
    <Modal open={Boolean(row)} onClose={onClose} title="Ubah Baris Pariwisata">
      {values ? (
        <EditRowForm
          row={row!}
          initialValues={values}
          countryOptions={countryOptions}
          sourceOptions={sourceOptions}
          statusOptions={statusOptions}
          loading={loading}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}

function EditRowForm({
  row,
  initialValues,
  countryOptions,
  sourceOptions,
  statusOptions,
  loading,
  onClose,
  onSubmit
}: SharedProps & {
  row: TourismRowRecord | TourismCurrentRecord;
  initialValues: ManualRow;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    row: TourismRowRecord | TourismCurrentRecord,
    payload: TourismPayloadRow
  ) => void | Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);

  return (
    <div className="space-y-4">
      <ManualRowFields
        values={values}
        countryOptions={countryOptions}
        sourceOptions={sourceOptions}
        statusOptions={statusOptions}
        onChange={setValues}
      />
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="outline"
          rounded="md"
          className="px-4 py-2 text-sm font-semibold"
          onClick={onClose}
        >
          Batal
        </Button>
        <Button
          type="button"
          variant="primary"
          rounded="md"
          className="px-4 py-2 text-sm font-semibold"
          disabled={loading}
          onClick={async () => {
            await onSubmit(row, toPayloadRow(values));
          }}
        >
          {loading ? "Menyimpan..." : "Simpan Baris"}
        </Button>
      </div>
    </div>
  );
}

function FieldSelect({
  label,
  value,
  options,
  required = false,
  onChange
}: {
  label: string;
  value: string;
  options: SelectOption[];
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-800">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
        ) : null}
      </label>
      <Select
        value={value || null}
        options={options}
        onChange={onChange}
        placeholder={`Pilih ${label}`}
      />
    </div>
  );
}
