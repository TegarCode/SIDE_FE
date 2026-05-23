import * as yup from "yup";
import type {
  AdminFaqFormItemValues,
  AdminFaqFormValues
} from "@/type/admin-management/adminDashboardFaq";

const faqItemSchema: yup.ObjectSchema<AdminFaqFormItemValues> = yup
  .object({
    id: yup.string().required(),
    question: yup
      .string()
      .trim()
      .required("Pertanyaan wajib diisi")
      .min(3, "Pertanyaan minimal 3 karakter"),
    answer: yup.string().trim().required("Jawaban wajib diisi"),
    order: yup
      .string()
      .defined()
      .default("")
      .trim()
      .test("item-order-valid", "Urutan item minimal 0", (value) => {
        if (!value) return true;
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= 0;
      })
  })
  .required();

export const adminFaqFormSchema: yup.ObjectSchema<AdminFaqFormValues> = yup
  .object({
    topic: yup
      .string()
      .trim()
      .required("Topik FAQ wajib diisi")
      .min(3, "Topik FAQ minimal 3 karakter"),
    summary: yup.string().trim().default(""),
    isFeatured: yup
      .boolean()
      .required("Status featured wajib dipilih")
      .default(false),
    order: yup
      .string()
      .defined()
      .trim()
      .required("Urutan topik wajib diisi")
      .test("topic-order-valid", "Urutan topik minimal 0", (value) => {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= 0;
      }),
    items: yup
      .array()
      .of(faqItemSchema)
      .required()
      .min(1, "Minimal harus ada 1 item FAQ")
  })
  .required();

export async function validateAdminFaqForm(values: AdminFaqFormValues) {
  try {
    await adminFaqFormSchema.validate(values, { abortEarly: false });
    return {} as Record<string, string>;
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return {
        topic: "Terjadi kesalahan validasi, silakan coba lagi"
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
