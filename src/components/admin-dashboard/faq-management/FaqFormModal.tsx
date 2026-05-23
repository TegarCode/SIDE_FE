import {
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Textarea } from "@/components/ui/Form/Textarea";
import { Modal } from "@/components/ui/Modal";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import type {
  AdminFaqFormValues,
  AdminFaqTopicRecord
} from "@/type/admin-management/adminDashboardFaq";
import {
  flattenApiValidationErrors,
  getApiValidationErrors
} from "@/utils/apiFormError";
import { validateAdminFaqForm } from "@/validators/admin-management/adminDashboardFaq";

type FaqFormModalProps = {
  open: boolean;
  mode: "create" | "update" | "detail";
  faq: AdminFaqTopicRecord | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminFaqFormValues) => Promise<void>;
};

type FaqFormContentProps = {
  mode: "create" | "update" | "detail";
  initialValues: AdminFaqFormValues;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: AdminFaqFormValues) => Promise<void>;
};

const FEATURED_OPTIONS: SelectOption[] = [
  { value: "true", label: "Featured" },
  { value: "false", label: "Tidak Featured" }
];

function createEmptyItem(index = 0) {
  return {
    id: `new-item-${Date.now()}-${index}`,
    question: "",
    answer: "",
    order: index === 0 ? "0" : String(index)
  };
}

const EMPTY_FORM: AdminFaqFormValues = {
  topic: "",
  summary: "",
  isFeatured: false,
  order: "0",
  items: [createEmptyItem()]
};

