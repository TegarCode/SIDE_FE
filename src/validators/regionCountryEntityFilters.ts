import * as yup from "yup";
import type { MitraFilterState } from "@/type/mitra";

export type RegionCountryEntityFilterErrors = Partial<{
  country: string;
}>;

export const regionCountryEntityFiltersSchema = yup.object({
  region: yup.string().nullable().defined(),
  subregion: yup.string().nullable().defined(),
  country: yup
    .string()
    .nullable()
    .defined()
    .required("Negara / entitas wajib dipilih.")
});

export function validateRegionCountryEntityFilters(
  value: MitraFilterState
): RegionCountryEntityFilterErrors {
  const errors: RegionCountryEntityFilterErrors = {};

  try {
    regionCountryEntityFiltersSchema.validateSync(value, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (issue.path === "country" && !errors.country) {
          errors.country = issue.message;
        }
      }
    }
  }

  return errors;
}
