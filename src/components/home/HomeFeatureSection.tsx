import { motion } from "framer-motion";
import type { ComponentType, SVGProps } from "react";
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  GlobeAltIcon,
  PresentationChartBarIcon
} from "@heroicons/react/24/outline";

type Feature = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

const featureData: Feature[] = [
  {
    icon: ChartBarIcon,
    title: "Grafik Interaktif",
    description:
      "Tampilkan data ekonomi dalam grafik dinamis yang mudah dipahami."
  },
  {
    icon: GlobeAltIcon,
    title: "Peta Interaktif",
    description: "Visualisasi geografis untuk hubungan diplomasi antarnegara."
  },
  {
    icon: DocumentChartBarIcon,
    title: "Otomasi Laporan",
    description: "Ekspor data ke PDF atau CSV secara instan dan praktis."
  },
  {
    icon: PresentationChartBarIcon,
    title: "Data Terbaru",
    description: "Selalu terhubung dengan data terbaru tanpa perlu muat ulang."
  }
];

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.15,
      duration: 0.6
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function HomeFeatureSection() {
  return (
    <section id="fitur" className="relative overflow-hidden bg-white py-24">
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(94,122,221,0.5) 0%, rgba(56,74,160,0.2) 80%)"
          }}
        />
      </div>

      <motion.div
        className="relative z-10 container mx-auto px-6 lg:px-12"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-wide text-[#162360] sm:text-4xl lg:text-5xl">
            Fitur SIDE
          </h2>
          <div className="mx-auto mt-4 w-16 rounded-full border-t-4 border-[#FFB900] sm:w-20" />
          <p
            className="mx-auto mt-6 max-w-3xl text-lg font-semibold text-[#5E7ADD]"
            style={{ lineHeight: "1.6" }}
          >
            SIDE memudahkan akses, analisis, dan penyampaian data diplomasi
            ekonomi secara digital dan efisien.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {featureData.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                variants={itemVariants}
                className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-lg"
              >
                <Icon className="mb-4 h-12 w-12 text-[#5E7ADD]" />
                <h3 className="mb-2 text-xl font-semibold text-[#162360]">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
