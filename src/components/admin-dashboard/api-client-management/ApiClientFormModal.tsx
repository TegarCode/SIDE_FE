import {
  ArrowPathIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GroupedFilterMultiSelect } from "@/components/ui/Form/GroupedFilterMultiSelect";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Textarea } from "@/components/ui/Form/Textarea";
import { Modal } from "@/components/ui/Modal";
import type {
  AdminApiClientFormValues,
  AdminApiClientRegenerateFormValues,
  AdminApiClientRecord
} from "@/type/admin-management/adminDashboardApiClient";
import type { GroupedFilterOptionGroup } from "@/type/komoditasUtama";
import {
  flattenApiValidationErrors,
  getApiValidationErrors
} from "@/utils/apiFormError";
import { validateAdminApiClientForm } from "@/validators/admin-management/adminDashboardApiClient";

type ApiClientFormModalProps = {
  open: boolean;
  mode: "create" | "update" | "detail";
  apiClient: AdminApiClientRecord | null;
  abilityGroups: GroupedFilterOptionGroup[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminApiClientFormValues) => Promise<void>;
};

type ApiClientSuccessModalProps = {
  open: boolean;
  apiKey: string | null;
  notice?: string | null;
  clientName?: string | null;
  onClose: () => void;
};

type ApiClientRegenerateKeyModalProps = {
  open: boolean;
  apiClient: AdminApiClientRecord | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminApiClientRegenerateFormValues) => Promise<void>;
};

const ACTIVE_OPTIONS = [
  { value: "true", label: "Aktif" },
  { value: "false", label: "Nonaktif" }
];

const EMPTY_FORM: AdminApiClientFormValues = {
  name: "",
  description: "",
  abilities: [],
  allowedDomains: [],
  active: true
};

