import React from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import type { AnalisisRcaEpdComparisonRow } from "@/type/analisis";
import {
  epdScoreFromLabel,
  formatCompactNumber,
  formatRcaEpdNumber,
  shortProductLabel,
  xModelScore
} from "@/components/analisis/potensi-daya-saing/rcaEpdChartUtils";

type Props = {
  rows: AnalisisRcaEpdComparisonRow[];
  originLabel?: string;
  destinationLabel?: string;
};

type MetricDefinition = {
  id: string;
  label: string;
  shortLabel: string;
  group: "Daya Saing" | "Perdagangan" | "Strategis";
  scaleMode: "signed" | "positive";
  originValue: (row: AnalisisRcaEpdComparisonRow) => number | null;
  destinationValue: (row: AnalisisRcaEpdComparisonRow) => number | null;
};

type MetricRange = {
  min: number;
  max: number;
  maxAbs: number;
  scaleMode: "signed" | "positive";
};

type RadarDatum = {
  metricId: string;
  metric: string;
  fullMetric: string;
  origin: number;
  destination: number;
  originRaw: number | null;
  destinationRaw: number | null;
};

type RadarTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload?: RadarDatum;
  }>;
};

const originColor = "#384AA0";
const destinationColor = "#D97706";
const defaultMetricIds = [
  "rca",
  "growthShare",
  "growthDemand",
  "epdScore",
  "xModelScore"
];

