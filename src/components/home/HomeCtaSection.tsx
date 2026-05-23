import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const headingVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { delay: 0.15, duration: 0.5 } }
};

const textVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { delay: 0.25, duration: 0.5 } }
};

const buttonVariants = { hover: { scale: 1.02 }, tap: { scale: 0.98 } };

export function HomeCtaSection() {
  return (
    <motion.section
      className="relative w-full overflow-x-hidden px-6 py-14 sm:py-18 md:py-32 lg:px-12"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="relative mx-auto w-full max-w-7xl isolate rounded-4xl bg-[#162360] p-6 shadow-2xl sm:rounded-[2.5rem] sm:p-10 md:p-16">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-4xl sm:rounded-[2.5rem]"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-cover bg-center opacity-10" />
          <div
            className="absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl sm:h-80 sm:w-80"
            style={{
              background:
                "radial-gradient(closest-side, #5E7ADD55, transparent)"
            }}
          />
          <div
            className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full blur-3xl sm:h-80 sm:w-80"
            style={{
              background:
                "radial-gradient(closest-side, #FFB90055, transparent)"
            }}
          />
        </div>

        <div className="relative z-20 grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <motion.h2
              className="mb-4 text-2xl font-extrabold leading-tight text-white sm:mb-6 sm:text-4xl md:text-5xl"
              variants={headingVariants}
            >
              Diplomasi Ekonomi <br />
              <span className="bg-linear-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
                Berbasis Data
              </span>
            </motion.h2>

            <motion.p
              className="mb-6 text-base leading-relaxed text-white/90 sm:mb-8 sm:text-lg md:text-xl"
              variants={textVariants}
            >
              Tidak perlu lagi membuka banyak sumber terpisah. Data perdagangan,
              investasi, dan hubungan antarnegara kini tersedia dalam satu
              platform terpadu,{" "}
              <span className="font-semibold text-white">SIDE</span>.
            </motion.p>

            <motion.div variants={textVariants}>
              <motion.div
                className="inline-flex w-full sm:w-auto"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  to="/indonesia/diplomasi-ekonomi"
                  className="flex w-full items-center justify-center rounded-full bg-white px-5 py-3 font-semibold text-[#162360] transition hover:bg-gray-200 sm:w-auto sm:px-7"
                  aria-label="Jelajahi Dashboard Diplomasi Ekonomi"
                >
                  Jelajahi Dashboard
                  <ArrowRightIcon className="ml-2 h-5 w-5 shrink-0" />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <div className="hidden md:block" />
        </div>

        <motion.img
          src="/images/CTAtanyadata.png"
          alt="Maskot Tanya Data"
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-2 -right-2 z-30 hidden w-64 select-none drop-shadow-2xl md:block lg:w-80 xl:w-[24rem]"
          loading="lazy"
          initial={{ y: 0 }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.section>
  );
}
