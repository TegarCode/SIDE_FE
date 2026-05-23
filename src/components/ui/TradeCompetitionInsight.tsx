import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { Select } from "@/components/ui/Form/Select";
import { InsightStatCard } from "@/components/ui/InsightStatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  DiplomasiCountryValueItem,
  DiplomasiExportProductInsightItem,
  SelectOption
} from "@/type/indonesiaDiplomasi";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { cn } from "@/utils/cn";

type ViewerVariant = "panel" | "modal";

type TradeCompetitionInsightProps = {
  variant?: ViewerVariant;
  title: string;
  products: DiplomasiExportProductInsightItem[];
  productOptions: SelectOption[];
  selectedHs: string | null;
  activeHs?: string | null;
  onSelectHs: (hs: string) => void;
  latestYear: number | null;
  unitLabel: string;
  sourceLabel?: string | null;
  competitorSourceLabel?: string | null;
  loading?: boolean;
  hsLoading?: boolean;
  emptyMessage?: string;
  titlePrefixPrimary?: string;
  titlePrefixGlobal?: string;
  titlePrefixAsean?: string;
  listYearLabel?: number | null;
  topDestinationLabel?: string;
  yearCardTitle?: string;
  valueCardTitle?: string;
  shareCardTitle?: string;
  showPrimaryList?: boolean;
  showItemShare?: boolean;
  showHeader?: boolean;
  showProductSelect?: boolean;
  showSearchButton?: boolean;
  onSearch?: () => void;
  searchLoading?: boolean;
  searchDisabled?: boolean;
  errorMessage?: string | null;
  onRegisterDownload?: (handler: (() => void) | null) => void;
};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function isIndonesia(item: DiplomasiCountryValueItem) {
  const alpha2 = item.alpha2?.toUpperCase() ?? "";
  const alpha3 = item.alpha3?.toUpperCase() ?? "";
  const country = item.country.toUpperCase();
  return alpha2 === "ID" || alpha3 === "IDN" || country.includes("INDONESIA");
}

