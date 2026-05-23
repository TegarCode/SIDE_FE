import type { DiplomasiSummaryCardView } from "@/type/indonesiaDiplomasi";
import type {
  MitraSingleServiceData,
  MitraSingleServiceRow
} from "@/type/mitra";

export function formatServicePeriod(
  year: number | null,
  prevYear: number | null
) {
  if (year == null && prevYear == null) return "-";
  if (year != null && prevYear != null)
    return `Tahun ${year} dan tahun ${prevYear}`;
  return `Tahun ${year ?? prevYear ?? "-"}`;
}

export function toServiceSummaryCards(
  data: MitraSingleServiceData
): DiplomasiSummaryCardView[] {
  const currentYear = data.year != null ? String(data.year) : null;
  const previousYear = data.prevYear != null ? String(data.prevYear) : null;

  return [
    {
      id: "mitra-jasa-inbound",
      title: "Jasa Masuk",
      tone: "blue",
      unit: data.unit,
      value: data.summary.inbound.valueNow,
      prevValue: data.summary.inbound.valuePrev,
      year: currentYear,
      prevYear: previousYear,
      note: `Nilai jasa masuk ke ${data.countryName ?? data.country ?? "-"} pada tahun terbaru dibanding tahun sebelumnya.`,
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName: data.sourceName
    },
    {
      id: "mitra-jasa-outbound",
      title: "Jasa Keluar",
      tone: "sky",
      unit: data.unit,
      value: data.summary.outbound.valueNow,
      prevValue: data.summary.outbound.valuePrev,
      year: currentYear,
      prevYear: previousYear,
      note: `Nilai jasa keluar dari ${data.countryName ?? data.country ?? "-"} pada tahun terbaru dibanding tahun sebelumnya.`,
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName: data.sourceName
    }
  ];
}

export function toTopMitraRaw(
  rows: MitraSingleServiceRow[],
  year: number | null,
  prevYear: number | null
) {
  return {
    data: {
      items: rows.map((item) => ({
        negara: item.label,
        kode_alpha2: item.alpha2,
        kode_alpha3: item.code,
        nilai_perdagangan: {
          ...(prevYear != null && item.valuePrev != null
            ? { [prevYear]: item.valuePrev }
            : {}),
          ...(year != null && item.valueNow != null
            ? { [year]: item.valueNow }
            : {})
        },
        proporsi: {}
      }))
    }
  };
}
