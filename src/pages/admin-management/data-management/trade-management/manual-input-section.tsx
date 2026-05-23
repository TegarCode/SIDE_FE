import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Modal } from "@/components/ui/Modal";
import type {
  TradeCurrentRecord,
  TradePayloadRow,
  TradeRowRecord
} from "@/type/admin-management/adminDashboardTrade";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import {
  createManualRow,
  FIELD_LIMITS,
  isRequiredRowField,
  TRADE_STATUS_OPTIONS,
  type ManualRow,
  toPayloadRow
} from "./types";

export function ManualInputSection({
  note,
  rows,
  countryOptions,
  sectorOptions,
  sourceOptions,
  statusOptions,
  hsLenOptions,
  loading,
  onNoteChange,
  onRowsChange,
  onSubmit
}: {
  note: string;
  rows: ManualRow[];
  countryOptions: SelectOption[];
  sectorOptions: SelectOption[];
  sourceOptions: SelectOption[];
  statusOptions: SelectOption[];
  hsLenOptions: SelectOption[];
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
            Tambahkan baris perdagangan ke staging batch manual dengan format
            yang sama seperti upload.
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
                sectorOptions={sectorOptions}
                sourceOptions={sourceOptions}
                statusOptions={statusOptions}
                hsLenOptions={hsLenOptions}
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
  sectorOptions,
  sourceOptions,
  statusOptions,
  hsLenOptions,
  loading,
  onClose,
  onSubmit
}: {
  row: TradeRowRecord | TradeCurrentRecord | null;
  countryOptions: SelectOption[];
  sectorOptions: SelectOption[];
  sourceOptions: SelectOption[];
  statusOptions: SelectOption[];
  hsLenOptions: SelectOption[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    row: TradeRowRecord | TradeCurrentRecord,
    payload: TradePayloadRow
  ) => void | Promise<void>;
}) {
  return (
    <Modal
      open={Boolean(row)}
      onClose={loading ? () => undefined : onClose}
      title="Ubah Baris Data"
      subtitle="Perbarui data perdagangan pada baris yang dipilih sebelum disimpan kembali."
      size="xl"
    >
      {row ? (
        <EditRowForm
          key={row.id}
          row={row}
          countryOptions={countryOptions}
          sectorOptions={sectorOptions}
          sourceOptions={sourceOptions}
          statusOptions={statusOptions}
          hsLenOptions={hsLenOptions}
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
  sectorOptions,
  sourceOptions,
  statusOptions,
  hsLenOptions,
  loading,
  onClose,
  onSubmit
}: {
  row: TradeRowRecord | TradeCurrentRecord;
  countryOptions: SelectOption[];
  sectorOptions: SelectOption[];
  sourceOptions: SelectOption[];
  statusOptions: SelectOption[];
  hsLenOptions: SelectOption[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    row: TradeRowRecord | TradeCurrentRecord,
    payload: TradePayloadRow
  ) => void | Promise<void>;
}) {
  const [values, setValues] = useState<ManualRow>(() => ({
    id: row.id,
    Kode_Alpha3_Reporter: row.kodeAlpha3Reporter,
    Provinsi_Reporter: row.provinsiReporter,
    Kota_Reporter: row.kotaReporter,
    Kode_Alpha3_Partner: row.kodeAlpha3Partner,
    Provinsi_Partner: row.provinsiPartner,
    Kota_Partner: row.kotaPartner,
    Bulan: row.bulan,
    Tahun: row.tahun == null ? "" : String(row.tahun),
    HsCode: row.hsCode,
    ID_Sektor: row.idSektor,
    Vol: row.vol == null ? "" : String(row.vol),
    Satuan: row.satuan,
    Tarif: row.tarif == null ? "" : String(row.tarif),
    Nilai: row.nilai == null ? "" : String(row.nilai),
    Kode_Sumber: row.kodeSumber,
    Status: row.statusData || "Export",
    Berat_Bersih: row.beratBersih == null ? "" : String(row.beratBersih),
    Pelabuhan: row.pelabuhan,
    hs_len: row.hsLen == null ? "" : String(row.hsLen)
  }));

  return (
    <div className="space-y-4">
      <RowEditor
        values={values}
        countryOptions={countryOptions}
        sectorOptions={sectorOptions}
        sourceOptions={sourceOptions}
        statusOptions={statusOptions}
        hsLenOptions={hsLenOptions}
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
  sectorOptions,
  sourceOptions,
  statusOptions,
  hsLenOptions,
  onChange
}: {
  values: ManualRow;
  countryOptions: SelectOption[];
  sectorOptions: SelectOption[];
  sourceOptions: SelectOption[];
  statusOptions: SelectOption[];
  hsLenOptions: SelectOption[];
  onChange: (values: ManualRow) => void;
}) {
  const update = (key: keyof ManualRow, value: string) =>
    onChange({ ...values, [key]: value });

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <FieldSelect
        label="Kode Reporter"
        value={values.Kode_Alpha3_Reporter}
        options={countryOptions}
        required={isRequiredRowField("Kode_Alpha3_Reporter")}
        onChange={(value) => update("Kode_Alpha3_Reporter", value)}
      />
      <Input
        label="Provinsi Reporter"
        maxLength={FIELD_LIMITS.Provinsi_Reporter}
        value={values.Provinsi_Reporter}
        onChange={(event) => update("Provinsi_Reporter", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Kota Reporter"
        maxLength={FIELD_LIMITS.Kota_Reporter}
        value={values.Kota_Reporter}
        onChange={(event) => update("Kota_Reporter", event.target.value)}
        className="rounded-md"
      />
      <FieldSelect
        label="Kode Partner"
        value={values.Kode_Alpha3_Partner}
        options={countryOptions}
        required={isRequiredRowField("Kode_Alpha3_Partner")}
        onChange={(value) => update("Kode_Alpha3_Partner", value)}
      />
      <Input
        label="Provinsi Partner"
        maxLength={FIELD_LIMITS.Provinsi_Partner}
        value={values.Provinsi_Partner}
        onChange={(event) => update("Provinsi_Partner", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Kota Partner"
        maxLength={FIELD_LIMITS.Kota_Partner}
        value={values.Kota_Partner}
        onChange={(event) => update("Kota_Partner", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Bulan"
        maxLength={FIELD_LIMITS.Bulan}
        value={values.Bulan}
        onChange={(event) => update("Bulan", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Tahun"
        type="number"
        min={1900}
        max={2100}
        required={isRequiredRowField("Tahun")}
        value={values.Tahun}
        onChange={(event) => update("Tahun", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="HS Code"
        maxLength={FIELD_LIMITS.HsCode}
        required={isRequiredRowField("HsCode")}
        value={values.HsCode}
        onChange={(event) => update("HsCode", event.target.value)}
        className="rounded-md"
      />
      <FieldSelect
        label="ID Sektor"
        value={values.ID_Sektor}
        options={sectorOptions}
        onChange={(value) => update("ID_Sektor", value)}
      />
      <Input
        label="Volume"
        type="number"
        value={values.Vol}
        onChange={(event) => update("Vol", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Satuan"
        maxLength={FIELD_LIMITS.Satuan}
        value={values.Satuan}
        onChange={(event) => update("Satuan", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Tarif"
        type="number"
        step="0.01"
        value={values.Tarif}
        onChange={(event) => update("Tarif", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Nilai"
        type="number"
        step="0.01"
        required={isRequiredRowField("Nilai")}
        value={values.Nilai}
        onChange={(event) => update("Nilai", event.target.value)}
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
        options={statusOptions.length ? statusOptions : TRADE_STATUS_OPTIONS}
        required={isRequiredRowField("Status")}
        onChange={(value) => update("Status", value)}
      />
      <Input
        label="Berat Bersih"
        type="number"
        step="0.01"
        value={values.Berat_Bersih}
        onChange={(event) => update("Berat_Bersih", event.target.value)}
        className="rounded-md"
      />
      <Input
        label="Pelabuhan"
        maxLength={FIELD_LIMITS.Pelabuhan}
        value={values.Pelabuhan}
        onChange={(event) => update("Pelabuhan", event.target.value)}
        className="rounded-md"
      />
      <FieldSelect
        label="Panjang HS"
        value={values.hs_len}
        options={hsLenOptions}
        required={isRequiredRowField("hs_len")}
        onChange={(value) => update("hs_len", value)}
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
