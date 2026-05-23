import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import type { DiplomasiTabPanelProps } from "@/components/indonesia/diplomasi/tabs/types";
import { NILAI_PERDAGANGAN_MAP_BUCKETS } from "@/constants/indonesiaDiplomasi";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { MapHeatLayer } from "@/components/ui/MapHeatLayer";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import { MultiLineTrendChart } from "@/components/ui/charts/MultiLineTrendChart";
import { PartnerMixedChart } from "@/components/ui/charts/PartnerMixedChart";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { MapSkeleton } from "@/components/ui/skeletons/MapSkeleton";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { DiplomasiItemRecord } from "@/type/indonesiaDiplomasi";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumberSeries(value: unknown): Record<number, number> {
  if (!isRecord(value)) return {};
  const out: Record<number, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    const year = Number(key);
    const num = Number(raw);
    if (Number.isFinite(year) && Number.isFinite(num)) out[year] = num;
  }
  return out;
}

function parseItems(raw: unknown): DiplomasiItemRecord[] {
  if (!isRecord(raw)) return [];
  const candidates: unknown[] = [
    raw.items,
    raw.data,
    isRecord(raw.data) ? raw.data.items : null,
    isRecord(raw.data) && isRecord(raw.data.data) ? raw.data.data.items : null
  ];
  const list = candidates.find((value) => Array.isArray(value)) as
    | unknown[]
    | undefined;
  if (!list) return [];

  return list
    .filter(isRecord)
    .map((item) => ({
      country:
        (typeof item.negara === "string" && item.negara.trim()) ||
        (typeof item.country === "string" && item.country.trim()) ||
        "-",
      alpha3: typeof item.kode_alpha3 === "string" ? item.kode_alpha3 : null,
      nilai: asNumberSeries(item.nilai_perdagangan ?? item.nilai),
      neraca: asNumberSeries(item.neraca)
    }))
    .filter((item) => Object.keys(item.nilai).length > 0);
}

function hasIso2Field(row: Record<string, unknown>) {
  return Boolean(
    row.id_alpha2 ??
    row.kode_alpha2 ??
    row.alpha2 ??
    row.iso2 ??
    row.iso_a2 ??
    row.ISO_A2
  );
}

function toArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord);
}

function extractMapData(raw: unknown): Array<Record<string, unknown>> {
  if (!isRecord(raw)) return [];

  const candidates = [
    raw.items,
    raw.rows,
    raw.data,
    isRecord(raw.data) ? raw.data.items : null,
    isRecord(raw.data) && isRecord(raw.data.data) ? raw.data.data.items : null,
    isRecord(raw.payload) ? raw.payload.items : null
  ];

  for (const candidate of candidates) {
    const arr = toArray(candidate);
    if (arr.some(hasIso2Field)) return arr;
  }

  const queue: unknown[] = Object.values(raw);
  while (queue.length > 0) {
    const current = queue.shift();
    const arr = toArray(current);
    if (arr.some(hasIso2Field)) return arr;
    if (isRecord(current)) queue.push(...Object.values(current));
  }

  return [];
}

function extractUnitLabel(raw: unknown) {
  if (!isRecord(raw)) return "Ribu US$";

  const read = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  const data = isRecord(raw.data) ? raw.data : null;
  const meta = isRecord(raw.meta)
    ? raw.meta
    : data && isRecord(data.meta)
      ? data.meta
      : null;

  const candidates: unknown[] = [
    raw.unit,
    raw.unitLabel,
    raw.satuan,
    raw.satuan_nilai,
    raw.currency,
    data?.unit,
    data?.unitLabel,
    data?.satuan,
    data?.satuan_nilai,
    data?.currency,
    meta?.unit,
    meta?.unitLabel,
    meta?.satuan,
    meta?.satuan_nilai,
    meta?.currency
  ];

  for (const candidate of candidates) {
    const value = read(candidate);
    if (value) return value;
  }

  return "Ribu US$";
}

