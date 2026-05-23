import * as yup from "yup";

export type OriginSingleDestinationSingleFilterValue = {
  origin: {
    region: string | null;
    subregion: string | null;
    country: string | null;
  };
  destination: {
    region: string | null;
    subregion: string | null;
    country: string | null;
  };
};

export type OriginSingleDestinationSingleFilterErrors = Partial<{
  originCountry: string;
  destinationCountry: string;
}>;

export const originSingleDestinationSingleFiltersSchema = yup.object({
  origin: yup.object({
    region: yup.string().nullable().defined(),
    subregion: yup.string().nullable().defined(),
    country: yup
      .string()
      .nullable()
      .defined()
      .required("Negara / entitas asal wajib dipilih.")
  }),
  destination: yup.object({
    region: yup.string().nullable().defined(),
    subregion: yup.string().nullable().defined(),
    country: yup
      .string()
      .nullable()
      .defined()
      .required("Negara / entitas tujuan wajib dipilih.")
  })
});

export function validateOriginSingleDestinationSingleFilters(
  value: OriginSingleDestinationSingleFilterValue
): OriginSingleDestinationSingleFilterErrors {
  const errors: OriginSingleDestinationSingleFilterErrors = {};

  try {
    originSingleDestinationSingleFiltersSchema.validateSync(value, {
      abortEarly: false
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (issue.path === "origin.country" && !errors.originCountry) {
          errors.originCountry = issue.message;
        }
        if (
          issue.path === "destination.country" &&
          !errors.destinationCountry
        ) {
          errors.destinationCountry = issue.message;
        }
      }
    }
  }

  return errors;
}
