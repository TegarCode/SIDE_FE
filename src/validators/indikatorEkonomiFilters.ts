import * as yup from "yup";
import type { EconomicIndicatorFilterState } from "@/type/indonesiaIndikatorEkonomi";

export type IndikatorEkonomiFilterErrors = Partial<{
  year: string;
  indicatorId: string;
}>;

export const indikatorEkonomiFiltersSchema = yup.object({
  year: yup.string().nullable().defined().required("Tahun wajib dipilih."),
  indicatorId: yup
    .string()
    .nullable()
    .defined()
    .required("Indikator wajib dipilih.")
});

export function validateIndikatorEkonomiFilters(
  value: EconomicIndicatorFilterState
): IndikatorEkonomiFilterErrors {
  const errors: IndikatorEkonomiFilterErrors = {};

  try {
    indikatorEkonomiFiltersSchema.validateSync(value, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (issue.path === "year" && !errors.year) {
          errors.year = issue.message;
        }
        if (issue.path === "indicatorId" && !errors.indicatorId) {
          errors.indicatorId = issue.message;
        }
      }
    }
  }

  return errors;
}
