import { useMemo, useState } from "react";
import {
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Modal } from "@/components/ui/Modal";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import type {
  AdminUserFormValues,
  AdminUserRecord,
  AdminUserRoleOption
} from "@/type/admin-management/adminDashboardUser";
import { validateAdminUserForm } from "@/validators/admin-management/adminDashboardUser";

type UserFormModalProps = {
  open: boolean;
  mode: "create" | "update";
  user: AdminUserRecord | null;
  roleOptions: AdminUserRoleOption[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminUserFormValues) => Promise<void>;
};

type UserFormContentProps = {
  mode: "create" | "update";
  loading: boolean;
  roleOptions: AdminUserRoleOption[];
  initialValues: AdminUserFormValues;
  onClose: () => void;
  onSubmit: (values: AdminUserFormValues) => Promise<void>;
};

const EMPTY_FORM: AdminUserFormValues = {
  name: "",
  email: "",
  role: "",
  status: "active",
  password: "",
  passwordConfirmation: ""
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" }
];

export function UserFormModal({
  open,
  mode,
  user,
  roleOptions,
  loading = false,
  onClose,
  onSubmit
}: UserFormModalProps) {
  const initialValues = useMemo<AdminUserFormValues>(() => {
    if (user && mode === "update") {
      return {
        name: user.name,
        email: user.email,
        role: user.roles[0] ?? "",
        status: user.status,
        password: "",
        passwordConfirmation: ""
      };
    }

    return EMPTY_FORM;
  }, [mode, user]);

  const formKey = `${mode}-${user?.id ?? "new"}-${open ? "open" : "closed"}`;
  const title =
    mode === "create"
      ? "Tambah Pengguna Baru"
      : `Update Pengguna ${user?.name}`;
  const subtitle =
    mode === "create"
      ? "Isi data akun, pilih peran, dan tentukan status pengguna."
      : "Perbarui data pengguna, peran, status, atau reset password bila diperlukan.";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="xl"
    >
      <UserFormContent
        key={formKey}
        mode={mode}
        loading={loading}
        roleOptions={roleOptions}
        initialValues={initialValues}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function UserFormContent({
  mode,
  loading,
  roleOptions,
  initialValues,
  onClose,
  onSubmit
}: UserFormContentProps) {
  const [values, setValues] = useState<AdminUserFormValues>(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AdminUserFormValues, string>>
  >({});

  const selectOptions = useMemo<SelectOption[]>(
    () =>
      roleOptions.map((option) => ({
        value: option.label,
        label: option.label
      })),
    [roleOptions]
  );

  const selectedRole = roleOptions.find(
    (option) => option.label === values.role
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = await validateAdminUserForm(values, mode);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(values);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="user-name"
          label="Nama"
          required
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          error={errors.name}
          placeholder="Contoh: Rizky Pratama"
          disabled={loading}
          className="rounded-md"
        />
        <Input
          id="user-email"
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={(event) =>
            setValues((current) => ({ ...current, email: event.target.value }))
          }
          error={errors.email}
          placeholder="contoh: rizky@contoh.id"
          disabled={loading}
          className="rounded-md"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Peran
            <span aria-hidden="true" className="ml-1 text-red-600">
              *
            </span>
          </label>
          <Select
            value={values.role}
            options={selectOptions}
            onChange={(nextValue) =>
              setValues((current) => ({ ...current, role: nextValue }))
            }
            placeholder="Pilih peran pengguna"
            isLoading={loading}
            isDisabled={loading}
            isSearchable
            error={errors.role}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Status
            <span aria-hidden="true" className="ml-1 text-red-600">
              *
            </span>
          </label>
          <Select
            value={values.status}
            options={STATUS_OPTIONS}
            onChange={(nextValue) =>
              setValues((current) => ({
                ...current,
                status: nextValue === "inactive" ? "inactive" : "active"
              }))
            }
            isSearchable={false}
            isDisabled={loading}
            error={errors.status}
          />
        </div>
      </div>

      {selectedRole ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3">
          <div className="text-xs font-medium text-[#223B8F]">
            Peran terpilih
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {selectedRole.label}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="user-password"
          label={mode === "create" ? "Password" : "Password Baru"}
          type="password"
          required={mode === "create"}
          value={values.password}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              password: event.target.value
            }))
          }
          error={errors.password}
          placeholder={
            mode === "create"
              ? "Masukkan password"
              : "Kosongkan jika tidak diubah"
          }
          helperText={
            mode === "update" ? "Isi hanya jika password ingin diperbarui." : ""
          }
          disabled={loading}
          className="rounded-md"
        />
        <Input
          id="user-password-confirmation"
          label="Konfirmasi Password"
          type="password"
          required={mode === "create"}
          value={values.passwordConfirmation}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              passwordConfirmation: event.target.value
            }))
          }
          error={errors.passwordConfirmation}
          placeholder="Ulangi password"
          disabled={loading}
          className="rounded-md"
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
          {mode === "create" ? (
            <PlusIcon className="h-4 w-4" />
          ) : (
            <PencilSquareIcon className="h-4 w-4" />
          )}
          {loading
            ? "Menyimpan..."
            : mode === "create"
              ? "Simpan Pengguna"
              : "Update Pengguna"}
        </Button>
      </div>
    </form>
  );
}
