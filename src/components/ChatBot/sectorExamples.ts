import type { ChatSector } from "@/hooks/ChatBot/useChatbot";

type SectorExamples = Record<Exclude<ChatSector, null>, string[]>;

const EXAMPLES: SectorExamples = {
  Perdagangan: [
    "Top 5 ekspor Indonesia ke Jepang tahun 2022",
    "Total impor dari China tahun 2023",
    "Ekspor HS Code 9999 ke Indonesia tahun 2021"
  ],
  Pariwisata: [
    "Jumlah wisatawan dari Singapura ke Indonesia tahun 2023",
    "Tren wisatawan mancanegara ke Indonesia selama 5 tahun terakhir",
    "Asal negara wisatawan terbanyak ke Indonesia tahun 2022",
    "Wisatawan Indonesia terbanyak pergi ke negara mana tahun 2021?"
  ],
  Investasi: [
    "Investasi asing tertinggi masuk ke Indonesia tahun 2022",
    "Total investasi outbound dari Indonesia ke dunia selama lima tahun terakhir",
    "5 negara penyumbang investasi terbesar ke Indonesia tahun 2020",
    "Negara tujuan utama investasi outbound dari Indonesia tahun 2020"
  ],
  Jasa: [
    "Nilai jasa ke Singapura tahun 2023",
    "Jumlah jasa yang diberikan oleh tenaga kerja laki-laki ke Jepang tahun 2022",
    "Tren jasa Indonesia 5 tahun terakhir",
    "Negara tujuan utama jasa Indonesia tahun 2023"
  ]
};

export function getExamplesForSector(sector: ChatSector) {
  if (!sector) {
    return EXAMPLES;
  }

  return EXAMPLES[sector] ?? [];
}
