import * as yup from "yup";
import type { AdminContactFormValues } from "@/type/admin-management/adminDashboardContact";

export const adminContactFormSchema: yup.ObjectSchema<AdminContactFormValues> =
  yup
    .object({
      name: yup.string().trim().required("Nama wajib diisi"),
      email: yup
        .string()
        .trim()
        .required("Email wajib diisi")
        .email("Format email tidak valid"),
      type: yup
        .mixed<"PERTANYAAN" | "MASUKAN" | "SARAN">()
        .oneOf(["PERTANYAAN", "MASUKAN", "SARAN"], "Jenis pesan tidak valid")
        .required("Jenis wajib dipilih"),
      message: yup
        .string()
        .trim()
        .required("Pesan wajib diisi")
        .min(6, "Pesan minimal 6 karakter")
    })
    .required();

export async function validateAdminContactForm(values: AdminContactFormValues) {
  try {
    await adminContactFormSchema.validate(values, { abortEarly: false });
    return {} as Partial<Record<keyof AdminContactFormValues, string>>;
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return { name: "Terjadi kesalahan validasi, silakan coba lagi" };
    }

    return error.inner.reduce(
      (accumulator, item) => {
        if (
          item.path &&
          !accumulator[item.path as keyof AdminContactFormValues]
        ) {
          accumulator[item.path as keyof AdminContactFormValues] = item.message;
        }
        return accumulator;
      },
      {} as Partial<Record<keyof AdminContactFormValues, string>>
    );
  }
}