export function FaqFormModal({
  open,
  mode,
  faq,
  loading = false,
  onClose,
  onSubmit
}: FaqFormModalProps) {
  const initialValues = useMemo<AdminFaqFormValues>(() => {
    if (faq && mode !== "create") {
      return {
        topic: faq.topic,
        summary: faq.summary,
        isFeatured: faq.isFeatured,
        order: String(faq.order),
        items:
          faq.items.length > 0
            ? faq.items.map((item, index) => ({
                id: item.id || `existing-item-${index}`,
                question: item.question,
                answer: item.answer,
                order: String(item.order)
              }))
            : [createEmptyItem()]
      };
    }

    return EMPTY_FORM;
  }, [faq, mode]);

  const title =
    mode === "create"
      ? "Tambah FAQ Baru"
      : mode === "update"
        ? `Update FAQ ${faq?.topic ?? ""}`
        : `Detail FAQ ${faq?.topic ?? ""}`;
  const subtitle =
    mode === "detail"
      ? "Tinjau topik FAQ beserta seluruh item pertanyaan dan jawaban yang terhubung."
      : "Kelola topik FAQ, ringkasan, status featured, urutan, dan seluruh item FAQ dalam satu form.";
  const formKey = `${mode}-${faq?.id ?? "new"}-${open ? "open" : "closed"}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="full"
    >
      <FaqFormContent
        key={formKey}
        mode={mode}
        initialValues={initialValues}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function FaqFormContent({
  mode,
  initialValues,
  loading,
  onClose,
  onSubmit
}: FaqFormContentProps) {
  const [values, setValues] = useState<AdminFaqFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendMessages, setBackendMessages] = useState<string[]>([]);
  const isDetail = mode === "detail";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDetail) {
      onClose();
      return;
    }

    const nextErrors = await validateAdminFaqForm(values);
    setErrors(nextErrors);
    setBackendMessages([]);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      const fieldErrors = getApiValidationErrors(error);
      const flattenedMessages = flattenApiValidationErrors(fieldErrors);

      setErrors((current) => ({
        ...current,
        ...Object.entries(fieldErrors).reduce<Record<string, string>>(
          (accumulator, [field, messages]) => {
            if (messages[0]) {
              accumulator[field] = messages[0];
            }
            return accumulator;
          },
          {}
        )
      }));
      setBackendMessages(flattenedMessages);
    }
  };

  const featuredValue = values.isFeatured ? "true" : "false";

  const addItem = () => {
    setValues((current) => ({
      ...current,
      items: [...current.items, createEmptyItem(current.items.length)]
    }));
  };

  const removeItem = (index: number) => {
    setValues((current) => ({
      ...current,
      items:
        current.items.length <= 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const updateItem = (
    index: number,
    field: "question" | "answer" | "order",
    nextValue: string
  ) => {
    setValues((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: nextValue } : item
      )
    }));
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {backendMessages.length > 0 ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="text-sm font-semibold text-rose-700">
            Validasi backend
          </div>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-rose-700">
            {backendMessages.map((message, index) => (
              <li key={`${message}-${index}`}>â€¢ {message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px_180px]">
        <Input
          id="faq-topic"
          label="Topik FAQ"
          required
          value={values.topic}
          onChange={(event) =>
            setValues((current) => ({ ...current, topic: event.target.value }))
          }
          error={errors.topic}
          placeholder="Contoh: Akun dan Akses"
          disabled={loading || isDetail}
          className="rounded-md"
        />
        <Input
          id="faq-order"
          label="Urutan"
          required
          type="number"
          min={0}
          value={values.order}
          onChange={(event) =>
            setValues((current) => ({ ...current, order: event.target.value }))
          }
          error={errors.order}
          placeholder="0"
          disabled={loading || isDetail}
          className="rounded-md"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Featured
            <span aria-hidden="true" className="ml-1 text-red-600">
              *
            </span>
          </label>
          <Select
            value={featuredValue}
            options={FEATURED_OPTIONS}
            onChange={(nextValue) =>
              setValues((current) => ({
                ...current,
                isFeatured: nextValue === "true"
              }))
            }
            isSearchable={false}
            isDisabled={loading || isDetail}
            error={errors.isFeatured}
          />
        </div>
      </div>

      <Textarea
        id="faq-summary"
        label="Ringkasan"
        value={values.summary}
        onChange={(event) =>
          setValues((current) => ({ ...current, summary: event.target.value }))
        }
        error={errors.summary}
        placeholder="Ringkasan singkat topik FAQ ini"
        disabled={loading || isDetail}
        className="rounded-md"
      />

      <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Item FAQ
              <span aria-hidden="true" className="ml-1 text-red-600">
                *
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Setiap topik wajib memiliki minimal satu pertanyaan dan jawaban.
            </div>
            {errors.items ? (
              <div className="mt-2 text-xs font-medium text-rose-700">
                {errors.items}
              </div>
            ) : null}
          </div>

          {!isDetail ? (
            <Button
              type="button"
              variant="primary"
              rounded="md"
              className="gap-1.5 px-3 py-2 text-xs font-semibold"
              onClick={addItem}
              disabled={loading}
            >
              <PlusIcon className="h-4 w-4" />
              Tambah Item
            </Button>
          ) : null}
        </div>

        <div className="space-y-4">
          {values.items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Item FAQ {index + 1}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Atur pertanyaan, jawaban, dan urutan item pada topik ini.
                  </div>
                </div>

                {!isDetail ? (
                  <Button
                    type="button"
                    variant="outline"
                    rounded="md"
                    className="gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => removeItem(index)}
                    disabled={loading || values.items.length <= 1}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Hapus Item
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_140px]">
                <Textarea
                  id={`faq-item-question-${index}`}
                  label="Pertanyaan"
                  required
                  value={item.question}
                  onChange={(event) =>
                    updateItem(index, "question", event.target.value)
                  }
                  error={errors[`items.${index}.question`]}
                  placeholder="Masukkan pertanyaan FAQ"
                  disabled={loading || isDetail}
                  className="rounded-md"
                />
                <Input
                  id={`faq-item-order-${index}`}
                  label="Urutan Item"
                  type="number"
                  min={0}
                  value={item.order}
                  onChange={(event) =>
                    updateItem(index, "order", event.target.value)
                  }
                  error={errors[`items.${index}.order`]}
                  placeholder="0"
                  disabled={loading || isDetail}
                  className="rounded-md"
                />
              </div>

              <div className="mt-4">
                <Textarea
                  id={`faq-item-answer-${index}`}
                  label="Jawaban"
                  required
                  value={item.answer}
                  onChange={(event) =>
                    updateItem(index, "answer", event.target.value)
                  }
                  error={errors[`items.${index}.answer`]}
                  placeholder="Masukkan jawaban FAQ"
                  disabled={loading || isDetail}
                  className="min-h-[120px] rounded-md"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="outline"
          rounded="md"
          className="gap-1.5 px-4 py-2 text-sm font-semibold"
          onClick={onClose}
          disabled={loading}
        >
          <XMarkIcon className="h-4 w-4" />
          {isDetail ? "Tutup" : "Batal"}
        </Button>
        {!isDetail ? (
          <Button
            type="submit"
            variant="primary"
            rounded="md"
            className="gap-1.5 px-4 py-2 text-sm font-semibold"
            disabled={loading}
          >
            {mode === "create" ? (
              <PlusIcon className="h-4 w-4" />
            ) : (
              <PencilSquareIcon className="h-4 w-4" />
            )}
            {loading
              ? "Menyimpan..."
              : mode === "create"
                ? "Simpan FAQ"
                : "Update FAQ"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            rounded="md"
            className="gap-1.5 px-4 py-2 text-sm font-semibold"
            onClick={onClose}
          >
            <EyeIcon className="h-4 w-4" />
            Selesai
          </Button>
        )}
      </div>
    </form>
  );
}
