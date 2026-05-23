import * as yup from "yup";
import type { AdminAuthenticationLogUpdateFormValues } from "@/type/admin-management/adminDashboardAuthenticationLog";

const authenticationLogUpdateSchema: yup.ObjectSchema<AdminAuthenticationLogUpdateFormValues> =
  yup
    .object({
      clearedByUser: yup
        .mixed<"true" | "false">()
        .oneOf(["true", "false"], "Status clear wajib dipilih")
        .required("Status clear wajib dipilih")
    })
    .required();

export async function validateAdminAuthenticationLogUpdateForm(
  values: AdminAuthenticationLogUpdateFormValues
) {
  try {
    await authenticationLogUpdateSchema.validate(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return {
        clearedByUser: "Terjadi kesalahan validasi, silakan coba lagi"
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
