import React from "react";
import { APP_NAME } from "@/constants/app";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { RegionCountryEntityFiltersPanel } from "@/components/filters/RegionCountryEntityFiltersPanel";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { AnalisisOperationalRiskOverviewSection } from "@/components/analisis/operational-risk/AnalisisOperationalRiskOverviewSection";
import { AnalisisOperationalRiskIndicatorDetailSection } from "@/components/analisis/operational-risk/AnalisisOperationalRiskIndicatorDetailSection";
import { useAnalisisOperationalRiskQuery } from "@/hooks/analisis/useAnalisisOperationalRiskQuery";
import { useCommonCountriesQuery } from "@/hooks/indonesia/useCountryGeoQueries";
import { normalizeCountriesFromCommon } from "@/service/mitra/master";
import { isUnauthorizedApiError } from "@/utils/apiError";
import type { MitraFilterState, MitraSubregionOption } from "@/type/mitra";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { SelectOption } from "@/type/indonesiaDiplomasi";

const OPERATIONAL_RISK_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-analisis-operational-risk-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini menampilkan persebaran skor risiko operasional dan rincian indikator untuk negara terpilih."
  },
  {
    selector: '[data-analisis-operational-risk-tour="filters-panel"]',
    title: "Filter negara",
    description:
      "Pilih region, subregion, dan negara untuk memuat skor operational risk sesuai wilayah yang ingin dianalisis."
  },
  {
    selector: '[data-analisis-operational-risk-tour="overview-section"]',
    title: "Overview risiko",
    description:
      "Bagian ini menampilkan ringkasan skor risiko operasional dan gambaran umum negara yang sedang dipilih."
  },
  {
    selector: '[data-analisis-operational-risk-tour="indicator-detail"]',
    title: "Detail indikator",
    description:
      "Section ini menampilkan rincian skor per indikator agar Anda bisa melihat komponen risiko secara lebih detail."
  }
];

export function AnalisisOperationalRiskPage() {
  useDocumentTitle(`Risiko Operasional | ${APP_NAME}`);
  const { toast, dismiss } = useToast();
  const countriesQuery = useCommonCountriesQuery();
  const [filters, setFilters] = React.useState<MitraFilterState>({
    region: null,
    subregion: null,
    country: null
  });

  const countryOptions = React.useMemo(
    () => normalizeCountriesFromCommon(countriesQuery.data ?? []),
    [countriesQuery.data]
  );
  const regionOptions = React.useMemo<SelectOption[]>(() => {
    const seen = new Set<string>();
    return countryOptions
      .map((item) => item.regionValue)
      .filter((value): value is string => Boolean(value))
      .filter((value) => {
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      })
      .map((value) => ({ value, label: value }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "id-ID", { sensitivity: "base" })
      );
  }, [countryOptions]);
  const subregionOptions = React.useMemo<MitraSubregionOption[]>(() => {
    const seen = new Set<string>();
    return (countriesQuery.data ?? [])
      .filter(
        (
          item
        ): item is typeof item & { wilayahId: string; wilayahNama: string } =>
          Boolean(item.wilayahId && item.wilayahNama)
      )
      .filter((item) => {
        const key = `${item.dirjenNama ?? ""}::${item.wilayahId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((item) => ({
        value: item.wilayahId,
        label: item.wilayahNama,
        regionValue: item.dirjenNama ?? ""
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "id-ID", { sensitivity: "base" })
      );
  }, [countriesQuery.data]);

  React.useEffect(() => {
    if (!countryOptions.length || filters.country) return;
    const indonesia =
      countryOptions.find((item) => item.value === "IDN") ?? null;
    if (!indonesia) return;
    setFilters({
      region: null,
      subregion: null,
      country: indonesia.value
    });
  }, [countryOptions, filters.country]);

  const operationalRiskQuery = useAnalisisOperationalRiskQuery(
    filters.country,
    Boolean(filters.country)
  );
  const hasUnauthorizedError =
    isUnauthorizedApiError(countriesQuery.error) ||
    isUnauthorizedApiError(operationalRiskQuery.error);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastSuccessKeyRef = React.useRef("");
  const lastErrorKeyRef = React.useRef("");
  const requestKey = `operational-risk:${filters.country ?? "none"}`;

  React.useEffect(() => {
    if (operationalRiskQuery.isFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Memuat risiko operasional",
        description: "Data risiko operasional sedang diambil.",
        tone: "loading",
        durationMs: null
      });
      return;
    }
    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [dismiss, operationalRiskQuery.isFetching, toast]);

  React.useEffect(() => {
    if (
      operationalRiskQuery.isFetching ||
      !operationalRiskQuery.isSuccess ||
      !operationalRiskQuery.data
    )
      return;
    if (lastSuccessKeyRef.current === requestKey) return;
    lastSuccessKeyRef.current = requestKey;
    lastErrorKeyRef.current = "";
    toast({
      title: "Risiko operasional siap",
      description: "Data risiko operasional berhasil dimuat.",
      tone: "success",
      durationMs: 2200
    });
  }, [
    operationalRiskQuery.data,
    operationalRiskQuery.isFetching,
    operationalRiskQuery.isSuccess,
    requestKey,
    toast
  ]);

  React.useEffect(() => {
    const errorMessage =
      operationalRiskQuery.error instanceof Error
        ? operationalRiskQuery.error.message
        : operationalRiskQuery.error
          ? "Terjadi kesalahan saat memuat risiko operasional."
          : "";
    const errorKey = `${requestKey}:${errorMessage}`;
    if (!errorMessage || lastErrorKeyRef.current === errorKey) return;
    lastErrorKeyRef.current = errorKey;
    toast({
      title: "Risiko operasional gagal dimuat",
      description: errorMessage,
      tone: "error"
    });
  }, [operationalRiskQuery.error, requestKey, toast]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data risiko operasional tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-analisis-operational-risk-tour="page-title">
          <PageTitle
            title="Risiko Operasional"
            description="Persebaran skor operational risk (total per negara) dan rincian skor per indikator untuk negara terpilih."
          />
        </div>

        <div data-analisis-operational-risk-tour="filters-panel">
          <RegionCountryEntityFiltersPanel
            regionOptions={regionOptions}
            subregionOptions={subregionOptions}
            countryOptions={countryOptions}
            value={filters}
            loading={countriesQuery.isLoading}
            requestLoading={operationalRiskQuery.isFetching}
            onSubmit={setFilters}
            onReset={() => {
              const indonesia =
                countryOptions.find((item) => item.value === "IDN") ?? null;
              setFilters({
                region: null,
                subregion: null,
                country: indonesia?.value ?? null
              });
            }}
          />
        </div>

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data risiko operasional memerlukan sesi login yang aktif"
            body="Permintaan ke layanan operational risk menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat overview dan detail indikator."
          />
        ) : (
          <>
            <div data-analisis-operational-risk-tour="overview-section">
              <AnalisisOperationalRiskOverviewSection
                data={operationalRiskQuery.data ?? null}
                loading={
                  operationalRiskQuery.isLoading ||
                  operationalRiskQuery.isFetching
                }
              />
            </div>

            <div data-analisis-operational-risk-tour="indicator-detail">
              <AnalisisOperationalRiskIndicatorDetailSection
                data={operationalRiskQuery.data ?? null}
                loading={
                  operationalRiskQuery.isLoading ||
                  operationalRiskQuery.isFetching
                }
              />
            </div>
          </>
        )}
      </div>
      <GuidedTour
        steps={OPERATIONAL_RISK_TOUR_STEPS}
        storageKey="side-analisis-operational-risk-tour-completed"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
