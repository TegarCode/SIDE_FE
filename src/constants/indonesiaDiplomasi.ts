import type {
  DiplomasiCardDefinition,
  DiplomasiSectorKey,
  DiplomasiTabItem
} from "@/type/indonesiaDiplomasi";

export const DIPLOMASI_PAGE_SIZE = 8;

export const DIPLOMASI_HS_LEVEL_OPTIONS = [
  { value: "2", label: "HS 2" },
  { value: "4", label: "HS 4" },
  { value: "6", label: "HS 6" }
] as const;

export const DIPLOMASI_TABS: DiplomasiTabItem[] = [
  { label: "Nilai Perdagangan", slug: "nilai_perdagangan" },
  { label: "Total Ekspor", slug: "total_ekspor" },
  { label: "Total Impor", slug: "total_impor" },
  { label: "Neraca Perdagangan", slug: "neraca_perdagangan" },
  { label: "Investasi Masuk", slug: "investasi_masuk" },
  { label: "Turis Masuk", slug: "turis_masuk" }
];

export const DIPLOMASI_SECTOR_LABELS: Record<DiplomasiSectorKey, string> = {
  perdagangan: "Perdagangan",
  investasi: "Investasi",
  pariwisata: "Pariwisata"
};

export const DIPLOMASI_SUMMARY_CARDS: DiplomasiCardDefinition[] = [
  {
    id: "trade_total",
    title: "Nilai Perdagangan",
    unit: "US$",
    tone: "orange"
  },
  {
    id: "top_partner",
    title: "Mitra Dagang Utama",
    unit: "US$",
    tone: "orange"
  },
  {
    id: "trade_balance",
    title: "Neraca Perdagangan",
    unit: "US$",
    tone: "purple"
  },
  {
    id: "top_surplus_country",
    title: "Negara Surplus Terbesar",
    unit: "US$",
    tone: "purple"
  },
  { id: "export_total", title: "Total Ekspor", unit: "US$", tone: "emerald" },
  {
    id: "top_export_dest",
    title: "Tujuan Ekspor Utama",
    unit: "US$",
    tone: "emerald"
  },
  { id: "import_total", title: "Total Impor", unit: "US$", tone: "rose" },
  {
    id: "top_import_origin",
    title: "Asal Impor Utama",
    unit: "US$",
    tone: "rose"
  },
  {
    id: "top_export_product",
    title: "Produk Ekspor Utama",
    unit: "US$",
    tone: "emerald"
  },
  {
    id: "top_import_product",
    title: "Produk Impor Utama",
    unit: "US$",
    tone: "emerald"
  },
  {
    id: "tourist_inbound",
    title: "Total Wisatawan Masuk",
    unit: "Orang",
    tone: "cyan"
  },
  {
    id: "tourist_inbound_top_origin",
    title: "Asal Wisatawan Terbesar",
    unit: "Orang",
    tone: "cyan"
  },
  {
    id: "fdi_in_total",
    title: "Total Investasi Masuk",
    unit: "Ribu US$",
    tone: "blue"
  },
  {
    id: "fdi_in_top_origin",
    title: "Asal Investasi Masuk",
    unit: "Ribu US$",
    tone: "blue"
  }
];

export const DIPLOMASI_YEAR_META_KEYS_BY_CARD_ID: Record<string, string> = {
  trade_total: "tradeYears",
  top_partner: "tradeYears",
  trade_balance: "tradeYears",
  top_surplus_country: "tradeYears",
  export_total: "tradeYears",
  top_export_dest: "tradeYears",
  import_total: "tradeYears",
  top_import_origin: "tradeYears",
  top_export_product: "tradeYears",
  top_import_product: "tradeYears",
  tourist_inbound: "tourismYears",
  tourist_inbound_top_origin: "tourismYears",
  fdi_in_total: "fdiYears",
  fdi_in_top_origin: "fdiYears"
};

export const NILAI_PERDAGANGAN_MAP_BUCKETS = [
  {
    key: "b_ge_1b",
    min: 1_000_000_000,
    max: Number.POSITIVE_INFINITY,
    label: ">= 1B",
    color: "#b45309"
  },
  {
    key: "b_100m_999m",
    min: 100_000_000,
    max: 999_999_999,
    label: "100M - 999.9M",
    color: "#d97706"
  },
  {
    key: "b_50m_99m",
    min: 50_000_000,
    max: 99_999_999,
    label: "50M - 99.9M",
    color: "#f59e0b"
  },
  {
    key: "b_10m_49m",
    min: 10_000_000,
    max: 49_999_999,
    label: "10M - 49.9M",
    color: "#eab308"
  },
  {
    key: "b_1m_9m",
    min: 1_000_000,
    max: 9_999_999,
    label: "1M - 9.9M",
    color: "#84cc16"
  },
  {
    key: "b_100k_999k",
    min: 100_000,
    max: 999_999,
    label: "100K - 999.9K",
    color: "#22c55e"
  },
  {
    key: "b_10k_99k",
    min: 10_000,
    max: 99_999,
    label: "10K - 99.9K",
    color: "#10b981"
  },
  { key: "b_1_9k", min: 1, max: 9_999, label: "1 - 9.9K", color: "#10b981" }
] as const;
