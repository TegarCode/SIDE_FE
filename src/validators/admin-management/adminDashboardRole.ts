import * as yup from "yup";
import type { AdminRoleFormValues } from "@/type/admin-management/adminDashboardRole";

export const adminRoleFormSchema: yup.ObjectSchema<AdminRoleFormValues> = yup
  .object({
    name: yup
      .string()
      .trim()
      .required("Nama role wajib diisi")
      .min(3, "Nama role minimal 3 karakter"),
    slug: yup
      .string()
      .trim()
      .required("Slug role wajib diisi")
      .matches(
        /^[a-z0-9_-]+$/,
        "Slug hanya boleh berisi huruf kecil, angka, tanda hubung, dan underscore"
      ),
    description: yup
      .string()
      .trim()
      .required("Deskripsi role wajib diisi")
      .min(8, "Deskripsi role minimal 8 karakter"),
    status: yup
      .mixed<AdminRoleFormValues["status"]>()
      .oneOf(["active", "inactive"], "Status role tidak valid")
      .required("Status role wajib dipilih"),
    permissions: yup
      .array()
      .of(yup.string().trim().required())
      .min(1, "Pilih minimal satu permission")
      .defined()
  })
  .required();

export async function validateAdminRoleForm(values: AdminRoleFormValues) {
  try {
    await adminRoleFormSchema.validate(values, { abortEarly: false });
    return {} as Partial<Record<keyof AdminRoleFormValues, string>>;
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return {
        name: "Terjadi kesalahan validasi, silakan coba lagi"
      };
    }

    return error.inner.reduce(
      (acc, item) => {
        if (item.path && !acc[item.path as keyof AdminRoleFormValues]) {
          acc[item.path as keyof AdminRoleFormValues] = item.message;
        }
        return acc;
      },
      {} as Partial<Record<keyof AdminRoleFormValues, string>>
    );
  }
}