export function ApiClientFormModal({
  open,
  mode,
  apiClient,
  abilityGroups,
  loading = false,
  onClose,
  onSubmit
}: ApiClientFormModalProps) {
  const initialValues = useMemo<AdminApiClientFormValues>(() => {
    if (apiClient && mode !== "create") {
      return {
        name: apiClient.name,
        description: apiClient.description,
        abilities: apiClient.abilities,
        allowedDomains: apiClient.allowedDomains,
        active: apiClient.active
      };
    }

    return EMPTY_FORM;
  }, [apiClient, mode]);

  const title =
    mode === "create"
      ? "Tambah API Client"
      : mode === "update"
        ? `Update API Client ${apiClient?.name ?? ""}`
        : `Detail API Client ${apiClient?.name ?? ""}`;
  const subtitle =
    mode === "detail"
      ? "Tinjau nama, daftar abilities, domain yang diizinkan, dan status aktif API client."
      : "Kelola API client untuk akses backend melalui header X-API-KEY dan atur daftar abilities yang diizinkan.";
  const formKey = `${mode}-${apiClient?.id ?? "new"}-${open ? "open" : "closed"}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="xl"
    >
      <ApiClientFormContent
        key={formKey}
        mode={mode}
        initialValues={initialValues}
        abilityGroups={abilityGroups}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

export function ApiClientSuccessModal({
  open,
  apiKey,
  notice,
  clientName,
  onClose
}: ApiClientSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!apiKey) return;

    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="API Key Baru"
      subtitle="Simpan API key ini sekarang. Backend tidak akan mengirimkan nilai mentah ini lagi setelah modal ditutup."
      size="lg"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="text-sm font-semibold text-amber-800">
            {notice || "API key hanya ditampilkan sekali. Simpan dengan aman."}
          </div>
          {clientName ? (
            <div className="mt-1 text-sm text-amber-700">
              Client: {clientName}
            </div>
          ) : null}
        </div>

        <Textarea
          id="api-client-plain-key"
          label="Plain Text API Key"
          value={apiKey || "-"}
          readOnly
          className="min-h-[140px] rounded-md font-mono text-xs"
        />

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            rounded="md"
            className="gap-1.5 px-4 py-2 text-sm font-semibold"
            onClick={onClose}
          >
            <XMarkIcon className="h-4 w-4" />
            Tutup
          </Button>
          <Button
            type="button"
            variant="primary"
            rounded="md"
            className="gap-1.5 px-4 py-2 text-sm font-semibold"
            onClick={() => void handleCopy()}
            disabled={!apiKey}
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            {copied ? "Tersalin" : "Copy API Key"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ApiClientRegenerateKeyModal({
  open,
  apiClient,
  loading = false,
  onClose,
  onSubmit
}: ApiClientRegenerateKeyModalProps) {
  const [values, setValues] = useState<AdminApiClientRegenerateFormValues>({
    currentPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendMessages, setBackendMessages] = useState<string[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!values.currentPassword.trim()) {
      nextErrors.currentPassword = "Password saat ini wajib diisi";
    }

    setErrors(nextErrors);
    setBackendMessages([]);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        currentPassword: values.currentPassword
      });
      setValues({ currentPassword: "" });
      setErrors({});
      setBackendMessages([]);
    } catch (error) {
      const fieldErrors = getApiValidationErrors(error);
      const flattenedMessages = flattenApiValidationErrors(fieldErrors);

      setErrors((current) => ({
        ...current,
        ...(fieldErrors.current_password?.[0]
          ? { currentPassword: fieldErrors.current_password[0] }
          : {})
      }));
      setBackendMessages(flattenedMessages);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setValues({ currentPassword: "" });
    setErrors({});
    setBackendMessages([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Regenerate API Key ${apiClient?.name ?? ""}`}
      subtitle="API key lama akan langsung tidak berlaku. API key baru hanya akan ditampilkan sekali setelah proses berhasil."
      size="lg"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="text-sm font-semibold text-amber-800">
            API key lama akan dinonaktifkan segera setelah API key baru
            diterbitkan.
          </div>
          <div className="mt-1 text-sm text-amber-700">
            Salin API key baru segera setelah berhasil karena sistem tidak akan
            menampilkannya kembali.
          </div>
        </div>

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

        <Input
          id="api-client-regenerate-password"
          label="Password Saat Ini"
          type="password"
          required
          value={values.currentPassword}
          onChange={(event) =>
            setValues({ currentPassword: event.target.value })
          }
          error={errors.currentPassword}
          placeholder="Masukkan password admin saat ini"
          disabled={loading}
          className="rounded-md"
        />

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            rounded="md"
            className="gap-1.5 px-4 py-2 text-sm font-semibold"
            onClick={handleClose}
            disabled={loading}
          >
            <XMarkIcon className="h-4 w-4" />
            Batal
          </Button>
          <Button
            type="submit"
            variant="warning"
            rounded="md"
            className="gap-1.5 px-4 py-2 text-sm font-semibold"
            disabled={loading}
          >
            <ArrowPathIcon className="h-4 w-4" />
            {loading ? "Memproses..." : "Regenerate API Key"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

type ApiClientFormContentProps = {
  mode: "create" | "update" | "detail";
  initialValues: AdminApiClientFormValues;
  abilityGroups: GroupedFilterOptionGroup[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: AdminApiClientFormValues) => Promise<void>;
};

function ApiClientFormContent({
  mode,
  initialValues,
  abilityGroups,
  loading,
  onClose,
  onSubmit
}: ApiClientFormContentProps) {
  const [values, setValues] = useState<AdminApiClientFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendMessages, setBackendMessages] = useState<string[]>([]);
  const isDetail = mode === "detail";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDetail) {
      onClose();
      return;
    }

    const nextErrors = await validateAdminApiClientForm(values);
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
        ...Object.entries(fieldErrors).reduce<Record<string, string>>(
          (accumulator, [field, messages]) => {
            if (messages[0]) {
              accumulator[field] = messages[0];
            }
            return accumulator;
          },
          {}
        )
      }));
      setBackendMessages(flattenedMessages);
    }
  };

  const addDomain = () => {
    setValues((current) => ({
      ...current,
      allowedDomains: [...current.allowedDomains, ""]
    }));
  };

  const removeDomain = (index: number) => {
    setValues((current) => ({
      ...current,
      allowedDomains:
        current.allowedDomains.length <= 1
          ? current.allowedDomains
          : current.allowedDomains.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const updateDomain = (index: number, nextValue: string) => {
    setValues((current) => ({
      ...current,
      allowedDomains: current.allowedDomains.map((domain, itemIndex) =>
        itemIndex === index ? nextValue : domain
      )
    }));
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

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
        <Input
          id="api-client-name"
          label="Nama API Client"
          required
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          error={errors.name}
          placeholder="Contoh: Mobile Service"
          disabled={loading || isDetail}
          className="rounded-md"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Status Aktif
            <span aria-hidden="true" className="ml-1 text-red-600">
              *
            </span>
          </label>
          <Select
            value={values.active ? "true" : "false"}
            options={ACTIVE_OPTIONS}
            onChange={(nextValue) =>
              setValues((current) => ({
                ...current,
                active: nextValue === "true"
              }))
            }
            isSearchable={false}
            isDisabled={loading || isDetail}
            error={errors.active}
          />
        </div>
      </div>

      <Textarea
        id="api-client-description"
        label="Deskripsi"
        value={values.description}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            description: event.target.value
          }))
        }
        error={errors.description}
        placeholder="Deskripsi singkat API client"
        disabled={loading || isDetail}
        className="rounded-md"
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Abilities
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
        </label>
        <GroupedFilterMultiSelect
          groups={abilityGroups}
          value={values.abilities}
          onChange={(nextValues) =>
            setValues((current) => ({ ...current, abilities: nextValues }))
          }
          placeholder="Pilih abilities API client"
          isLoading={loading && abilityGroups.length === 0}
          isDisabled={loading || isDetail}
          showSelectedList
          defaultSelectedListVisible
          footerNote="untuk akses endpoint backend"
          helperText="grup berdasarkan kategori permission"
          emptySelectedLabel="Belum ada ability dipilih"
          selectAllLabel="Pilih Semua Akses"
          clearAllLabel="Kosongkan Akses"
          groupMetaLabel="Kategori"
        />
        {errors.abilities ? (
          <p className="mt-1 text-xs text-red-600">{errors.abilities}</p>
        ) : null}
      </div>

      <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Domain yang Diizinkan
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Opsional. Isi jika API key perlu dibatasi ke domain tertentu.
            </div>
            {errors.allowedDomains ? (
              <div className="mt-2 text-xs font-medium text-rose-700">
                {errors.allowedDomains}
              </div>
            ) : null}
          </div>

          {!isDetail ? (
            <Button
              type="button"
              variant="primary"
              rounded="md"
              className="gap-1.5 px-3 py-2 text-xs font-semibold"
              onClick={addDomain}
              disabled={loading}
            >
              <PlusIcon className="h-4 w-4" />
              Tambah Domain
            </Button>
          ) : null}
        </div>

        {values.allowedDomains.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
            Tidak ada pembatasan domain.
          </div>
        ) : (
          <div className="space-y-3">
            {values.allowedDomains.map((domain, index) => (
              <div
                key={`domain-${index}`}
                className="rounded-md border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Input
                    id={`api-client-domain-${index}`}
                    label={`Domain ${index + 1}`}
                    value={domain}
                    onChange={(event) =>
                      updateDomain(index, event.target.value)
                    }
                    error={
                      errors[`allowedDomains[${index}]`] ||
                      errors[`allowed_domains.${index}`] ||
                      errors[`allowed_domains.${index}.value`]
                    }
                    placeholder="https://service.example.com"
                    disabled={loading || isDetail}
                    className="rounded-md"
                  />
                  {!isDetail ? (
                    <Button
                      type="button"
                      variant="outline"
                      rounded="md"
                      className="mt-6 shrink-0 gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => removeDomain(index)}
                      disabled={loading || values.allowedDomains.length <= 1}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Hapus
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
          {isDetail ? "Tutup" : "Batal"}
        </Button>
        {!isDetail ? (
          <Button
            type="submit"
            variant="primary"
            rounded="md"
            className="gap-1.5 px-4 py-2 text-sm font-semibold"
            disabled={loading}
          >
            {mode === "create" ? (
              <PlusIcon className="h-4 w-4" />
            ) : (
              <PencilSquareIcon className="h-4 w-4" />
            )}
            {loading
              ? "Menyimpan..."
              : mode === "create"
                ? "Simpan API Client"
                : "Update API Client"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            rounded="md"
            className="gap-1.5 px-4 py-2 text-sm font-semibold"
            onClick={onClose}
          >
            <EyeIcon className="h-4 w-4" />
            Selesai
          </Button>
        )}
      </div>
    </form>
  );
}
