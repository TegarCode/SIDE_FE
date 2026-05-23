import * as yup from "yup";
import type { MitraInvestmentRouteFilterState } from "@/components/filters/BilateralRouteFiltersPanel";

export type BilateralRouteFilterErrors = Partial<{
  origins: string;
  destinations: string;
}>;

export const bilateralRouteFiltersSchema: yup.ObjectSchema<MitraInvestmentRouteFilterState> =
  yup.object({
    origins: yup
      .array()
      .of(yup.string().trim().required())
      .min(1, "Pilih minimal satu negara/entitas asal.")
      .required("Pilih minimal satu negara/entitas asal."),
    destinations: yup
      .array()
      .of(yup.string().trim().required())
      .min(1, "Pilih minimal satu negara/entitas tujuan.")
      .required("Pilih minimal satu negara/entitas tujuan.")
  });

export function validateBilateralRouteFilters(
  value: MitraInvestmentRouteFilterState
): BilateralRouteFilterErrors {
  const errors: BilateralRouteFilterErrors = {};

  try {
    bilateralRouteFiltersSchema.validateSync(value, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (issue.path === "origins" && !errors.origins) {
          errors.origins = issue.message;
        }
        if (issue.path === "destinations" && !errors.destinations) {
          errors.destinations = issue.message;
        }
      }
    }
  }

  return errors;
}
