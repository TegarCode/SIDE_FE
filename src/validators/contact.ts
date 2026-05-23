import * as yup from "yup";
import type { ContactFormPayload } from "@/type/home";

export const contactFormSchema: yup.ObjectSchema<ContactFormPayload> = yup
  .object({
    nama: yup
      .string()
      .trim()
      .required("Nama lengkap wajib diisi")
      .min(2, "Nama minimal 2 karakter"),
    email: yup
      .string()
      .trim()
      .required("Email wajib diisi")
      .email("Format email tidak valid"),
    jenis: yup
      .mixed<ContactFormPayload["jenis"]>()
      .oneOf(["PERTANYAAN", "MASUKAN", "SARAN"], "Jenis pesan tidak valid")
      .required("Jenis pesan wajib dipilih"),
    pesan: yup
      .string()
      .trim()
      .required("Pesan wajib diisi")
      .min(10, "Pesan minimal 10 karakter")
  })
  .required();

export type ContactFormValues = yup.InferType<typeof contactFormSchema>;

export async function validateContactForm(values: ContactFormPayload) {
  try {
    await contactFormSchema.validate(values, { abortEarly: false });
    return {} as Partial<Record<keyof ContactFormPayload, string>>;
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return {
        pesan: "Terjadi kesalahan validasi, silakan coba kembali"
      };
    }

    return error.inner.reduce(
      (acc, item) => {
        if (item.path && !acc[item.path as keyof ContactFormPayload]) {
          acc[item.path as keyof ContactFormPayload] = item.message;
        }

        return acc;
      },
      {} as Partial<Record<keyof ContactFormPayload, string>>
    );
  }
}
