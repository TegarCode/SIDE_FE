import type { AnalisisRcaEpdRow } from "@/type/analisis";

export type RcaEpdChartPoint = {
  key: string;
  kode: string;
  hs4: string;
  komoditas: string;
  kategoriEpd: string;
  xModel: string;
  avgGrowthShare: number;
  avgGrowthDemand: number;
  avgRca: number;
  bubbleSize: number;
  categoryColor: string;
  xModelColor: string;
  derivedQuadrant: EpdQuadrantKey;
};

export type EpdQuadrantKey =
  | "Rising Star"
  | "Lost Opportunity"
  | "Falling Star"
  | "Retreat";

export type StrategicRecommendationLabel =
  | "Ekspansi agresif"
  | "Penetrasi pasar"
  | "Maintain niche market"
  | "Opportunity alert"
  | "Reposition selektif"
  | "Diversifikasi produk";

export type StrategicRecommendation = {
  label: StrategicRecommendationLabel;
  priority: "tinggi" | "menengah" | "rendah";
  reason: string;
  color: string;
};

const fallbackCategory = "Tidak Terklasifikasi";
const fallbackXModel = "Tidak Ada X Model";

const categoryColors: Record<string, string> = {
  "rising star": "#059669",
  "lost opportunity": "#D97706",
  "falling star": "#0284C7",
  retreat: "#64748B"
};

const palette = [
  "#384AA0",
  "#059669",
  "#D97706",
  "#0284C7",
  "#7C3AED",
  "#BE123C",
  "#0F766E",
  "#A16207"
];

const strategicRecommendationColors: Record<
  StrategicRecommendationLabel,
  string
> = {
  "Ekspansi agresif": "#059669",
  "Penetrasi pasar": "#0284C7",
  "Maintain niche market": "#7C3AED",
  "Opportunity alert": "#D97706",
  "Reposition selektif": "#0F766E",
  "Diversifikasi produk": "#64748B"
};

