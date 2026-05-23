import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { APP_NAME } from "@/constants/app";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const IDE_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-analisis-ide-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini menampilkan IDE atau Indeks Diplomasi Ekonomi beserta konteks penggunaannya."
  },
  {
    selector: '[data-analisis-ide-tour="download-button"]',
    title: "Unduh pedoman",
    description:
      "Gunakan tombol ini untuk membuka pedoman IDE sebagai referensi metodologi dan cara membaca indeks."
  },
  {
    selector: '[data-analisis-ide-tour="powerbi-section"]',
    title: "Dashboard IDE",
    description:
      "Bagian ini memuat dashboard Power BI interaktif untuk mengeksplorasi indeks, tren, dan perbandingan lintas negara."
  }
];

export function AnalisisIdePage() {
  useDocumentTitle(`IDE (Indeks Diplomasi Ekonomi) | ${APP_NAME}`);
  const embedRef = React.useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = React.useState(640);
  const powerBiSrc =
    "https://app.powerbi.com/view?r=eyJrIjoiOTg1OWVmNGUtNDgzZC00MWM1LWFjMDktYjFmNGZlOTNlOTc4IiwidCI6IjFkNTE2OWFjLWM3Y2ItNDI3NS05NzY0LWJmOGM5YzM2NGE0YyIsImMiOjEwfQ%3D%3D";

  React.useEffect(() => {
    const calculateHeight = () => {
      if (!embedRef.current) return;
      const rect = embedRef.current.getBoundingClientRect();
      const viewportHeight =
        window.visualViewport?.height &&
        Number.isFinite(window.visualViewport.height)
          ? window.visualViewport.height
          : window.innerHeight;
      const bottomSpacing = window.innerWidth < 768 ? 12 : 16;
      const minHeight = window.innerWidth < 768 ? 460 : 600;
      const nextHeight = Math.max(
        minHeight,
        Math.floor(viewportHeight - rect.top - bottomSpacing)
      );
      setHeight(nextHeight);
    };

    calculateHeight();
    const timeoutId = window.setTimeout(calculateHeight, 120);
    const handleResize = () => window.requestAnimationFrame(calculateHeight);

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const handleOpenGuide = React.useCallback(() => {
    window.open(
      "/files/pedoman-indeks-diplomasi-ekonomi.pdf",
      "_blank",
      "noopener,noreferrer"
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-analisis-ide-tour="page-title">
          <PageTitle
            title="IDE (Indeks Diplomasi Ekonomi)"
            description="IDE disusun dari sub modul Perdagangan, Investasi, Pariwisata, dan Tenaga Kerja untuk memetakan prioritas strategi ekonomi serta melihat tren dan perbandingan lintas negara."
            actions={
              <div data-analisis-ide-tour="download-button">
                <Button
                  type="button"
                  variant="primary"
                  rounded="sm"
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold"
                  onClick={handleOpenGuide}
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Unduh Pedoman
                </Button>
              </div>
            }
          />
        </div>

        <section
          ref={embedRef}
          data-analisis-ide-tour="powerbi-section"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-[#0b0f14] shadow-sm"
        >
          <iframe
            title="Indeks Diplomasi Ekonomi"
            src={powerBiSrc}
            className="w-full border-0"
            style={{ height }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </div>
      <GuidedTour
        steps={IDE_TOUR_STEPS}
        storageKey="side-analisis-ide-tour-completed"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
