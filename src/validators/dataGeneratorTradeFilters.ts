import * as yup from "yup";

export type DataGeneratorTradeFilterValueLike = {
  origins: string[];
  originGroup: string | null;
  destinations: string[];
  destinationGroup: string | null;
  yearFrom: string | null;
  yearTo: string | null;
  tradeType: string | null;
  hsLevel: string | null;
  hsCodes: string[];
  source: string | null;
};

export type DataGeneratorTradeFilterErrors = Partial<{
  originSelection: string;
  destinationSelection: string;
  groupCombination: string;
  yearFrom: string;
  yearTo: string;
  tradeType: string;
  hsLevel: string;
  hsCodes: string;
  source: string;
}>;

export const dataGeneratorTradeFiltersSchema = yup
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
    tradeType: yup
      .string()
      .nullable()
      .defined()
      .required("Tipe perdagangan wajib dipilih."),
    hsLevel: yup
      .string()
      .nullable()
      .defined()
      .required("HS level wajib dipilih."),
    hsCodes: yup
      .array()
      .of(yup.string().trim().required())
      .min(1, "Pilih minimal satu HS Code.")
      .defined()
      .required("Pilih minimal satu HS Code."),
    source: yup
      .string()
      .nullable()
      .defined()
      .required("Sumber data wajib dipilih.")
  })
  .test(
    "origin-selection",
    "Pilih minimal satu negara/entitas asal atau satu grup asal.",
    function validateOriginSelection(value) {
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
    function validateDestinationSelection(value) {
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
    function validateGroupCombination(value) {
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
    function validateYearOrder(value) {
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

export function validateDataGeneratorTradeFilters(
  value: DataGeneratorTradeFilterValueLike
): DataGeneratorTradeFilterErrors {
  const errors: DataGeneratorTradeFilterErrors = {};

  try {
    dataGeneratorTradeFiltersSchema.validateSync(value, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (!issue.path) continue;
        if (issue.path in errors) continue;
        errors[issue.path as keyof DataGeneratorTradeFilterErrors] =
          issue.message;
      }
    }
  }

  return errors;
}
