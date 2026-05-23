import { type ChangeEvent, type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useContactMutation } from "@/hooks/home/useContactMutation";
import { CONTACT_TYPE_OPTIONS, INITIAL_CONTACT_FORM } from "@/constants/home";
import type { ContactFormPayload } from "@/type/home";
import { validateContactForm } from "@/validators/contact";

type ContactErrors = Partial<Record<keyof ContactFormPayload, string>>;

type SubmitFeedback = {
  type: "success" | "error";
  message: string;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const blockVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export function HomeContactSection() {
  const [form, setForm] = useState<ContactFormPayload>(INITIAL_CONTACT_FORM);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [feedback, setFeedback] = useState<SubmitFeedback | null>(null);
  const contactMutation = useContactMutation();

  const handleChange =
    (field: keyof ContactFormPayload) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const nextValue = event.target.value;
      setForm((previous) => ({ ...previous, [field]: nextValue }));
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const validationErrors = await validateContactForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    contactMutation.mutate(form, {
      onSuccess: (result) => {
        setForm(INITIAL_CONTACT_FORM);
        setErrors({});
        setFeedback({ type: "success", message: result.message });
      },
      onError: () => {
        setFeedback({
          type: "error",
          message: "Pesan gagal dikirim. Coba lagi nanti."
        });
      }
    });
  };

  return (
    <section
      id="contact-us"
      className="relative overflow-hidden bg-white py-24"
    >
      <motion.div
        className="relative z-10 container mx-auto px-6 lg:px-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-wide text-[#162360] sm:text-4xl lg:text-5xl">
            Hubungi Tim SIDE
          </h2>
          <div className="mx-auto mt-4 w-16 rounded-full border-t-4 border-[#FFB900] sm:w-20" />
          <p className="mx-auto mt-4 max-w-3xl text-lg font-medium text-[#5E7ADD]">
            Punya pertanyaan, masukan, atau saran untuk pengembangan SIDE?
            Sampaikan langsung melalui formulir berikut.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16"
          variants={containerVariants}
        >
          <motion.div variants={blockVariants}>
            <div className="rounded-2xl border border-slate-100 bg-[#F4F6FF] px-6 py-6 shadow-sm">
              <h3 className="mb-3 text-xl font-semibold text-[#162360]">
                Kami ingin mendengar dari Anda
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Formulir ini dapat digunakan untuk menyampaikan:
              </p>
              <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-slate-600">
                <li>Pertanyaan mengenai fitur dan data di SIDE</li>
                <li>Masukan perbaikan tampilan maupun alur kerja</li>
                <li>Saran fitur baru yang mendukung kebutuhan Anda</li>
              </ul>
              <p className="text-xs text-slate-500">
                Email resmi:{" "}
                <span className="font-semibold text-[#162360]">
                  data1.pskikad@kemlu.go.id
                </span>
              </p>
            </div>
          </motion.div>

          <motion.div variants={blockVariants}>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-100 bg-[#F9FAFF] px-6 py-6 shadow-lg shadow-slate-200/60"
            >
              <div className="mb-4">
                <label
                  htmlFor="nama"
                  className="mb-1.5 block text-sm font-semibold text-[#162360]"
                >
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  value={form.nama}
                  onChange={handleChange("nama")}
                  placeholder="Tuliskan nama Anda"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#5E7ADD] focus:outline-none focus:ring-2 focus:ring-[#5E7ADD]/40"
                />
                {errors.nama && (
                  <p className="mt-1 text-xs text-red-600">{errors.nama}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-[#162360]"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="nama@instansi.go.id"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#5E7ADD] focus:outline-none focus:ring-2 focus:ring-[#5E7ADD]/40"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="jenis"
                  className="mb-1.5 block text-sm font-semibold text-[#162360]"
                >
                  Jenis Pesan <span className="text-red-500">*</span>
                </label>
                <select
                  id="jenis"
                  name="jenis"
                  value={form.jenis}
                  onChange={handleChange("jenis")}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#5E7ADD] focus:outline-none focus:ring-2 focus:ring-[#5E7ADD]/40"
                >
                  {CONTACT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.jenis && (
                  <p className="mt-1 text-xs text-red-600">{errors.jenis}</p>
                )}
              </div>

              <div className="mb-5">
                <label
                  htmlFor="pesan"
                  className="mb-1.5 block text-sm font-semibold text-[#162360]"
                >
                  Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="pesan"
                  name="pesan"
                  rows={5}
                  value={form.pesan}
                  onChange={handleChange("pesan")}
                  placeholder="Tuliskan pertanyaan, masukan, atau saran Anda..."
                  className="block w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#5E7ADD] focus:outline-none focus:ring-2 focus:ring-[#5E7ADD]/40"
                />
                {errors.pesan && (
                  <p className="mt-1 text-xs text-red-600">{errors.pesan}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={contactMutation.isPending}
                rounded="xl"
                className="inline-flex items-center justify-center rounded-xl bg-[#162360] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1F2F80] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {contactMutation.isPending ? "Mengirim..." : "Kirim Pesan"}
              </Button>

              {feedback && (
                <p
                  className={`mt-3 text-sm ${feedback.type === "success" ? "text-emerald-600" : "text-red-600"}`}
                >
                  {feedback.message}
                </p>
              )}
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
