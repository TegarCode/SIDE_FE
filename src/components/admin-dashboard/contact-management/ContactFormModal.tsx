import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Textarea } from "@/components/ui/Form/Textarea";
import { Modal } from "@/components/ui/Modal";
import { CONTACT_TYPE_OPTIONS } from "@/constants/home";
import type {
  AdminContactFormValues,
  AdminContactRecord
} from "@/type/admin-management/adminDashboardContact";
import {
  flattenApiValidationErrors,
  getApiValidationErrors
} from "@/utils/apiFormError";
import { validateAdminContactForm } from "@/validators/admin-management/adminDashboardContact";

type ContactFormModalProps = {
  open: boolean;
  contact: AdminContactRecord | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminContactFormValues) => Promise<void>;
};

const EMPTY_FORM: AdminContactFormValues = {
  name: "",
  email: "",
  type: "PERTANYAAN",
  message: ""
};

export function ContactFormModal({
  open,
  contact,
  loading = false,
  onClose,
  onSubmit
}: ContactFormModalProps) {
  const initialValues = useMemo<AdminContactFormValues>(() => {
    if (!contact) return EMPTY_FORM;

    return {
      name: contact.name,
      email: contact.email,
      type: contact.type,
      message: contact.message
    };
  }, [contact]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Contact ${contact?.name ?? ""}`}
      subtitle="Perbarui nama, email, jenis pesan, dan isi pesan contact dari halaman admin."
      size="xl"
    >
      <ContactFormContent
        key={`${contact?.id ?? "new"}-${open ? "open" : "closed"}`}
        initialValues={initialValues}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

type ContactFormContentProps = {
  initialValues: AdminContactFormValues;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: AdminContactFormValues) => Promise<void>;
};

function ContactFormContent({
  initialValues,
  loading,
  onClose,
  onSubmit
}: ContactFormContentProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AdminContactFormValues, string>>
  >({});
  const [backendMessages, setBackendMessages] = useState<string[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = await validateAdminContactForm(values);
    setErrors(nextErrors);
    setBackendMessages([]);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      const fieldErrors = getApiValidationErrors(error);
      const flattenedMessages = flattenApiValidationErrors(fieldErrors);

      setErrors((current) => ({
        ...current,
        ...(Object.entries(fieldErrors).reduce<
          Partial<Record<keyof AdminContactFormValues, string>>
        >((accumulator, [field, messages]) => {
          if (messages[0]) {
            accumulator[field as keyof AdminContactFormValues] = messages[0];
          }
          return accumulator;
        }, {}) as Partial<Record<keyof AdminContactFormValues, string>>)
      }));
      setBackendMessages(flattenedMessages);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {backendMessages.length > 0 ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="text-sm font-semibold text-rose-700">
            Validasi backend
          </div>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-rose-700">
            {backendMessages.map((message, index) => (
              <li key={`${message}-${index}`}>• {message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="contact-name"
          label="Nama"
          required
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          error={errors.name}
          placeholder="Contoh: Budi Santoso"
          disabled={loading}
          className="rounded-md"
        />
        <Input
          id="contact-email"
          label="Email"
          required
          type="email"
          value={values.email}
          onChange={(event) =>
            setValues((current) => ({ ...current, email: event.target.value }))
          }
          error={errors.email}
          placeholder="contoh: budi@example.com"
          disabled={loading}
          className="rounded-md"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Jenis
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
        </label>
        <Select
          value={values.type}
          options={CONTACT_TYPE_OPTIONS}
          onChange={(nextValue) =>
            setValues((current) => ({
              ...current,
              type:
                nextValue === "MASUKAN"
                  ? "MASUKAN"
                  : nextValue === "SARAN"
                    ? "SARAN"
                    : "PERTANYAAN"
            }))
          }
          isSearchable={false}
          isDisabled={loading}
          error={errors.type}
        />
      </div>

      <Textarea
        id="contact-message"
        label="Pesan"
        required
        value={values.message}
        onChange={(event) =>
          setValues((current) => ({ ...current, message: event.target.value }))
        }
        error={errors.message}
        placeholder="Masukkan isi pesan contact"
        disabled={loading}
        className="min-h-[180px] rounded-md"
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
          <PencilSquareIcon className="h-4 w-4" />
          {loading ? "Menyimpan..." : "Update Contact"}
        </Button>
      </div>
    </form>
  );
}
