import * as yup from "yup";
import type { AdminPermissionFormValues } from "@/type/admin-management/adminDashboardPermission";

export const adminPermissionFormSchema: yup.ObjectSchema<AdminPermissionFormValues> =
  yup
    .object({
      name: yup
        .string()
        .trim()
        .required("Code permission wajib diisi")
        .matches(
          /^[a-z0-9_]+$/,
          "Code permission hanya boleh berisi huruf kecil, angka, dan underscore"
        )
        .min(3, "Code permission minimal 3 karakter"),
      category: yup
        .string()
        .trim()
        .required("Kategori permission wajib diisi")
        .min(3, "Kategori permission minimal 3 karakter"),
      moduleGroup: yup
        .mixed<AdminPermissionFormValues["moduleGroup"]>()
        .oneOf(
          ["dashboard", "admin_management"],
          "Modul permission wajib dipilih"
        )
        .required("Modul permission wajib dipilih"),
      description: yup
        .string()
        .trim()
        .required("Deskripsi permission wajib diisi")
        .min(8, "Deskripsi permission minimal 8 karakter")
    })
    .required();

export async function validateAdminPermissionForm(
  values: AdminPermissionFormValues
) {
  try {
    await adminPermissionFormSchema.validate(values, { abortEarly: false });
    return {} as Partial<Record<keyof AdminPermissionFormValues, string>>;
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return {
        name: "Terjadi kesalahan validasi, silakan coba lagi"
      };
    }

    return error.inner.reduce(
      (accumulator, item) => {
        if (
          item.path &&
          !accumulator[item.path as keyof AdminPermissionFormValues]
        ) {
          accumulator[item.path as keyof AdminPermissionFormValues] =
            item.message;
        }
        return accumulator;
      },
      {} as Partial<Record<keyof AdminPermissionFormValues, string>>
    );
  }
}
