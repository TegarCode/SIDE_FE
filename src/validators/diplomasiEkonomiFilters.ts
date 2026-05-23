import * as yup from "yup";
import type {
  DiplomasiApiParams,
  DiplomasiFilterState,
  DiplomasiSectorKey,
  DiplomasiSourceOptionsBySector
} from "@/type/indonesiaDiplomasi";

export type DiplomasiFilterErrors = Partial<{
  yearRange: string;
  hs: string;
  dirjen: string;
  sumber: string;
}>;

type DiplomasiSchemaContext = {
  sourceOptionsBySector: DiplomasiSourceOptionsBySector;
};

export const diplomasiFiltersSchema = yup.object({
  yearStart: yup
    .number()
    .nullable()
    .defined()
    .required("Rentang tahun wajib dipilih."),
  yearEnd: yup
    .number()
    .nullable()
    .defined()
    .required("Rentang tahun wajib dipilih.")
    .test(
      "valid-year-range",
      "Tahun awal tidak boleh lebih besar dari tahun akhir.",
      function validateYearEnd(value) {
        const { yearStart } = this.parent as DiplomasiFilterState;
        if (yearStart == null || value == null) return true;
        return yearStart <= value;
      }
    ),
  hs: yup.string().trim().defined().required("Level HS wajib dipilih."),
  dirjen: yup
    .array()
    .of(yup.string().trim().required())
    .min(1, "Pilih minimal satu Unit Regional Kemlu.")
    .defined()
    .required("Pilih minimal satu Unit Regional Kemlu."),
  sourceBySector: yup
    .object({
      perdagangan: yup.string().nullable().defined(),
      investasi: yup.string().nullable().defined(),
      pariwisata: yup.string().nullable().defined()
    })
    .test(
      "source-by-sector",
      "Pilih sumber data untuk setiap sektor yang tersedia.",
      function validateSources(value) {
        const context = this.options.context as
          | DiplomasiSchemaContext
          | undefined;
        const sourceOptionsBySector = context?.sourceOptionsBySector;
        if (!sourceOptionsBySector || !value) return true;

        return !(
          Object.keys(sourceOptionsBySector) as DiplomasiSectorKey[]
        ).some((sector) => {
          const options = sourceOptionsBySector[sector];
          if (options.length === 0) return false;
          return !value[sector];
        });
      }
    )
    .defined()
    .required()
});

export function validateDiplomasiFilters(
  state: DiplomasiFilterState,
  sourceOptionsBySector: DiplomasiSourceOptionsBySector
): DiplomasiFilterErrors {
  const errors: DiplomasiFilterErrors = {};

  try {
    diplomasiFiltersSchema.validateSync(state, {
      abortEarly: false,
      context: { sourceOptionsBySector }
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      for (const issue of error.inner) {
        if (
          (issue.path === "yearStart" || issue.path === "yearEnd") &&
          !errors.yearRange
        ) {
          errors.yearRange = issue.message;
        }
        if (issue.path === "hs" && !errors.hs) {
          errors.hs = issue.message;
        }
        if (issue.path === "dirjen" && !errors.dirjen) {
          errors.dirjen = issue.message;
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

export function toDiplomasiApiParams(
  state: DiplomasiFilterState,
  sourceOptionsBySector: DiplomasiSourceOptionsBySector
): DiplomasiApiParams | null {
  const errors = validateDiplomasiFilters(state, sourceOptionsBySector);
  if (Object.keys(errors).length > 0) {
    return null;
  }

  const sumber = (Object.keys(state.sourceBySector) as DiplomasiSectorKey[])
    .filter((sector) => {
      const value = state.sourceBySector[sector];
      if (!value) return false;
      const options = sourceOptionsBySector[sector];
      if (options.length === 0) return true;
      return options.some((option) => option.value === value);
    })
    .map((sector) => ({
      sektor: sector,
      sumber: String(state.sourceBySector[sector])
    }));

  if (sumber.length === 0 || state.yearStart == null || state.yearEnd == null) {
    return null;
  }

  return {
    year_start: state.yearStart,
    year_end: state.yearEnd,
    hs: state.hs,
    dirjen: state.dirjen.map(String),
    sumber
  };
}
