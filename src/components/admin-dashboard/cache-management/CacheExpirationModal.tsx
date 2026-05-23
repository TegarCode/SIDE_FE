import {
  ClockIcon,
  PencilSquareIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { Modal } from "@/components/ui/Modal";
import type {
  AdminCacheRecord,
  AdminCacheUpdateFormValues
} from "@/type/admin-management/adminDashboardCache";
import {
  flattenApiValidationErrors,
  getApiValidationErrors
} from "@/utils/apiFormError";
import { validateAdminCacheUpdateForm } from "@/validators/admin-management/adminDashboardCache";

type CacheExpirationModalProps = {
  open: boolean;
  cacheItem: AdminCacheRecord | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminCacheUpdateFormValues) => Promise<void>;
};

export function CacheExpirationModal({
  open,
  cacheItem,
  loading = false,
  onClose,
  onSubmit
}: CacheExpirationModalProps) {
  const formKey = `${cacheItem?.id ?? "empty"}-${cacheItem?.expiration ?? "no-expiration"}-${open ? "open" : "closed"}`;

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      title="Update Expiration Cache"
      subtitle="Perubahan ini hanya mengubah waktu kedaluwarsa cache. Nilai cache tidak dibangun ulang dari halaman ini."
      size="lg"
    >
      <CacheExpirationModalContent
        key={formKey}
        initialValue={
          cacheItem?.expiration
            ? toDatetimeLocalValue(cacheItem.expiration)
            : ""
        }
        loading={loading}
        cacheItem={cacheItem}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function CacheExpirationModalContent({
  initialValue,
  loading,
  cacheItem,
  onClose,
  onSubmit
}: {
  initialValue: string;
  loading: boolean;
  cacheItem: AdminCacheRecord | null;
  onClose: () => void;
  onSubmit: (values: AdminCacheUpdateFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<AdminCacheUpdateFormValues>({
    expirationAt: initialValue
  });
  const [error, setError] = useState("");
  const [backendMessages, setBackendMessages] = useState<string[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = await validateAdminCacheUpdateForm(values);
    const expirationError = nextErrors.expirationAt ?? "";
    setError(expirationError);
    setBackendMessages([]);

    if (expirationError) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (submitError) {
      const fieldErrors = getApiValidationErrors(submitError);
      setError(
        fieldErrors.expiration_at?.[0] || fieldErrors.expirationAt?.[0] || ""
      );
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
          Cache Key
        </div>
        <div className="mt-2 break-all text-sm font-medium text-slate-900">
          {cacheItem?.key || "-"}
        </div>
      </div>

      <Input
        id="cache-expiration-at"
        type="datetime-local"
        label="Expiration At"
        required
        value={values.expirationAt}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValues({ expirationAt: nextValue });
          if (error) {
            setError("");
          }
        }}
        error={error}
        disabled={loading}
        helperText="Format waktu mengikuti zona lokal browser. Data akan dikirim ke backend sebagai waktu lengkap detik."
      />

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
          {loading ? (
            <ClockIcon className="h-4 w-4 animate-spin" />
          ) : (
            <PencilSquareIcon className="h-4 w-4" />
          )}
          {loading ? "Menyimpan..." : "Update Expiration"}
        </Button>
      </div>
    </form>
  );
}

function toDatetimeLocalValue(value: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  return formatter.format(date).replace(" ", "T");
}
