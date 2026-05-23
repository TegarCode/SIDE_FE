import {
  ArrowPathIcon,
  CheckBadgeIcon,
  DocumentCheckIcon,
  EyeIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import {
  SortableDataTable,
  type SortDirection
} from "@/components/ui/SortableDataTable";
import type { TourismBatchRecord } from "@/type/admin-management/adminDashboardTourism";
import { getApiErrorMessage } from "@/utils/apiFormError";
import { cn } from "@/utils/cn";
import {
  canApproveBatch,
  canValidate,
  formatDateTime,
  getBatchStatusLabel,
  getSourceTypeLabel,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  type WorkflowAction
} from "./types";
export function ListSection({
  batches,
  uploaderNameById,
  isLoading,
  isError,
  error,
  page,
  totalPages,
  limit,
  searchInput,
  statusInput,
  sourceTypeInput,
  canUpdate,
  canApprove,
  canPublish,
  canDelete,
  sortBy,
  sortDirection,
  onLimitChange,
  onSearchInputChange,
  onStatusInputChange,
  onSourceTypeInputChange,
  onSearchSubmit,
  onPageChange,
  onSortChange,
  onRefetch,
  onSelectBatch,
  onWorkflow
}: {
  batches: TourismBatchRecord[];
  uploaderNameById: Record<string, string>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  page: number;
  totalPages: number;
  limit: string;
  searchInput: string;
  statusInput: string;
  sourceTypeInput: string;
  canUpdate: boolean;
  canApprove: boolean;
  canPublish: boolean;
  canDelete: boolean;
  sortBy: string;
  sortDirection: SortDirection;
  onLimitChange: (value: string) => void;
  onSearchInputChange: (value: string) => void;
  onStatusInputChange: (value: string) => void;
  onSourceTypeInputChange: (value: string) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: SortDirection) => void;
  onRefetch: () => void;
  onSelectBatch: (batchId: string) => void;
  onWorkflow: (action: WorkflowAction, batch: TourismBatchRecord) => void;
}) {
  const [infoBatch, setInfoBatch] = useState<TourismBatchRecord | null>(null);

  const columns = [
    { key: "source_type", label: "Sumber", className: "min-w-28" },
    { key: "uploaded_by", label: "Pengunggah", className: "min-w-40" },
    {
      key: "original_filename",
      label: "Nama File",
      className: "min-w-44"
    },
    {
      key: "note",
      label: "Catatan",
      className: "min-w-44",
      sortable: false
    },
    { key: "status", label: "Status", className: "min-w-32" },
    { key: "total_rows", label: "Total Baris", className: "min-w-28" },
    { key: "valid_rows", label: "Baris Valid", className: "min-w-28" },
    { key: "invalid_rows", label: "Baris Tidak Valid", className: "min-w-28" },
    { key: "uploaded_at", label: "Diunggah", className: "min-w-40" },
    { key: "validated_at", label: "Divalidasi", className: "min-w-40" },
    { key: "approved_at", label: "Disetujui", className: "min-w-40" },
    { key: "published_at", label: "Dipublikasi", className: "min-w-40" },
    {
      key: "actions",
      label: "Aksi",
      className: "min-w-120",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    }
  ];

  const rows = batches.map((batch) => ({
    source_type: getSourceTypeLabel(batch.sourceType),
    uploaded_by: {
      display: (
        <span className="block max-w-[180px] truncate text-slate-700">
          {getUploaderName(batch, uploaderNameById)}
        </span>
      ),
      sortValue: getUploaderName(batch, uploaderNameById)
    },
    original_filename: batch.originalFilename || "-",
    note: {
      display: (
        <div className="flex items-center gap-2">
          <span className="max-w-[220px] truncate text-slate-700">
            {batch.note || "-"}
          </span>
          <Button
            type="button"
            variant="ghost"
            rounded="md"
            className="h-7 w-7 p-0 text-slate-500"
            onClick={() => setInfoBatch(batch)}
            aria-label="Lihat ringkasan batch"
            title="Lihat ringkasan batch"
          >
            <InformationCircleIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
      sortValue: batch.note || ""
    },
    status: {
      display: <StatusBadge status={batch.status} />,
      sortValue: batch.status
    },
    total_rows: batch.totalRows,
    valid_rows: batch.validRows,
    invalid_rows: {
      display: (
        <span
          className={cn(batch.invalidRows > 0 && "font-semibold text-rose-700")}
        >
          {batch.invalidRows}
        </span>
      ),
      sortValue: batch.invalidRows
    },
    uploaded_at: formatDateTime(batch.uploadedAt || batch.createdAt),
    validated_at: formatDateTime(batch.validatedAt),
    approved_at: formatDateTime(batch.approvedAt),
    published_at: formatDateTime(batch.publishedAt),
    actions: {
      display: (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <ActionButton
            icon={EyeIcon}
            label="Detail"
            tone="primary"
            onClick={() => onSelectBatch(batch.id)}
          />
          {canUpdate ? (
            <ActionButton
              icon={ArrowPathIcon}
              label="Validasi"
              tone="warning"
              disabled={!canValidate(batch)}
              onClick={() => onWorkflow("validate", batch)}
            />
          ) : null}
          {canApprove ? (
            <ActionButton
              icon={CheckBadgeIcon}
              label="Setujui"
              tone="success"
              disabled={!canApproveBatch(batch)}
              onClick={() => onWorkflow("approve", batch)}
            />
          ) : null}
          {canPublish ? (
            <ActionButton
              icon={DocumentCheckIcon}
              label="Publikasi"
              tone="success"
              disabled={batch.status !== "approved"}
              onClick={() => onWorkflow("publish", batch)}
            />
          ) : null}
          {canApprove ? (
            <ActionButton
              icon={XCircleIcon}
              label="Tolak"
              disabled={batch.status === "published"}
              tone="danger"
              onClick={() => onWorkflow("reject", batch)}
            />
          ) : null}
          {canDelete ? (
            <ActionButton
              icon={TrashIcon}
              label="Hapus"
              disabled={batch.status === "published"}
              tone="danger"
              onClick={() => onWorkflow("delete", batch)}
            />
          ) : null}
        </div>
      ),
      sortValue: batch.id
    }
  }));

  return (
    <Card className="rounded-lg p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">
            Daftar Batch Input dan Unggah
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Filter batch berdasarkan status, sumber data, dan pencarian umum.
          </div>
        </div>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <form
            className="grid gap-3 lg:grid-cols-[minmax(0,260px)_170px_170px_auto]"
            onSubmit={onSearchSubmit}
          >
            <Input
              id="kinerja-search"
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              placeholder="Cari batch atau nama berkas..."
              className="h-8 rounded-md py-1 text-xs"
            />
            <Select
              value={statusInput}
              options={STATUS_OPTIONS}
              onChange={onStatusInputChange}
              size="sm"
              isSearchable={false}
            />
            <Select
              value={sourceTypeInput}
              options={SOURCE_OPTIONS}
              onChange={onSourceTypeInputChange}
              size="sm"
              isSearchable={false}
            />
            <Button
              type="submit"
              variant="primary"
              rounded="md"
              className="h-8 gap-1.5 px-3 text-xs font-semibold"
            >
              <MagnifyingGlassIcon className="h-3.5 w-3.5" />
              Cari
            </Button>
          </form>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">
              Tampilkan
            </span>
            <DataLimitSelect
              value={limit}
              onChange={onLimitChange}
              options={["10", "25", "50", "100"]}
              itemLabel="batch"
              className="w-28"
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <ErrorPanel
            title="Gagal memuat daftar batch"
            error={error}
            onRefetch={onRefetch}
          />
        ) : batches.length === 0 ? (
          <EmptyStatePanel
            title="Batch tidak ditemukan"
            description="Belum ada batch yang sesuai dengan filter saat ini."
            compact
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <SortableDataTable
              columns={columns}
              rows={rows}
              className="max-h-150"
              tableClassName="w-full min-w-[2080px] text-sm"
              disableDefaultMinWidth
              showRowNumber
              rowNumberOffset={(page - 1) * Number(limit)}
              controlledSortKey={sortBy}
              controlledSortDirection={sortDirection}
              onSortChange={onSortChange}
              manualSorting
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showWhenSinglePage
            />
          </div>
        )}
      </div>

      <BatchInfoModal
        batch={infoBatch}
        uploaderNameById={uploaderNameById}
        onClose={() => setInfoBatch(null)}
      />
    </Card>
  );
}

