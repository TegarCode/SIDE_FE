import { APP_NAME } from "@/constants/app";
import { HomeContactSection } from "@/components/home/HomeContactSection";
import { HomeCtaSection } from "@/components/home/HomeCtaSection";
import { HomeFaqSection } from "@/components/home/HomeFaqSection";
import { HomeFeatureSection } from "@/components/home/HomeFeatureSection";
import { HomeFloatingImageSection } from "@/components/home/HomeFloatingImageSection";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomePainPointSection } from "@/components/home/HomePainPointSection";
import { HomeSectorSection } from "@/components/home/HomeSectorSection";
import { HomeSideViewsSection } from "@/components/home/HomeSideViewsSection";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const HOME_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: "[data-home-tour='hero-section']",
    title: "Kenali halaman utama",
    description:
      "Ini adalah beranda SIDE. User baru sebaiknya mulai dari sini dulu untuk memahami fungsi utama platform."
  },
  {
    selector: "[data-home-tour='video-guide-button']",
    title: "Klik video panduan",
    description:
      "Kalau baru pertama kali buka, tombol ini langkah paling aman. Klik untuk lihat playlist tutorial resmi."
  },
  {
    selector: "#sektor",
    title: "Pilih sektor yang ingin dieksplor",
    description:
      "Sesudah paham gambaran umum, pengguna bisa lanjut klik sektor sesuai kebutuhan analisis."
  },
  {
    selector: "#faq",
    title: "Cek FAQ bila masih bingung",
    description:
      "Kalau ada pertanyaan cepat tentang SIDE, bagian FAQ jadi rujukan berikutnya."
  },
  {
    selector: "#contact-us",
    title: "Hubungi tim SIDE",
    description:
      "Kalau masih perlu bantuan atau ingin memberi masukan, pengguna bisa langsung kirim pesan lewat form ini."
  }
];

export function HomePage() {
  useDocumentTitle(`Home | ${APP_NAME}`);

  return (
    <>
      <HomeHeroSection />
      <HomeFloatingImageSection />
      <HomePainPointSection />
      <HomeFeatureSection />
      <HomeSectorSection />
      <HomeSideViewsSection />
      <HomeFaqSection />
      <HomeContactSection />
      <HomeCtaSection />

      <GuidedTour
        steps={HOME_TOUR_STEPS}
        storageKey="side-home-tour-completed"
        launcherLabel="Tur Halaman"
        coachmarkLabel="Panduan awal"
      />
    </>
  );
}
