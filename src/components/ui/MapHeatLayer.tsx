import React from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry
} from "geojson";
import type { PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";

type MapMetricKey =
  | "value"
  | "balance"
  | "proportion"
  | "proportion_balance"
  | "change";

type MapSeriesAccessors = Partial<
  Record<MapMetricKey, string | ((item: Record<string, unknown>) => unknown)>
>;

type MapHeatBucket = {
  key?: string;
  min: number;
  max?: number;
  color: string;
  label?: string;
};

type MapHeatLayerProps = {
  className?: string;
  data?: Array<Record<string, unknown>>;
  title?: string;
  unitLabel?: string;
  currencyPrefix?: string;
  colorMetric?: "value" | "balance" | "proportion" | "proportion_balance";
  headerMetric?:
    | "value"
    | "balance"
    | "proportion"
    | "proportion_balance"
    | "color";
  hideBalance?: boolean;
  seriesAccessors?: MapSeriesAccessors;
  idAccessor?: string | ((item: Record<string, unknown>) => unknown);
  nameAccessor?: string | ((item: Record<string, unknown>) => unknown);
  posColors?: string[];
  negColors?: string[];
  zeroColor?: string;
  noDataColor?: string;
  bucketsCount?: number;
  fixedNegFor?: Array<
    "value" | "balance" | "proportion" | "proportion_balance"
  >;
  geojsonUrl?: string;
  customBuckets?: MapHeatBucket[] | null;
  borderColor?: string;
  borderHoverColor?: string;
  borderWidth?: number;
  borderHoverWidth?: number;
  resetKey?: string | number;
  footerText?: React.ReactNode;
  legendColumns?: 1 | 2 | 3 | 4;
  showProportionInTooltip?: boolean;
};

type SeriesInfo = {
  y1: number | null;
  y2: number | null;
  valueY1: number;
  valueY2: number;
  balanceY1: number;
  balanceY2: number;
  propY1: number;
  propY2: number;
  propBalY1: number;
  propBalY2: number;
  chgY2: number | null;
};

type BuiltBucket = {
  key: string;
  label: string;
  min: number;
  max: number;
  color: string;
};

const geojsonCache = new Map<string, FeatureCollection>();
const geojsonInflight = new Map<string, Promise<FeatureCollection>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string) {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return { r: 0, g: 0, b: 0 };
  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(input: { r: number; g: number; b: number }) {
  const toHex = (value: number) =>
    clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(input.r)}${toHex(input.g)}${toHex(input.b)}`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function resampleStops(stops: string[], n: number) {
  if (stops.length === 0) return [];
  if (n <= 1) return [stops[0]];
  if (stops.length === 1) return Array.from({ length: n }, () => stops[0]);

  const rgbs = stops.map(hexToRgb);
  const output: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    const segment = t * (rgbs.length - 1);
    const i0 = Math.floor(segment);
    const i1 = Math.min(rgbs.length - 1, i0 + 1);
    const localT = segment - i0;
    output.push(
      rgbToHex({
        r: lerp(rgbs[i0].r, rgbs[i1].r, localT),
        g: lerp(rgbs[i0].g, rgbs[i1].g, localT),
        b: lerp(rgbs[i0].b, rgbs[i1].b, localT)
      })
    );
  }
  return output;
}

function readByAccessor(
  item: Record<string, unknown>,
  accessor?: string | ((value: Record<string, unknown>) => unknown)
) {
  if (!accessor) return undefined;
  if (typeof accessor === "function") return accessor(item);
  return item[accessor];
}

function toFiniteNumberOrNull(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function MapHeatLayer({
  className = "h-90 w-full",
  data = [],
  currencyPrefix = "Ribu US$",
  colorMetric = "value",
  headerMetric = "value",
  hideBalance = true,
  seriesAccessors = {
    value: "nilai_perdagangan",
    balance: "neraca",
    proportion: "proporsi",
    proportion_balance: "proporsi_neraca",
    change: "perubahan"
  },
  idAccessor = (item) => item.id_alpha2 ?? item.kode_alpha2 ?? item.alpha2,
  nameAccessor = (item) => item.name ?? item.negara,
  posColors,
  negColors,
  zeroColor = "#9ca3af",
  noDataColor = "#9ca3af",
  bucketsCount = 7,
  geojsonUrl = "/assets/world-countries.geojson",
  customBuckets = null,
  borderColor = "#cbd5e1",
  borderHoverColor = "#0f172a",
  borderWidth = 0.6,
  borderHoverWidth = 2,
  footerText,
  legendColumns = 4,
  showProportionInTooltip = true
}: MapHeatLayerProps) {
  const [mounted, setMounted] = React.useState(false);
  const [geoData, setGeoData] = React.useState<FeatureCollection | null>(null);
  const [activeBucketKeys, setActiveBucketKeys] = React.useState<string[]>([]);
  const initializedBucketKeysRef = React.useRef(false);
  const previousBucketKeysRef = React.useRef<string[]>([]);
  const mapRef = React.useRef<L.Map | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  const short = React.useCallback((value: number) => {
    if (!Number.isFinite(value)) return String(value);
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000)
      return `${sign}${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
    if (abs >= 1_000_000)
      return `${sign}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    if (abs >= 1_000)
      return `${sign}${(abs / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    return String(value);
  }, []);

  const legendGridClassName =
    legendColumns === 1
      ? "grid-cols-1"
      : legendColumns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : legendColumns === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  const seriesByIso2 = React.useMemo(() => {
    const output: Record<string, SeriesInfo> = {};
    for (const item of data) {
      const rawIso = readByAccessor(item, idAccessor);
      const iso2 = String(rawIso ?? "").toUpperCase();
      if (!iso2) continue;

      const valueSeriesRaw = readByAccessor(item, seriesAccessors.value);
      const balanceSeriesRaw = readByAccessor(item, seriesAccessors.balance);
      const proportionSeriesRaw = readByAccessor(
        item,
        seriesAccessors.proportion
      );
      const proportionBalanceSeriesRaw = readByAccessor(
        item,
        seriesAccessors.proportion_balance
      );
      const changeSeriesRaw = readByAccessor(item, seriesAccessors.change);

      const valueSeries = isRecord(valueSeriesRaw) ? valueSeriesRaw : {};
      const balanceSeries = isRecord(balanceSeriesRaw) ? balanceSeriesRaw : {};
      const proportionSeries = isRecord(proportionSeriesRaw)
        ? proportionSeriesRaw
        : {};
      const proportionBalanceSeries = isRecord(proportionBalanceSeriesRaw)
        ? proportionBalanceSeriesRaw
        : {};
      const changeSeries = isRecord(changeSeriesRaw) ? changeSeriesRaw : {};

      const years = Object.keys(valueSeries)
        .map((year) => Number(year))
        .filter((year) => Number.isFinite(year))
        .sort((a, b) => a - b);

      const y2 = years.length ? years[years.length - 1] : null;
      const y1 = years.length > 1 ? years[years.length - 2] : null;

      const sourceForChange =
        headerMetric === "balance" ? balanceSeries : valueSeries;
      const chgRaw = y2 != null ? toFiniteNumberOrNull(changeSeries[y2]) : null;
      const chgCalculated =
        y1 != null && y2 != null && Number.isFinite(Number(sourceForChange[y1]))
          ? ((toNumber(sourceForChange[y2]) - toNumber(sourceForChange[y1])) /
              Math.max(1, Math.abs(toNumber(sourceForChange[y1])))) *
            100
          : null;

      output[iso2] = {
        y1,
        y2,
        valueY1: y1 != null ? toNumber(valueSeries[y1]) : 0,
        valueY2: y2 != null ? toNumber(valueSeries[y2]) : 0,
        balanceY1: y1 != null ? toNumber(balanceSeries[y1]) : 0,
        balanceY2: y2 != null ? toNumber(balanceSeries[y2]) : 0,
        propY1: y1 != null ? toNumber(proportionSeries[y1]) : 0,
        propY2: y2 != null ? toNumber(proportionSeries[y2]) : 0,
        propBalY1: y1 != null ? toNumber(proportionBalanceSeries[y1]) : 0,
        propBalY2: y2 != null ? toNumber(proportionBalanceSeries[y2]) : 0,
        chgY2: chgRaw != null ? Number(chgRaw.toFixed(2)) : chgCalculated
      };
    }
    return output;
  }, [data, headerMetric, idAccessor, seriesAccessors]);

  const nameByIso2 = React.useMemo(() => {
    const output: Record<string, string> = {};
    for (const item of data) {
      const rawIso = readByAccessor(item, idAccessor);
      const iso2 = String(rawIso ?? "").toUpperCase();
      if (!iso2) continue;
      const rawName = readByAccessor(item, nameAccessor);
      if (rawName != null) output[iso2] = String(rawName);
    }
    return output;
  }, [data, idAccessor, nameAccessor]);

  const { buckets, colorByIso2, bucketKeyByIso2 } = React.useMemo(() => {
    const pickValue = (value: SeriesInfo) => {
      if (colorMetric === "balance") return value.balanceY2;
      if (colorMetric === "proportion") return value.propY2;
      if (colorMetric === "proportion_balance") return value.propBalY2;
      return value.valueY2;
    };

    const values = Object.values(seriesByIso2)
      .map((value) => pickValue(value))
      .filter((value) => Number.isFinite(value));

    if (values.length === 0) {
      return {
        buckets: [
          {
            key: "nodata",
            label: "No Data",
            min: 0,
            max: 0,
            color: noDataColor
          }
        ],
        colorByIso2: {} as Record<string, string>,
        bucketKeyByIso2: {} as Record<string, string>
      };
    }

    const hasNegative = values.some((value) => value < 0);
    const hasPositive = values.some((value) => value > 0);

    const makeCuts = (input: number[], parts: number) => {
      const n = Math.max(3, Math.min(9, parts));
      if (input.length === 0) return [] as number[];
      const sorted = [...input].sort((a, b) => a - b);
      const cuts: number[] = [];
      for (let i = 1; i < n; i += 1) {
        const index = Math.floor((i * sorted.length) / n);
        cuts.push(sorted[Math.min(index, sorted.length - 1)]);
      }
      return Array.from(new Set(cuts)).sort((a, b) => a - b);
    };

    const defaultPos = [
      "#10b981",
      "#22c55e",
      "#84cc16",
      "#eab308",
      "#f59e0b",
      "#d97706",
      "#b45309"
    ];
    const defaultNeg = [
      "#1e3a8a",
      "#1d4ed8",
      "#2563eb",
      "#3b82f6",
      "#60a5fa",
      "#93c5fd",
      "#bfdbfe"
    ];

    const buildPos = (input: number[]) => {
      const positiveValues = input.filter((value) => value > 0);
      if (positiveValues.length === 0) return [] as BuiltBucket[];
      const cuts = makeCuts(positiveValues, bucketsCount);
      const ranges = [0, ...cuts, Number.POSITIVE_INFINITY];
      const palette = resampleStops(
        posColors && posColors.length ? posColors : defaultPos,
        ranges.length - 1
      );
      const result: BuiltBucket[] = [];
      for (let i = 1; i < ranges.length; i += 1) {
        const min = ranges[i - 1] === 0 ? 1 : ranges[i - 1];
        const max = ranges[i];
        result.push({
          min,
          max,
          color: palette[i - 1],
          key: `pos-${min}-${max}`,
          label:
            max === Number.POSITIVE_INFINITY
              ? `>= ${short(min)}`
              : `${short(min)} - ${short(max)}`
        });
      }
      return result;
    };

    const buildNegIntervals = (input: number[]) => {
      const absolute = input
        .map((value) => Math.abs(value))
        .sort((a, b) => a - b);
      if (absolute.length === 0) return [] as BuiltBucket[];
      const cuts = makeCuts(absolute, bucketsCount);
      const ranges = [0, ...cuts, Number.POSITIVE_INFINITY];
      const palette = resampleStops(
        negColors && negColors.length ? negColors : defaultNeg,
        ranges.length - 1
      );
      const result: BuiltBucket[] = [];
      for (let i = ranges.length - 1; i >= 1; i -= 1) {
        const minAbsRange = ranges[i - 1] === 0 ? 1 : ranges[i - 1];
        const maxAbsRange = ranges[i];
        result.push({
          min: -maxAbsRange,
          max: -minAbsRange,
          color: palette[ranges.length - 1 - i],
          key: `neg-${minAbsRange}-${maxAbsRange}`,
          label:
            maxAbsRange === Number.POSITIVE_INFINITY
              ? `<= -${short(minAbsRange)}`
              : `-${short(maxAbsRange)} - -${short(minAbsRange)}`
        });
      }
      return result;
    };

    let builtBuckets: BuiltBucket[] = [];

    if (
      Array.isArray(customBuckets) &&
      customBuckets.length > 0 &&
      colorMetric === "value"
    ) {
      const positiveBuckets = [...customBuckets]
        .sort((a, b) => a.min - b.min)
        .map((bucket, index) => ({
          key: bucket.key ?? `custom-${index}`,
          min: bucket.min,
          max: bucket.max ?? Number.POSITIVE_INFINITY,
          color: bucket.color,
          label:
            bucket.label ??
            (bucket.max == null
              ? `>= ${short(bucket.min)}`
              : `${short(bucket.min)} - ${short(bucket.max)}`)
        }));
      const negativePart = hasNegative
        ? buildNegIntervals(values.filter((value) => value < 0))
        : [];
      builtBuckets = [
        ...negativePart,
        { key: "zero", min: 0, max: 0, color: zeroColor, label: "0" },
        ...positiveBuckets
      ];
    } else if (hasPositive && !hasNegative) {
      builtBuckets = [
        ...buildPos(values.filter((value) => value > 0)),
        { key: "zero", min: 0, max: 0, color: zeroColor, label: "0" }
      ];
    } else if (!hasPositive && hasNegative) {
      builtBuckets = [
        ...buildNegIntervals(values),
        { key: "zero", min: 0, max: 0, color: zeroColor, label: "0" }
      ];
    } else {
      builtBuckets = [
        ...buildNegIntervals(values.filter((value) => value < 0)),
        { key: "zero", min: 0, max: 0, color: zeroColor, label: "0" },
        ...buildPos(values.filter((value) => value > 0))
      ];
    }

    const findBucket = (value: number) =>
      builtBuckets.find((bucket) =>
        value === 0 && bucket.key === "zero"
          ? true
          : value >= bucket.min &&
            (bucket.max === Number.POSITIVE_INFINITY
              ? true
              : value <= bucket.max)
      );

    const colorMap: Record<string, string> = {};
    const keyMap: Record<string, string> = {};
    for (const [iso2, series] of Object.entries(seriesByIso2)) {
      const value = pickValue(series);
      if (!Number.isFinite(value)) {
        colorMap[iso2] = noDataColor;
        keyMap[iso2] = "";
        continue;
      }
      const bucket = findBucket(value);
      if (bucket) {
        colorMap[iso2] = bucket.color;
        keyMap[iso2] = bucket.key;
      } else {
        colorMap[iso2] = noDataColor;
      }
    }

    return {
      buckets: builtBuckets,
      colorByIso2: colorMap,
      bucketKeyByIso2: keyMap
    };
  }, [
    bucketsCount,
    colorMetric,
    customBuckets,
    negColors,
    noDataColor,
    posColors,
    seriesByIso2,
    short,
    zeroColor
  ]);

  React.useEffect(() => {
    if (buckets.length === 0) return;
    const nextBucketKeys = buckets.map((bucket) => bucket.key);
    const previousBucketKeys = previousBucketKeysRef.current;
    const previousSignature = previousBucketKeys.join("|");
    const nextSignature = nextBucketKeys.join("|");

    if (
      !initializedBucketKeysRef.current ||
      previousSignature !== nextSignature
    ) {
      setActiveBucketKeys(nextBucketKeys);
      initializedBucketKeysRef.current = true;
      previousBucketKeysRef.current = nextBucketKeys;
    }
  }, [buckets]);

  const isIso2Active = React.useCallback(
    (iso2: string) => {
      const key = bucketKeyByIso2[iso2];
      if (!key) return true;
      return activeBucketKeys.includes(key);
    },
    [activeBucketKeys, bucketKeyByIso2]
  );

  const infoRef = React.useRef(seriesByIso2);
  const colorRef = React.useRef(colorByIso2);
  const metricRef = React.useRef({ colorMetric, headerMetric });
  const nameRef = React.useRef(nameByIso2);

  React.useEffect(() => {
    infoRef.current = seriesByIso2;
    colorRef.current = colorByIso2;
    metricRef.current = { colorMetric, headerMetric };
    nameRef.current = nameByIso2;
  }, [colorByIso2, colorMetric, headerMetric, nameByIso2, seriesByIso2]);

  React.useEffect(() => {
    let active = true;

    const cached = geojsonCache.get(geojsonUrl);
    if (cached) {
      setGeoData(cached);
      return () => {
        active = false;
      };
    }

    const pending = geojsonInflight.get(geojsonUrl);
    if (pending) {
      pending
        .then((json) => {
          if (!active) return;
          setGeoData(json);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }

    const request = fetch(geojsonUrl)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Failed to load geojson: ${response.status}`);
        return response.json() as Promise<FeatureCollection>;
      })
      .then((json) => {
        geojsonCache.set(geojsonUrl, json);
        return json;
      })
      .finally(() => {
        geojsonInflight.delete(geojsonUrl);
      });

    geojsonInflight.set(geojsonUrl, request);
    request
      .then((json) => {
        if (!active) return;
        setGeoData(json);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [geojsonUrl]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => mapRef.current?.invalidateSize());
    observer.observe(containerRef.current);

    const onResize = () => mapRef.current?.invalidateSize();
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const style = React.useCallback(
    (feature?: Feature<Geometry, GeoJsonProperties>): PathOptions => {
      const featureProps = (feature?.properties ?? {}) as Record<
        string,
        unknown
      >;
      const iso =
        (featureProps["ISO3166-1-Alpha-2"] as string | undefined) ??
        (featureProps["ISO_A2"] as string | undefined) ??
        (featureProps["iso_a2"] as string | undefined) ??
        (featureProps["ISO_A2_EH"] as string | undefined) ??
        "";
      const iso2 = String(iso).toUpperCase();
      const active = isIso2Active(iso2);
      return {
        fillColor: active ? colorByIso2[iso2] || noDataColor : noDataColor,
        fillOpacity: active ? 0.9 : 0,
        color: borderColor,
        weight: active ? borderWidth : 0.4,
        opacity: active ? 1 : 0.3,
        dashArray: "",
        lineJoin: "round",
        lineCap: "round"
      };
    },
    [borderColor, borderWidth, colorByIso2, isIso2Active, noDataColor]
  );

  const renderTooltipHtml = React.useCallback(
    (countryName: string, iso2: string) => {
      const info = infoRef.current[iso2];
      if (!info) return "";
      const displayName = nameRef.current[iso2] || countryName;
      const {
        colorMetric: currentColorMetric,
        headerMetric: currentHeaderMetric
      } = metricRef.current;
      const headerBg = colorRef.current[iso2] || "#111827";
      const pick = (metric: typeof currentColorMetric, year: 1 | 2) => {
        if (metric === "balance")
          return year === 2 ? info.balanceY2 : info.balanceY1;
        if (metric === "proportion")
          return year === 2 ? info.propY2 : info.propY1;
        if (metric === "proportion_balance")
          return year === 2 ? info.propBalY2 : info.propBalY1;
        return year === 2 ? info.valueY2 : info.valueY1;
      };
      const headerSeries =
        currentHeaderMetric === "color"
          ? currentColorMetric
          : currentHeaderMetric;
      const mainValue = pick(headerSeries as typeof currentColorMetric, 2);
      const prevValue = pick(headerSeries as typeof currentColorMetric, 1);
      const propValue =
        currentColorMetric === "balance"
          ? info.propBalY2 || info.propY2
          : info.propY2 || info.propBalY2;
      const kpi =
        info.chgY2 == null
          ? "-"
          : `${info.chgY2 >= 0 ? "+" : ""}${Number(info.chgY2).toFixed(2)}%`;

      const nf = new Intl.NumberFormat("id-ID");
      return `
      <div style="min-width:240px;max-width:320px;border-radius:14px;overflow:hidden;box-shadow:0 16px 40px rgba(2,8,23,.18);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.45);">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:${headerBg};color:white;font-weight:700;font-size:13px;">
          <div style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${displayName}</div>
          <div style="opacity:.9;font-weight:600">${currencyPrefix}</div>
        </div>
        <div style="background:rgba(255,255,255,.96);padding:12px 14px;">
          <div style="font-size:22px;line-height:28px;font-weight:800;color:#0f172a">${nf.format(mainValue)}</div>
          <div style="display:flex;gap:8px;margin-top:6px;align-items:flex-end;flex-wrap:wrap">
            <div style="font-size:13px;color:#0f172a;font-weight:700">Tahun - ${info.y2 ?? "-"}</div>
            <div style="margin-left:auto;font-size:12px;color:#6b7280">${info.y1 ? `${info.y1}: <b style="color:#111827">${nf.format(prevValue)}</b>` : ""}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
            <div style="font-size:11px;color:#64748b">Perubahan ${info.y1 ?? "-"} ke ${info.y2 ?? "-"}</div>
            <div style="text-align:right;font-size:13px;color:#0f172a;font-weight:700">${kpi}</div>
            ${hideBalance ? "" : `<div style="font-size:11px;color:#64748b">Neraca</div><div style="text-align:right;font-size:13px;color:#0f172a;font-weight:700">${nf.format(info.balanceY2)}</div>`}
            ${
              showProportionInTooltip
                ? `<div style="font-size:11px;color:#64748b">Pangsa Pasar</div>
            <div style="text-align:right;font-size:13px;color:#0f172a;font-weight:700">${Number.isFinite(propValue) ? Number(propValue).toFixed(2) + "%" : "-"}</div>`
                : ""
            }
          </div>
        </div>
      </div>`;
    },
    [currencyPrefix, hideBalance, showProportionInTooltip]
  );

  const onEachFeature = React.useCallback(
    (feature: Feature<Geometry, GeoJsonProperties>, layer: L.Layer) => {
      if (!(layer instanceof L.Path)) return;
      const featureProps = (feature.properties ?? {}) as Record<
        string,
        unknown
      >;
      const iso =
        (featureProps["ISO3166-1-Alpha-2"] as string | undefined) ??
        (featureProps["ISO_A2"] as string | undefined) ??
        (featureProps["iso_a2"] as string | undefined) ??
        (featureProps["ISO_A2_EH"] as string | undefined) ??
        "";
      const iso2 = String(iso).toUpperCase();
      const countryName =
        (featureProps["name"] as string | undefined) ??
        (featureProps["ADMIN"] as string | undefined) ??
        (featureProps["COUNTRY"] as string | undefined) ??
        "Negara";

      const updateTooltip = () => {
        if (!isIso2Active(iso2)) {
          layer.unbindTooltip();
          return;
        }
        const html = renderTooltipHtml(countryName, iso2);
        if (!html) return;
        const tooltip = layer.getTooltip();
        if (tooltip) tooltip.setContent(html);
        else {
          layer.bindTooltip(html, {
            sticky: true,
            permanent: false,
            direction: "bottom",
            className:
              "leaflet-tooltip-custom p-0 !bg-transparent !border-0 !shadow-none pointer-events-none",
            opacity: 1
          });
        }
      };

      updateTooltip();

      layer.on({
        mouseover: (event) => {
          const target = event.target as L.Path;
          if (!isIso2Active(iso2)) {
            target.setStyle(style(feature));
            target.closeTooltip();
            return;
          }
          updateTooltip();
          target.setStyle({
            weight: borderHoverWidth,
            color: borderHoverColor,
            fillOpacity: 0.98
          });
          target.bringToFront();
          target.openTooltip();
        },
        mouseout: (event) => {
          const target = event.target as L.Path;
          target.setStyle(style(feature));
          target.closeTooltip();
        },
        click: () => {
          if (!isIso2Active(iso2)) return;
          updateTooltip();
        }
      });
    },
    [borderHoverColor, borderHoverWidth, isIso2Active, renderTooltipHtml, style]
  );

  if (!mounted) {
    return (
      <div
        className={`${className} grid place-items-center rounded-xl bg-linear-to-b from-slate-200 to-slate-100`}
      >
        <div className="text-xs text-slate-600 sm:text-sm">Memuat peta...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl ring-1 ring-slate-200 ${className}`}
      >
        <MapContainer
          ref={mapRef}
          center={[20, 0]}
          zoom={1}
          minZoom={2}
          maxZoom={5}
          style={{ height: "100%", width: "100%" }}
          worldCopyJump={false}
          maxBoundsViscosity={1}
          maxBounds={[
            [-85, -180],
            [85, 180]
          ]}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            crossOrigin={true}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {geoData ? (
            <GeoJSON
              key={activeBucketKeys.join("_")}
              data={geoData}
              style={style}
              onEachFeature={onEachFeature}
            />
          ) : null}
        </MapContainer>
      </div>

      <div className={`grid gap-x-8 gap-y-2 text-sm ${legendGridClassName}`}>
        {buckets.map((bucket) => {
          const active = activeBucketKeys.includes(bucket.key);
          return (
            <button
              key={bucket.key}
              type="button"
              data-map-legend-item="true"
              onClick={() => {
                setActiveBucketKeys((previous) =>
                  previous.includes(bucket.key)
                    ? previous.filter((key) => key !== bucket.key)
                    : [...previous, bucket.key]
                );
              }}
              className={`group flex items-center gap-2 text-left transition ${active ? "opacity-100" : "opacity-45"}`}
            >
              <span className="relative inline-flex items-center justify-center">
                <span
                  data-map-legend-swatch="true"
                  className="inline-block h-4 w-4 rounded border border-slate-300"
                  style={{ backgroundColor: bucket.color }}
                />
                {!active ? (
                  <span className="pointer-events-none absolute inset-0 rounded border border-slate-400 bg-white/70" />
                ) : null}
              </span>
              <span
                data-map-legend-label="true"
                className={`text-xs text-slate-700 sm:text-[13px] ${active ? "" : "line-through"}`}
              >
                {bucket.label}
              </span>
            </button>
          );
        })}
        <div className="flex items-center gap-2" data-map-legend-item="true">
          <span
            data-map-legend-swatch="true"
            className="inline-block h-4 w-4 rounded border border-slate-300"
            style={{ backgroundColor: noDataColor }}
          />
          <span
            className="text-xs text-slate-700 sm:text-[13px]"
            data-map-legend-label="true"
          >
            No Data
          </span>
        </div>
      </div>
      {footerText ? (
        <div className="text-right text-xs italic text-slate-500">
          {footerText}
        </div>
      ) : null}
    </div>
  );
}