export function NilaiPerdaganganTab({
  overview,
  loading,
  error,
  periodLabel
}: DiplomasiTabPanelProps) {
  const [sortColumnLabel, setSortColumnLabel] =
    React.useState<string>("tahun terbaru");
  const [produkSortColumnLabel, setProdukSortColumnLabel] =
    React.useState<string>("tahun terbaru");
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const [produkDownloadHandler, setProdukDownloadHandler] = React.useState<
    (() => void) | null
  >(null);

  const raw = overview?.raw ?? null;
  const unitLabel = React.useMemo(() => extractUnitLabel(raw), [raw]);

  const items = React.useMemo(() => parseItems(raw), [raw]);

  const yearsAsc = React.useMemo(() => {
    const all = new Set<number>();
    for (const item of items) {
      for (const year of Object.keys(item.nilai)) {
        const value = Number(year);
        if (Number.isFinite(value)) all.add(value);
      }
    }
    return Array.from(all).sort((a, b) => a - b);
  }, [items]);

  const sourceLabel = React.useMemo(() => {
    if (!isRecord(raw)) return null;
    const meta = isRecord(raw.meta)
      ? raw.meta
      : isRecord(raw.data) && isRecord(raw.data.meta)
        ? raw.data.meta
        : null;
    if (!meta) return null;
    if (typeof meta.sumber === "string" && meta.sumber.trim())
      return meta.sumber.trim();
    if (typeof meta.source === "string" && meta.source.trim())
      return meta.source.trim();
    return null;
  }, [raw]);

  const totals = React.useMemo(() => {
    const trade: number[] = [];
    const ekspor: number[] = [];
    const impor: number[] = [];
    const neraca: number[] = [];

    for (const year of yearsAsc) {
      let totalTrade = 0;
      let totalBalance = 0;
      for (const item of items) {
        totalTrade += item.nilai[year] ?? 0;
        totalBalance += item.neraca[year] ?? 0;
      }
      trade.push(totalTrade);
      neraca.push(totalBalance);
      ekspor.push((totalTrade + totalBalance) / 2);
      impor.push((totalTrade - totalBalance) / 2);
    }

    return { trade, ekspor, impor, neraca };
  }, [items, yearsAsc]);

  const timeSeries = React.useMemo(
    () => [
      { label: "Nilai Perdagangan", values: totals.trade },
      { label: "Nilai Ekspor", values: totals.ekspor },
      { label: "Nilai Impor", values: totals.impor },
      { label: "Nilai Neraca", values: totals.neraca }
    ],
    [totals]
  );

  const extrasByYear = React.useMemo(() => {
    const out: Record<number, { delta?: number }> = {};
    for (let idx = 0; idx < yearsAsc.length; idx += 1) {
      if (idx === 0) continue;
      const current = totals.trade[idx] ?? 0;
      const prev = totals.trade[idx - 1] ?? 0;
      if (prev !== 0)
        out[yearsAsc[idx]] = { delta: ((current - prev) / prev) * 100 };
    }
    return out;
  }, [totals.trade, yearsAsc]);

  const topPartners = React.useMemo(() => {
    const latestYear = yearsAsc[yearsAsc.length - 1];
    if (!latestYear) return [];
    return [...items]
      .sort((a, b) => (b.nilai[latestYear] ?? 0) - (a.nilai[latestYear] ?? 0))
      .slice(0, 5);
  }, [items, yearsAsc]);

  const partnerSeries = React.useMemo(
    () =>
      topPartners.map((partner) => ({
        name: partner.country,
        export: yearsAsc.map(
          (year) =>
            ((partner.nilai[year] ?? 0) + (partner.neraca[year] ?? 0)) / 2
        ),
        import: yearsAsc.map(
          (year) =>
            ((partner.nilai[year] ?? 0) - (partner.neraca[year] ?? 0)) / 2
        ),
        balance: yearsAsc.map((year) => partner.neraca[year] ?? 0)
      })),
    [topPartners, yearsAsc]
  );

  const handleRegisterDownload = React.useCallback(
    (handler: (() => void) | null) => {
      if (!handler) {
        setDownloadHandler(null);
        return;
      }
      setDownloadHandler(() => handler);
    },
    []
  );

  const handleRegisterProdukDownload = React.useCallback(
    (handler: (() => void) | null) => {
      if (!handler) {
        setProdukDownloadHandler(null);
        return;
      }
      setProdukDownloadHandler(() => handler);
    },
    []
  );

  const tableCaption = React.useMemo(
    () =>
      `${periodLabel} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel}`,
    [periodLabel, sortColumnLabel, unitLabel]
  );
  const produkTableCaption = React.useMemo(
    () =>
      `${periodLabel} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${produkSortColumnLabel}`,
    [periodLabel, produkSortColumnLabel, unitLabel]
  );
  const mapData = React.useMemo(() => extractMapData(raw), [raw]);
  const showLoadingLayout = loading || (!error && !overview);
  const shouldShowEmptyFallback = !showLoadingLayout && yearsAsc.length === 0;

  return (
    <div className="space-y-4">
      {showLoadingLayout ? (
        <>
          <section className="space-y-4">
            <div className="grid items-stretch gap-4 xl:grid-cols-[1.8fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Peta Nilai Perdagangan Indonesia
                </h3>
                <p className="text-xs text-slate-500">Memuat data peta...</p>
                <div className="mt-4">
                  <MapSkeleton />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Top Mitra Nilai Perdagangan Indonesia
                </h3>
                <p className="text-xs text-slate-500">Memuat data tabel...</p>
                <div className="mt-4">
                  <TableSkeleton rows={8} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Time Series Nilai Perdagangan Indonesia
                </h3>
                <p className="text-xs text-slate-500">
                  Memuat visualisasi tren...
                </p>
                <div className="mt-4">
                  <ChartSkeleton />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Top Produk Nilai Perdagangan Indonesia
                </h3>
                <p className="text-xs text-slate-500">Memuat data tabel...</p>
                <div className="mt-4">
                  <TableSkeleton rows={8} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold tracking-tight text-slate-900">
                Komparasi Tren Perdagangan Indonesia
              </h3>
              <p className="text-xs text-slate-500">
                Memuat visualisasi komparasi...
              </p>
              <div className="mt-4">
                <ChartSkeleton />
              </div>
            </div>
          </section>
        </>
      ) : error ? (
        <FilterFallbackCard
          title="Bagian lanjutan belum tersedia"
          body={error}
        />
      ) : shouldShowEmptyFallback ? (
        <FilterFallbackCard
          title="Bagian lanjutan belum tersedia"
          body="Data time series belum tersedia untuk filter aktif."
        />
      ) : (
        <>
          <section className="space-y-4">
            {overview?.metrics.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {overview.metrics.slice(0, 4).map((metric) => (
                  <div
                    key={metric.key}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <p className="text-xs text-slate-500">{metric.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid items-stretch gap-4 xl:grid-cols-[1.8fr_1fr]">
              <ExpandableCard
                title="Peta Nilai Perdagangan Indonesia"
                subtitle={`${periodLabel} | Unit: ${unitLabel}`}
                className="min-w-0 h-full"
                expandLabel="Perbesar peta"
                modalSize="full"
                expandedContent={
                  <MapHeatLayer
                    key={`nilai-perdagangan-${periodLabel}-expanded`}
                    className="w-full h-[72vh]"
                    data={mapData}
                    title="Peta Nilai Perdagangan Indonesia"
                    unitLabel={unitLabel}
                    currencyPrefix={unitLabel}
                    geojsonUrl="/assets/world-countries.geojson"
                    hideBalance={false}
                    seriesAccessors={{
                      value: "nilai_perdagangan",
                      balance: "neraca",
                      proportion: "proporsi",
                      proportion_balance: "proporsi_neraca"
                    }}
                    customBuckets={[...NILAI_PERDAGANGAN_MAP_BUCKETS]}
                    noDataColor="#f1f5f9"
                  />
                }
              >
                <div className="flex h-full flex-col">
                  <MapHeatLayer
                    key={`nilai-perdagangan-${periodLabel}`}
                    className="w-full h-56 sm:h-72 lg:h-120"
                    data={mapData}
                    title="Peta Nilai Perdagangan Indonesia"
                    unitLabel={unitLabel}
                    currencyPrefix={unitLabel}
                    geojsonUrl="/assets/world-countries.geojson"
                    hideBalance={false}
                    seriesAccessors={{
                      value: "nilai_perdagangan",
                      balance: "neraca",
                      proportion: "proporsi",
                      proportion_balance: "proporsi_neraca"
                    }}
                    customBuckets={[...NILAI_PERDAGANGAN_MAP_BUCKETS]}
                    noDataColor="#f1f5f9"
                  />
                  {sourceLabel ? (
                    <p className="mt-auto text-right text-[11px] text-slate-500">
                      Sumber: {sourceLabel}
                    </p>
                  ) : null}
                </div>
              </ExpandableCard>

              <ExpandableCard
                title="Top Mitra Nilai Perdagangan Indonesia"
                subtitle={tableCaption}
                actions={
                  <IconTooltip label="Unduh Excel">
                    <span>
                      <Button
                        type="button"
                        disabled={!downloadHandler}
                        onClick={() => downloadHandler?.()}
                        className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
                        aria-label="Unduh Excel"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </span>
                  </IconTooltip>
                }
                className="min-w-0 h-full min-h-115"
                contentClassName="flex h-full flex-col"
                expandLabel="Perbesar tabel"
                modalSize="full"
                expandedContent={
                  <TopMitraTable
                    raw={raw}
                    unitLabel={unitLabel}
                    expanded
                    onSortColumnChange={setSortColumnLabel}
                    onRegisterDownload={handleRegisterDownload}
                  />
                }
              >
                <div className="flex h-full flex-col">
                  <div className="min-h-0 flex-1">
                    <TopMitraTable
                      raw={raw}
                      unitLabel={unitLabel}
                      onSortColumnChange={setSortColumnLabel}
                      onRegisterDownload={handleRegisterDownload}
                    />
                  </div>
                  {sourceLabel ? (
                    <p className="mt-auto text-right text-[11px] text-slate-500">
                      Sumber: {sourceLabel}
                    </p>
                  ) : null}
                </div>
              </ExpandableCard>
            </div>
          </section>

          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
              <ExpandableCard
                title="Time Series Nilai Perdagangan Indonesia"
                subtitle={`${periodLabel} | Unit: ${unitLabel}`}
                className="min-w-0 min-h-144"
                modalSize="full"
                expandedContent={
                  <MultiLineTrendChart
                    key={`ts-expanded-${periodLabel}-${yearsAsc.join("-")}`}
                    series={timeSeries}
                    years={yearsAsc}
                    unit={unitLabel}
                    extrasByYear={extrasByYear}
                    height={720}
                  />
                }
                contentClassName="flex h-full flex-col gap-3"
              >
                <div className="h-130">
                  <MultiLineTrendChart
                    key={`ts-${periodLabel}-${yearsAsc.join("-")}`}
                    series={timeSeries}
                    years={yearsAsc}
                    unit={unitLabel}
                    extrasByYear={extrasByYear}
                    height={520}
                  />
                </div>
                {sourceLabel ? (
                  <p className="mt-auto text-right text-[11px] text-slate-500">
                    Sumber: {sourceLabel}
                  </p>
                ) : null}
              </ExpandableCard>

              <ExpandableCard
                title="Top Produk Nilai Perdagangan Indonesia"
                subtitle={produkTableCaption}
                className="min-w-0 min-h-144"
                modalSize="full"
                contentClassName="flex h-full flex-col gap-3"
                actions={
                  <IconTooltip label="Unduh Excel">
                    <span>
                      <Button
                        type="button"
                        disabled={!produkDownloadHandler}
                        onClick={() => produkDownloadHandler?.()}
                        className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
                        aria-label="Unduh Excel Top Produk"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </span>
                  </IconTooltip>
                }
                expandedContent={
                  <TopProdukTable
                    raw={raw}
                    unitLabel={unitLabel}
                    expanded
                    onSortColumnChange={setProdukSortColumnLabel}
                  />
                }
              >
                <div className="h-130">
                  <TopProdukTable
                    raw={raw}
                    unitLabel={unitLabel}
                    onRegisterDownload={handleRegisterProdukDownload}
                    onSortColumnChange={setProdukSortColumnLabel}
                  />
                </div>
                {sourceLabel ? (
                  <p className="mt-auto text-right text-[11px] text-slate-500">
                    Sumber: {sourceLabel}
                  </p>
                ) : null}
              </ExpandableCard>
            </div>

            <ExpandableCard
              title="Komparasi Tren Perdagangan Indonesia"
              subtitle={`Top 5 negara/entitas - ${periodLabel} | Unit: ${unitLabel}`}
              className="min-w-0 min-h-144"
              modalSize="full"
              expandedContent={
                <PartnerMixedChart
                  years={yearsAsc}
                  partners={partnerSeries}
                  unit={unitLabel}
                  height={720}
                />
              }
              contentClassName="flex h-full flex-col gap-3"
            >
              <div className="min-h-0 flex-1">
                <PartnerMixedChart
                  years={yearsAsc}
                  partners={partnerSeries}
                  unit={unitLabel}
                  height={480}
                />
              </div>
              {sourceLabel ? (
                <p className="mt-auto text-right text-[11px] text-slate-500">
                  Sumber: {sourceLabel}
                </p>
              ) : null}
            </ExpandableCard>
          </section>
        </>
      )}
    </div>
  );
}
