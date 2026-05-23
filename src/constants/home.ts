import type {
  AnalyticsHistoryItem,
  ContactMessageType,
  HomeFeature,
  HomePainPoint,
  HomeSector
} from "@/type/home";

export const HOME_HERO_BADGE =
  "Data untuk Diplomasi, Diplomasi untuk Indonesia";

export const HOME_PAIN_POINTS: HomePainPoint[] = [
  {
    title: "Data terfragmentasi",
    description:
      "Informasi tersebar di banyak sumber sehingga analisis terpadu menjadi lambat."
  },
  {
    title: "Sulit diakses",
    description:
      "Proses pencarian data memakan waktu karena tidak tersedia dalam satu alur kerja."
  },
  {
    title: "Data Tidak Terbaru",
    description:
      "Pembaruan data tidak seragam sehingga respons kebijakan sering terlambat."
  },
  {
    title: "Minim visualisasi",
    description:
      "Laporan dominan berbasis teks dan sulit dipresentasikan ke pemangku kepentingan."
  }
];

export const HOME_FEATURES: HomeFeature[] = [
  {
    title: "Grafik Interaktif",
    description:
      "Tampilkan data ekonomi dalam grafik dinamis yang mudah dibaca."
  },
  {
    title: "Peta Interaktif",
    description:
      "Visualisasi geografis untuk membaca hubungan diplomasi antarnegara."
  },
  {
    title: "Otomasi Laporan",
    description: "Ekspor data ke PDF atau CSV dengan proses yang konsisten."
  },
  {
    title: "Data Terbaru",
    description:
      "Akses data terkini untuk mendukung keputusan kebijakan berbasis bukti."
  }
];

export const HOME_SECTORS: HomeSector[] = [
  {
    title: "Trade",
    imageUrl:
      "https://www.cato.org/sites/cato.org/files/styles/aside_3x/public/2019-09/Shipping%20Containers.jpg?itok=GDE8eX7g",
    description:
      "Telusuri nilai ekspor-impor, volume perdagangan, dan tren komoditas utama Indonesia."
  },
  {
    title: "Tourism",
    imageUrl:
      "https://international.unud.ac.id/protected/storage/file_summernote/4a0885ebc3c02b217cbf6c079eca6b37.jpg",
    description:
      "Analisis kunjungan wisatawan, pendapatan sektor pariwisata, dan pola musiman."
  },
  {
    title: "Investment",
    imageUrl:
      "https://www.pnbmetlife.com/content/dam/pnb-metlife/images/articles/savings/importance-of-investment.jpg",
    description:
      "Pantau arus investasi, proyek strategis, dan dampaknya pada pertumbuhan nasional."
  },
  {
    title: "Services",
    imageUrl:
      "https://i0.wp.com/isellerdotblog.wpcomstaging.com/wp-content/uploads/2025/03/human-showing-service-concept-business.jpg?fit=1568%2C1026&ssl=1",
    description:
      "Lihat kontribusi sektor jasa terhadap PDB dan pertumbuhan lintas subsektor."
  }
];

export const FALLBACK_HOME_VIEWS_HISTORY: AnalyticsHistoryItem[] = [
  { label: "Juli 2025", views: 8421 },
  { label: "Agustus 2025", views: 9730 },
  { label: "September 2025", views: 11320 },
  { label: "Oktober 2025", views: 12540 },
  { label: "November 2025", views: 13210 }
];

export const CONTACT_TYPE_OPTIONS: Array<{
  label: string;
  value: ContactMessageType;
}> = [
  { label: "Pertanyaan", value: "PERTANYAAN" },
  { label: "Masukan", value: "MASUKAN" },
  { label: "Saran", value: "SARAN" }
];

export const INITIAL_CONTACT_FORM = {
  nama: "",
  email: "",
  jenis: "PERTANYAAN" as ContactMessageType,
  pesan: ""
};
