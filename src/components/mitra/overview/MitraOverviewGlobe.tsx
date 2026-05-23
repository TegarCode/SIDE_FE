import React from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import countriesRaw from "@/constants/ne_110m_admin_0_countries.geojson?raw";
import { MapSkeleton } from "@/components/ui/skeletons/MapSkeleton";
import { cn } from "@/utils/cn";
import type {
  MitraOverviewTradeData,
  MitraOverviewTradeItem
} from "@/type/mitra";

type GeoFeatureProperties = {
  name?: string;
  NAME?: string;
  ISO_A2?: string;
  ISO_A3?: string;
  "ISO3166-1-Alpha-2"?: string;
  "ISO3166-1-Alpha-3"?: string;
};

type GeoFeature = {
  type: "Feature";
  properties: GeoFeatureProperties;
  geometry: unknown;
  bbox?: [number, number, number, number];
};

type GeoCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

type GlobePin = {
  lat: number;
  lng: number;
};

type MitraOverviewGlobeProps = {
  tradeSummary: MitraOverviewTradeData | null;
  highlightA2?: string | null;
  countryName: string;
  loading?: boolean;
  onCountrySelect?: (alpha2: string) => void;
};

const GLOBE_IMAGE_URL =
  "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const BUMP_IMAGE_URL = "//unpkg.com/three-globe/example/img/earth-topology.png";

const BUCKETS = [
  {
    key: "GE_1B",
    label: ">=1B",
    min: 1e9,
    max: Number.POSITIVE_INFINITY,
    color: "#06B6D4",
    alt: 0.07
  },
  {
    key: "100M_999M",
    label: "100M - 999.9M",
    min: 1e8,
    max: 1e9,
    color: "#10B981",
    alt: 0.05
  },
  {
    key: "50M_99M",
    label: "50M - 99.9M",
    min: 5e7,
    max: 1e8,
    color: "#22C55E",
    alt: 0.04
  },
  {
    key: "10M_49M",
    label: "10M - 49.9M",
    min: 1e7,
    max: 5e7,
    color: "#84CC16",
    alt: 0.03
  },
  {
    key: "1M_9M",
    label: "1M - 9.9M",
    min: 1e6,
    max: 1e7,
    color: "#EAB308",
    alt: 0.022
  },
  {
    key: "100K_999K",
    label: "100K - 999.9K",
    min: 1e5,
    max: 1e6,
    color: "#D97706",
    alt: 0.018
  },
  {
    key: "10K_99K",
    label: "10K - 99.9K",
    min: 1e4,
    max: 1e5,
    color: "#A16207",
    alt: 0.014
  },
  {
    key: "1_9K",
    label: "1 - 9.9K",
    min: 1,
    max: 1e4,
    color: "#92400E",
    alt: 0.012
  },
  {
    key: "NONE",
    label: "No Data",
    min: 0,
    max: 1,
    color: "#9CA3AF",
    alt: 0.004
  }
] as const;

function rgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const numeric = Number.parseInt(clean, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex: string, amount = 0.35) {
  const clean = hex.replace("#", "");
  const numeric = Number.parseInt(clean, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;
  const next = [r, g, b]
    .map((channel) => Math.round(channel + (255 - channel) * amount))
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("");
  return `#${next}`;
}

function formatNumber(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "-";
  return value.toLocaleString("id-ID");
}

function formatPercent(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "";
  return `${value >= 0 ? "+" : "-"} ${Math.abs(value).toFixed(1)}%`;
}

function bucketForTotal(total: number) {
  return (
    BUCKETS.find((bucket) => total >= bucket.min && total < bucket.max) ??
    BUCKETS[BUCKETS.length - 1]
  );
}

function centerFromFeature(feature: GeoFeature): GlobePin | null {
  if (Array.isArray(feature.bbox) && feature.bbox.length === 4) {
    const [minLng, minLat, maxLng, maxLat] = feature.bbox;
    return {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2
    };
  }
  return null;
}

function getFeatureAlpha2(feature: GeoFeature) {
  return (
    feature.properties["ISO3166-1-Alpha-2"] ?? feature.properties.ISO_A2 ?? null
  );
}

function getFeatureName(feature: GeoFeature) {
  return feature.properties.name ?? feature.properties.NAME ?? null;
}

function useGlobeDimensions() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState(0);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const resize = () => {
      const width = containerRef.current?.clientWidth ?? 0;
      setSize(width);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return {
    containerRef,
    size
  };
}

export function MitraOverviewGlobe({
  tradeSummary,
  highlightA2,
  loading = false,
  onCountrySelect
}: MitraOverviewGlobeProps) {
  const { containerRef, size } = useGlobeDimensions();
  const globeRef = React.useRef<GlobeMethods | undefined>(undefined);
  const [isGlobeReady, setIsGlobeReady] = React.useState(false);
  const [selectedIso, setSelectedIso] = React.useState<string | null>(null);
  const [pinData, setPinData] = React.useState<GlobePin[]>([]);
  const countries = React.useMemo<GeoCollection>(
    () => JSON.parse(countriesRaw) as GeoCollection,
    []
  );

  const years = tradeSummary?.years ?? [];
  const activeYear = years[0] ?? null;
  const prevYear = years[1] ?? null;

  const itemByAlpha2 = React.useMemo(() => {
    const map = new Map<string, MitraOverviewTradeItem>();
    for (const item of tradeSummary?.items ?? []) {
      const alpha2 = item.alpha2?.toUpperCase();
      if (!alpha2) continue;
      map.set(alpha2, item);
    }
    return map;
  }, [tradeSummary?.items]);

  const highlightedAlpha2 = (highlightA2 ?? "CN").toUpperCase();
  const showLoadingOverlay = loading || size === 0 || !isGlobeReady;

  const getTotalTrade = React.useCallback(
    (alpha2: string) => {
      const item = itemByAlpha2.get(alpha2.toUpperCase());
      return Number(item?.export ?? 0) + Number(item?.import ?? 0);
    },
    [itemByAlpha2]
  );

  const getBucket = React.useCallback(
    (alpha2: string) => bucketForTotal(getTotalTrade(alpha2)),
    [getTotalTrade]
  );

  const getCenterByAlpha2 = React.useCallback(
    (alpha2: string) => {
      const feature = countries?.features.find(
        (item) => getFeatureAlpha2(item)?.toUpperCase() === alpha2.toUpperCase()
      );
      return feature ? centerFromFeature(feature) : null;
    },
    [countries]
  );

  const focusCountry = React.useCallback(
    (alpha2: string, duration = 900) => {
      const center = getCenterByAlpha2(alpha2);
      if (!center) return;

      setSelectedIso(alpha2);
      setPinData([center]);
      globeRef.current?.pointOfView({ ...center, altitude: 1.65 }, duration);
    },
    [getCenterByAlpha2]
  );

  React.useEffect(() => {
    if (!size || !isGlobeReady) return;
    focusCountry(highlightedAlpha2, 900);
  }, [focusCountry, highlightedAlpha2, isGlobeReady, size]);

  const handlePolygonClick = React.useCallback(
    (feature: GeoFeature) => {
      const alpha2 = getFeatureAlpha2(feature)?.toUpperCase();
      if (!alpha2) return;
      focusCountry(alpha2, 900);
      onCountrySelect?.(alpha2);
    },
    [focusCountry, onCountrySelect]
  );

  return (
    <div>
      <div
        ref={containerRef}
        className="relative min-h-128 w-full overflow-hidden"
      >
        {showLoadingOverlay ? (
          <div className="absolute inset-0 z-10">
            <MapSkeleton className="h-full border-0 bg-transparent" />
          </div>
        ) : null}
        {size > 0 ? (
          <div
            className={cn(
              "transition-opacity duration-500",
              showLoadingOverlay ? "opacity-0" : "opacity-100"
            )}
          >
            <Globe
              ref={globeRef}
              width={size}
              height={size}
              backgroundColor="rgba(0,0,0,0)"
              globeImageUrl={GLOBE_IMAGE_URL}
              bumpImageUrl={BUMP_IMAGE_URL}
              onGlobeReady={() => {
                setIsGlobeReady(true);
                focusCountry(highlightedAlpha2, 0);
              }}
              showAtmosphere={false}
              polygonsData={countries.features}
              polygonsTransitionDuration={250}
              polygonCapColor={(feature: object) => {
                const typedFeature = feature as GeoFeature;
                const alpha2 =
                  getFeatureAlpha2(typedFeature)?.toUpperCase() ?? "";
                const bucket = getBucket(alpha2);
                const isSelected = alpha2 === selectedIso;
                const color = isSelected
                  ? lighten(bucket.color, 0.15)
                  : bucket.color;
                const alpha = isSelected
                  ? bucket.key === "NONE"
                    ? 0.45
                    : 1
                  : bucket.key === "NONE"
                    ? 0.1
                    : 0.88;
                return rgba(color, alpha);
              }}
              polygonSideColor={(feature: object) => {
                const typedFeature = feature as GeoFeature;
                const alpha2 =
                  getFeatureAlpha2(typedFeature)?.toUpperCase() ?? "";
                const bucket = getBucket(alpha2);
                const isSelected = alpha2 === selectedIso;
                const alpha = isSelected
                  ? bucket.key === "NONE"
                    ? 0.35
                    : 0.85
                  : bucket.key === "NONE"
                    ? 0.05
                    : 0.8;
                return rgba(
                  isSelected ? lighten(bucket.color, 0.05) : bucket.color,
                  alpha
                );
              }}
              polygonStrokeColor={(feature: object) => {
                const typedFeature = feature as GeoFeature;
                const alpha2 =
                  getFeatureAlpha2(typedFeature)?.toUpperCase() ?? "";
                return alpha2 === selectedIso
                  ? "#FFFFFF"
                  : "rgba(255,255,255,.65)";
              }}
              polygonAltitude={(feature: object) => {
                const typedFeature = feature as GeoFeature;
                const alpha2 =
                  getFeatureAlpha2(typedFeature)?.toUpperCase() ?? "";
                const bucket = getBucket(alpha2);
                return alpha2 === selectedIso
                  ? Math.max(0.06, bucket.alt * 0.9)
                  : Math.max(0.002, bucket.alt * 0.15);
              }}
              polygonLabel={(feature: object) => {
                const typedFeature = feature as GeoFeature;
                const alpha2 =
                  getFeatureAlpha2(typedFeature)?.toUpperCase() ?? "";
                const item = itemByAlpha2.get(alpha2) ?? null;
                const name =
                  item?.country ?? getFeatureName(typedFeature) ?? alpha2;
                const unit = item?.unit ?? "";
                const flagUrl = alpha2
                  ? `https://flagcdn.com/24x18/${alpha2.toLowerCase()}.png`
                  : "";
                const totalTrade = item
                  ? Number(item.export ?? 0) + Number(item.import ?? 0)
                  : 0;
                const totalTradePrev = item
                  ? Number(item.exportPrev ?? 0) + Number(item.importPrev ?? 0)
                  : 0;
                const balancePrev =
                  item && item.exportPrev != null && item.importPrev != null
                    ? Number(item.exportPrev) - Number(item.importPrev)
                    : null;

                return `
                  <div style="background: rgba(17,24,39,0.92); padding: 10px 12px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.35); color: #e5e7eb; min-width: 260px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:4px;">
                      <div style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:14px; color:#22c55e;">
                        ${flagUrl ? `<img src="${flagUrl}" alt="${alpha2}" width="20" height="15" style="border-radius:2px; box-shadow:0 0 0 1px rgba(255,255,255,.45);" />` : ""}
                        <span>${name} (${alpha2})</span>
                      </div>
                      ${unit ? `<span style="display:inline-flex; align-items:center; height:20px; padding:0 8px; border-radius:999px; background:rgba(255,255,255,.12); color:#e2e8f0; font-size:11px; font-weight:600;">${unit}</span>` : ""}
                    </div>
                    <div style="opacity: .75; margin-bottom: 6px;">Tahun <b>${activeYear ?? "-"}</b>${prevYear ? ` | sebelumnya ${prevYear}` : ""}</div>
                    <div style="opacity:.8;">Total Trade (Export + Import):</div>
                    <div style="font-weight:800;">${formatNumber(totalTrade)}</div>
                    <div style="margin-top:2px; opacity:.75;">Sebelumnya: ${formatNumber(totalTradePrev)}</div>
                    <div style="display:flex; justify-content:space-between; gap:12px; margin-top:8px;">
                      <div style="flex:1;">
                        <div style="opacity:.8;">Export:</div>
                        <div style="font-weight:800;">${formatNumber(item?.export ?? null)}</div>
                        <div style="margin-top:2px; color:${item?.exportChange != null && item.exportChange >= 0 ? "#16a34a" : "#dc2626"}">${formatPercent(item?.exportChange ?? null)}</div>
                        <div style="margin-top:2px; opacity:.75;">Sebelumnya: ${formatNumber(item?.exportPrev ?? null)}</div>
                      </div>
                      <div style="flex:1;">
                        <div style="opacity:.8;">Import:</div>
                        <div style="font-weight:800;">${formatNumber(item?.import ?? null)}</div>
                        <div style="margin-top:2px; color:${item?.importChange != null && item.importChange >= 0 ? "#16a34a" : "#dc2626"}">${formatPercent(item?.importChange ?? null)}</div>
                        <div style="margin-top:2px; opacity:.75;">Sebelumnya: ${formatNumber(item?.importPrev ?? null)}</div>
                      </div>
                    </div>
                    <div style="margin-top:8px; opacity:.8;">Balance:</div>
                    <div style="font-weight:600; color:#86efac;">${formatNumber(item?.balance ?? null)}</div>
                    <div style="margin-top:2px; opacity:.75;">Sebelumnya: ${formatNumber(balancePrev)}</div>
                  </div>
                `;
              }}
              onPolygonClick={(feature: object) =>
                handlePolygonClick(feature as GeoFeature)
              }
              htmlElementsData={pinData}
              htmlElement={() => {
                const element = document.createElement("div");
                element.innerHTML = `
                  <div class="relative">
                    <svg viewBox="-4 0 36 36">
                      <defs>
                        <filter id="mitra-glow">
                          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"></feGaussianBlur>
                          <feMerge>
                            <feMergeNode in="coloredBlur"></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                          </feMerge>
                        </filter>
                      </defs>
                      <path filter="url(#mitra-glow)" fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
                      <circle fill="black" cx="14" cy="14" r="7"></circle>
                    </svg>
                    <div class="absolute inset-0 h-full w-full rounded-full animate-ping" style="background: rgba(239,68,68,.35)"></div>
                  </div>
                `;
                element.className = "text-red-600";
                element.style.width = "30px";
                element.style.height = "30px";
                return element;
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700">
        {BUCKETS.map((bucket) => (
          <div key={bucket.key} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-block h-4 w-4 rounded shadow-sm ring-1 ring-black/10",
                bucket.key === "NONE" && "opacity-80"
              )}
              style={{ backgroundColor: bucket.color }}
            />
            <span className="whitespace-nowrap">
              {bucket.label === "No Data" ? "No Data" : bucket.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
