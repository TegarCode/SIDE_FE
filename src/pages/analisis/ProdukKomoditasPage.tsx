import { APP_NAME } from "@/constants/app";
import { AnalisisProdukKomoditasTableSection } from "@/components/analisis/produk-komoditas/AnalisisProdukKomoditasTableSection";
import { OriginSingleDestinationMultiFiltersPanel } from "@/components/filters/OriginSingleDestinationMultiFiltersPanel";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { useAnalisisProdukKomoditasQuery } from "@/hooks/analisis/useAnalisisProdukKomoditasQuery";
import { useMitraMasterQuery } from "@/hooks/mitra/useMitraMasterQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import React from "react";
import { isUnauthorizedApiError } from "@/utils/apiError";
import type { OriginSingleDestinationMultiFilterValue } from "@/validators/originSingleDestinationMultiFilters";

const PRODUK_KOMODITAS_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-analisis-produk-komoditas-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini menampilkan produk ekspor utama dan analisis kompetitor untuk negara asal dan tujuan yang dipilih."
  },
  {
    selector: '[data-analisis-produk-komoditas-tour="filters-panel"]',
    title: "Filter negara asal dan tujuan",
    description:
      "Pilih negara asal dan satu atau beberapa tujuan untuk memperbarui tabel komoditas ekspor utama."
  },
  {
    selector: '[data-analisis-produk-komoditas-tour="table-section"]',
    title: "Tabel komoditas",
    description:
      "Bagian ini menampilkan daftar komoditas ekspor utama beserta analisis kompetitor sesuai filter aktif. Klik row kompetitor untuk menampilkan negara kompetitornya."
  }
];

function buildDefaultFilters(
  countryOptions: Array<{
    value: string;
    regionValue: string | null;
    subregionValue: string | null;
  }>
): OriginSingleDestinationMultiFilterValue {
  const indonesia = countryOptions.find((item) => item.value === "IDN") ?? null;

  return {
    origin: {
      region: indonesia?.regionValue ?? null,
      subregion: indonesia?.subregionValue ?? null,
      country: indonesia?.value ?? "IDN"
    },
    destinations: ["CHN"]
  };
}

