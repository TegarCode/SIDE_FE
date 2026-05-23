import React from "react";
import { APP_NAME } from "@/constants/app";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { Select } from "@/components/ui/Form/Select";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import {
  useAnalisisGeopolitikPerdaganganQuery,
  useAnalisisGeopolitikPerdaganganYearsQuery
} from "@/hooks/analisis/useAnalisisGeopolitikPerdaganganQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { AnalisisGeopolitikTopCountriesSection } from "@/components/analisis/geopolitik-perdagangan/AnalisisGeopolitikTopCountriesSection";
import { AnalisisGeopolitikComparisonSection } from "@/components/analisis/geopolitik-perdagangan/AnalisisGeopolitikComparisonSection";
import { AnalisisGeopolitikTopProductsSection } from "@/components/analisis/geopolitik-perdagangan/AnalisisGeopolitikTopProductsSection";
import { isUnauthorizedApiError } from "@/utils/apiError";

const GEOPOLITIK_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-analisis-geopolitik-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini menampilkan analisis geopolitik perdagangan Indonesia, termasuk negara utama, komparasi, dan produk utama."
  },
  {
    selector: '[data-analisis-geopolitik-tour="year-filter"]',
    title: "Filter tahun",
    description:
      "Pilih tahun untuk mengganti seluruh analisis geopolitik perdagangan sesuai periode yang ingin dilihat."
  },
  {
    selector: '[data-analisis-geopolitik-tour="top-countries"]',
    title: "Negara utama",
    description:
      "Bagian ini menampilkan negara geopolitik utama untuk ekspor dan impor pada tahun yang dipilih."
  },
  {
    selector: '[data-analisis-geopolitik-tour="comparison-section"]',
    title: "Komparasi produk",
    description:
      "Gunakan section ini untuk membandingkan posisi Indonesia dengan negara-negara geopolitik pada kelompok produk utama."
  },
  {
    selector: '[data-analisis-geopolitik-tour="top-products"]',
    title: "Produk utama",
    description:
      "Bagian ini menampilkan daftar produk utama ekspor dan impor yang paling dominan pada tahun terpilih."
  }
];