function asNumber(value: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function colorFromLabel(label: string) {
  let hash = 0;
  for (let index = 0; index < label.length; index += 1) {
    hash = (hash * 31 + label.charCodeAt(index)) % 9973;
  }

  return palette[hash % palette.length];
}

function normalizedLabel(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function categoryColor(label: string | null | undefined) {
  const normalized = normalizedLabel(label);

  const exactColor = categoryColors[normalized];
  if (exactColor) return exactColor;

  if (normalized.includes("rising")) return categoryColors["rising star"];
  if (normalized.includes("lost")) return categoryColors["lost opportunity"];
  if (normalized.includes("falling")) return categoryColors["falling star"];
  if (normalized.includes("retreat")) return categoryColors.retreat;

  return colorFromLabel(normalized || fallbackCategory);
}

export function xModelColor(label: string | null | undefined) {
  return colorFromLabel(String(label ?? fallbackXModel));
}

export function epdScoreFromLabel(
  label: string | null | undefined,
  fallbackQuadrant?: EpdQuadrantKey | null
) {
  const normalized = normalizedLabel(label);
  const derived = fallbackQuadrant ?? null;

  if (normalized.includes("rising") || derived === "Rising Star") return 100;
  if (normalized.includes("falling") || derived === "Falling Star") return 70;
  if (normalized.includes("lost") || derived === "Lost Opportunity") return 50;
  if (normalized.includes("retreat") || derived === "Retreat") return 20;

  return 50;
}

export function xModelScore(label: string | null | undefined) {
  const normalized = normalizedLabel(label);

  if (normalized.includes("optim")) return 100;
  if (normalized.includes("tidak") && normalized.includes("potens")) return 10;
  if (normalized.includes("kurang")) return 40;
  if (normalized.includes("potens")) return 75;

  return 50;
}

export function isCompetitiveRca(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value >= 1;
}

export function deriveStrategicRecommendation(
  point: Pick<RcaEpdChartPoint, "avgRca" | "derivedQuadrant" | "xModel">
): StrategicRecommendation {
  const competitive = isCompetitiveRca(point.avgRca);
  const xScore = xModelScore(point.xModel);

  if (point.derivedQuadrant === "Rising Star") {
    if (competitive) {
      return {
        label: "Ekspansi agresif",
        priority: "tinggi",
        reason:
          "RCA sudah kuat dan pasar tumbuh. Produk ini layak diprioritaskan untuk ekspansi agresif.",
        color: strategicRecommendationColors["Ekspansi agresif"]
      };
    }

    return {
      label: "Penetrasi pasar",
      priority: "tinggi",
      reason:
        "Pasar tumbuh tetapi daya saing belum cukup kuat. Fokus pada penetrasi pasar dan penguatan ekspor.",
      color: strategicRecommendationColors["Penetrasi pasar"]
    };
  }

  if (point.derivedQuadrant === "Lost Opportunity") {
    return {
      label: "Opportunity alert",
      priority: xScore >= 75 ? "tinggi" : "menengah",
      reason:
        "Permintaan pasar tumbuh, tetapi pertumbuhan share tertinggal. Perlu respons strategi dan penetrasi yang lebih cepat.",
      color: strategicRecommendationColors["Opportunity alert"]
    };
  }

  if (point.derivedQuadrant === "Falling Star") {
    if (competitive) {
      return {
        label: "Maintain niche market",
        priority: "menengah",
        reason:
          "Produk masih kompetitif, tetapi dinamika pasar melemah. Jaga pasar niche yang masih memberi hasil baik.",
        color: strategicRecommendationColors["Maintain niche market"]
      };
    }

    return {
      label: "Reposition selektif",
      priority: "menengah",
      reason:
        "Share relatif bertahan, tetapi demand melemah dan daya saing belum kuat. Seleksi pasar atau reposisi diperlukan.",
      color: strategicRecommendationColors["Reposition selektif"]
    };
  }

  return {
    label: "Diversifikasi produk",
    priority: "rendah",
    reason:
      "Daya saing dan dinamika pasar sama-sama lemah. Pertimbangkan diversifikasi produk atau realokasi fokus pasar.",
    color: strategicRecommendationColors["Diversifikasi produk"]
  };
}

export function strategicPotentialScore(
  point: Pick<
    RcaEpdChartPoint,
    "avgRca" | "kategoriEpd" | "xModel" | "derivedQuadrant"
  >
) {
  const clampedRca = Math.min(Math.max(point.avgRca, 0), 4);
  const rcaScore = (clampedRca / 4) * 100;
  const epdScore = epdScoreFromLabel(point.kategoriEpd, point.derivedQuadrant);
  const modelScore = xModelScore(point.xModel);

  return rcaScore * 0.25 + epdScore * 0.4 + modelScore * 0.35;
}

export function strategicRecommendationLegend() {
  return (
    Object.entries(strategicRecommendationColors) as Array<
      [StrategicRecommendationLabel, string]
    >
  ).map(([label, color]) => ({
    label,
    color
  }));
}

export function classifyEpdQuadrant(
  avgGrowthDemand: number,
  avgGrowthShare: number
): EpdQuadrantKey {
  if (avgGrowthDemand >= 0 && avgGrowthShare >= 0) return "Rising Star";
  if (avgGrowthDemand >= 0 && avgGrowthShare < 0) return "Lost Opportunity";
  if (avgGrowthDemand < 0 && avgGrowthShare >= 0) return "Falling Star";
  return "Retreat";
}

export function toRcaEpdChartPoints(
  rows: AnalisisRcaEpdRow[]
): RcaEpdChartPoint[] {
  return rows
    .map((row, index) => {
      const avgGrowthShare = asNumber(row.avgGrowthShare);
      const avgGrowthDemand = asNumber(row.avgGrowthDemand);
      if (avgGrowthShare == null || avgGrowthDemand == null) return null;

      const avgRca = Math.max(0, asNumber(row.avgRca) ?? 0);
      const kode = row.kode ?? row.hs4;
      const kategoriEpd = row.kategoriEpd || fallbackCategory;
      const xModel = row.xModel || fallbackXModel;

      return {
        key: `${kode}-${index}`,
        kode,
        hs4: row.hs4,
        komoditas: row.komoditas,
        kategoriEpd,
        xModel,
        avgGrowthShare,
        avgGrowthDemand,
        avgRca,
        bubbleSize: Math.max(avgRca, 0.08),
        categoryColor: categoryColor(kategoriEpd),
        xModelColor: xModelColor(xModel),
        derivedQuadrant: classifyEpdQuadrant(avgGrowthDemand, avgGrowthShare)
      };
    })
    .filter((item): item is RcaEpdChartPoint => item != null);
}

export function symmetricDomain(values: number[], minimum = 1) {
  const maxAbs = Math.max(
    minimum,
    ...values.map((value) => Math.abs(value)).filter(Number.isFinite)
  );
  const padded = maxAbs * 1.12;
  return [-padded, padded] as [number, number];
}

export function positiveDomain(values: number[], minimum = 1) {
  const max = Math.max(minimum, ...values.filter(Number.isFinite));
  return [0, max * 1.12] as [number, number];
}

type DynamicDomainOptions = {
  includeZero?: boolean;
  minimumPadding?: number;
  paddingRatio?: number;
  fallbackSpan?: number;
};

export function dynamicDomain(
  values: number[],
  {
    includeZero = false,
    minimumPadding = 0.1,
    paddingRatio = 0.2,
    fallbackSpan = 0.5
  }: DynamicDomainOptions = {}
) {
  const finiteValues = values.filter(Number.isFinite);
  if (!finiteValues.length) {
    return [-fallbackSpan, fallbackSpan] as [number, number];
  }

  let min = Math.min(...finiteValues);
  let max = Math.max(...finiteValues);

  if (includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }

  const span = max - min;
  const padding =
    span > 0
      ? Math.max(span * paddingRatio, minimumPadding)
      : Math.max(Math.abs(max || min) * paddingRatio, minimumPadding);

  return [min - padding, max + padding] as [number, number];
}

export function logRcaValue(value: number, floor = 0.01) {
  return Math.log10(Math.max(value, floor));
}

export function formatLogRcaTick(value: number) {
  const rawValue = 10 ** value;

  if (!Number.isFinite(rawValue)) return "";
  if (rawValue >= 100) return String(Math.round(rawValue));
  if (rawValue >= 10) return rawValue.toFixed(1);
  if (rawValue >= 1) return rawValue.toFixed(1);
  if (rawValue >= 0.1) return rawValue.toFixed(2);
  return rawValue.toFixed(3);
}

export function deterministicJitter(
  seed: string,
  salt: number,
  spread = 0.025
) {
  let hash = 0;
  const source = `${seed}:${salt}`;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) % 9973;
  }

  return ((hash % 1000) / 1000 - 0.5) * spread;
}

export function formatRcaEpdNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return value.toFixed(4);
}

export function formatCompactNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return value.toLocaleString("id-ID", {
    maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 3
  });
}

export function shortProductLabel(value: string, maxLength = 30) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

export function uniqueLegendItems(
  points: RcaEpdChartPoint[],
  key: "kategoriEpd" | "xModel",
  colorKey: "categoryColor" | "xModelColor"
) {
  return Array.from(
    new Map(
      points.map((point) => [
        point[key],
        { label: point[key], color: point[colorKey] }
      ])
    ).values()
  );
}