function ActionButton({
  icon: Icon,
  label,
  tone = "default",
  disabled,
  onClick
}: {
  icon: typeof EyeIcon;
  label: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  disabled?: boolean;
  onClick: () => void;
}) {
  if (disabled) return null;

  return (
    <Button
      type="button"
      variant={
        tone === "primary"
          ? "primary"
          : tone === "success"
            ? "success"
            : tone === "warning"
              ? "warning"
              : tone === "danger"
                ? "danger"
                : "outline"
      }
      rounded="md"
      className="gap-1.5 px-3 py-1.5 text-xs font-semibold"
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    validating: "bg-amber-100 text-amber-800",
    publishing: "bg-sky-100 text-sky-800",
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
      {getBatchStatusLabel(status)}
    </span>
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
  title,
  error,
  onRefetch
}: {
  title: string;
  error: unknown;
  onRefetch: () => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
      <div>
        <div className="text-sm font-semibold text-rose-700">{title}</div>
        <div className="mt-1 text-sm leading-relaxed text-rose-700">
          {getApiErrorMessage(error, "Data belum dapat diambil dari server.")}
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

function BatchInfoModal({
  batch,
  uploaderNameById,
  onClose
}: {
  batch: TourismBatchRecord | null;
  uploaderNameById: Record<string, string>;
  onClose: () => void;
}) {
  return (
    <Modal
      open={Boolean(batch)}
      onClose={onClose}
      title="Ringkasan Batch"
      subtitle="Informasi singkat batch untuk ditinjau tanpa membuka halaman detail."
      size="lg"
    >
      {batch ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <InfoItem
              label="Sumber Data"
              value={getSourceTypeLabel(batch.sourceType)}
            />
            <InfoItem
              label="Status Batch"
              value={getBatchStatusLabel(batch.status)}
            />
            <InfoItem
              label="Nama Berkas"
              value={batch.originalFilename || "-"}
            />
            <InfoItem
              label="Waktu Unggah"
              value={formatDateTime(batch.uploadedAt || batch.createdAt)}
            />
            <InfoItem
              label="Divalidasi"
              value={formatDateTime(batch.validatedAt)}
            />
            <InfoItem
              label="Disetujui"
              value={formatDateTime(batch.approvedAt)}
            />
            <InfoItem
              label="Dipublikasi"
              value={formatDateTime(batch.publishedAt)}
            />
            <InfoItem
              label="Pengunggah"
              value={getUploaderName(batch, uploaderNameById)}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Catatan
            </div>
            <div className="mt-2 text-sm leading-relaxed text-slate-800">
              {batch.note || "-"}
            </div>
          </div>

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
      ) : null}
    </Modal>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value || "-"}
      </div>
    </div>
  );
}

function getUploaderName(
  batch: TourismBatchRecord,
  uploaderNameById: Record<string, string>
) {
  return (
    batch.uploadedByName ||
    uploaderNameById[batch.uploadedBy] ||
    batch.uploadedBy ||
    "-"
  );
}
