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
import type {
  AdminPermissionFormValues,
  AdminPermissionRecord
} from "@/type/admin-management/adminDashboardPermission";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import { validateAdminPermissionForm } from "@/validators/admin-management/adminDashboardPermission";

type PermissionFormModalProps = {
  open: boolean;
  mode: "create" | "update";
  permission: AdminPermissionRecord | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminPermissionFormValues) => Promise<void>;
};

type PermissionFormContentProps = {
  mode: "create" | "update";
  loading: boolean;
  initialValues: AdminPermissionFormValues;
  onClose: () => void;
  onSubmit: (values: AdminPermissionFormValues) => Promise<void>;
};

const EMPTY_FORM: AdminPermissionFormValues = {
  name: "",
  category: "",
  moduleGroup: "",
  description: ""
};

const MODULE_GROUP_OPTIONS: SelectOption[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "admin_management", label: "Admin Management" }
];

export function PermissionFormModal({
  open,
  mode,
  permission,
  loading = false,
  onClose,
  onSubmit
}: PermissionFormModalProps) {
  const initialValues = useMemo<AdminPermissionFormValues>(() => {
    if (permission && mode === "update") {
      return {
        name: permission.code,
        category: permission.category,
        moduleGroup: permission.moduleGroup,
        description: permission.description
      };
    }

    return EMPTY_FORM;
  }, [mode, permission]);

  const formKey = `${mode}-${permission?.id ?? "new"}-${open ? "open" : "closed"}`;
  const title =
    mode === "create"
      ? "Tambah Permission Baru"
      : `Update Permission ${permission?.displayName}`;
  const subtitle =
    mode === "create"
      ? "Tambahkan permission baru dan tentukan modul asalnya."
      : "Perbarui code, kategori, modul, dan deskripsi permission.";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="lg"
    >
      <PermissionFormContent
        key={formKey}
        mode={mode}
        loading={loading}
        initialValues={initialValues}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function PermissionFormContent({
  mode,
  loading,
  initialValues,
  onClose,
  onSubmit
}: PermissionFormContentProps) {
  const [values, setValues] =
    useState<AdminPermissionFormValues>(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AdminPermissionFormValues, string>>
  >({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = await validateAdminPermissionForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(values);
  };

  const derivedLabel =
    values.name
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "-";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        id="permission-name"
        label="Code Permission"
        required
        value={values.name}
        onChange={(event) =>
          setValues((current) => ({ ...current, name: event.target.value }))
        }
        error={errors.name}
        placeholder="contoh: approve_admin_permissions"
        disabled={loading}
        className="rounded-md"
      />

      <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
        <div className="text-xs font-medium text-[#223B8F]">
          Nama Permission
        </div>
        <div className="mt-1 text-sm font-semibold text-slate-900">
          {derivedLabel}
        </div>
      </div>

      <Input
        id="permission-category"
        label="Category"
        required
        value={values.category}
        onChange={(event) =>
          setValues((current) => ({ ...current, category: event.target.value }))
        }
        error={errors.category}
        placeholder="Contoh: Modul Permission Admin"
        disabled={loading}
        className="rounded-md"
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Modul
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
        </label>
        <Select
          value={values.moduleGroup}
          options={MODULE_GROUP_OPTIONS}
          onChange={(nextValue) =>
            setValues((current) => ({
              ...current,
              moduleGroup:
                nextValue === "admin_management"
                  ? "admin_management"
                  : nextValue === "dashboard"
                    ? "dashboard"
                    : ""
            }))
          }
          isSearchable={false}
          error={errors.moduleGroup}
        />
      </div>

      <Input
        id="permission-description"
        label="Deskripsi"
        required
        value={values.description}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            description: event.target.value
          }))
        }
        error={errors.description}
        placeholder="Jelaskan kegunaan permission ini"
        disabled={loading}
        className="rounded-md"
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
          {mode === "create" ? (
            <PlusIcon className="h-4 w-4" />
          ) : (
            <PencilSquareIcon className="h-4 w-4" />
          )}
          {loading
            ? "Menyimpan..."
            : mode === "create"
              ? "Simpan Permission"
              : "Update Permission"}
        </Button>
      </div>
    </form>
  );
}
