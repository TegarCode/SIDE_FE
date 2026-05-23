import * as yup from "yup";
import type { AdminUserFormValues } from "@/type/admin-management/adminDashboardUser";

export const adminUserFormSchema: yup.ObjectSchema<AdminUserFormValues> = yup
  .object({
    name: yup
      .string()
      .trim()
      .required("Nama pengguna wajib diisi")
      .min(3, "Nama pengguna minimal 3 karakter"),
    email: yup
      .string()
      .trim()
      .email("Format email tidak valid")
      .required("Email wajib diisi"),
    role: yup.string().trim().required("Peran wajib dipilih"),
    status: yup
      .mixed<AdminUserFormValues["status"]>()
      .oneOf(["active", "inactive"], "Status pengguna tidak valid")
      .required("Status pengguna wajib dipilih"),
    password: yup.string().trim().default(""),
    passwordConfirmation: yup
      .string()
      .trim()
      .oneOf([yup.ref("password"), ""], "Konfirmasi password harus sama")
      .default("")
  })
  .required();

export async function validateAdminUserForm(
  values: AdminUserFormValues,
  mode: "create" | "update"
) {
  try {
    const schema = adminUserFormSchema.shape({
      password:
        mode === "create"
          ? yup
              .string()
              .trim()
              .required("Password wajib diisi")
              .min(8, "Password minimal 8 karakter")
          : yup
              .string()
              .trim()
              .test(
                "optional-password-length",
                "Password minimal 8 karakter",
                (value) => !value || value.length >= 8
              ),
      passwordConfirmation:
        mode === "create"
          ? yup
              .string()
              .trim()
              .required("Konfirmasi password wajib diisi")
              .oneOf([yup.ref("password")], "Konfirmasi password harus sama")
          : yup
              .string()
              .trim()
              .oneOf(
                [yup.ref("password"), ""],
                "Konfirmasi password harus sama"
              )
    });

    await schema.validate(values, { abortEarly: false });
    return {} as Partial<Record<keyof AdminUserFormValues, string>>;
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return {
        name: "Terjadi kesalahan validasi, silakan coba lagi"
      };
    }

    return error.inner.reduce(
      (accumulator, item) => {
        if (item.path && !accumulator[item.path as keyof AdminUserFormValues]) {
          accumulator[item.path as keyof AdminUserFormValues] = item.message;
        }
        return accumulator;
      },
      {} as Partial<Record<keyof AdminUserFormValues, string>>
    );
  }
}
