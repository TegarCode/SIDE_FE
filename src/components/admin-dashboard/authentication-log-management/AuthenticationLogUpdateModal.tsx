import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Form/Select";
import { Modal } from "@/components/ui/Modal";
import type {
  AdminAuthenticationLogRecord,
  AdminAuthenticationLogUpdateFormValues
} from "@/type/admin-management/adminDashboardAuthenticationLog";
import {
  flattenApiValidationErrors,
  getApiValidationErrors
} from "@/utils/apiFormError";
import { validateAdminAuthenticationLogUpdateForm } from "@/validators/admin-management/adminDashboardAuthenticationLog";

type AuthenticationLogUpdateModalProps = {
  open: boolean;
  logItem: AdminAuthenticationLogRecord | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminAuthenticationLogUpdateFormValues) => Promise<void>;
};

export function AuthenticationLogUpdateModal({
  open,
  logItem,
  loading = false,
  onClose,
  onSubmit
}: AuthenticationLogUpdateModalProps) {
  const formKey = `${logItem?.id ?? "empty"}-${logItem?.clearedByUser ? "true" : "false"}-${open ? "open" : "closed"}`;

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      title="Update Authentication Log"
      subtitle="Perubahan ini hanya mengubah status cleared_by_user pada authentication log."
      size="lg"
    >
      <AuthenticationLogUpdateModalContent
        key={formKey}
        initialValue={logItem?.clearedByUser ? "true" : "false"}
        logItem={logItem}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function AuthenticationLogUpdateModalContent({
  initialValue,
  logItem,
  loading,
  onClose,
  onSubmit
}: {
  initialValue: "true" | "false";
  logItem: AdminAuthenticationLogRecord | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: AdminAuthenticationLogUpdateFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<AdminAuthenticationLogUpdateFormValues>({
    clearedByUser: initialValue
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendMessages, setBackendMessages] = useState<string[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = await validateAdminAuthenticationLogUpdateForm(values);
    setErrors(nextErrors);
    setBackendMessages([]);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      const fieldErrors = getApiValidationErrors(error);
      setErrors((current) => ({
        ...current,
        ...(fieldErrors.cleared_by_user?.[0]
          ? { clearedByUser: fieldErrors.cleared_by_user[0] }
          : {})
      }));
      setBackendMessages(flattenApiValidationErrors(fieldErrors));
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {backendMessages.length > 0 ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="text-sm font-semibold text-rose-700">
            Validasi backend
          </div>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-rose-700">
            {backendMessages.map((message, index) => (
              <li key={`${message}-${index}`}>- {message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Log
        </div>
        <div className="mt-2 text-sm font-medium text-slate-900">
          {logItem?.user?.name || "Pengguna tidak tersedia"}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {logItem?.user?.email || "-"} | Login{" "}
          {formatDateTime(logItem?.loginAt || "")}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Cleared By User
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
        </label>
        <Select
          value={values.clearedByUser}
          options={[
            { value: "false", label: "Belum Dibersihkan" },
            { value: "true", label: "Sudah Dibersihkan" }
          ]}
          onChange={(nextValue) =>
            setValues({
              clearedByUser: nextValue as "true" | "false"
            })
          }
          size="sm"
          isSearchable={false}
          error={errors.clearedByUser}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="outline"
          rounded="md"
          className="gap-1.5 px-4 py-2 text-sm font-semibold"
          onClick={onClose}
          disabled={loading}
        >
          <XMarkIcon className="h-4 w-4" />
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          rounded="md"
          className="gap-1.5 px-4 py-2 text-sm font-semibold"
          disabled={loading}
        >
          <PencilSquareIcon className="h-4 w-4" />
          {loading ? "Menyimpan..." : "Update Status"}
        </Button>
      </div>
    </form>
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
