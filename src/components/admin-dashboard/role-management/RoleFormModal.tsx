import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  Squares2X2Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useDeferredValue, useMemo, useState } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Modal } from "@/components/ui/Modal";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import type {
  AdminRoleFormValues,
  AdminRoleRecord,
  RolePermissionItem
} from "@/type/admin-management/adminDashboardRole";
import { cn } from "@/utils/cn";
import { validateAdminRoleForm } from "@/validators/admin-management/adminDashboardRole";

type RoleFormModalProps = {
  open: boolean;
  mode: "create" | "update";
  role: AdminRoleRecord | null;
  permissions: RolePermissionItem[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminRoleFormValues) => Promise<void>;
};

type RoleFormContentProps = {
  mode: "create" | "update";
  role: AdminRoleRecord | null;
  permissions: RolePermissionItem[];
  loading: boolean;
  initialValues: AdminRoleFormValues;
  onClose: () => void;
  onSubmit: (values: AdminRoleFormValues) => Promise<void>;
};

type PermissionModuleGroup = "admin_management" | "dashboard";

type PermissionCategoryGroup = {
  category: string;
  items: RolePermissionItem[];
};

const EMPTY_FORM: AdminRoleFormValues = {
  name: "",
  slug: "",
  description: "",
  status: "active",
  permissions: []
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" }
];

const MODULE_TABS: TabItem<PermissionModuleGroup>[] = [
  { value: "admin_management", label: "Admin Management" },
  { value: "dashboard", label: "Dashboard" }
];

export function RoleFormModal({
  open,
  mode,
  role,
  permissions,
  loading = false,
  onClose,
  onSubmit
}: RoleFormModalProps) {
  const initialValues = useMemo<AdminRoleFormValues>(() => {
    if (role && mode === "update") {
      return {
        name: role.name,
        slug: role.slug,
        description: role.description,
        status: role.status,
        permissions: role.permissions
      };
    }

    return EMPTY_FORM;
  }, [mode, role]);

  const formKey = `${mode}-${role?.id ?? "new"}-${open ? "open" : "closed"}`;
  const title =
    mode === "create" ? "Tambah Role Baru" : `Update Role ${role?.name}`;
  const subtitle =
    mode === "create"
      ? "Tentukan nama role, slug, deskripsi, dan permission awal."
      : "Perbarui detail role sekaligus permission yang dapat digunakan.";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="2xl"
    >
      <RoleFormContent
        key={formKey}
        mode={mode}
        role={role}
        permissions={permissions}
        loading={loading}
        initialValues={initialValues}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function RoleFormContent({
  mode,
  permissions,
  loading,
  initialValues,
  onClose,
  onSubmit
}: RoleFormContentProps) {
  const [values, setValues] = useState<AdminRoleFormValues>(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AdminRoleFormValues, string>>
  >({});
  const [pickerOpen, setPickerOpen] = useState(false);

  const permissionMap = useMemo(
    () => new Map(permissions.map((item) => [item.code, item])),
    [permissions]
  );
  const selectedPermissionItems = useMemo(
    () =>
      values.permissions
        .map((code) => permissionMap.get(code))
        .filter((item): item is RolePermissionItem => Boolean(item)),
    [permissionMap, values.permissions]
  );
  const selectedCategories = useMemo(
    () =>
      Array.from(
        new Set(selectedPermissionItems.map((item) => item.category.trim()))
      ).sort((left, right) => left.localeCompare(right, "id-ID")),
    [selectedPermissionItems]
  );
  const selectedAdminManagementCount = selectedPermissionItems.filter(
    (item) => item.moduleGroup === "admin_management"
  ).length;
  const selectedDashboardCount =
    selectedPermissionItems.length - selectedAdminManagementCount;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = await validateAdminRoleForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(values);
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            id="role-name"
            label="Nama Role"
            required
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            error={errors.name}
            placeholder="Contoh: Supervisor Regional"
            disabled={loading}
            className="rounded-md"
          />

          <Input
            id="role-slug"
            label="Slug"
            required
            value={values.slug}
            onChange={(event) =>
              setValues((current) => ({ ...current, slug: event.target.value }))
            }
            error={errors.slug}
            placeholder="contoh: supervisor_regional"
            disabled={loading}
            className="rounded-md"
          />
        </div>

        <Input
          id="role-description"
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
          placeholder="Jelaskan cakupan penggunaan role ini"
          disabled={loading}
          className="rounded-md"
        />

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
            error={errors.status}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(56,74,160,0.08),transparent_34%),linear-gradient(180deg,#ffffff,#f8fafc)] shadow-sm">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold text-slate-900">
                    Permission
                    <span aria-hidden="true" className="ml-1 text-red-600">
                      *
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#223B8F]/8 px-2.5 py-1 text-[11px] font-semibold text-[#223B8F] ring-1 ring-[#223B8F]/10">
                    {values.permissions.length} dipilih
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Susun permission lewat picker terpisah agar lebih rapi per
                  modul dan kategori.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                rounded="lg"
                className="gap-2 px-4 py-2 text-sm font-semibold"
                onClick={() => setPickerOpen(true)}
                disabled={loading}
              >
                <Squares2X2Icon className="h-4 w-4" />
                Buka Permission Picker
              </Button>
            </div>
          </div>

          <div className="grid gap-4 px-4 py-4 sm:grid-cols-3 sm:px-5">
            <SummaryPill
              title="Admin Management"
              value={selectedAdminManagementCount}
              tone="blue"
            />
            <SummaryPill
              title="Dashboard"
              value={selectedDashboardCount}
              tone="amber"
            />
            <SummaryPill
              title="Kategori Aktif"
              value={selectedCategories.length}
              tone="emerald"
            />
          </div>

          <div className="border-t border-slate-200 bg-white/80 px-4 py-4 sm:px-5">
            {selectedPermissionItems.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.slice(0, 8).map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200"
                    >
                      {category}
                    </span>
                  ))}
                  {selectedCategories.length > 8 ? (
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                      +{selectedCategories.length - 8} kategori lain
                    </span>
                  ) : null}
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {selectedPermissionItems.slice(0, 6).map((item) => (
                    <div
                      key={item.code}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {formatModuleGroup(item.moduleGroup)} / {item.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Belum ada permission dipilih. Gunakan permission picker untuk
                memilih akses berdasarkan modul dan kategori.
              </div>
            )}

            {errors.permissions ? (
              <p className="mt-3 text-xs text-rose-700">{errors.permissions}</p>
            ) : null}
          </div>
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
                ? "Simpan Role"
                : "Update Role"}
          </Button>
        </div>
      </form>

      <PermissionPickerModal
        key={
          pickerOpen ? values.permissions.slice().sort().join("|") : "closed"
        }
        open={pickerOpen}
        permissions={permissions}
        selectedValues={values.permissions}
        onClose={() => setPickerOpen(false)}
        onApply={(nextPermissions) => {
          setValues((current) => ({
            ...current,
            permissions: nextPermissions
          }));
          setPickerOpen(false);
        }}
      />
    </>
  );
}

