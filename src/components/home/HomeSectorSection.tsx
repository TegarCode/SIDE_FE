import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { APP_ROUTES, EXTERNAL_ROUTES } from "@/constants/routes";

type Sector = {
  title: string;
  imageUrl: string;
  description: string;
  href?: string;
  external?: boolean;
};

const sectorData: Sector[] = [
  {
    title: "Trade",
    imageUrl:
      "https://www.cato.org/sites/cato.org/files/styles/aside_3x/public/2019-09/Shipping%20Containers.jpg?itok=GDE8eX7g",
    description:
      "Telusuri nilai ekspor-impor, volume perdagangan, dan tren komoditas utama Indonesia secara mendalam.",
    href: APP_ROUTES.SEKTOR.PERDAGANGAN
  },
  {
    title: "Tourism",
    imageUrl:
      "https://international.unud.ac.id/protected/storage/file_summernote/4a0885ebc3c02b217cbf6c079eca6b37.jpg",
    description:
      "Analisis kunjungan wisatawan, pendapatan sektor pariwisata, dan pola musiman dengan data akurat.",
    href: APP_ROUTES.SEKTOR.PAREKRAF_OVERVIEW
  },
  {
    title: "Investment",
    imageUrl:
      "https://www.pnbmetlife.com/content/dam/pnb-metlife/images/articles/savings/importance-of-investment.jpg",
    description:
      "Pantau aliran investasi asing, proyek strategis, dan kontribusinya terhadap pertumbuhan nasional.",
    href: EXTERNAL_ROUTES.INVESTOLINK,
    external: true
  },
  {
    title: "Services",
    imageUrl:
      "https://i0.wp.com/isellerdotblog.wpcomstaging.com/wp-content/uploads/2025/03/human-showing-service-concept-business.jpg?fit=1568%2C1026&ssl=1",
    description:
      "Dapatkan gambaran menyeluruh kontribusi sektor jasa terhadap PDB dan pertumbuhan lintas subsektor.",
    href: APP_ROUTES.SEKTOR.JASA_OVERVIEW
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export function HomeSectorSection() {
  return (
    <section id="sektor" className="relative overflow-hidden bg-white py-24">
      <motion.div
        className="relative z-10 container mx-auto px-6 lg:px-12"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-wide text-[#162360] sm:text-4xl lg:text-5xl">
            Sektor Komoditas Utama
          </h2>
          <div className="mx-auto mt-4 w-16 rounded-full border-t-4 border-[#FFB900] sm:w-20" />
          <p className="mx-auto mt-4 max-w-3xl text-lg font-medium text-[#5E7ADD]">
            Eksplorasi sektor-sektor utama yang menjadi fokus analisis dalam
            platform SIDE.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10"
          variants={containerVariants}
        >
          {sectorData.map((sector) => {
            const destination = sector.href || APP_ROUTES.NOT_FOUND;
            const cardClassName =
              "group relative block h-64 cursor-pointer overflow-hidden rounded-2xl shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4";

            const content = (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${sector.imageUrl}')` }}
                />
                <div className="absolute inset-0 bg-black/30 transition-opacity duration-500 group-hover:bg-black/60" />

                <div className="relative z-10 pl-6 pt-6 text-left text-white">
                  <h3 className="text-xl font-semibold">{sector.title}</h3>
                </div>

                <div className="absolute bottom-0 left-0 w-full translate-y-full bg-linear-to-t from-black/80 to-transparent p-4 transition-transform duration-500 group-hover:translate-y-0">
                  <hr className="mb-2 border-gray-200 opacity-50" />
                  <p className="text-left text-sm leading-relaxed text-white">
                    {sector.description}
                  </p>
                </div>
              </>
            );

            return (
              <motion.article key={sector.title} variants={cardVariants}>
                {sector.external ? (
                  <a
                    href={destination}
                    target="_blank"
                    rel="noreferrer"
                    className={cardClassName}
                  >
                    {content}
                  </a>
                ) : (
                  <Link to={destination} className={cardClassName}>
                    {content}
                  </Link>
                )}
              </motion.article>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
