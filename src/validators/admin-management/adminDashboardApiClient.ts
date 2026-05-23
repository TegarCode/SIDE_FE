import * as yup from "yup";
import type { AdminApiClientFormValues } from "@/type/admin-management/adminDashboardApiClient";

export const adminApiClientFormSchema: yup.ObjectSchema<AdminApiClientFormValues> =
  yup
    .object({
      name: yup
        .string()
        .trim()
        .required("Nama API client wajib diisi")
        .min(3, "Nama API client minimal 3 karakter"),
      description: yup.string().trim().default(""),
      abilities: yup
        .array(yup.string().trim().required("Ability tidak valid"))
        .min(1, "Minimal pilih satu ability")
        .required("Ability wajib dipilih"),
      allowedDomains: yup
        .array(
          yup
            .string()
            .defined()
            .trim()
            .test(
              "optional-domain",
              "Format domain harus berupa URL yang valid",
              (value) => !value || /^https?:\/\/.+/i.test(value)
            )
        )
        .default([]),
      active: yup.boolean().required("Status aktif wajib dipilih")
    })
    .required();

export async function validateAdminApiClientForm(
  values: AdminApiClientFormValues
) {
  try {
    await adminApiClientFormSchema.validate(values, { abortEarly: false });
    return {} as Record<string, string>;
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return {
        name: "Terjadi kesalahan validasi, silakan coba lagi"
      };
    }

    return error.inner.reduce<Record<string, string>>((accumulator, item) => {
      if (item.path && !accumulator[item.path]) {
        accumulator[item.path] = item.message;
      }
      return accumulator;
    }, {});
  }
}
