import React from "react";
import { createPortal } from "react-dom";
import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { downloadComposedPng } from "@/utils/downloadComposedPng";

type TradeProductsTreemapChartRow = {
  code: string;
  label: string;
  valueOd: number | null;
  valuePrev?: number | null;
  valueReverse: number | null;
  shareValue?: number | null;
};

type TradeProductsTreemapChartProps = {
  rows: TradeProductsTreemapChartRow[];
  mode: "ekspor" | "impor";
  year: number | null;
  previousYear?: number | null;
  unitLabel: string;
  height?: number;
  filename?: string;
  onRegisterDownload?: (handler: (() => void) | null) => void;
  exportTitle?: string;
  exportSubtitle?: string;
  exportFooter?: string;
};

type TreemapNodeData = TradeProductsTreemapChartRow & {
  name: string;
  fullName: string;
  value: number;
  reverseValue: number;
  fill: string;
  anomalyType: "under" | "over" | null;
  anomalyFlagged: boolean;
};

const TREEMAP_PALETTE = [
  "#2e9f58",
  "#7a50c4",
  "#c9833b",
  "#c94a8a",
  "#1f76bf",
  "#c96a2f",
  "#2e9d76",
  "#8364c8",
  "#c48a34",
  "#c9547b",
  "#2e8f83",
  "#439c5c"
];

function formatNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function formatSignedNumber(value: number | null | undefined) {
  const numeric = Number(value ?? 0);
  const sign = numeric >= 0 ? "+" : "-";
  return `${sign}${formatNumber(Math.abs(numeric))}`;
}

function formatAbbreviatedNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return formatNumber(value);
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(2)}%`;
}

function formatDeltaPercent(
  current: number | null | undefined,
  previous: number | null | undefined
) {
  const now = Number(current ?? 0);
  const prev = Number(previous ?? 0);
  if (!Number.isFinite(now) || !Number.isFinite(prev) || prev === 0)
    return null;
  const delta = ((now - prev) / Math.abs(prev)) * 100;
  if (!Number.isFinite(delta)) return null;
  return delta;
}

function getAnomalyInfo(
  nowRaw: number | null | undefined,
  reverseRaw: number | null | undefined
) {
  const now = Number(nowRaw ?? 0);
  const reverse = Number(reverseRaw ?? 0);
  if (now <= 0 || reverse <= 0) {
    return {
      now,
      reverse,
      diffValue: null as number | null,
      diffPct: null as number | null,
      isUnder: false,
      isOver: false,
      flagged: false
    };
  }

  const diffValue = reverse - now;
  const diffPct = diffValue >= 0 ? diffValue / now : diffValue / reverse;
  const isUnder = diffPct >= 0.4;
  const isOver = diffPct <= -0.4;

  return {
    now,
    reverse,
    diffValue,
    diffPct,
    isUnder,
    isOver,
    flagged: isUnder || isOver
  };
}

function hexToRgb(hex: string) {
  const normalized = String(hex || "").replace("#", "");
  const full =
    normalized.length === 3
      ? [...normalized].map((char) => `${char}${char}`).join("")
      : normalized;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16)
  };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function fitTextToBox(
  text: string,
  boxWidth: number,
  fontSize = 12,
  paddingX = 8
) {
  const usable = Math.max(0, Number(boxWidth || 0) - paddingX * 2);
  const avgChar = fontSize * 0.58;
  const maxChars = Math.floor(usable / avgChar);

  if (maxChars <= 1) return "";
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(1, maxChars - 3))}...`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function TreemapTooltip({
  active,
  payload,
  unitLabel,
  year,
  previousYear,
  coordinate,
  containerRect
}: {
  active?: boolean;
  payload?: Array<{ payload?: TreemapNodeData }>;
  unitLabel: string;
  year: number | null;
  previousYear: number | null;
  coordinate?: { x?: number; y?: number };
  containerRect?: DOMRect | null;
}) {
  if (!active || !payload?.length) return null;
  if (typeof document === "undefined") return null;

  const node = payload[0]?.payload;
  if (!node) return null;

  const anomaly = getAnomalyInfo(node.value, node.reverseValue);
  const shareValue =
    node.shareValue != null && Number.isFinite(node.shareValue)
      ? node.shareValue / 100
      : null;
  const deltaPercent = formatDeltaPercent(node.value, node.valuePrev);
  const diffValue =
    node.valuePrev != null && Number.isFinite(Number(node.valuePrev))
      ? Number(node.value ?? 0) - Number(node.valuePrev ?? 0)
      : null;

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  const tooltipWidth = 320;
  const tooltipHeight = 280;
  const anchorLeft = (containerRect?.left ?? 0) + (coordinate?.x ?? 0);
  const anchorTop = (containerRect?.top ?? 0) + (coordinate?.y ?? 0);
  const horizontalOffset = 10;
  const verticalOffset = 10;
  const preferredLeft = anchorLeft + horizontalOffset;
  const preferredTop = anchorTop + verticalOffset;
  const flippedLeft = anchorLeft - tooltipWidth - horizontalOffset;
  const flippedTop = anchorTop - tooltipHeight - verticalOffset;
  const left =
    preferredLeft + tooltipWidth + 8 <= viewportWidth
      ? preferredLeft
      : Math.max(8, flippedLeft);
  const top =
    preferredTop + tooltipHeight + 8 <= viewportHeight
      ? preferredTop
      : Math.max(8, flippedTop);

  return createPortal(
    <div
      className="pointer-events-none fixed z-4000 min-w-55 max-w-[320px] rounded-xl border bg-white/95 p-3 text-sm shadow-lg backdrop-blur"
      style={{ left, top, borderColor: node.fill }}
    >
      <span
        className="mb-2 inline-block rounded-full border px-2 py-0.5 text-[10px]"
        style={{ borderColor: node.fill, color: node.fill }}
      >
        HS {node.code}
      </span>

      <div
        className="mb-2 font-semibold leading-snug"
        style={{ color: node.fill }}
      >
        {node.fullName}
      </div>

      <div className="text-base font-extrabold" style={{ color: node.fill }}>
        {formatNumber(node.value)}
      </div>
      <div className="mb-2 text-xs text-slate-500">
        ({formatAbbreviatedNumber(node.value)})
      </div>

      {year != null ? (
        <div className="mb-2 space-y-0.5 text-xs text-slate-600">
          <div>
            Tahun {year}:{" "}
            <span className="font-semibold text-slate-900">
              {formatNumber(node.value)}
            </span>
          </div>
          {previousYear != null ? (
            <div>
              Tahun {previousYear}:{" "}
              <span className="font-semibold text-slate-900">
                {formatNumber(node.valuePrev)}
              </span>
            </div>
          ) : null}
          {previousYear != null ? (
            <div>
              Selisih:{" "}
              <span
                className={`font-semibold ${
                  diffValue != null
                    ? diffValue > 0
                      ? "text-emerald-700"
                      : diffValue < 0
                        ? "text-rose-700"
                        : "text-slate-900"
                    : "text-slate-900"
                }`}
              >
                {diffValue == null ? "-" : formatSignedNumber(diffValue)}
              </span>
            </div>
          ) : null}
          {previousYear != null ? (
            <div>
              Perubahan:{" "}
              <span
                className={`font-semibold ${
                  deltaPercent != null
                    ? deltaPercent > 0
                      ? "text-emerald-700"
                      : deltaPercent < 0
                        ? "text-rose-700"
                        : "text-slate-900"
                    : "text-slate-900"
                }`}
              >
                {deltaPercent == null
                  ? "-"
                  : `${deltaPercent > 0 ? "▲" : deltaPercent < 0 ? "▼" : ""}${Math.abs(deltaPercent).toFixed(2)}%`}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {node.reverseValue > 0 ? (
        <div className="mb-2 text-xs text-slate-600">
          <div>
            Nilai sebaliknya:{" "}
            <span className="font-semibold text-slate-900">
              {formatNumber(node.reverseValue)}
            </span>
          </div>
          <div className="mt-0.5">
            Selisih:{" "}
            <span className="font-semibold text-slate-900">
              {formatSignedNumber(anomaly.diffValue)}
            </span>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {anomaly.flagged ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-900">
            <div className="font-semibold">
              ! Indikasi{" "}
              {anomaly.isUnder ? "under invoicing" : "over invoicing"}
            </div>
            <div className="mt-0.5">
              Selisih:{" "}
              <span className="font-semibold">
                {formatSignedNumber(anomaly.diffValue)}
              </span>{" "}
              ({((anomaly.diffPct ?? 0) * 100).toFixed(1)}%)
            </div>
          </div>
        ) : null}

        {shareValue != null ? (
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>{`Pangsa ${year ?? ""}`}</span>
              <span className="font-medium text-slate-800">
                {formatPercent(shareValue)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-300/25">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, Number((shareValue ?? 0) * 100)).toFixed(2)}%`,
                  background: `linear-gradient(90deg, ${rgba(node.fill, 0.95)} 0%, ${rgba(node.fill, 0.6)} 100%)`
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 text-[11px] text-slate-400">
        {year != null ? `Tahun ${year} • ` : ""}Unit: {unitLabel}
      </div>
    </div>,
    document.body
  );
}

function TreemapNode(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: TreemapNodeData;
  name?: string;
}) {
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const width = props.width ?? 0;
  const height = props.height ?? 0;
  const payload = props.payload;
  const nodeFill = payload?.fill ?? props.fill ?? "#2e9f58";
  const minSide = Math.min(width, height);
  const fontSize = clamp(minSide * 0.16, 12, 24);
  const canShowText = width >= 68 && height >= 40;
  const rawLabelBase = payload?.anomalyFlagged
    ? `! ${payload.fullName}`
    : (payload?.fullName ?? props.name ?? "");
  const label = canShowText
    ? fitTextToBox(rawLabelBase, width, fontSize, 14)
    : "";
  const shareLabel =
    canShowText &&
    width >= 82 &&
    height >= 60 &&
    payload?.shareValue != null &&
    Number.isFinite(payload.shareValue)
      ? `${Number(payload.shareValue).toFixed(1)}%`
      : "";
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const labelY = shareLabel
    ? centerY - fontSize * 0.12
    : centerY + fontSize * 0.18;
  const shareY = labelY + fontSize * 0.95;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ fill: nodeFill }}
        stroke="#fff"
        strokeWidth={2}
      />
      {label ? (
        <text
          x={centerX}
          y={labelY}
          fontSize={fontSize}
          fill="#fff"
          textAnchor="middle"
          style={{
            pointerEvents: "none",
            fontWeight: 700,
            paintOrder: "stroke",
            stroke: "rgba(0,0,0,0.25)",
            strokeWidth: 2
          }}
        >
          {label}
        </text>
      ) : null}
      {shareLabel ? (
        <text
          x={centerX}
          y={shareY}
          fontSize={Math.max(10, fontSize * 0.72)}
          fill="rgba(255,255,255,0.92)"
          textAnchor="middle"
          style={{
            pointerEvents: "none",
            fontWeight: 600,
            paintOrder: "stroke",
            stroke: "rgba(0,0,0,0.18)",
            strokeWidth: 1.5
          }}
        >
          {shareLabel}
        </text>
      ) : null}
    </g>
  );
}

export function TradeProductsTreemapChart({
  rows,
  year,
  previousYear = null,
  unitLabel,
  height = 420,
  filename = "trade_products_treemap",
  onRegisterDownload,
  exportTitle,
  exportSubtitle,
  exportFooter
}: TradeProductsTreemapChartProps) {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const [containerRect, setContainerRect] = React.useState<DOMRect | null>(
    null
  );

  React.useEffect(() => {
    const node = wrapperRef.current;
    if (!node) {
      setContainerRect(null);
      return;
    }

    const updateRect = () => {
      setContainerRect(node.getBoundingClientRect());
    };

    updateRect();

    const resizeObserver = new ResizeObserver(() => {
      updateRect();
    });
    resizeObserver.observe(node);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, []);

  const nodes = React.useMemo(() => {
    const filtered = rows.filter((row) => (row.valueOd ?? 0) > 0);

    return filtered.map((row, index) => {
      const anomaly = getAnomalyInfo(row.valueOd, row.valueReverse);
      return {
        ...row,
        name: anomaly.flagged ? `! ${row.label}` : row.label,
        fullName: row.label,
        value: Number(row.valueOd ?? 0),
        reverseValue: Number(row.valueReverse ?? 0),
        valuePrev: Number(row.valuePrev ?? 0),
        shareValue: row.shareValue ?? null,
        anomalyType: anomaly.isUnder ? "under" : anomaly.isOver ? "over" : null,
        anomalyFlagged: anomaly.flagged,
        fill: TREEMAP_PALETTE[index % TREEMAP_PALETTE.length]
      } satisfies TreemapNodeData;
    });
  }, [rows]);

  const handleDownload = React.useCallback(() => {
    const svg = wrapperRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const encodedSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    void downloadComposedPng({
      imageUrl: encodedSvg,
      filename,
      title: exportTitle,
      subtitle: exportSubtitle,
      footer: exportFooter
    });
  }, [exportFooter, exportSubtitle, exportTitle, filename]);

  React.useEffect(() => {
    onRegisterDownload?.(handleDownload);
    return () => onRegisterDownload?.(null);
  }, [handleDownload, onRegisterDownload]);

  if (!rows.length) {
    return (
      <div
        className="relative overflow-visible [&_.recharts-responsive-container]:overflow-visible [&_.recharts-surface]:overflow-visible [&_.recharts-wrapper]:overflow-visible"
        style={{ height }}
      >
        <EmptyStatePanel
          compact
          title="Treemap belum tersedia"
          description="Data produk belum tersedia untuk filter perdagangan yang aktif."
          className="h-full"
        />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="relative z-0 overflow-visible [&_.recharts-responsive-container]:overflow-visible [&_.recharts-surface]:overflow-visible [&_.recharts-wrapper]:overflow-visible"
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={nodes}
          dataKey="value"
          stroke="#fff"
          isAnimationActive={false}
          content={<TreemapNode />}
        >
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.12)" }}
            wrapperStyle={{
              zIndex: 2600,
              pointerEvents: "none",
              overflow: "visible"
            }}
            allowEscapeViewBox={{ x: true, y: true }}
            content={
              <TreemapTooltip
                unitLabel={unitLabel}
                year={year}
                previousYear={previousYear}
                containerRect={containerRect}
              />
            }
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
