import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";
import type { DiplomasiSummaryCardView } from "@/type/indonesiaDiplomasi";

const TONE = {
  orange: {
    bg: "bg-orange-200",
    text: "text-orange-900",
    ring: "ring-orange-300"
  },
  purple: {
    bg: "bg-purple-200",
    text: "text-purple-900",
    ring: "ring-purple-300"
  },
  emerald: {
    bg: "bg-emerald-200",
    text: "text-emerald-900",
    ring: "ring-emerald-300"
  },
  rose: { bg: "bg-rose-200", text: "text-rose-900", ring: "ring-rose-300" },
  blue: { bg: "bg-blue-200", text: "text-blue-900", ring: "ring-blue-300" },
  sky: { bg: "bg-sky-200", text: "text-sky-900", ring: "ring-sky-300" },
  cyan: { bg: "bg-cyan-200", text: "text-cyan-900", ring: "ring-cyan-300" },
  amber: { bg: "bg-amber-200", text: "text-amber-900", ring: "ring-amber-300" },
  slate: { bg: "bg-slate-100", text: "text-slate-900", ring: "ring-slate-300" }
} as const;

function resolveTone(tone: DiplomasiSummaryCardView["tone"]) {
  if (
    tone === "emerald" ||
    tone === "orange" ||
    tone === "purple" ||
    tone === "rose" ||
    tone === "blue" ||
    tone === "sky" ||
    tone === "cyan" ||
    tone === "amber" ||
    tone === "slate"
  ) {
    return tone;
  }
  return "orange";
}