function CompetitionListSkeleton({
  title,
  showUnit = true
}: {
  title: string;
  showUnit?: boolean;
  unitLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-40 rounded-full" />
          {showUnit ? <Skeleton className="h-4 w-18 rounded-full" /> : null}
        </div>
      </div>
      <div className="space-y-2 p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`${title}-skeleton-${index}`}
            className="flex items-center justify-between gap-2.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-7 w-9 rounded-sm" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
            </div>
            <div className="space-y-1 text-right">
              <Skeleton className="ml-auto h-3.5 w-18 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TradeCompetitionInsight({
  variant = "panel",
  title,
  products,
  productOptions,
  selectedHs,
  activeHs,
  onSelectHs,
  latestYear,
  unitLabel,
  sourceLabel,
  competitorSourceLabel,
  loading = false,
  hsLoading = false,
  emptyMessage = "Data persaingan produk belum tersedia.",
  titlePrefixPrimary = "Tujuan Ekspor INDONESIA",
  titlePrefixGlobal = "Tujuan Ekspor Utama ke",
  titlePrefixAsean = "Tujuan Ekspor ASEAN ke",
  listYearLabel = null,
  topDestinationLabel = "Top Tujuan",
  yearCardTitle = "Tahun",
  valueCardTitle = "Nilai",
  shareCardTitle = "Pangsa",
  showPrimaryList = true,
  showItemShare = false,
  showHeader = true,
  showProductSelect = true,
  showSearchButton = false,
  onSearch,
  searchLoading = false,
  searchDisabled = false,
  errorMessage,
  onRegisterDownload
}: TradeCompetitionInsightProps) {
  const activeProduct = React.useMemo(
    () =>
      products.find((product) => product.hs === (activeHs ?? selectedHs)) ??
      null,
    [activeHs, products, selectedHs]
  );
  const fallbackSelectedOption = React.useMemo(
    () => productOptions.find((option) => option.value === selectedHs) ?? null,
    [productOptions, selectedHs]
  );
  const topDestination = activeProduct?.tujuanEkspor[0] ?? null;
  const sourceFooter =
    competitorSourceLabel && competitorSourceLabel !== sourceLabel
      ? `Sumber: ${sourceLabel ?? "-"} | Kompetitor: ${competitorSourceLabel}`
      : `Sumber: ${sourceLabel ?? "-"}`;
  const activeValue =
    latestYear != null ? (activeProduct?.nilai[latestYear] ?? 0) : 0;
  const activeShare =
    latestYear != null ? (activeProduct?.share[latestYear] ?? 0) : 0;
  const selectedOption = React.useMemo(() => {
    if (activeProduct) {
      return (
        productOptions.find((option) => option.value === activeProduct.hs) ?? {
          value: activeProduct.hs,
          label: `HS ${activeProduct.hs} - ${activeProduct.name}`
        }
      );
    }
    return fallbackSelectedOption;
  }, [activeProduct, fallbackSelectedOption, productOptions]);
  const withYearLabel = React.useCallback(
    (heading: string) =>
      listYearLabel != null ? `${heading} ${listYearLabel}` : heading,
    [listYearLabel]
  );

  const downloadRows = React.useMemo(() => {
    const sections: Array<{
      title: string;
      items: DiplomasiCountryValueItem[];
    }> = [
      {
        title: `${titlePrefixPrimary} (${unitLabel})`,
        items: activeProduct?.tujuanEkspor ?? []
      },
      {
        title: `${titlePrefixGlobal} ${topDestination?.country ?? "-"} (${unitLabel})`,
        items: activeProduct?.kompetitorGlobalTopTujuanEkspor ?? []
      },
      {
        title: `${titlePrefixAsean} ${topDestination?.country ?? "-"} (${unitLabel})`,
        items: activeProduct?.kompetitorAseanTopTujuanEkspor ?? []
      }
    ];

    return sections.flatMap((section) =>
      section.items.map((item, index) => ({
        kategori: section.title,
        rank: item.rank ?? index + 1,
        negara: item.country,
        kode_alpha3: item.alpha3 ?? "-",
        nilai: item.nilai
      }))
    );
  }, [
    activeProduct,
    titlePrefixAsean,
    titlePrefixGlobal,
    titlePrefixPrimary,
    topDestination?.country,
    unitLabel
  ]);

  const handleDownload = React.useCallback(() => {
    if (!activeProduct) return;
    downloadTableAsExcel({
      title,
      subtitle: `HS ${activeProduct.hs} - ${activeProduct.name} | Tahun: ${latestYear ?? "-"} | Unit: ${unitLabel}`,
      source: sourceFooter.replace(/^Sumber:\s*/i, ""),
      columns: [
        {
          key: "kategori",
          label: "Kategori",
          selector: (row: Record<string, string | number>) => row.kategori
        },
        {
          key: "rank",
          label: "Ranking",
          selector: (row: Record<string, string | number>) => row.rank,
          numeric: true
        },
        {
          key: "negara",
          label: "Negara",
          selector: (row: Record<string, string | number>) => row.negara
        },
        {
          key: "kode_alpha3",
          label: "Kode",
          selector: (row: Record<string, string | number>) => row.kode_alpha3
        },
        {
          key: "nilai",
          label: `Nilai (${unitLabel})`,
          selector: (row: Record<string, string | number>) => row.nilai,
          numeric: true
        }
      ],
      rows: downloadRows,
      filename: `${title.replace(/\s+/g, "_")}_HS_${activeProduct.hs}_${latestYear ?? "-"}`,
      sheetName: "Competition"
    });
  }, [activeProduct, downloadRows, latestYear, sourceFooter, title, unitLabel]);

  React.useEffect(() => {
    onRegisterDownload?.(handleDownload);
    return () => onRegisterDownload?.(null);
  }, [handleDownload, onRegisterDownload]);

  const renderList = (
    heading: string,
    items: DiplomasiCountryValueItem[],
    opts?: {
      competitor?: boolean;
      highlightIndonesia?: boolean;
      emptyMessage?: string;
      showUnit?: boolean;
    }
  ) => (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">
          {opts?.showUnit === false
            ? withYearLabel(heading)
            : `${withYearLabel(heading)} (${unitLabel})`}
        </h3>
      </div>
      <div className="space-y-2 p-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
            {opts?.emptyMessage ?? "Tidak ada data."}
          </div>
        ) : (
          items.map((item, index) => {
            const highlight = opts?.highlightIndonesia && isIndonesia(item);
            return (
              <div
                key={`${heading}-${item.alpha3 ?? item.country}-${index}`}
                className={cn(
                  "flex items-center justify-between gap-2.5 rounded-md border px-2.5 py-1.5 transition",
                  highlight
                    ? "border-emerald-200 bg-emerald-50/60"
                    : opts?.competitor
                      ? "border-slate-200 bg-slate-50/70"
                      : "border-slate-200 bg-white"
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-[12px] font-bold text-slate-700 ring-1 ring-slate-200">
                    {item.rank ?? index + 1}
                  </div>
                  <CountryFlag
                    alpha2={item.alpha2}
                    countryName={item.country}
                    className="h-7 w-9 rounded-none bg-transparent text-[22px] ring-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {item.country}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{item.alpha3 ?? "-"}</span>
                      {highlight ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Indonesia
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="px-2.5 py-1.5 text-right">
                  <p className="tabular-nums text-[14px] font-semibold text-slate-900">
                    {formatNumber(item.nilai)}
                  </p>
                  {showItemShare && item.share != null ? (
                    <p className="text-[11px] text-slate-500">
                      {item.share.toFixed(2)}%
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("w-full space-y-4", variant === "modal" && "space-y-5")}>
      <div
        className={cn(
          "flex flex-col gap-3",
          variant === "modal" ? "w-full" : "xl:gap-4"
        )}
      >
        <div className="min-w-0 flex-1">
          {showHeader ? (
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {title}
              </h3>
              {activeProduct ? (
                <p className="mt-1 text-xs text-slate-500">{`HS ${activeProduct.hs} - ${activeProduct.name}`}</p>
              ) : null}
            </div>
          ) : null}
          {showProductSelect ? (
            <div className={cn(showHeader ? "mt-3" : "")}>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Pilih produk
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Select
                  options={productOptions}
                  value={selectedOption?.value ?? null}
                  onChange={onSelectHs}
                  placeholder={
                    hsLoading ? "Memuat produk..." : "Pilih produk..."
                  }
                  isLoading={hsLoading}
                  noOptionsMessage="Produk tidak ditemukan"
                  className="min-w-0 flex-1"
                />
                {showSearchButton ? (
                  <Button
                    type="button"
                    onClick={onSearch}
                    disabled={searchDisabled || searchLoading}
                    variant="primary"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <span>{searchLoading ? "Mencari..." : "Cari"}</span>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "grid gap-3 sm:grid-cols-2",
            variant === "modal"
              ? "w-full xl:grid-cols-4 2xl:grid-cols-5"
              : "xl:grid-cols-4"
          )}
        >
          <InsightStatCard
            title="Produk HS"
            value={
              <p className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                {activeProduct?.hs ?? "-"}
              </p>
            }
            badge="HS"
            description={
              <p className="line-clamp-2">{activeProduct?.name ?? "-"}</p>
            }
            className={cn(variant === "modal" && "p-5")}
          />
          <InsightStatCard
            title={yearCardTitle}
            value={
              <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                {latestYear ?? "-"}
              </p>
            }
            badge="Aktif"
            className={cn(variant === "modal" && "p-5")}
          />
          <InsightStatCard
            title={valueCardTitle}
            value={
              <p className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                {formatNumber(activeValue)}
              </p>
            }
            badge={unitLabel}
            progress={70}
            className={cn(variant === "modal" && "p-5")}
          />
          {variant === "modal" ? (
            <InsightStatCard
              title={shareCardTitle}
              value={
                <p className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  {activeShare.toFixed(2)}%
                </p>
              }
              badge="Share"
              progress={Math.max(8, Math.min(100, activeShare))}
              className="p-5"
            />
          ) : null}
          <InsightStatCard
            title={topDestinationLabel}
            className={cn(variant === "modal" && "p-5")}
          >
            <div className="mt-3 flex items-start gap-3">
              <CountryFlag
                alpha2={topDestination?.alpha2}
                countryName={topDestination?.country}
                className={cn(
                  "shrink-0 rounded-none bg-transparent ring-0",
                  variant === "modal"
                    ? "h-10 w-14 text-[32px]"
                    : "h-8 w-11 text-[26px]"
                )}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate font-semibold tracking-[-0.03em] text-slate-900",
                    variant === "modal" ? "text-lg" : "text-base"
                  )}
                >
                  {topDestination?.country ?? "-"}
                </p>
                <p
                  className={cn(
                    "mt-1 text-slate-500",
                    variant === "modal" ? "text-xs" : "text-[11px]"
                  )}
                >
                  {topDestination?.alpha3 ?? "-"}
                </p>
              </div>
            </div>
          </InsightStatCard>
        </div>
      </div>

      {loading || searchLoading ? (
        <div className="space-y-4">
          <div
            className={cn(
              "grid gap-4",
              variant === "modal" ? "xl:grid-cols-3" : "lg:grid-cols-3"
            )}
          >
            <CompetitionListSkeleton
              title={titlePrefixPrimary}
              unitLabel={unitLabel}
            />
            <CompetitionListSkeleton
              title={titlePrefixGlobal}
              unitLabel={unitLabel}
            />
            <CompetitionListSkeleton
              title={titlePrefixAsean}
              unitLabel={unitLabel}
            />
          </div>
        </div>
      ) : errorMessage ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      ) : !activeProduct ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <>
          <div
            className={cn(
              "grid gap-4",
              variant === "modal"
                ? showPrimaryList
                  ? "xl:grid-cols-3"
                  : "xl:grid-cols-2"
                : showPrimaryList
                  ? "lg:grid-cols-3"
                  : "lg:grid-cols-2"
            )}
          >
            {showPrimaryList
              ? renderList(titlePrefixPrimary, activeProduct.tujuanEkspor, {
                  highlightIndonesia: true
                })
              : null}
            {renderList(
              `${titlePrefixGlobal} ${topDestination?.country ?? "-"}`,
              activeProduct.kompetitorGlobalTopTujuanEkspor,
              {
                competitor: true,
                highlightIndonesia: true,
                emptyMessage: "Data pada tahun tersebut belum tersedia."
              }
            )}
            {renderList(
              `${titlePrefixAsean} ${topDestination?.country ?? "-"}`,
              activeProduct.kompetitorAseanTopTujuanEkspor,
              {
                competitor: true,
                highlightIndonesia: true,
                emptyMessage: "Data pada tahun tersebut belum tersedia."
              }
            )}
          </div>
        </>
      )}

      <p className="text-right text-[11px] text-slate-500">{sourceFooter}</p>
    </div>
  );
}
