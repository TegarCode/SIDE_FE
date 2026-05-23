import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Modal } from "@/components/ui/Modal";
import type {
  KinerjaEkonomiCurrentRecord,
  KinerjaEkonomiPayloadRow,
  KinerjaEkonomiRowRecord
} from "@/type/admin-management/adminDashboardKinerjaEkonomi";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import {
  createManualRow,
  FIELD_LIMITS,
  type ManualRow,
  toPayloadRow
} from "./types";
export function ManualInputSection({
  note,
  rows,
  countryOptions,
  indicatorOptions,
  sourceOptions,
  loading,
  onNoteChange,
  onRowsChange,
  onSubmit
}: {
  note: string;
  rows: ManualRow[];
  countryOptions: SelectOption[];
  indicatorOptions: SelectOption[];
  sourceOptions: SelectOption[];
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
              <RowEditor
                values={row}
                countryOptions={countryOptions}
                indicatorOptions={indicatorOptions}
                sourceOptions={sourceOptions}
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
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Kirim Batch Manual"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function EditRowModal({
  row,
  countryOptions,
  indicatorOptions,
  sourceOptions,
  loading,
  onClose,
  onSubmit
}: {
  row: KinerjaEkonomiRowRecord | KinerjaEkonomiCurrentRecord | null;
  countryOptions: SelectOption[];
  indicatorOptions: SelectOption[];
  sourceOptions: SelectOption[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    row: KinerjaEkonomiRowRecord | KinerjaEkonomiCurrentRecord,
    payload: KinerjaEkonomiPayloadRow
  ) => void | Promise<void>;
}) {
  return (
    <Modal
      open={Boolean(row)}
      onClose={loading ? () => undefined : onClose}
      title="Ubah Baris Data"
      subtitle="Perbarui data pada baris yang dipilih sebelum disimpan kembali ke batch."
      size="xl"
    >
      {row ? (
        <EditRowForm
          key={row.id}
          row={row}
          countryOptions={countryOptions}
          indicatorOptions={indicatorOptions}
          sourceOptions={sourceOptions}
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
  countryOptions,
  indicatorOptions,
  sourceOptions,
  loading,
  onClose,
  onSubmit
}: {
  row: KinerjaEkonomiRowRecord | KinerjaEkonomiCurrentRecord;
  countryOptions: SelectOption[];
  indicatorOptions: SelectOption[];
  sourceOptions: SelectOption[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    row: KinerjaEkonomiRowRecord | KinerjaEkonomiCurrentRecord,
    payload: KinerjaEkonomiPayloadRow
  ) => void | Promise<void>;
}) {
  const [values, setValues] = useState<ManualRow>(() => ({
    id: row.id,
    Kode_Alpha3: row.kodeAlpha3,
    Bulan: row.bulan == null ? "" : String(row.bulan),
    Tahun: row.tahun == null ? "" : String(row.tahun),
    Nilai: row.nilai == null ? "" : String(row.nilai),
    Unit: row.unit,
    Satuan: row.satuan,
    ID_Indikator: row.idIndikator,
    Komponen_Indikator: row.komponenIndikator,
    KodeSumber: row.kodeSumber
  }));

  return (
    <div className="space-y-4">
      <RowEditor
        values={values}
        countryOptions={countryOptions}
        indicatorOptions={indicatorOptions}
        sourceOptions={sourceOptions}
        onChange={setValues}
      />
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="outline"
          rounded="md"
          className="px-4 py-2 text-sm font-semibold"
          onClick={onClose}
          disabled={loading}
        >
          Batal
        </Button>
        <Button
          type="button"
          variant="primary"
          rounded="md"
          className="px-4 py-2 text-sm font-semibold"
          onClick={() => void onSubmit(row, toPayloadRow(values))}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Baris"}
        </Button>
      </div>
    </div>
  );
}

function RowEditor({
  values,
  countryOptions,
  indicatorOptions,
  sourceOptions,
  onChange
}: {
  values: ManualRow;
  countryOptions: SelectOption[];
  indicatorOptions: SelectOption[];
  sourceOptions: SelectOption[];
  onChange: (values: ManualRow) => void;
}) {
  const update = (key: keyof ManualRow, value: string) =>
    onChange({ ...values, [key]: value });

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <FieldSelect
        label="Kode_Alpha3"
        value={values.Kode_Alpha3}
        options={countryOptions}
        required
        onChange={(value) => update("Kode_Alpha3", value)}
      />
      <Input
        label="Bulan"
        type="number"
        min={1}
        max={12}
        value={values.Bulan}
        onChange={(event) => update("Bulan", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Tahun"
        type="number"
        min={1900}
        max={9999}
        required
        value={values.Tahun}
        onChange={(event) => update("Tahun", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Nilai"
        type="number"
        step="0.01"
        required
        value={values.Nilai}
        onChange={(event) => update("Nilai", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Unit"
        maxLength={FIELD_LIMITS.Unit}
        value={values.Unit}
        onChange={(event) => update("Unit", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Satuan"
        maxLength={FIELD_LIMITS.Satuan}
        required
        value={values.Satuan}
        onChange={(event) => update("Satuan", event.target.value)}
        className="rounded-md"
      />
      <FieldSelect
        label="ID_Indikator"
        value={values.ID_Indikator}
        options={indicatorOptions}
        required
        onChange={(value) => update("ID_Indikator", value)}
      />
      <Input
        label="Komponen_Indikator"
        maxLength={FIELD_LIMITS.Komponen_Indikator}
        value={values.Komponen_Indikator}
        onChange={(event) => update("Komponen_Indikator", event.target.value)}
        className="rounded-md"
      />
      <FieldSelect
        label="KodeSumber"
        value={values.KodeSumber}
        options={sourceOptions}
        required
        onChange={(value) => update("KodeSumber", value)}
      />
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
