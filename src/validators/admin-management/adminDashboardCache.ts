import * as yup from "yup";
import type { AdminCacheUpdateFormValues } from "@/type/admin-management/adminDashboardCache";

const cacheUpdateSchema: yup.ObjectSchema<AdminCacheUpdateFormValues> = yup
  .object({
    expirationAt: yup
      .string()
      .trim()
      .required("Tanggal kedaluwarsa wajib diisi")
      .test(
        "is-valid-datetime",
        "Format tanggal kedaluwarsa tidak valid",
        (value) => {
          if (!value) return false;
          return !Number.isNaN(new Date(value).getTime());
        }
      )
  })
  .required();

export async function validateAdminCacheUpdateForm(
  values: AdminCacheUpdateFormValues
) {
  try {
    await cacheUpdateSchema.validate(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return {
        expirationAt: "Terjadi kesalahan validasi, silakan coba lagi"
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
