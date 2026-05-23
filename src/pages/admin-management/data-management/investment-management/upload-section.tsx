import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { useDeferredValue, useMemo, useState } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import { cn } from "@/utils/cn";
import {
  formatFileSize,
  isRequiredRowField,
  MAX_UPLOAD_SIZE_LABEL,
  normalizeHeader,
  RECOMMENDED_UPLOAD_SIZE_LABEL,
  TARGET_FIELDS,
  UPLOAD_FIELD_REQUIREMENTS
} from "./types";

export function UploadSection({
  note,
  filename,
  headers,
  rows,
  mapping,
  countryOptions,
  sectorOptions,
  sourceOptions,
  statusOptions,
  monthOptions,
  loading,
  previewLoading,
  onNoteChange,
  onFileSelected,
  onMappingChange,
  onSubmit
}: {
  note: string;
  filename: string;
  headers: string[];
  rows: Record<string, unknown>[];
  mapping: Record<string, string>;
  countryOptions: SelectOption[];
  sectorOptions: SelectOption[];
  sourceOptions: SelectOption[];
  statusOptions: SelectOption[];
  monthOptions: SelectOption[];
  loading: boolean;
  previewLoading: boolean;
  onNoteChange: (value: string) => void;
  onFileSelected: (file: File) => void | Promise<void>;
  onMappingChange: (mapping: Record<string, string>) => void;
  onSubmit: () => void;
}) {
  const headerOptions = useMemo(
    () => [
      { value: "__none", label: "Tidak dipetakan" },
      ...headers.map((header) => ({ value: header, label: header }))
    ],
    [headers]
  );
  const previewHeaders = useMemo(
    () => headers.filter((header) => normalizeHeader(header) !== "id"),
    [headers]
  );
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [selectedFileMeta, setSelectedFileMeta] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [referenceSearch, setReferenceSearch] = useState("");

  const deferredReferenceSearch = useDeferredValue(
    referenceSearch.trim().toLowerCase()
  );

  const filterItems = (items: SelectOption[]) =>
    items.filter((item) =>
      `${item.value} ${item.label}`
        .toLowerCase()
        .includes(deferredReferenceSearch)
    );

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setSelectedFileMeta({ name: file.name, size: file.size });
    await onFileSelected(file);
  };

  return (
    <Card className="rounded-lg p-5 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <div className="text-lg font-semibold text-slate-900">
          Unggah CSV/Excel Investasi
        </div>
        <div className="mt-1 text-sm text-slate-500">
          Sistem membaca pratinjau file terlebih dahulu, lalu batch unggahan
          diproses ke staging setelah pemetaan kolom dikirim.
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="overflow-hidden rounded-lg border border-blue-100 bg-blue-50">
          <div className="border-b border-blue-100 px-4 py-3">
            <div className="text-sm font-semibold text-[#223B8F]">
              Kolom yang diperlukan pada file upload
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Nama kolom sumber boleh berbeda, tetapi harus dipetakan ke field
              target investasi setelah preview terbaca.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100 text-xs">
              <thead className="bg-white/70 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-2 font-semibold">Field Target</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold">Format Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 bg-white/50">
                {UPLOAD_FIELD_REQUIREMENTS.map((item) => (
                  <tr key={item.field}>
                    <td className="px-4 py-2 font-semibold text-slate-900">
                      {item.field}
                      {item.required === "Wajib" ? (
                        <span aria-hidden="true" className="ml-1 text-red-600">
                          *
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {item.required}
                    </td>
                    <td className="px-4 py-2 text-slate-700">{item.format}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Accordion
          title="Panel Referensi"
          description="Gunakan helper ini untuk memastikan kode dan nilai pada file sesuai master yang tersedia."
          defaultOpen={false}
          className="rounded-lg"
          contentClassName="space-y-3"
        >
          <Input
            value={referenceSearch}
            onChange={(event) => setReferenceSearch(event.target.value)}
            placeholder="Cari kode atau nama referensi..."
            className="rounded-md"
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <ReferenceCodePanel
              title="Kode Negara"
              items={filterItems(countryOptions)}
              emptyMessage="Kode negara tidak ditemukan."
            />
            <ReferenceCodePanel
              title="Kode Sumber"
              items={filterItems(sourceOptions)}
              emptyMessage="Kode sumber tidak ditemukan."
            />
            <ReferenceCodePanel
              title="ID Sektor"
              items={filterItems(sectorOptions)}
              emptyMessage="ID sektor tidak ditemukan."
            />
            <ReferenceCodePanel
              title="Status Arus"
              items={filterItems(statusOptions)}
              emptyMessage="Status arus tidak ditemukan."
            />
            <ReferenceCodePanel
              title="Bulan"
              items={filterItems(monthOptions)}
              emptyMessage="Bulan tidak ditemukan."
            />
          </div>
        </Accordion>

        <label
          htmlFor="upload-investment-file"
          className={cn(
            "group block cursor-pointer rounded-lg border border-dashed p-6 text-center transition",
            isDraggingFile
              ? "border-[#223B8F] bg-blue-50 ring-2 ring-[#223B8F]/20"
              : "border-slate-300 bg-slate-50 hover:border-[#223B8F] hover:bg-blue-50/60"
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDraggingFile(false);
            void handleFileChange(event.dataTransfer.files?.[0] ?? null);
          }}
        >
          <input
            id="upload-investment-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="sr-only"
            onChange={(event) =>
              void handleFileChange(event.target.files?.[0] ?? null)
            }
          />
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-white text-[#223B8F] ring-1 ring-blue-100 transition group-hover:ring-[#223B8F]/30">
            <CloudArrowUpIcon className="h-6 w-6" />
          </span>
          <span className="mt-3 block text-sm font-semibold text-slate-900">
            Tarik file ke sini atau klik untuk memilih file
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-500">
            Mendukung CSV, XLS, dan XLSX. Maksimum sistem{" "}
            {MAX_UPLOAD_SIZE_LABEL}; rekomendasi operasional sampai{" "}
            {RECOMMENDED_UPLOAD_SIZE_LABEL}.
          </span>
        </label>

        {previewLoading ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-[#223B8F]">
            Membuat pratinjau di backend...
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Catatan Batch
          </label>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Catatan opsional untuk batch unggahan"
            className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#384AA0] focus:outline-none focus:ring-2 focus:ring-[#384AA0]/30"
          />
        </div>

        {filename ? (
          <div className="grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Berkas siap ditinjau
              </div>
              <div className="mt-1 break-words text-sm font-semibold text-slate-900">
                {filename}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {selectedFileMeta
                  ? `${formatFileSize(selectedFileMeta.size)} - `
                  : ""}
                {headers.length} kolom, {rows.length} contoh baris terbaca.
              </div>
            </div>
            <div className="rounded-md bg-white/80 p-3 text-xs text-slate-600 ring-1 ring-emerald-100">
              Pastikan field wajib sudah dipetakan, terutama kode negara asal,
              kode negara tujuan, tahun, nilai investasi, kode sumber, dan
              status.
            </div>
          </div>
        ) : null}

        {headers.length ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">
              Mapping Kolom File ke Field Target
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {TARGET_FIELDS.map((field) => (
                <div key={field}>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    {field}
                    {isRequiredRowField(field) ? (
                      <span aria-hidden="true" className="ml-1 text-red-600">
                        *
                      </span>
                    ) : null}
                  </label>
                  <Select
                    value={mapping[field] || "__none"}
                    options={headerOptions}
                    onChange={(value) =>
                      onMappingChange({
                        ...mapping,
                        [field]: value === "__none" ? "" : value
                      })
                    }
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {rows.length ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900">
              Pratinjau Contoh Baris
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    {previewHeaders.map((header) => (
                      <th key={header} className="px-3 py-2 font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.slice(0, 8).map((row, index) => (
                    <tr key={index}>
                      {previewHeaders.map((header) => (
                        <td key={header} className="px-3 py-2 text-slate-700">
                          {String(row[header] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="primary"
            rounded="md"
            className="px-5 py-2 text-sm font-semibold"
            onClick={onSubmit}
            disabled={loading || rows.length === 0}
          >
            {loading ? "Menyimpan..." : "Kirim Batch Unggahan"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ReferenceCodePanel({
  title,
  items,
  emptyMessage
}: {
  title: string;
  items: SelectOption[];
  emptyMessage: string;
}) {
  return (
    <div className="rounded-md border border-slate-200">
      <div className="border-b border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900">
        {title}
      </div>
      <div className="max-h-64 overflow-auto">
        {items.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={`${item.value}-${item.label}`}
                className="grid gap-1 px-3 py-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-start sm:gap-3"
              >
                <code className="inline-flex w-fit rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                  {item.value}
                </code>
                <div className="text-xs leading-relaxed text-slate-600">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-xs text-slate-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
