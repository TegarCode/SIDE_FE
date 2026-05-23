import type { DiplomasiSummaryCardView } from "@/type/indonesiaDiplomasi";
import type {
  MitraSingleTourismData,
  MitraSingleTourismRow
} from "@/type/mitra";

export function formatTourismPeriod(
  year: number | null,
  prevYear: number | null
) {
  if (year == null && prevYear == null) return "-";
  if (year != null && prevYear != null)
    return `Tahun ${year} dan tahun ${prevYear}`;
  return `Tahun ${year ?? prevYear ?? "-"}`;
}

export function toTourismSummaryCards(
  data: MitraSingleTourismData
): DiplomasiSummaryCardView[] {
  const currentYear = data.year != null ? String(data.year) : null;
  const previousYear = data.prevYear != null ? String(data.prevYear) : null;

  return [
    {
      id: "mitra-pariwisata-inbound",
      title: "Wisatawan Masuk",
      tone: "blue",
      unit: data.unit,
      value: data.summary.inbound.countNow,
      prevValue: data.summary.inbound.countPrev,
      year: currentYear,
      prevYear: previousYear,
      note: `Jumlah wisatawan mancanegara yang datang ke ${data.countryName ?? data.country ?? "-"} pada tahun terbaru dibanding tahun sebelumnya.`,
      highlight:
        data.summary.inbound.spendingNow != null
          ? `Belanja: ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(data.summary.inbound.spendingNow)}`
          : null,
      prevHighlight:
        data.summary.inbound.spendingPrev != null
          ? `Belanja: ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(data.summary.inbound.spendingPrev)}`
          : null,
      highlightType: "none",
      sourceName: data.sourceName
    },
    {
      id: "mitra-pariwisata-outbound",
      title: "Wisatawan Keluar",
      tone: "sky",
      unit: data.unit,
      value: data.summary.outbound.countNow,
      prevValue: data.summary.outbound.countPrev,
      year: currentYear,
      prevYear: previousYear,
      note: `Jumlah wisatawan dari ${data.countryName ?? data.country ?? "-"} yang berkunjung ke mancanegara pada tahun terbaru dibanding tahun sebelumnya.`,
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName: data.sourceName
    }
  ];
}

export function toTopMitraRaw(
  rows: MitraSingleTourismRow[],
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
