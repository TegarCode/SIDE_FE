import type { DiplomasiSummaryCardView } from "@/type/indonesiaDiplomasi";
import type {
  MitraSingleInvestmentData,
  MitraSingleInvestmentRow
} from "@/type/mitra";

export function formatInvestmentPeriod(
  year: number | null,
  prevYear: number | null
) {
  if (year == null && prevYear == null) return "-";
  if (year != null && prevYear != null)
    return `Tahun ${year} dan tahun ${prevYear}`;
  return `Tahun ${year ?? prevYear ?? "-"}`;
}

export function toInvestmentSummaryCards(
  data: MitraSingleInvestmentData
): DiplomasiSummaryCardView[] {
  const currentYear = data.year != null ? String(data.year) : null;
  const previousYear = data.prevYear != null ? String(data.prevYear) : null;

  return [
    {
      id: "mitra-investasi-inbound",
      title: `Investasi Masuk Dari Dunia ke ${data.countryName ?? data.country ?? "-"}`,
      tone: "blue",
      unit: data.unit,
      value: data.summary.inbound.valueNow,
      prevValue: data.summary.inbound.valuePrev,
      year: currentYear,
      prevYear: previousYear,
      note: "Nilai investasi masuk pada tahun terbaru dibanding tahun sebelumnya.",
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName: data.sourceName
    },
    {
      id: "mitra-investasi-outbound",
      title: `Investasi Keluar Dari ${data.countryName ?? data.country ?? "-"} ke Dunia`,
      tone: "sky",
      unit: data.unit,
      value: data.summary.outbound.valueNow,
      prevValue: data.summary.outbound.valuePrev,
      year: currentYear,
      prevYear: previousYear,
      note: "Nilai investasi keluar pada tahun terbaru dibanding tahun sebelumnya.",
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName: data.sourceName
    }
  ];
}

export function toTopMitraRaw(
  rows: MitraSingleInvestmentRow[],
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
