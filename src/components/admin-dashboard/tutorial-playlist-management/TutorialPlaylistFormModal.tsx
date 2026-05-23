import {
  EyeIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { Textarea } from "@/components/ui/Form/Textarea";
import { Modal } from "@/components/ui/Modal";
import type {
  AdminTutorialPlaylistFormValues,
  AdminTutorialPlaylistRecord
} from "@/type/admin-management/adminDashboardTutorialPlaylist";
import {
  flattenApiValidationErrors,
  getApiValidationErrors
} from "@/utils/apiFormError";
import { validateAdminTutorialPlaylistForm } from "@/validators/admin-management/adminDashboardTutorialPlaylist";

type TutorialPlaylistFormModalProps = {
  open: boolean;
  mode: "create" | "update" | "detail";
  playlist: AdminTutorialPlaylistRecord | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminTutorialPlaylistFormValues) => Promise<void>;
};

const EMPTY_FORM: AdminTutorialPlaylistFormValues = {
  title: "",
  slug: "",
  description: "",
  url: "",
  thumbnailFile: null,
  thumbnailPreview: ""
};

export function TutorialPlaylistFormModal({
  open,
  mode,
  playlist,
  loading = false,
  onClose,
  onSubmit
}: TutorialPlaylistFormModalProps) {
  const initialValues = useMemo<AdminTutorialPlaylistFormValues>(() => {
    if (playlist && mode !== "create") {
      return {
        title: playlist.title,
        slug: playlist.slug,
        description: playlist.description,
        url: playlist.url,
        thumbnailFile: null,
        thumbnailPreview: playlist.thumbnailUrl
      };
    }

    return EMPTY_FORM;
  }, [mode, playlist]);

  const title =
    mode === "create"
      ? "Tambah Daftar Video Tutorial"
      : mode === "update"
        ? `Update Tutorial ${playlist?.title ?? ""}`
        : `Detail Tutorial ${playlist?.title ?? ""}`;

  const subtitle =
    mode === "detail"
      ? "Tinjau detail playlist tutorial beserta thumbnail dan URL video."
      : "Kelola judul, slug, deskripsi, URL video, dan thumbnail playlist tutorial.";

  const formKey = `${mode}-${playlist?.id ?? "new"}-${open ? "open" : "closed"}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="xl"
    >
      <TutorialPlaylistFormContent
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

type TutorialPlaylistFormContentProps = {
  mode: "create" | "update" | "detail";
  initialValues: AdminTutorialPlaylistFormValues;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: AdminTutorialPlaylistFormValues) => Promise<void>;
};

function TutorialPlaylistFormContent({
  mode,
  initialValues,
  loading,
  onClose,
  onSubmit
}: TutorialPlaylistFormContentProps) {
  const [values, setValues] =
    useState<AdminTutorialPlaylistFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendMessages, setBackendMessages] = useState<string[]>([]);
  const isDetail = mode === "detail";

  useEffect(() => {
    return () => {
      if (values.thumbnailFile && values.thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(values.thumbnailPreview);
      }
    };
  }, [values.thumbnailFile, values.thumbnailPreview]);

  const handleThumbnailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextFile = event.target.files?.[0] ?? null;

    setValues((current) => {
      if (
        current.thumbnailFile &&
        current.thumbnailPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(current.thumbnailPreview);
      }

      return {
        ...current,
        thumbnailFile: nextFile,
        thumbnailPreview: nextFile ? URL.createObjectURL(nextFile) : ""
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDetail) {
      onClose();
      return;
    }

    const nextErrors = await validateAdminTutorialPlaylistForm(values, mode);
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
        ...(fieldErrors.title?.[0] ? { title: fieldErrors.title[0] } : {}),
        ...(fieldErrors.slug?.[0] ? { slug: fieldErrors.slug[0] } : {}),
        ...(fieldErrors.desc?.[0]
          ? { description: fieldErrors.desc[0] }
          : fieldErrors.description?.[0]
            ? { description: fieldErrors.description[0] }
            : {}),
        ...(fieldErrors.url?.[0] ? { url: fieldErrors.url[0] } : {}),
        ...(fieldErrors.thumbnail?.[0]
          ? { thumbnailFile: fieldErrors.thumbnail[0] }
          : {})
      }));
      setBackendMessages(flattenedMessages);
    }
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
              <li key={`${message}-${index}`}>- {message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="tutorial-title"
          label="Judul"
          required
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          error={errors.title}
          placeholder="Masukkan judul playlist tutorial"
          disabled={loading || isDetail}
          className="rounded-md"
        />
        <Input
          id="tutorial-slug"
          label="Slug"
          required
          value={values.slug}
          onChange={(event) =>
            setValues((current) => ({ ...current, slug: event.target.value }))
          }
          error={errors.slug}
          placeholder="contoh: overview-tutorial-side"
          disabled={loading || isDetail}
          className="rounded-md"
        />
      </div>

      <Textarea
        id="tutorial-description"
        label="Deskripsi"
        required
        value={values.description}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            description: event.target.value
          }))
        }
        error={errors.description}
        placeholder="Masukkan deskripsi playlist tutorial"
        disabled={loading || isDetail}
        className="min-h-[120px] rounded-md"
      />

      <Input
        id="tutorial-url"
        label="URL Video"
        required
        value={values.url}
        onChange={(event) =>
          setValues((current) => ({ ...current, url: event.target.value }))
        }
        error={errors.url}
        placeholder="https://www.youtube.com/embed/..."
        disabled={loading || isDetail}
        className="rounded-md"
      />

      <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Thumbnail
            {mode === "create" ? (
              <span aria-hidden="true" className="ml-1 text-red-600">
                *
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Format yang didukung: JPG, JPEG, PNG, WEBP. Ukuran maksimal 2MB.
          </div>
        </div>

        {!isDetail ? (
          <div>
            <input
              id="tutorial-thumbnail"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleThumbnailChange}
              disabled={loading}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#223B8F] hover:file:bg-blue-100"
            />
            {errors.thumbnailFile ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.thumbnailFile}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {values.thumbnailPreview ? (
            <img
              src={values.thumbnailPreview}
              alt="Thumbnail tutorial"
              className="h-52 w-full object-cover"
            />
          ) : (
            <div className="flex h-52 items-center justify-center bg-slate-100 text-slate-400">
              <div className="flex flex-col items-center gap-2 text-sm">
                <PhotoIcon className="h-8 w-8" />
                Belum ada thumbnail
              </div>
            </div>
          )}
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
                ? "Simpan Tutorial"
                : "Update Tutorial"}
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