function formatNumberNoRound(input: number | string | null) {
  if (input == null || input === "") return null;

  let value =
    typeof input === "number" || typeof input === "bigint"
      ? String(input)
      : String(input).trim();
  value = value.replace(/\s+/g, "");

  const hasDot = value.includes(".");
  const hasComma = value.includes(",");
  if (hasDot && hasComma) {
    const lastDot = value.lastIndexOf(".");
    const lastComma = value.lastIndexOf(",");
    if (lastComma > lastDot) {
      value = value.replace(/\./g, "").replace(",", ".");
    } else {
      value = value.replace(/,/g, "");
    }
  } else if (!hasDot && hasComma) {
    const parts = value.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      value = `${parts[0]}.${parts[1]}`;
    } else {
      value = value.replace(/,/g, "");
    }
  } else {
    const dotParts = value.split(".");
    if (
      dotParts.length > 1 &&
      dotParts.slice(1).every((item) => item.length === 3)
    ) {
      value = value.replace(/\./g, "");
    }
  }

  if (/e/i.test(value)) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return value;
    value = numeric.toFixed(20).replace(/\.?0+$/, "");
  }

  const negative = value.startsWith("-");
  if (negative) value = value.slice(1);

  const [intRaw] = value.split(".");
  const intFormatted = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}${intFormatted}`;
}

function toNumeric(value: number | string | null) {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatValueWithUnit(value: number | string | null) {
  if (value == null) return "-";
  const numeric = toNumeric(value);
  if (numeric === 0) return "N/A";
  const body = formatNumberNoRound(value);
  return body == null ? "-" : body;
}

function useYoY(
  value: number | string | null,
  prevValue: number | string | null
) {
  return React.useMemo(() => {
    const v = toNumeric(value);
    const p = toNumeric(prevValue);
    if (v == null || p == null || v === 0 || p === 0) {
      return { pct: null, delta: null, sign: "flat" as const };
    }
    const delta = v - p;
    const pct = delta / p;
    return {
      pct,
      delta,
      sign:
        delta > 0
          ? ("up" as const)
          : delta < 0
            ? ("down" as const)
            : ("flat" as const)
    };
  }, [value, prevValue]);
}

function formatPctNoSign(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "?";
  return `${(Math.abs(value) * 100).toFixed(2)}%`;
}

function formatSignedValue(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "-";
  const sign = value >= 0 ? "+" : "-";
  const body = formatNumberNoRound(Math.abs(value));
  return body == null ? "-" : `${sign}${body}`;
}

function yoySymbol(sign: "up" | "down" | "flat") {
  if (sign === "up") return "▲";
  if (sign === "down") return "▼";
  return "";
}

function yoySymbolClassName(sign: "up" | "down" | "flat") {
  if (sign === "up") return "text-emerald-700";
  if (sign === "down") return "text-rose-700";
  return "text-slate-600";
}

function isHighlightProduct(card: DiplomasiSummaryCardView) {
  if (card.highlightType === "product") return true;
  if (card.highlightType === "country") return false;
  const value = card.highlight?.trim() ?? "";
  if (!value) return false;
  if (/^HS\s*\d+/i.test(value)) return true;
  if (/^[A-Z\s\-()]{2,20}$/.test(value)) return false;
  return true;
}

function SummaryCardSkeleton({
  tone
}: {
  tone: DiplomasiSummaryCardView["tone"];
}) {
  const resolvedTone = resolveTone(tone);
  const palette = TONE[resolvedTone];
  return (
    <div
      className={cn(
        "h-full rounded-2xl p-3 shadow-sm ring-1 ring-inset",
        palette.bg,
        palette.text,
        palette.ring
      )}
    >
      <div className="space-y-2 animate-pulse">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-40 rounded bg-black/10" />
          <div className="h-4 w-12 rounded bg-black/10" />
        </div>
        <div className="h-7 w-40 rounded bg-black/10" />
        <div className="h-3 w-44 rounded bg-black/10" />
      </div>
    </div>
  );
}

export type SummaryCardProps = {
  card: DiplomasiSummaryCardView;
  loading?: boolean;
};

export function SummaryCard({ card, loading = false }: SummaryCardProps) {
  const [open, setOpen] = React.useState(false);
  const tone = resolveTone(card.tone);
  const palette = TONE[tone];
  const { pct, sign, delta } = useYoY(card.value, card.prevValue);
  const currentNumeric = toNumeric(card.value);
  const prevNumeric = toNumeric(card.prevValue);
  const isValueMissing = card.value == null || currentNumeric === 0;
  const isPrevMissing = card.prevValue == null;
  const product = isHighlightProduct(card);
  const hasPrevValue = card.prevValue != null;
  const hasPrevComparison =
    prevNumeric != null &&
    prevNumeric !== 0 &&
    currentNumeric != null &&
    currentNumeric !== 0;

  const missingNowText = `Data tahun ${card.year ?? "ini"} belum tersedia dari sumber terkait.`;
  const missingPrevText = `Data tahun ${card.prevYear ?? "lalu"} belum tersedia dari sumber terkait.`;
  const missingNowTextShort = `Data tahun ${card.year ?? "ini"} belum tersedia.`;
  const missingPrevTextShort = `Data ${card.prevYear ?? "lalu"} belum tersedia.`;

  const pillClassName =
    sign === "up"
      ? "bg-emerald-100 text-emerald-700 ring-emerald-300"
      : sign === "down"
        ? "bg-rose-100 text-rose-700 ring-rose-300"
        : "bg-slate-100 text-slate-700 ring-slate-300";

  if (loading) return <SummaryCardSkeleton tone={card.tone} />;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col gap-2 rounded-2xl p-3 shadow-sm ring-1 ring-inset",
        palette.bg,
        palette.text,
        palette.ring
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div
            className="wrap-break-word text-[12px] font-semibold leading-snug"
            title={card.title}
          >
            {card.title}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {card.unit ? (
            <span className="inline-flex h-5 items-center rounded-full bg-white/60 px-1.5 text-[10px] font-semibold ring-1 ring-black/10">
              {card.unit}
            </span>
          ) : null}
          <button
            type="button"
            className="rounded-md p-1 hover:bg-black/5"
            aria-label="Stat detail"
            title="Detail"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <InformationCircleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {isValueMissing ? (
          <div className="space-y-1 pt-1">
            <div className="text-[14px] font-semibold leading-snug tracking-tight">
              {missingNowTextShort}
            </div>
          </div>
        ) : card.highlight ? (
          <>
            <div
              className="truncate text-[17px] font-bold leading-tight tracking-tight sm:text-[20px]"
              title={String(card.highlight)}
            >
              {product
                ? String(card.highlight)
                : String(card.highlight).toUpperCase()}
            </div>
            <div className="flex items-center text-[16px]">
              <span className="font-bold">
                {formatValueWithUnit(card.value)}
              </span>
            </div>
            {!hasPrevComparison && card.note ? (
              <div className="pt-1 text-[12px] font-medium opacity-90">
                {card.note}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="text-[20px] font-bold leading-6 tracking-tight">
              {formatValueWithUnit(card.value)}
            </div>
            {currentNumeric === 0 ? (
              <div className="text-[12px] italic leading-snug opacity-80">
                {missingNowTextShort}
              </div>
            ) : null}
          </>
        )}

        {hasPrevValue ? (
          <div className="flex items-center gap-1.5">
            {hasPrevComparison ? (
              <span
                className={cn(
                  "inline-flex h-5 items-center gap-1 rounded-full px-1.5 text-[11px] font-semibold ring-1 ring-inset",
                  pillClassName
                )}
              >
                {yoySymbol(sign)}
                {formatPctNoSign(pct)}
              </span>
            ) : (
              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-slate-100 px-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-300">
                N/A
              </span>
            )}
            <span className="text-[11px] opacity-80">
              dari {card.prevYear ?? "tahun lalu"}
            </span>
          </div>
        ) : null}

        {hasPrevValue ? (
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px]">
            <span className="opacity-70">Sebelumnya: </span>
            {card.prevHighlight ? (
              <>
                <span
                  className="font-semibold align-middle"
                  title={String(card.prevHighlight)}
                >
                  {product
                    ? String(card.prevHighlight)
                    : String(card.prevHighlight).toUpperCase()}
                </span>
                <span className="mx-1 opacity-60">|</span>
              </>
            ) : null}
            {isPrevMissing ? (
              <span className="italic opacity-80">{missingPrevTextShort}</span>
            ) : (
              <span className="font-semibold">
                {formatValueWithUnit(card.prevValue)}
              </span>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-auto pt-0.5 text-right text-[10px] italic opacity-80">
        {card.sourceName || "-"}
      </div>

      {open ? (
        <div
          role="tooltip"
          className="absolute right-2 top-7 z-50 w-[min(92vw,300px)] rounded-lg border border-black/10 bg-white/95 p-3 text-[11px] text-slate-800 shadow-xl backdrop-blur"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="mb-1 text-xs font-semibold">Rincian Statistik</div>
          {card.note ? <div className="mb-1">{card.note}</div> : null}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="opacity-70">
              {card.year ? `Tahun ${card.year}` : "Tahun aktif"}
            </div>
            <div className="text-right font-semibold">
              {isValueMissing
                ? missingNowText
                : formatValueWithUnit(card.value)}
            </div>

            <div className="opacity-70">
              {card.prevYear ? `Tahun ${card.prevYear}` : "Tahun sebelumnya"}
            </div>
            <div className="text-right font-semibold">
              {isPrevMissing
                ? missingPrevText
                : formatValueWithUnit(card.prevValue)}
            </div>

            <div className="opacity-70">
              Perubahan {card.prevYear ?? "sebelumnya"} ke{" "}
              {card.year ?? "aktif"}
            </div>
            <div
              className={cn(
                "text-right font-semibold",
                yoySymbolClassName(sign)
              )}
            >{`${yoySymbol(sign)}${formatPctNoSign(pct)}`}</div>

            <div className="opacity-70">Selisih absolut</div>
            <div className="text-right font-semibold">
              {formatSignedValue(delta)}
            </div>

            {card.highlight ? (
              <>
                <div className="opacity-70">
                  {product ? "Produk" : "Negara/Entitas"}{" "}
                  {card.year ? `(${card.year})` : ""}
                </div>
                <div className="text-right font-semibold">
                  {product
                    ? String(card.highlight)
                    : String(card.highlight).toUpperCase()}
                </div>
              </>
            ) : null}

            {card.prevHighlight ? (
              <>
                <div className="opacity-70">
                  {product ? "Produk" : "Negara/Entitas"}{" "}
                  {card.prevYear ? `(${card.prevYear})` : ""}
                </div>
                <div className="text-right font-semibold">
                  {product
                    ? String(card.prevHighlight)
                    : String(card.prevHighlight).toUpperCase()}
                </div>
              </>
            ) : null}

            <div className="opacity-70">Sumber</div>
            <div className="text-right font-semibold">
              {card.sourceName || "-"}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
