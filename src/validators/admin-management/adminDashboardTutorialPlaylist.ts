import * as yup from "yup";
import type { AdminTutorialPlaylistFormValues } from "@/type/admin-management/adminDashboardTutorialPlaylist";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const tutorialPlaylistSchema: yup.ObjectSchema<
  Omit<AdminTutorialPlaylistFormValues, "thumbnailFile" | "thumbnailPreview">
> = yup
  .object({
    title: yup
      .string()
      .trim()
      .required("Judul wajib diisi")
      .min(3, "Judul minimal 3 karakter"),
    slug: yup
      .string()
      .trim()
      .required("Slug wajib diisi")
      .min(3, "Slug minimal 3 karakter"),
    description: yup.string().trim().required("Deskripsi wajib diisi"),
    url: yup
      .string()
      .trim()
      .required("URL wajib diisi")
      .url("Format URL tidak valid")
  })
  .required();

export async function validateAdminTutorialPlaylistForm(
  values: AdminTutorialPlaylistFormValues,
  mode: "create" | "update"
) {
  try {
    await tutorialPlaylistSchema.validate(
      {
        title: values.title,
        slug: values.slug,
        description: values.description,
        url: values.url
      },
      { abortEarly: false }
    );

    const errors: Record<string, string> = {};

    if (mode === "create" && !values.thumbnailFile) {
      errors.thumbnailFile = "Thumbnail wajib diunggah";
    }

    if (values.thumbnailFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(values.thumbnailFile.type)) {
        errors.thumbnailFile =
          "Thumbnail harus berupa JPG, JPEG, PNG, atau WEBP";
      } else if (values.thumbnailFile.size > MAX_FILE_SIZE) {
        errors.thumbnailFile = "Ukuran thumbnail maksimal 2MB";
      }
    }

    return errors;
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return {
        title: "Terjadi kesalahan validasi, silakan coba lagi"
      };
    }

    const fieldErrors = error.inner.reduce<Record<string, string>>(
      (accumulator, item) => {
        if (item.path && !accumulator[item.path]) {
          accumulator[item.path] = item.message;
        }
        return accumulator;
      },
      {}
    );

    if (mode === "create" && !values.thumbnailFile) {
      fieldErrors.thumbnailFile = "Thumbnail wajib diunggah";
    }

    if (values.thumbnailFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(values.thumbnailFile.type)) {
        fieldErrors.thumbnailFile =
          "Thumbnail harus berupa JPG, JPEG, PNG, atau WEBP";
      } else if (values.thumbnailFile.size > MAX_FILE_SIZE) {
        fieldErrors.thumbnailFile = "Ukuran thumbnail maksimal 2MB";
      }
    }

    return fieldErrors;
  }
}
