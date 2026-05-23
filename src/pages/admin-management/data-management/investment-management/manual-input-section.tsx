import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Modal } from "@/components/ui/Modal";
import type {
  InvestmentCurrentRecord,
  InvestmentPayloadRow,
  InvestmentRowRecord
} from "@/type/admin-management/adminDashboardInvestment";
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
  sectorOptions: SelectOption[];
  sourceOptions: SelectOption[];
  statusOptions: SelectOption[];
  monthOptions: SelectOption[];
};

export function ManualInputSection({
  note,
  rows,
  countryOptions,
  sectorOptions,
  sourceOptions,
  statusOptions,
  monthOptions,
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
                sectorOptions={sectorOptions}
                sourceOptions={sourceOptions}
                statusOptions={statusOptions}
                monthOptions={monthOptions}
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
  sectorOptions,
  sourceOptions,
  statusOptions,
  monthOptions,
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
        label="Nama Perusahaan"
        value={values.Nama_Perusahaan}
        maxLength={FIELD_LIMITS.Nama_Perusahaan}
        onChange={(event) => update("Nama_Perusahaan", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Tipe Investasi"
        value={values.Tipe_Investasi}
        maxLength={FIELD_LIMITS.Tipe_Investasi}
        onChange={(event) => update("Tipe_Investasi", event.target.value)}
        className="rounded-md"
      />
      <FieldSelect
        label="Bulan"
        value={values.Bulan}
        options={[{ value: "", label: "Pilih bulan" }, ...monthOptions]}
        onChange={(value) => update("Bulan", value)}
      />
      <Input
        label="Tahun"
        value={values.Tahun}
        inputMode="numeric"
        required={isRequiredRowField("Tahun")}
        onChange={(event) => update("Tahun", event.target.value)}
        className="rounded-md"
      />
      <FieldSelect
        label="Sektor"
        value={values.ID_Sektor}
        options={[{ value: "", label: "Pilih sektor" }, ...sectorOptions]}
        onChange={(value) => update("ID_Sektor", value)}
      />
      <Input
        label="Nilai Investasi"
        value={values.Nilai_Investasi}
        inputMode="decimal"
        required={isRequiredRowField("Nilai_Investasi")}
        onChange={(event) => update("Nilai_Investasi", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Nilai Proyek"
        value={values.Nilai_Proyek}
        inputMode="numeric"
        onChange={(event) => update("Nilai_Proyek", event.target.value)}
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
  row: InvestmentRowRecord | InvestmentCurrentRecord
): ManualRow {
  return {
    id: row.id,
    Kode_Alpha3_Asal: row.kodeAlpha3Asal,
    Provinsi_Asal: row.provinsiAsal,
    Kota_Asal: row.kotaAsal,
    Kode_Alpha3_Tujuan: row.kodeAlpha3Tujuan,
    Nama_Perusahaan: row.namaPerusahaan,
    Tipe_Investasi: row.tipeInvestasi,
    Bulan: row.bulan == null ? "" : String(row.bulan),
    Tahun: row.tahun == null ? "" : String(row.tahun),
    ID_Sektor: row.idSektor == null ? "" : String(row.idSektor),
    Nilai_Investasi:
      row.nilaiInvestasi == null ? "" : String(row.nilaiInvestasi),
    Nilai_Proyek: row.nilaiProyek == null ? "" : String(row.nilaiProyek),
    Kode_Sumber: row.kodeSumber,
    Status: row.statusData || "Inbound"
  };
}

export function EditRowModal({
  row,
  countryOptions,
  sectorOptions,
  sourceOptions,
  statusOptions,
  monthOptions,
  loading,
  onClose,
  onSubmit
}: SharedProps & {
  row: InvestmentRowRecord | InvestmentCurrentRecord | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    row: InvestmentRowRecord | InvestmentCurrentRecord,
    payload: InvestmentPayloadRow
  ) => void | Promise<void>;
}) {
  const values = row ? toEditableRowData(row) : null;

  return (
    <Modal open={Boolean(row)} onClose={onClose} title="Ubah Baris Investasi">
      {values ? (
        <EditRowForm
          row={row!}
          initialValues={values}
          countryOptions={countryOptions}
          sectorOptions={sectorOptions}
          sourceOptions={sourceOptions}
          statusOptions={statusOptions}
          monthOptions={monthOptions}
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
  sectorOptions,
  sourceOptions,
  statusOptions,
  monthOptions,
  loading,
  onClose,
  onSubmit
}: SharedProps & {
  row: InvestmentRowRecord | InvestmentCurrentRecord;
  initialValues: ManualRow;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    row: InvestmentRowRecord | InvestmentCurrentRecord,
    payload: InvestmentPayloadRow
  ) => void | Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);

  return (
    <div className="space-y-4">
      <ManualRowFields
        values={values}
        countryOptions={countryOptions}
        sectorOptions={sectorOptions}
        sourceOptions={sourceOptions}
        statusOptions={statusOptions}
        monthOptions={monthOptions}
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
