import { motion } from "framer-motion";
import type { ComponentType, SVGProps } from "react";
import {
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

type PainPoint = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

const painPoints: PainPoint[] = [
  {
    icon: ExclamationTriangleIcon,
    title: "Data Terfragmentasi",
    description:
      "Informasi tersebar di banyak sumber, menyulitkan analisis terpadu."
  },
  {
    icon: MagnifyingGlassIcon,
    title: "Sulit Diakses",
    description: "Proses pencarian data memakan waktu dan kurang interaktif."
  },
  {
    icon: ClockIcon,
    title: "Data Tidak Terbaru",
    description:
      "Data terlambat diperbarui, menghambat respons kebijakan cepat."
  },
  {
    icon: DocumentTextIcon,
    title: "Minim Visualisasi",
    description:
      "Laporan berbasis teks, sulit dipresentasikan dan diinterpretasi."
  }
];

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.2, duration: 0.6 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function HomePainPointSection() {
  return (
    <section
      id="pain-point"
      className="relative overflow-hidden bg-white py-24"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255, 185, 0, 0.5) 0%, rgba(94,122,221,0.2) 80%)"
          }}
        />
      </div>

      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center lg:px-12"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        <div className="mb-16">
          <h2 className="text-3xl font-extrabold text-[#162360] sm:text-4xl lg:text-5xl">
            Tantangan Sebelum SIDE
          </h2>
          <div className="mx-auto mt-4 w-16 rounded-full border-t-4 border-[#FFB900] sm:w-20" />
          <p className="mx-auto mt-6 max-w-3xl text-lg font-medium text-[#5E7ADD]">
            Masalah umum dalam pengelolaan dan interpretasi data diplomasi
            ekonomi.
          </p>
        </div>

        <div className="grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {painPoints.map(({ icon: Icon, title, description }) => (
            <motion.article
              key={title}
              variants={itemVariants}
              className="max-w-xs rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-lg transition-shadow duration-300 hover:shadow-xl"
            >
              <Icon className="mx-auto mb-4 h-10 w-10 text-[#5E7ADD]" />
              <h3 className="mb-2 text-xl font-semibold text-[#162360]">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {description}
              </p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
