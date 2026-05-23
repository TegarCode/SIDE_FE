import { motion } from "framer-motion";
import desktopImage from "@/assets/images/home/desktop.png";
import phoneImage from "@/assets/images/home/phone.png";
import tabletImage from "@/assets/images/home/tablet.png";

export function HomeFloatingImageSection() {
  return (
    <motion.div
      className="relative z-20 -mt-20 px-6 md:-mt-36 lg:-mt-44 lg:px-12"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="relative mx-auto max-w-7xl py-8 md:py-12">
        <motion.div
          className="relative z-10 overflow-hidden rounded-xl border-8 border-[#FFB900] shadow-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <img
            src={desktopImage}
            alt="Desktop Preview"
            className="h-auto w-full object-cover"
          />
        </motion.div>

        <motion.div
          className="absolute -bottom-4 -left-6 z-20 hidden w-44 overflow-hidden rounded-xl border-8 border-[#FFB900] shadow-md md:-left-10 md:block md:w-52"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <img
            src={phoneImage}
            alt="Mobile Preview"
            className="h-auto w-full object-cover"
          />
        </motion.div>

        <motion.div
          className="absolute -bottom-4 -right-6 z-20 hidden w-64 overflow-hidden rounded-xl border-8 border-[#FFB900] shadow-md md:-right-10 md:block md:w-80"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <img
            src={tabletImage}
            alt="Tablet Preview"
            className="h-auto w-full object-cover"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
