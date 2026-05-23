import * as yup from "yup";

export type DataGeneratorTourismFilterValueLike = {
  origins: string[];
  originGroup: string | null;
  destinations: string[];
  destinationGroup: string | null;
  yearFrom: string | null;
  yearTo: string | null;
  typeData: string | null;
  source: string | null;
};

export type DataGeneratorTourismFilterErrors = Partial<{
  originSelection: string;
  destinationSelection: string;
  groupCombination: string;
  yearFrom: string;
  yearTo: string;
  typeData: string;
  source: string;
}>;

export const dataGeneratorTourismFiltersSchema = yup
  .object({
    origins: yup.array().of(yup.string().trim().required()).defined(),
    originGroup: yup.string().nullable().defined(),
    destinations: yup.array().of(yup.string().trim().required()).defined(),
    destinationGroup: yup.string().nullable().defined(),
    yearFrom: yup
      .string()
      .nullable()
      .defined()
      .required("Tahun awal wajib dipilih."),
    yearTo: yup
      .string()
      .nullable()
      .defined()
      .required("Tahun akhir wajib dipilih."),
    typeData: yup
      .string()
      .nullable()
      .defined()
      .required("Jenis data wajib dipilih."),
    source: yup
      .string()
      .nullable()
      .defined()
      .required("Sumber data wajib dipilih.")
  })
  .test(
    "origin-selection",
    "Pilih minimal satu negara/entitas asal atau satu grup asal.",
    function (value) {
      if ((value?.origins?.length ?? 0) > 0 || value?.originGroup) return true;
      return this.createError({
        path: "originSelection",
        message: "Pilih minimal satu negara/entitas asal atau satu grup asal."
      });
    }
  )
  .test(
    "destination-selection",
    "Pilih minimal satu negara/entitas tujuan atau satu grup tujuan.",
    function (value) {
      if ((value?.destinations?.length ?? 0) > 0 || value?.destinationGroup)
        return true;
      return this.createError({
        path: "destinationSelection",
        message:
          "Pilih minimal satu negara/entitas tujuan atau satu grup tujuan."
      });
    }
  )
  .test(
    "group-combination",
    "Grup asal dan grup tujuan tidak dapat dipilih bersamaan.",
    function (value) {
      if (!(value?.originGroup && value?.destinationGroup)) return true;
      return this.createError({
        path: "groupCombination",
        message: "Grup asal dan grup tujuan tidak dapat dipilih bersamaan."
      });
    }
  )
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

export function validateDataGeneratorTourismFilters(
  value: DataGeneratorTourismFilterValueLike
): DataGeneratorTourismFilterErrors {
  const errors: DataGeneratorTourismFilterErrors = {};

  try {
    dataGeneratorTourismFiltersSchema.validateSync(value, {
      abortEarly: false
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (!issue.path) continue;
        if (issue.path in errors) continue;
        errors[issue.path as keyof DataGeneratorTourismFilterErrors] =
          issue.message;
      }
    }
  }

  return errors;
}
