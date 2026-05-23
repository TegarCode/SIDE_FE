import * as yup from "yup";
import type {
  BilateralApiSourceItem,
  BilateralFilterState,
  BilateralOverviewParams,
  BilateralSourceOptionsBySector,
  BilateralTabSlug
} from "@/type/indonesiaKerjasamaBilateral";

type BilateralFilterErrors = Partial<
  Record<"partners" | "hsCodes" | "sumber", string>
>;

type KerjasamaBilateralSchemaContext = {
  tab: BilateralTabSlug;
  sourceOptionsBySector: BilateralSourceOptionsBySector;
};

const TAB_SOURCE_SECTOR: Partial<
  Record<BilateralTabSlug, keyof BilateralSourceOptionsBySector>
> = {
  perdagangan: "perdagangan",
  pariwisata: "pariwisata",
  investasi: "investasi",
  jasa: "jasa"
};

export const kerjasamaBilateralFiltersSchema = yup.object({
  partners: yup
    .array()
    .of(yup.string().trim().required())
    .min(1, "Pilih minimal satu negara mitra.")
    .defined()
    .required("Pilih minimal satu negara mitra."),
  hsCodes: yup
    .array()
    .of(yup.string().trim().required())
    .test(
      "required-for-perdagangan",
      "Pilih minimal satu HS Code atau gunakan Semua HS Code.",
      function validateHsCodes(value) {
        const context = this.options.context as
          | KerjasamaBilateralSchemaContext
          | undefined;
        if (context?.tab !== "perdagangan") return true;
        return Array.isArray(value) && value.length > 0;
      }
    )
    .defined()
    .required(),
  sourceBySector: yup
    .object({
      perdagangan: yup.string().nullable().defined(),
      pariwisata: yup.string().nullable().defined(),
      investasi: yup.string().nullable().defined(),
      jasa: yup.string().nullable().defined()
    })
    .test(
      "source-for-active-tab",
      "Pilih sumber data untuk tab aktif.",
      function validateSourceBySector(value) {
        const context = this.options.context as
          | KerjasamaBilateralSchemaContext
          | undefined;
        if (!context || !value) return true;

        const activeSector = TAB_SOURCE_SECTOR[context.tab];
        if (!activeSector) return true;
        if (context.sourceOptionsBySector[activeSector].length === 0)
          return true;
        return Boolean(value[activeSector]);
      }
    )
    .defined()
    .required()
});

export function validateKerjasamaBilateralFilters(
  tab: BilateralTabSlug,
  filters: BilateralFilterState,
  sourceOptionsBySector: BilateralSourceOptionsBySector
): BilateralFilterErrors {
  const errors: BilateralFilterErrors = {};

  try {
    kerjasamaBilateralFiltersSchema.validateSync(filters, {
      abortEarly: false,
      context: { tab, sourceOptionsBySector }
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (issue.path === "partners" && !errors.partners) {
          errors.partners = issue.message;
        }
        if (issue.path === "hsCodes" && !errors.hsCodes) {
          errors.hsCodes = issue.message;
        }
        if (
          (issue.path === "sourceBySector" || issue.path === "sumber") &&
          !errors.sumber
        ) {
          errors.sumber = issue.message;
        }
      }
    }
  }

  return errors;
}

export function toKerjasamaBilateralApiParams(
  tab: BilateralTabSlug,
  filters: BilateralFilterState
): BilateralOverviewParams | null {
  if (!Array.isArray(filters.partners) || filters.partners.length === 0)
    return null;

  const sourceItems: BilateralApiSourceItem[] = Object.entries(
    filters.sourceBySector
  )
    .filter((entry): entry is [BilateralApiSourceItem["sektor"], string] =>
      Boolean(entry[1])
    )
    .map(([sektor, sumber]) => ({ sektor, sumber }));

  const params: BilateralOverviewParams = {
    partners: filters.partners
  };

  if (tab === "perdagangan" && filters.hsCodes.length > 0) {
    params.hsCode = filters.hsCodes.includes("ALL") ? "ALL" : filters.hsCodes;
  }

  if (sourceItems.length > 0) {
    params.sumber = sourceItems;
  }

  return params;
}
