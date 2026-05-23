import { motion } from "framer-motion";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/Button";

export function HomeHeroSection() {
  const navigate = useNavigate();

  return (
    <section
      data-home-tour="hero-section"
      className="relative overflow-hidden bg-linear-to-br from-white via-blue-50 to-white pb-56 pt-20"
    >
      <div className="absolute left-4 top-4 h-48 w-48 rounded-full bg-linear-to-br from-[#F5C75C] to-[#E3E7F8] opacity-30 blur-3xl" />
      <div className="absolute bottom-8 right-8 h-64 w-64 rounded-full bg-linear-to-br from-[#162360] to-[#3F51B5] opacity-20 blur-3xl" />

      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center lg:px-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.span
          className="inline-block rounded-full border border-[#F5C75C] bg-[#F5C75C] px-5 py-2 text-sm font-semibold text-black"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Data untuk Diplomasi, Diplomasi untuk Indonesia
        </motion.span>

        <motion.h1
          className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="bg-linear-to-r from-[#87CEEB] to-[#0000FF] bg-clip-text text-transparent">
            SIDE
          </span>
          <span className="block text-gray-900">
            Sistem Informasi Diplomasi Ekonomi
          </span>
        </motion.h1>

        <motion.div
          className="mx-auto mt-6 max-w-2xl space-y-4 text-base text-gray-700 md:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p>
            <strong className="text-gray-900">
              Sistem informasi yang mendukung diplomasi berbasis data.
            </strong>{" "}
            <span className="font-semibold text-[#162360]">SIDE</span> adalah
            platform yang menyediakan{" "}
            <span className="font-semibold text-[#162360]">
              data dan analisis
            </span>{" "}
            dengan{" "}
            <span className="font-semibold text-[#162360]">
              visualisasi interaktif
            </span>{" "}
            mengenai hubungan ekonomi antarnegara.
          </p>
          <p className="text-sm text-gray-600 md:text-base">
            Platform ini membantu perumusan kebijakan luar negeri melalui grafik
            dinamis, peta interaktif, dan laporan yang dapat diunduh.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            type="button"
            onClick={() => navigate(APP_ROUTES.VIDEO_PANDUAN)}
            rounded="lg"
            data-home-tour="video-guide-button"
            className="flex items-center rounded-lg bg-[#162360] px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-[#111b4f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <PlayCircleIcon className="mr-2 h-6 w-6" />
            Tonton Video Panduan
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