function SummaryPill({
  title,
  value,
  tone
}: {
  title: string;
  value: number;
  tone: "blue" | "amber" | "emerald";
}) {
  const toneClassName =
    tone === "blue"
      ? "bg-[#223B8F]/8 text-[#223B8F] ring-[#223B8F]/10"
      : tone === "amber"
        ? "bg-amber-100/70 text-amber-700 ring-amber-200"
        : "bg-emerald-100/70 text-emerald-700 ring-emerald-200";

  return (
    <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm ring-1 ring-slate-100">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ring-1",
            toneClassName
          )}
        >
          Terpilih
        </span>
      </div>
    </div>
  );
}

function PermissionPickerModal({
  open,
  permissions,
  selectedValues,
  onClose,
  onApply
}: {
  open: boolean;
  permissions: RolePermissionItem[];
  selectedValues: string[];
  onClose: () => void;
  onApply: (values: string[]) => void;
}) {
  const [draftValues, setDraftValues] = useState<string[]>(selectedValues);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [activeModule, setActiveModule] =
    useState<PermissionModuleGroup>("admin_management");

  const groupedPermissions = useMemo(() => {
    const groups = {
      admin_management: new Map<string, RolePermissionItem[]>(),
      dashboard: new Map<string, RolePermissionItem[]>()
    } satisfies Record<
      PermissionModuleGroup,
      Map<string, RolePermissionItem[]>
    >;

    permissions.forEach((permission) => {
      const moduleGroup = permission.moduleGroup;
      const category = permission.category.trim() || "Lainnya";
      const currentItems = groups[moduleGroup].get(category) ?? [];
      currentItems.push(permission);
      groups[moduleGroup].set(category, currentItems);
    });

    return {
      admin_management: toCategoryGroups(groups.admin_management),
      dashboard: toCategoryGroups(groups.dashboard)
    } satisfies Record<PermissionModuleGroup, PermissionCategoryGroup[]>;
  }, [permissions]);

  const filteredGroups = useMemo(() => {
    return groupedPermissions[activeModule]
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!deferredSearch) return true;
          const haystack = [
            item.name,
            item.code,
            item.category,
            item.description,
            formatModuleGroup(item.moduleGroup)
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(deferredSearch);
        })
      }))
      .filter((group) => group.items.length > 0);
  }, [activeModule, deferredSearch, groupedPermissions]);

  const permissionMap = useMemo(
    () => new Map(permissions.map((item) => [item.code, item])),
    [permissions]
  );
  const selectedPermissionItems = useMemo(
    () =>
      draftValues
        .map((code) => permissionMap.get(code))
        .filter((item): item is RolePermissionItem => Boolean(item)),
    [draftValues, permissionMap]
  );
  const selectedByModule = useMemo(
    () => ({
      admin_management: selectedPermissionItems.filter(
        (item) => item.moduleGroup === "admin_management"
      ),
      dashboard: selectedPermissionItems.filter(
        (item) => item.moduleGroup === "dashboard"
      )
    }),
    [selectedPermissionItems]
  );
  const visibleCodes = filteredGroups.flatMap((group) =>
    group.items.map((item) => item.code)
  );
  const allVisibleSelected =
    visibleCodes.length > 0 &&
    visibleCodes.every((code) => draftValues.includes(code));

  const handleTogglePermission = (code: string) => {
    setDraftValues((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code]
    );
  };

  const handleToggleCategory = (items: RolePermissionItem[]) => {
    const itemCodes = items.map((item) => item.code);
    const everySelected = itemCodes.every((code) => draftValues.includes(code));

    setDraftValues((current) =>
      everySelected
        ? current.filter((code) => !itemCodes.includes(code))
        : Array.from(new Set([...current, ...itemCodes]))
    );
  };

  const handleSelectVisible = () => {
    setDraftValues((current) =>
      allVisibleSelected
        ? current.filter((code) => !visibleCodes.includes(code))
        : Array.from(new Set([...current, ...visibleCodes]))
    );
  };

  const handleSelectEntireModule = () => {
    const moduleCodes = groupedPermissions[activeModule].flatMap((group) =>
      group.items.map((item) => item.code)
    );
    const everySelected = moduleCodes.every((code) =>
      draftValues.includes(code)
    );

    setDraftValues((current) =>
      everySelected
        ? current.filter((code) => !moduleCodes.includes(code))
        : Array.from(new Set([...current, ...moduleCodes]))
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Permission Picker"
      subtitle="Kelompokkan akses role dengan cara yang lebih rapi: pilih modul terlebih dulu, lalu centang per kategori."
      size="full"
      bodyClassName="p-0"
    >
      <div className="grid min-h-0 lg:grid-cols-[minmax(0,1.8fr)_360px]">
        <div className="min-h-0 border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="space-y-4 border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.95))] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <Tabs
                items={MODULE_TABS.map((item) => ({
                  ...item,
                  label: `${item.label} (${groupedPermissions[item.value].flatMap((group) => group.items).length})`
                }))}
                value={activeModule}
                onChange={setActiveModule}
                listClassName="flex-wrap"
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={allVisibleSelected ? "secondary" : "outline"}
                  rounded="full"
                  className="px-3 py-1.5 text-xs font-semibold"
                  onClick={handleSelectVisible}
                >
                  {allVisibleSelected ? "Lepas Visible" : "Pilih Visible"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  rounded="full"
                  className="px-3 py-1.5 text-xs font-semibold"
                  onClick={handleSelectEntireModule}
                >
                  Toggle 1 Modul
                </Button>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari permission, code, kategori, atau modul..."
                leftSlot={
                  <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                }
                className="rounded-xl border-slate-200 bg-white/90"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  rounded="full"
                  className="px-3 py-1.5 text-xs font-semibold"
                  onClick={() => setDraftValues([])}
                >
                  Kosongkan Semua
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  rounded="full"
                  className="px-3 py-1.5 text-xs font-semibold"
                  onClick={() => setSearch("")}
                >
                  Reset Cari
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-[70vh] space-y-3 overflow-auto px-4 py-4 sm:px-5">
            {filteredGroups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                Tidak ada permission yang cocok untuk modul dan kata kunci ini.
              </div>
            ) : (
              filteredGroups.map((group, index) => {
                const groupCodes = group.items.map((item) => item.code);
                const selectedCount = groupCodes.filter((code) =>
                  draftValues.includes(code)
                ).length;

                return (
                  <Accordion
                    key={`${activeModule}-${group.category}`}
                    title={group.category}
                    description={`${group.items.length} permission dalam kategori ini`}
                    badge={`${selectedCount}/${group.items.length}`}
                    defaultOpen={index < 2 || selectedCount > 0}
                    summary={
                      selectedCount > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {group.items
                            .filter((item) => draftValues.includes(item.code))
                            .slice(0, 4)
                            .map((item) => (
                              <span
                                key={item.code}
                                className="inline-flex items-center rounded-full bg-[#223B8F]/8 px-2 py-0.5 text-[10px] font-semibold text-[#223B8F]"
                              >
                                {item.name}
                              </span>
                            ))}
                          {selectedCount > 4 ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              +{selectedCount - 4} lagi
                            </span>
                          ) : null}
                        </div>
                      ) : null
                    }
                    actions={
                      <Button
                        type="button"
                        variant="outline"
                        rounded="full"
                        className="px-3 py-1 text-[11px] font-semibold"
                        onClick={() => handleToggleCategory(group.items)}
                      >
                        {selectedCount === group.items.length
                          ? "Lepas Semua"
                          : "Pilih Semua"}
                      </Button>
                    }
                  >
                    <div className="grid gap-2">
                      {group.items.map((item) => {
                        const checked = draftValues.includes(item.code);

                        return (
                          <button
                            key={item.code}
                            type="button"
                            className={cn(
                              "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition",
                              checked
                                ? "border-[#223B8F]/25 bg-[#223B8F]/6 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            )}
                            onClick={() => handleTogglePermission(item.code)}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTogglePermission(item.code)}
                              onClick={(event) => event.stopPropagation()}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#223B8F] focus:ring-[#223B8F]"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-sm font-semibold text-slate-900">
                                  {item.name}
                                </div>
                                <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  {item.code}
                                </code>
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                {item.description ||
                                  "Tanpa deskripsi tambahan."}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Accordion>
                );
              })
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-col bg-slate-50/80">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
            <div className="text-sm font-semibold text-slate-900">
              Ringkasan Pilihan
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Tinjau komposisi akses sebelum diterapkan ke role.
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-auto px-4 py-4 sm:px-5">
            <div className="grid gap-3">
              <SidebarStatCard
                title="Admin Management"
                count={selectedByModule.admin_management.length}
                tone="blue"
              />
              <SidebarStatCard
                title="Dashboard"
                count={selectedByModule.dashboard.length}
                tone="amber"
              />
              <SidebarStatCard
                title="Total Permission"
                count={draftValues.length}
                tone="emerald"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Kategori Terpilih
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(
                  new Set(
                    selectedPermissionItems.map((item) => item.category.trim())
                  )
                )
                  .sort((left, right) => left.localeCompare(right, "id-ID"))
                  .map((category) => (
                    <span
                      key={category}
                      className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200"
                    >
                      {category}
                    </span>
                  ))}
                {selectedPermissionItems.length === 0 ? (
                  <div className="text-sm text-slate-400">
                    Belum ada kategori aktif.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Preview Permission
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {selectedPermissionItems.length} item
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {selectedPermissionItems.slice(0, 12).map((item) => (
                  <div
                    key={item.code}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {item.name}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {formatModuleGroup(item.moduleGroup)} / {item.category}
                    </div>
                  </div>
                ))}
                {selectedPermissionItems.length > 12 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-center text-xs font-medium text-slate-500">
                    +{selectedPermissionItems.length - 12} permission lain
                  </div>
                ) : null}
                {selectedPermissionItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-center text-sm text-slate-400">
                    Pilihan masih kosong.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                rounded="md"
                className="px-4 py-2 text-sm font-semibold"
                onClick={onClose}
              >
                Tutup
              </Button>
              <Button
                type="button"
                variant="primary"
                rounded="md"
                className="gap-2 px-4 py-2 text-sm font-semibold"
                onClick={() =>
                  onApply(
                    [...draftValues].sort((left, right) =>
                      left.localeCompare(right, "id-ID")
                    )
                  )
                }
              >
                <CheckCircleIcon className="h-4 w-4" />
                Terapkan Pilihan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function SidebarStatCard({
  title,
  count,
  tone
}: {
  title: string;
  count: number;
  tone: "blue" | "amber" | "emerald";
}) {
  const accentClassName =
    tone === "blue"
      ? "bg-[#223B8F]/8 text-[#223B8F]"
      : tone === "amber"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="text-2xl font-bold text-slate-900">{count}</div>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold",
            accentClassName
          )}
        >
          Selected
        </span>
      </div>
    </div>
  );
}

function toCategoryGroups(groups: Map<string, RolePermissionItem[]>) {
  return Array.from(groups.entries())
    .map(([category, items]) => ({
      category,
      items: [...items].sort((left, right) =>
        left.name.localeCompare(right.name, "id-ID")
      )
    }))
    .sort((left, right) =>
      left.category.localeCompare(right.category, "id-ID")
    );
}

function formatModuleGroup(value: PermissionModuleGroup) {
  return value === "admin_management" ? "Admin Management" : "Dashboard";
}
