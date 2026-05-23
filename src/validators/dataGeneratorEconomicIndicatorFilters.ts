import * as yup from "yup";

export type DataGeneratorEconomicIndicatorFilterValueLike = {
  indicatorId: string | null;
  yearFrom: string | null;
  yearTo: string | null;
};

export type DataGeneratorEconomicIndicatorFilterErrors = Partial<{
  indicatorId: string;
  yearFrom: string;
  yearTo: string;
}>;

export const dataGeneratorEconomicIndicatorFiltersSchema = yup
  .object({
    indicatorId: yup
      .string()
      .nullable()
      .defined()
      .required("Indikator wajib dipilih."),
    yearFrom: yup
      .string()
      .nullable()
      .defined()
      .required("Tahun awal wajib dipilih."),
    yearTo: yup
      .string()
      .nullable()
      .defined()
      .required("Tahun akhir wajib dipilih.")
  })
  .test(
    "year-order",
    "Tahun awal tidak boleh lebih besar dari tahun akhir.",
    function (value) {
      const start = Number(value?.yearFrom);
      const end = Number(value?.yearTo);
      if (!Number.isFinite(start) || !Number.isFinite(end) || start <= end)
        return true;
      return this.createError({
        path: "yearTo",
        message: "Tahun awal tidak boleh lebih besar dari tahun akhir."
      });
    }
  );

export function validateDataGeneratorEconomicIndicatorFilters(
  value: DataGeneratorEconomicIndicatorFilterValueLike
): DataGeneratorEconomicIndicatorFilterErrors {
  const errors: DataGeneratorEconomicIndicatorFilterErrors = {};
  try {
    dataGeneratorEconomicIndicatorFiltersSchema.validateSync(value, {
      abortEarly: false
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (!issue.path) continue;
        if (issue.path in errors) continue;
        errors[issue.path as keyof DataGeneratorEconomicIndicatorFilterErrors] =
          issue.message;
      }
    }
  }
  return errors;
}
