import * as yup from "yup";
import type { LoginFormValues } from "@/type/auth";

export const loginFormSchema: yup.ObjectSchema<LoginFormValues> = yup
  .object({
    email: yup
      .string()
      .trim()
      .required("Email wajib diisi")
      .email("Format email tidak valid"),
    password: yup.string().trim().required("Kata sandi wajib diisi"),
    captcha: yup.string().trim().required("Kode keamanan wajib diisi")
  })
  .required();

export async function validateLoginForm(values: LoginFormValues) {
  try {
    await loginFormSchema.validate(values, { abortEarly: false });
    return {} as Partial<Record<keyof LoginFormValues, string>>;
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return {
        captcha: "Terjadi kesalahan validasi, silakan coba lagi"
      };
    }

    return error.inner.reduce(
      (acc, item) => {
        if (item.path && !acc[item.path as keyof LoginFormValues]) {
          acc[item.path as keyof LoginFormValues] = item.message;
        }
        return acc;
      },
      {} as Partial<Record<keyof LoginFormValues, string>>
    );
  }
}