function valueOf(row: AnalisisRcaEpdComparisonRow, key: string) {
  const value = row[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function textOf(row: AnalisisRcaEpdComparisonRow, key: string, fallback = "-") {
  const value = row[key];
  if (value == null || value === "") return fallback;
  return String(value);
}

function difference(left: number | null, right: number | null) {
  if (left == null || right == null) return null;
  return left - right;
}

const metricDefinitions: MetricDefinition[] = [
  {
    id: "rca",
    label: "RCA",
    shortLabel: "RCA",
    group: "Daya Saing",
    scaleMode: "positive",
    originValue: (row) => valueOf(row, "AVG RCA Asal"),
    destinationValue: (row) => valueOf(row, "AVG RCA Tujuan")
  },
  {
    id: "growthShare",
    label: "Growth Share",
    shortLabel: "Growth Share",
    group: "Daya Saing",
    scaleMode: "signed",
    originValue: (row) => valueOf(row, "AVG Growth Share Asal"),
    destinationValue: (row) => valueOf(row, "AVG Growth Share Tujuan")
  },
  {
    id: "growthDemand",
    label: "Growth Demand",
    shortLabel: "Growth Demand",
    group: "Daya Saing",
    scaleMode: "signed",
    originValue: (row) => valueOf(row, "AVG Growth Demand Asal"),
    destinationValue: (row) => valueOf(row, "AVG Growth Demand Tujuan")
  },
  {
    id: "epdScore",
    label: "EPD Score",
    shortLabel: "EPD Score",
    group: "Strategis",
    scaleMode: "positive",
    originValue: (row) =>
      epdScoreFromLabel(textOf(row, "Kategori EPD Asal", ""), undefined),
    destinationValue: (row) =>
      epdScoreFromLabel(textOf(row, "Kategori EPD Tujuan", ""), undefined)
  },
  {
    id: "xModelScore",
    label: "X-Model Score",
    shortLabel: "X-Model Score",
    group: "Strategis",
    scaleMode: "positive",
    originValue: (row) => xModelScore(textOf(row, "X Model Asal", "")),
    destinationValue: (row) => xModelScore(textOf(row, "X Model Tujuan", ""))
  },
  {
    id: "exportWorld",
    label: "Export To World",
    shortLabel: "Export World",
    group: "Perdagangan",
    scaleMode: "positive",
    originValue: (row) => valueOf(row, "Ekspor RI ke Dunia"),
    destinationValue: (row) => valueOf(row, "Ekspor Mitra ke Dunia")
  },
  {
    id: "bilateralTrade",
    label: "Bilateral Trade",
    shortLabel: "Bilateral",
    group: "Perdagangan",
    scaleMode: "positive",
    originValue: (row) => valueOf(row, "Ekspor RI ke Mitra"),
    destinationValue: (row) => valueOf(row, "Impor Mitra dari Dunia")
  },
  {
    id: "importWorld",
    label: "Import From World",
    shortLabel: "Import World",
    group: "Perdagangan",
    scaleMode: "positive",
    originValue: (row) => valueOf(row, "Impor RI dari Dunia"),
    destinationValue: (row) => valueOf(row, "Impor Mitra dari Dunia")
  },
  {
    id: "competitivenessScore",
    label: "Competitiveness Score",
    shortLabel: "Competitiveness",
    group: "Strategis",
    scaleMode: "signed",
    originValue: (row) => {
      const rca = valueOf(row, "AVG RCA Asal");
      const growthShare = valueOf(row, "AVG Growth Share Asal");
      if (rca == null || growthShare == null) return null;
      return rca * growthShare;
    },
    destinationValue: (row) => {
      const rca = valueOf(row, "AVG RCA Tujuan");
      const growthShare = valueOf(row, "AVG Growth Share Tujuan");
      if (rca == null || growthShare == null) return null;
      return rca * growthShare;
    }
  },
  {
    id: "marketPower",
    label: "Market Power",
    shortLabel: "Market Power",
    group: "Strategis",
    scaleMode: "positive",
    originValue: (row) => {
      const exportWorld = valueOf(row, "Ekspor RI ke Dunia");
      const rca = valueOf(row, "AVG RCA Asal");
      if (exportWorld == null || rca == null) return null;
      return exportWorld * rca;
    },
    destinationValue: (row) => {
      const exportWorld = valueOf(row, "Ekspor Mitra ke Dunia");
      const rca = valueOf(row, "AVG RCA Tujuan");
      if (exportWorld == null || rca == null) return null;
      return exportWorld * rca;
    }
  },
  {
    id: "penetrationPotential",
    label: "Penetration Potential",
    shortLabel: "Penetration",
    group: "Strategis",
    scaleMode: "positive",
    originValue: (row) => {
      const partnerImportWorld = valueOf(row, "Impor Mitra dari Dunia");
      const riExportPartner = valueOf(row, "Ekspor RI ke Mitra");
      if (partnerImportWorld == null || riExportPartner == null) return null;
      return Math.max(0, partnerImportWorld - riExportPartner);
    },
    destinationValue: (row) => {
      const riImportWorld = valueOf(row, "Impor RI dari Dunia");
      const riImportPartner = valueOf(row, "Impor RI dari Mitra");
      if (riImportWorld == null || riImportPartner == null) return null;
      return Math.max(0, riImportWorld - riImportPartner);
    }
  }
];

function buildMetricRanges(rows: AnalisisRcaEpdComparisonRow[]) {
  return Object.fromEntries(
    metricDefinitions.map((metric) => {
      const values = rows
        .flatMap((row) => [
          metric.originValue(row),
          metric.destinationValue(row)
        ])
        .filter(
          (value): value is number => value != null && Number.isFinite(value)
        );
      const min = values.length ? Math.min(...values) : 0;
      const max = values.length ? Math.max(...values) : 0;
      const maxAbs = values.length
        ? Math.max(...values.map((value) => Math.abs(value)))
        : 0;

      return [metric.id, { min, max, maxAbs, scaleMode: metric.scaleMode }];
    })
  ) as Record<string, MetricRange>;
}

function normalizeValue(value: number | null, range: MetricRange) {
  if (value == null || !Number.isFinite(value)) {
    return range.scaleMode === "signed" ? 50 : 0;
  }

  if (range.scaleMode === "signed") {
    if (range.maxAbs === 0) return 50;

    const centered = 50 + (value / range.maxAbs) * 50;
    return Math.max(0, Math.min(100, centered));
  }

  if (range.max <= 0) return 0;

  return Math.max(0, Math.min(100, (value / range.max) * 100));
}

function rawChartValue(value: number | null, range: MetricRange) {
  if (value == null || !Number.isFinite(value)) return 0;

  if (range.scaleMode === "signed") {
    if (range.maxAbs === 0) return 0;
    return value;
  }

  return Math.max(0, value);
}

function RadarTooltip({ active, payload }: RadarTooltipProps) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="max-w-[300px] rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <div className="font-semibold text-slate-900">{item.fullMetric}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-indigo-50 p-2">
          <div className="font-semibold text-[#384AA0]">Negara 1</div>
          <div className="mt-1 text-slate-700">
            Raw: {formatCompactNumber(item.originRaw)}
          </div>
          <div className="text-slate-500">
            Chart: {formatRcaEpdNumber(item.origin)}
          </div>
        </div>
        <div className="rounded-md bg-amber-50 p-2">
          <div className="font-semibold text-amber-700">Negara 2</div>
          <div className="mt-1 text-slate-700">
            Raw: {formatCompactNumber(item.destinationRaw)}
          </div>
          <div className="text-slate-500">
            Chart: {formatRcaEpdNumber(item.destination)}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildInsight(
  radarData: RadarDatum[],
  originName: string,
  destinationName: string
) {
  const deltas = radarData
    .map((item) => ({
      metric: item.fullMetric,
      delta: difference(item.origin, item.destination)
    }))
    .filter(
      (item): item is { metric: string; delta: number } => item.delta != null
    );

  if (!deltas.length) {
    return "Data belum cukup untuk membaca keunggulan profil perdagangan.";
  }

  const originLead = [...deltas].sort(
    (left, right) => right.delta - left.delta
  )[0];
  const destinationLead = [...deltas].sort(
    (left, right) => left.delta - right.delta
  )[0];

  if (
    Math.abs(originLead.delta) < 0.01 &&
    Math.abs(destinationLead.delta) < 0.01
  ) {
    return "Profil kedua negara relatif seimbang pada metric yang dipilih.";
  }

  if (originLead.delta <= 0) {
    return `${destinationName} relatif lebih unggul pada sebagian besar metric yang dipilih.`;
  }

  if (destinationLead.delta >= 0) {
    return `${originName} relatif lebih unggul pada sebagian besar metric yang dipilih.`;
  }

  return `${originName} paling menonjol pada ${originLead.metric}, sementara ${destinationName} paling menonjol pada ${destinationLead.metric}.`;
}

function hasSignedMetrics(metrics: MetricDefinition[]) {
  return metrics.some((metric) => metric.scaleMode === "signed");
}

export function AnalisisRCAEPDSpiderComparisonChart({
  rows,
  originLabel,
  destinationLabel
}: Props) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [selectedMetricIds, setSelectedMetricIds] =
    React.useState<string[]>(defaultMetricIds);
  const [normalized, setNormalized] = React.useState(true);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [rows]);

  const selectedRow = rows[selectedIndex] ?? null;
  const metricRanges = React.useMemo(() => buildMetricRanges(rows), [rows]);
  const selectedMetrics = metricDefinitions.filter((metric) =>
    selectedMetricIds.includes(metric.id)
  );
  const containsSignedMetrics = hasSignedMetrics(selectedMetrics);

  const originName =
    (selectedRow
      ? textOf(selectedRow, "Negara 1", originLabel)
      : originLabel) ?? "Negara 1";
  const destinationName =
    (selectedRow
      ? textOf(selectedRow, "Negara 2", destinationLabel)
      : destinationLabel) ?? "Negara 2";

  const radarData = React.useMemo<RadarDatum[]>(() => {
    if (!selectedRow) return [];

    return selectedMetrics.map((metric) => {
      const originRaw = metric.originValue(selectedRow);
      const destinationRaw = metric.destinationValue(selectedRow);
      const range = metricRanges[metric.id] ?? {
        min: 0,
        max: 0,
        maxAbs: 0,
        scaleMode: metric.scaleMode
      };

      return {
        metricId: metric.id,
        metric: metric.shortLabel,
        fullMetric: metric.label,
        origin: normalized
          ? normalizeValue(originRaw, range)
          : rawChartValue(originRaw, range),
        destination: normalized
          ? normalizeValue(destinationRaw, range)
          : rawChartValue(destinationRaw, range),
        originRaw,
        destinationRaw
      };
    });
  }, [metricRanges, normalized, selectedMetrics, selectedRow]);

  const productOptions = React.useMemo(
    () =>
      rows.map((row, index) => ({
        index,
        kode: textOf(row, "Kode HS"),
        nama: textOf(row, "Nama Produk")
      })),
    [rows]
  );

  const selectedKode = selectedRow ? textOf(selectedRow, "Kode HS") : "-";
  const selectedProduct = selectedRow
    ? textOf(selectedRow, "Nama Produk")
    : "-";
  const sourceInfo = selectedRow
    ? [
        textOf(selectedRow, "Kategori EPD Asal", ""),
        textOf(selectedRow, "X Model Asal", ""),
        textOf(selectedRow, "Kategori EPD Tujuan", ""),
        textOf(selectedRow, "X Model Tujuan", ""),
        textOf(selectedRow, "Strategy", "")
      ].filter(Boolean)
    : [];
  const insight = buildInsight(radarData, originName, destinationName);

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetricIds((current) => {
      if (current.includes(metricId)) {
        if (current.length <= 3) return current;
        return current.filter((item) => item !== metricId);
      }

      return [...current, metricId];
    });
  };

  if (!rows.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data Country Comparison RCA & EPD belum cukup untuk menampilkan spider
        chart.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Spider Chart Profil Perdagangan RCA & EPD
          </h3>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Membandingkan profil produk antara Negara 1 dan Negara 2 pada metric
            daya saing, dinamika pasar, posisi EPD, dan prioritas strategi.
            Default chart dibuat konseptual agar perbandingan profil dagang
            lebih mudah dibaca daripada hanya melihat angka mentah.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={selectedIndex}
            onChange={(event) => setSelectedIndex(Number(event.target.value))}
            className="max-w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 sm:max-w-[360px]"
          >
            {productOptions.map((item) => (
              <option key={`${item.kode}-${item.index}`} value={item.index}>
                {item.kode} - {shortProductLabel(item.nama, 48)}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={normalized}
              onChange={(event) => setNormalized(event.target.checked)}
            />
            Normalized 0-100
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
        <div className="text-xs font-semibold uppercase text-slate-500">
          Metric selector
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {(["Daya Saing", "Perdagangan", "Strategis"] as const).map(
            (group) => (
              <div
                key={group}
                className="rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="text-xs font-semibold text-slate-700">
                  {group}
                </div>
                <div className="mt-2 space-y-2">
                  {metricDefinitions
                    .filter((metric) => metric.group === group)
                    .map((metric) => (
                      <label
                        key={metric.id}
                        className="flex items-center gap-2 text-xs text-slate-600"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMetricIds.includes(metric.id)}
                          onChange={() => handleMetricToggle(metric.id)}
                        />
                        {metric.label}
                      </label>
                    ))}
                </div>
              </div>
            )
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Minimal 3 metric harus aktif. Metric default memakai profil strategis:
          RCA, Growth Share, Growth Demand, EPD Score, dan X-Model Score.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.75fr]">
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-3 flex flex-col gap-1">
            <div className="text-sm font-semibold text-slate-900">
              {selectedKode} - {selectedProduct}
            </div>
            <div className="text-xs text-slate-500">
              {originName} dibandingkan dengan {destinationName}
            </div>
          </div>

          <div className="h-[480px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "#475569", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  domain={
                    normalized
                      ? [0, 100]
                      : containsSignedMetrics
                        ? ["auto", "auto"]
                        : undefined
                  }
                  tickCount={normalized ? 5 : undefined}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <Radar
                  name={originName}
                  dataKey="origin"
                  stroke={originColor}
                  fill={originColor}
                  fillOpacity={0.24}
                  strokeWidth={2}
                />
                <Radar
                  name={destinationName}
                  dataKey="destination"
                  stroke={destinationColor}
                  fill={destinationColor}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip content={<RadarTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Insight
            </div>
            <p className="mt-2 text-sm text-slate-700">{insight}</p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Konteks produk
            </div>
            <div className="mt-2 space-y-2 text-xs text-slate-600">
              {sourceInfo.length ? (
                sourceInfo.map((item) => (
                  <div key={item} className="rounded-md bg-slate-50 px-3 py-2">
                    {item}
                  </div>
                ))
              ) : (
                <div className="rounded-md bg-slate-50 px-3 py-2">
                  Kategori, X Model, atau Strategy belum tersedia.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-500">
            <div className="font-semibold uppercase text-slate-600">
              Panduan
            </div>
            <p className="mt-2">
              Pada mode normalized, metric bertanda seperti Growth Share dan
              Growth Demand memakai centered normalization: `50` adalah titik
              netral, nilai di bawah `50` berarti negatif, dan nilai di atas
              `50` berarti positif. Metric positif seperti RCA dan nilai ekspor
              tetap tumbuh dari pusat `0` ke luar hingga `100`.
            </p>
            <p className="mt-2">
              EPD Score dan X-Model Score adalah metric strategis turunan:
              semakin tinggi nilainya, semakin positif posisi pasar dan arah
              pengembangan produknya.
            </p>
            <p className="mt-2">
              Mode raw menampilkan angka asli. Untuk metric bertanda, garis bisa
              memotong ke dalam atau ke luar tergantung data, sehingga mode
              normalized biasanya lebih stabil untuk perbandingan bentuk.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
