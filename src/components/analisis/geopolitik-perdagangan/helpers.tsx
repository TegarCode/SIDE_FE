import type { ReactNode } from "react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import type {
  AnalisisGeopolitikCountryMeta,
  AnalisisGeopolitikProductItem,
  AnalisisGeopolitikTopCountryRow
} from "@/type/analisis";

export function formatNumber(value: number, digits = 0) {
  return Number(value || 0).toLocaleString("id-ID", {
    maximumFractionDigits: digits
  });
}

export function formatPercent(value: number | null, digits = 2) {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(digits)}%`;
}

export function formatSignedPercent(value: number | null, digits = 2) {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

function shortDesc(label: string) {
  return label.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(" ");
}

function normCode(value: string | null | undefined) {
  return String(value ?? "").toUpperCase();
}

function isWorld(codeAlpha3: string | null | undefined) {
  return normCode(codeAlpha3) === "WLD";
}

export function buildTopGeoRaw(
  rows: AnalisisGeopolitikTopCountryRow[],
  year: number | null,
  previousYear: number | null
) {
  return {
    items: rows.map((item) => ({
      kode_alpha2: item.codeAlpha2,
      kode_alpha3: item.codeAlpha3,
      negara: item.name,
      nilai_perdagangan: {
        ...(previousYear != null
          ? { [previousYear]: item.previousValue ?? 0 }
          : {}),
        ...(year != null ? { [year]: item.currentValue } : {})
      },
      proporsi: {
        ...(previousYear != null
          ? { [previousYear]: item.previousShare ?? 0 }
          : {}),
        ...(year != null ? { [year]: item.currentShare ?? 0 } : {})
      }
    }))
  };
}

export function buildCompareBarOption(
  rows: AnalisisGeopolitikProductItem[],
  seriesMeta: AnalisisGeopolitikCountryMeta[],
  {
    year,
    previousYear,
    unitLabel
  }: {
    year: number | null;
    previousYear: number | null;
    unitLabel: string;
  }
) {
  const categories = rows.map(
    (row) => `${row.hs} (${shortDesc(row.productName)})`
  );
  const normalizedSeries = seriesMeta.filter((item) => item.codeAlpha3);

  return {
    animationDuration: 700,
    animationEasing: "cubicOut",
    grid: { top: 56, right: 18, bottom: 96, left: 56, containLabel: true },
    tooltip: {
      trigger: "item",
      appendToBody: true,
      backgroundColor: "rgba(15,23,42,0.9)",
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      textStyle: { color: "#fff", fontSize: 11 },
      formatter: (payload: {
        dataIndex?: number;
        seriesName?: string;
        data?: {
          value?: number;
          prevValue?: number;
          share?: number | null;
          previousShare?: number | null;
        };
      }) => {
        const row = payload.dataIndex == null ? null : rows[payload.dataIndex];
        if (!row) return "";
        const current = Number(payload.data?.value ?? 0);
        const previous = Number(payload.data?.prevValue ?? 0);
        const delta =
          previous !== 0
            ? ((current - previous) / Math.abs(previous)) * 100
            : null;

        return `
          <div style="min-width:220px">
            <div style="font-weight:700;margin-bottom:6px">${payload.seriesName ?? "-"}</div>
            <div style="margin-bottom:4px">${row.hs} (${shortDesc(row.productName)})</div>
            <div>Nilai ${year ?? "-"}: <b>${formatNumber(current)}</b> (${unitLabel})</div>
            <div>Nilai ${previousYear ?? "-"}: <b>${formatNumber(previous)}</b> (${unitLabel})</div>
            <div>Pangsa ${year ?? "-"}: <b>${formatPercent(payload.data?.share ?? null)}</b></div>
            <div>Pangsa ${previousYear ?? "-"}: <b>${formatPercent(payload.data?.previousShare ?? null)}</b></div>
            <div>Perubahan: <b>${formatSignedPercent(delta)}</b></div>
          </div>
        `;
      }
    },
    legend: {
      bottom: 4,
      left: "center",
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 10,
      textStyle: { color: "#475569", fontSize: 10 },
      data: normalizedSeries.map((item) => item.name)
    },
    xAxis: {
      type: "category",
      data: categories,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { color: "#475569", fontSize: 10 }
    },
    yAxis: {
      type: "value",
      splitNumber: 5,
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: {
        color: "#475569",
        fontSize: 10,
        formatter: (value: number) => formatNumber(value)
      }
    },
    series: normalizedSeries.map((item, index) => ({
      name: item.name,
      type: "bar",
      data: rows.map((row) => {
        if (isWorld(item.codeAlpha3)) {
          return {
            value: row.worldCurrentValue,
            prevValue: row.worldPreviousValue,
            share: 100,
            previousShare: 100
          };
        }

        const metric = row.countryMetrics.find(
          (entry) => normCode(entry.codeAlpha3) === normCode(item.codeAlpha3)
        );
        return {
          value: metric?.value ?? 0,
          prevValue: metric?.previousValue ?? 0,
          share: metric?.share ?? 0,
          previousShare: metric?.previousShare ?? 0
        };
      }),
      itemStyle: {
        color: [
          "#2563eb",
          "#94a3b8",
          "#0f766e",
          "#7c3aed",
          "#dc2626",
          "#ea580c",
          "#1d4ed8"
        ][index % 7],
        borderRadius: [2, 2, 2, 2],
        shadowBlur: 4,
        shadowColor: "rgba(0,0,0,0.04)"
      },
      emphasis: { focus: "series" }
    })),
    barGap: "8%",
    barCategoryGap: "24%"
  };
}

export type GeopolitikTop20TableRow = {
  no: number;
  hs: string;
  productName: string;
  worldValue: number;
  countryMetrics: Record<string, { value: number; share: number | null }>;
  rankList: string;
};

export function buildTop20Rows(
  items: AnalisisGeopolitikProductItem[],
  geoCountries: AnalisisGeopolitikCountryMeta[]
) {
  return items.map((item, index) => ({
    no: index + 1,
    hs: item.hs,
    productName: item.productName,
    worldValue: item.worldCurrentValue,
    countryMetrics: Object.fromEntries(
      geoCountries
        .filter((country) => !isWorld(country.codeAlpha3))
        .map((country) => {
          const metric = item.countryMetrics.find(
            (entry) =>
              normCode(entry.codeAlpha3) === normCode(country.codeAlpha3)
          );
          return [
            normCode(country.codeAlpha3),
            {
              value: metric?.value ?? 0,
              share: metric?.share ?? 0
            }
          ];
        })
    ),
    rankList: item.rankList
  }));
}

export function buildTop20Columns(
  geoCountries: AnalisisGeopolitikCountryMeta[]
): Array<{
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  className?: string;
}> {
  const world = geoCountries.find((country) => isWorld(country.codeAlpha3));
  const countries = geoCountries.filter(
    (country) => !isWorld(country.codeAlpha3)
  );

  return [
    {
      key: "no",
      label: "No",
      align: "center",
      headerClassName: "min-w-12 sticky left-0 z-30 bg-slate-100",
      className: "min-w-12 sticky left-0 z-10 bg-white"
    },
    {
      key: "product",
      label: "HS Produk",
      headerClassName: "min-w-96 sticky left-12 z-20 bg-slate-100",
      className: "min-w-96 sticky left-12 z-10 bg-white"
    },
    {
      key: "worldValue",
      label: world?.name || "Dunia",
      align: "right",
      headerClassName: "min-w-40",
      className: "min-w-40"
    },
    ...countries.map((country) => ({
      key: country.codeAlpha3,
      label: `${country.name} (nilai|pangsa)`,
      align: "right" as const,
      headerClassName: "min-w-44",
      className: "min-w-44"
    })),
    {
      key: "rankList",
      label: "Rank Negara",
      headerClassName: "min-w-80",
      className: "min-w-80"
    }
  ];
}

export function renderCountryName(
  codeAlpha2: string | null,
  name: string
): ReactNode {
  return (
    <div className="flex items-center gap-2">
      {codeAlpha2 ? (
        <CountryFlag
          alpha2={codeAlpha2}
          countryName={name}
          className="h-9 w-9 border-0 text-xl shadow-none"
        />
      ) : null}
      <span className="font-medium text-slate-800">{name}</span>
    </div>
  );
}