export function AnalisisGeopolitikPerdaganganPage() {
  useDocumentTitle(`Geopolitik & Perdagangan | ${APP_NAME}`);
  const { toast, dismiss } = useToast();
  const yearsQuery = useAnalisisGeopolitikPerdaganganYearsQuery();
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const yearsLoadingToastIdRef = React.useRef<string | null>(null);
  const yearsSuccessShownRef = React.useRef(false);
  const yearsErrorKeyRef = React.useRef<string>("");

  React.useEffect(() => {
    if (selectedYear != null) return;
    const years = yearsQuery.data ?? [];
    if (!years.length) return;
    setSelectedYear(years[years.length - 1] ?? null);
  }, [selectedYear, yearsQuery.data]);

  React.useEffect(() => {
    if (yearsQuery.isFetching) {
      if (yearsLoadingToastIdRef.current) return;
      yearsLoadingToastIdRef.current = toast({
        title: "Memuat tahun geopolitik perdagangan",
        description: "Daftar tahun geopolitik perdagangan sedang diambil.",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (yearsLoadingToastIdRef.current) {
      dismiss(yearsLoadingToastIdRef.current);
      yearsLoadingToastIdRef.current = null;
    }
  }, [dismiss, toast, yearsQuery.isFetching]);

  React.useEffect(() => {
    if (
      yearsQuery.isFetching ||
      !yearsQuery.isSuccess ||
      !(yearsQuery.data ?? []).length
    )
      return;
    if (yearsSuccessShownRef.current) return;

    yearsSuccessShownRef.current = true;
    yearsErrorKeyRef.current = "";
    toast({
      title: "Daftar tahun siap",
      description: "Daftar tahun geopolitik perdagangan berhasil dimuat.",
      tone: "success",
      durationMs: 2200
    });
  }, [toast, yearsQuery.data, yearsQuery.isFetching, yearsQuery.isSuccess]);

  React.useEffect(() => {
    const errorMessage =
      yearsQuery.error instanceof Error
        ? yearsQuery.error.message
        : yearsQuery.error
          ? "Terjadi kesalahan saat memuat daftar tahun geopolitik perdagangan."
          : "";
    if (!errorMessage || yearsErrorKeyRef.current === errorMessage) return;

    yearsErrorKeyRef.current = errorMessage;
    toast({
      title: "Daftar tahun gagal dimuat",
      description: errorMessage,
      tone: "error"
    });
  }, [toast, yearsQuery.error]);

  const geopolitikQuery = useAnalisisGeopolitikPerdaganganQuery(
    selectedYear,
    selectedYear != null
  );
  const hasUnauthorizedError =
    isUnauthorizedApiError(yearsQuery.error) ||
    isUnauthorizedApiError(geopolitikQuery.error);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastSuccessKeyRef = React.useRef<string>("");
  const lastErrorKeyRef = React.useRef<string>("");
  const requestToastKey = `analisis-geopolitik-${selectedYear ?? "none"}`;

  React.useEffect(() => {
    if (geopolitikQuery.isFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Memuat geopolitik perdagangan",
        description: "Data geopolitik perdagangan sedang diambil.",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [dismiss, geopolitikQuery.isFetching, toast]);

  React.useEffect(() => {
    if (
      geopolitikQuery.isFetching ||
      !geopolitikQuery.isSuccess ||
      !geopolitikQuery.data
    )
      return;
    if (lastSuccessKeyRef.current === requestToastKey) return;

    lastSuccessKeyRef.current = requestToastKey;
    lastErrorKeyRef.current = "";
    toast({
      title: "Geopolitik perdagangan siap",
      description: "Data geopolitik perdagangan berhasil dimuat.",
      tone: "success",
      durationMs: 2200
    });
  }, [
    geopolitikQuery.data,
    geopolitikQuery.isFetching,
    geopolitikQuery.isSuccess,
    requestToastKey,
    toast
  ]);

  React.useEffect(() => {
    const errorMessage =
      geopolitikQuery.error instanceof Error
        ? geopolitikQuery.error.message
        : geopolitikQuery.error
          ? "Terjadi kesalahan saat memuat geopolitik perdagangan."
          : "";
    const errorKey = `${requestToastKey}:${errorMessage}`;
    if (!errorMessage || lastErrorKeyRef.current === errorKey) return;

    lastErrorKeyRef.current = errorKey;
    toast({
      title: "Geopolitik perdagangan gagal dimuat",
      description: errorMessage,
      tone: "error"
    });
  }, [geopolitikQuery.error, requestToastKey, toast]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data geopolitik perdagangan tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  const yearOptions = React.useMemo(
    () =>
      (yearsQuery.data ?? []).map((year) => ({
        value: String(year),
        label: String(year)
      })),
    [yearsQuery.data]
  );
  const data = geopolitikQuery.data;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-analisis-geopolitik-tour="page-title">
          <PageTitle
            title="Geopolitik & Perdagangan"
            description="Analisis terpadu ekspor-impor seluruh produk Indonesia, komparasi terhadap dunia, posisi global, dan benchmark lima negara geopolitik."
            actions={
              <div
                className="w-full sm:w-48"
                data-analisis-geopolitik-tour="year-filter"
              >
                <p className="mb-1 text-xs font-medium text-slate-600">Tahun</p>
                <Select
                  value={selectedYear == null ? null : String(selectedYear)}
                  options={yearOptions}
                  onChange={(value) => setSelectedYear(Number(value))}
                  isLoading={yearsQuery.isLoading}
                  isDisabled={geopolitikQuery.isFetching}
                  isSearchable={false}
                />
              </div>
            }
          />
        </div>

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data geopolitik perdagangan memerlukan sesi login yang aktif"
            body="Permintaan ke layanan geopolitik perdagangan menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat negara utama, komparasi, dan produk utama."
          />
        ) : (
          <>
            <div data-analisis-geopolitik-tour="top-countries">
              <AnalisisGeopolitikTopCountriesSection
                exportRows={data?.topGeoCountries.export ?? []}
                importRows={data?.topGeoCountries.import ?? []}
                year={data?.meta.year ?? selectedYear}
                previousYear={data?.meta.previousYear ?? null}
                unitLabel={data?.meta.unit ?? "Ribu US$"}
                sourceName={data?.meta.sourceName ?? null}
                loading={
                  geopolitikQuery.isLoading || geopolitikQuery.isFetching
                }
              />
            </div>

            <div data-analisis-geopolitik-tour="comparison-section">
              <AnalisisGeopolitikComparisonSection
                exportRows={data?.comparisonProducts.export ?? []}
                importRows={data?.comparisonProducts.import ?? []}
                geoCountries={data?.meta.geoCountries ?? []}
                year={data?.meta.year ?? selectedYear}
                previousYear={data?.meta.previousYear ?? null}
                unitLabel={data?.meta.unit ?? "Ribu US$"}
                sourceName={data?.meta.sourceName ?? null}
                loading={
                  geopolitikQuery.isLoading || geopolitikQuery.isFetching
                }
              />
            </div>

            <div data-analisis-geopolitik-tour="top-products">
              <AnalisisGeopolitikTopProductsSection
                exportRows={data?.top20Products.export ?? []}
                importRows={data?.top20Products.import ?? []}
                geoCountries={data?.meta.geoCountries ?? []}
                year={data?.meta.year ?? selectedYear}
                unitLabel={data?.meta.unit ?? "Ribu US$"}
                sourceName={data?.meta.sourceName ?? null}
                topProductsLimit={data?.meta.topProductsLimit ?? 20}
                loading={
                  geopolitikQuery.isLoading || geopolitikQuery.isFetching
                }
              />
            </div>
          </>
        )}
      </div>
      <GuidedTour
        steps={GEOPOLITIK_TOUR_STEPS}
        storageKey="side-analisis-geopolitik-tour-completed"
      />
    </div>
  );
}
