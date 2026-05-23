import * as yup from "yup";
import type { InfrastrukturFilterState } from "@/type/indonesiaInfrastruktur";

export type InfrastrukturFilterErrors = Partial<{
  categories: string;
}>;

export const infrastrukturFiltersSchema = yup.object({
  region: yup.string().nullable().defined(),
  subregion: yup.string().nullable().defined(),
  categories: yup
    .array()
    .of(yup.string().trim().required())
    .min(1, "Pilih minimal satu kategori infrastruktur.")
    .defined()
    .required("Pilih minimal satu kategori infrastruktur.")
});

export function validateInfrastrukturFilters(
  value: InfrastrukturFilterState
): InfrastrukturFilterErrors {
  const errors: InfrastrukturFilterErrors = {};

  try {
    infrastrukturFiltersSchema.validateSync(value, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (issue.path === "categories" && !errors.categories) {
          errors.categories = issue.message;
        }
      }
    }
  }

  return errors;
}
