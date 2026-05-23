import * as yup from "yup";

export type OriginSingleDestinationMultiFilterValue = {
  origin: {
    region: string | null;
    subregion: string | null;
    country: string | null;
  };
  destinations: string[];
};

export type OriginSingleDestinationMultiFilterErrors = Partial<{
  originCountry: string;
  destinations: string;
}>;

export const originSingleDestinationMultiFiltersSchema = yup.object({
  origin: yup.object({
    region: yup.string().nullable().defined(),
    subregion: yup.string().nullable().defined(),
    country: yup
      .string()
      .nullable()
      .defined()
      .required("Negara / entitas asal wajib dipilih.")
  }),
  destinations: yup
    .array()
    .of(yup.string().trim().required())
    .min(1, "Pilih minimal satu negara/entitas tujuan.")
    .defined()
    .required("Pilih minimal satu negara/entitas tujuan.")
});

export function validateOriginSingleDestinationMultiFilters(
  value: OriginSingleDestinationMultiFilterValue
): OriginSingleDestinationMultiFilterErrors {
  const errors: OriginSingleDestinationMultiFilterErrors = {};

  try {
    originSingleDestinationMultiFiltersSchema.validateSync(value, {
      abortEarly: false
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (issue.path === "origin.country" && !errors.originCountry) {
          errors.originCountry = issue.message;
        }
        if (issue.path === "destinations" && !errors.destinations) {
          errors.destinations = issue.message;
        }
      }
    }
  }

  return errors;
}