export function AnalisisProdukKomoditasPage() {
  useDocumentTitle(`Komoditas Ekspor Utama | ${APP_NAME}`);
  const { toast, dismiss } = useToast();
  const masterQuery = useMitraMasterQuery();
  const [filters, setFilters] =
    React.useState<OriginSingleDestinationMultiFilterValue>({
      origin: {
        region: null,
        subregion: null,
        country: "IDN"
      },
      destinations: ["CHN"]
    });

  React.useEffect(() => {
    const countryOptions = masterQuery.data?.countryOptions;
    if (!countryOptions?.length) return;

    setFilters((current) => {
      const defaults = buildDefaultFilters(countryOptions);
      const currentOriginExists = countryOptions.some(
        (item) => item.value === current.origin.country
      );

      if (
        currentOriginExists &&
        current.origin.country === defaults.origin.country &&
        current.origin.region === defaults.origin.region &&
        current.origin.subregion === defaults.origin.subregion
      ) {
        return current;
      }

      if (
        currentOriginExists &&
        current.origin.country &&
        current.origin.region &&
        current.origin.subregion
      ) {
        return current;
      }

      return {
        origin: {
          region: defaults.origin.region,
          subregion: defaults.origin.subregion,
          country: currentOriginExists
            ? (current.origin.country ?? defaults.origin.country)
            : defaults.origin.country
        },
        destinations:
          current.destinations.length > 0
            ? current.destinations
            : defaults.destinations
      };
    });
  }, [masterQuery.data?.countryOptions]);

  const handleReset = React.useCallback(() => {
    setFilters(buildDefaultFilters(masterQuery.data?.countryOptions ?? []));
  }, [masterQuery.data?.countryOptions]);

  const analisisQuery = useAnalisisProdukKomoditasQuery({
    origin: filters.origin.country,
    dest: filters.destinations,
    enabled: Boolean(filters.origin.country) && filters.destinations.length > 0
  });
  const hasUnauthorizedError =
    isUnauthorizedApiError(masterQuery.error) ||
    isUnauthorizedApiError(analisisQuery.error);
  const requestToastKey = React.useMemo(() => {
    const originKey = filters.origin.country ?? "none";
    const destKey =
      filters.destinations.length > 0 ? filters.destinations.join("|") : "none";
    return `analisis-komoditas-${originKey}-${destKey}`;
  }, [filters.destinations, filters.origin.country]);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastSuccessKeyRef = React.useRef<string>("");
  const lastErrorKeyRef = React.useRef<string>("");

  React.useEffect(() => {
    if (analisisQuery.isFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Memuat komoditas ekspor utama",
        description: "Data komoditas ekspor utama sedang diambil.",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [analisisQuery.isFetching, dismiss, toast]);

  React.useEffect(() => {
    if (
      analisisQuery.isFetching ||
      !analisisQuery.isSuccess ||
      !analisisQuery.data
    )
      return;
    if (lastSuccessKeyRef.current === requestToastKey) return;

    lastSuccessKeyRef.current = requestToastKey;
    lastErrorKeyRef.current = "";
    toast({
      title: "Komoditas ekspor utama siap",
      description: "Data komoditas ekspor utama berhasil dimuat.",
      tone: "success",
      durationMs: 2200
    });
  }, [
    analisisQuery.data,
    analisisQuery.isFetching,
    analisisQuery.isSuccess,
    requestToastKey,
    toast
  ]);

  React.useEffect(() => {
    const errorMessage =
      analisisQuery.error instanceof Error
        ? analisisQuery.error.message
        : analisisQuery.error
          ? "Terjadi kesalahan saat memuat komoditas ekspor utama."
          : "";
    const errorKey = `${requestToastKey}:${errorMessage}`;
    if (!errorMessage || lastErrorKeyRef.current === errorKey) return;

    lastErrorKeyRef.current = errorKey;
    toast({
      title: "Komoditas ekspor utama gagal dimuat",
      description: errorMessage,
      tone: "error"
    });
  }, [analisisQuery.error, requestToastKey, toast]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data komoditas ekspor utama tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-analisis-produk-komoditas-tour="page-title">
          <PageTitle
            title="Komoditas Ekspor Utama"
            description="Data produk ekspor utama dari suatu negara ke negara lainnya dan analisis kompetitor utamanya."
          />
        </div>

        <div data-analisis-produk-komoditas-tour="filters-panel">
          <OriginSingleDestinationMultiFiltersPanel
            regionOptions={masterQuery.data?.regionOptions ?? []}
            subregionOptions={masterQuery.data?.subregionOptions ?? []}
            countryOptions={masterQuery.data?.countryOptions ?? []}
            value={filters}
            loading={masterQuery.isLoading}
            requestLoading={masterQuery.isFetching}
            onSubmit={setFilters}
            onReset={handleReset}
            title="Filter Negara Asal dan Tujuan"
            description="Pilih negara asal secara bertingkat dan tentukan negara tujuan dengan mode geo/group. Klik header untuk membuka atau menutup filter."
            originDefaultCountry="IDN"
            destinationDefaultValues={["CHN"]}
          />
        </div>

        <div data-analisis-produk-komoditas-tour="table-section">
          {hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Data komoditas ekspor utama memerlukan sesi login yang aktif"
              body="Permintaan ke layanan analisis komoditas menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat tabel dan analisis kompetitornya."
            />
          ) : (
            <AnalisisProdukKomoditasTableSection
              data={analisisQuery.data ?? null}
              loading={analisisQuery.isLoading || analisisQuery.isFetching}
              errorMessage={
                analisisQuery.error instanceof Error
                  ? analisisQuery.error.message
                  : analisisQuery.error
                    ? "Terjadi kesalahan saat memuat komoditas ekspor utama."
                    : null
              }
            />
          )}
        </div>
      </div>
      <GuidedTour
        steps={PRODUK_KOMODITAS_TOUR_STEPS}
        storageKey="side-analisis-produk-komoditas-tour-completed"
      />
    </div>
  );
}
