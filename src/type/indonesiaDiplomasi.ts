export type DiplomasiSectorKey = "perdagangan" | "investasi" | "pariwisata";

export type DiplomasiTabSlug =
  | "nilai_perdagangan"
  | "total_ekspor"
  | "total_impor"
  | "neraca_perdagangan"
  | "investasi_masuk"
  | "turis_masuk";

export type DiplomasiCardTone =
  | "orange"
  | "purple"
  | "emerald"
  | "rose"
  | "cyan"
  | "blue"
  | "sky"
  | "amber"
  | "slate";

export type SelectOption = {
  value: string;
  label: string;
};

export type GroupedSelectOption = {
  label: string;
  options: SelectOption[];
};

export type DiplomasiSourceBySector = Record<DiplomasiSectorKey, string | null>;
export type DiplomasiSourceOptionsBySector = Record<
  DiplomasiSectorKey,
  SelectOption[]
>;

export type DiplomasiFilterState = {
  yearStart: number | null;
  yearEnd: number | null;
  hs: string;
  dirjen: string[];
  sourceBySector: DiplomasiSourceBySector;
};

export type DiplomasiApiSourceItem = {
  sektor: DiplomasiSectorKey;
  sumber: string;
};

export type DiplomasiApiParams = {
  year_start: number;
  year_end: number;
  hs: string;
  dirjen: string[];
  sumber: DiplomasiApiSourceItem[];
};

export type DiplomasiCompetitionInsightParams = {
  hsCode: string;
  negara: string;
  year?: number;
  sumber: DiplomasiApiSourceItem[];
};

export type DiplomasiMasterData = {
  yearsAsc: number[];
  yearsDesc: number[];
  tradeYearsDesc: number[];
  wilayahOptions: GroupedSelectOption[];
  sourceOptionsBySector: DiplomasiSourceOptionsBySector;
};

export type DiplomasiStatsCardRaw = {
  value: number | string | null;
  prevValue: number | string | null;
  year: string | number | null;
  prevYear: string | number | null;
  note: string;
  country: string | null;
  prevCountry: string | null;
  product: string | null;
  prevProduct: string | null;
  unit: string | null;
  sourceName: string | null;
};

export type DiplomasiStatsData = {
  cards: Record<string, DiplomasiStatsCardRaw>;
  meta: Record<string, unknown>;
  raw: unknown;
};

export type DiplomasiSummaryCardView = {
  id: string;
  title: string;
  tone: DiplomasiCardTone;
  unit: string;
  value: number | string | null;
  prevValue: number | string | null;
  year: string | null;
  prevYear: string | null;
  note: string;
  highlight: string | null;
  prevHighlight: string | null;
  highlightType: "country" | "product" | "none";
  sourceName: string | null;
};

export type DiplomasiMetric = {
  key: string;
  label: string;
  value: string;
};

export type DiplomasiOverviewTable = {
  columns: string[];
  rows: Array<Record<string, string>>;
};

export type DiplomasiOverviewData = {
  metrics: DiplomasiMetric[];
  table: DiplomasiOverviewTable | null;
  raw: unknown;
};

export type DiplomasiTabItem = {
  label: string;
  slug: DiplomasiTabSlug;
};

export type DiplomasiCardDefinition = {
  id: string;
  title: string;
  unit: string;
  tone: DiplomasiCardTone;
};

export type SortDirection = "asc" | "desc";

export type DiplomasiItemRecord = {
  country: string;
  alpha3: string | null;
  nilai: Record<number, number>;
  neraca: Record<number, number>;
};

export type TopProdukItem = {
  hs: string;
  name: string;
  nilai: Record<number, number>;
  strategi?: string | null;
  rcaAsal?: number | null;
  cmsaAsal?: number | null;
  classAsal?: string | null;
  rcaTujuan?: number | null;
  cmsaTujuan?: number | null;
  classTujuan?: string | null;
  asalWorld?: number | null;
  tujuanWorld?: number | null;
  neraca?: Record<number, number>;
  export?: Record<number, number>;
  import?: Record<number, number>;
  exportReverse?: Record<number, number>;
  importReverse?: Record<number, number>;
  share?: Record<number, number>;
  tujuanEkspor?: DiplomasiCountryValueItem[];
  tujuanImpor?: DiplomasiCountryValueItem[];
  kompetitorGlobalTopTujuanEkspor?: DiplomasiCountryValueItem[];
  kompetitorAseanTopTujuanEkspor?: DiplomasiCountryValueItem[];
  kompetitorGlobalTopTujuanImpor?: DiplomasiCountryValueItem[];
  kompetitorAseanTopTujuanImpor?: DiplomasiCountryValueItem[];
  cagr?: number | null;
};

export type DiplomasiCountryValueItem = {
  rank?: number | null;
  alpha2: string | null;
  alpha3: string | null;
  country: string;
  nilai: number;
  share?: number | null;
  rankGlobal?: number | null;
};

export type DiplomasiExportProductInsightItem = TopProdukItem & {
  neraca: Record<number, number>;
  share: Record<number, number>;
  export: Record<number, number>;
  import?: Record<number, number>;
  exportReverse: Record<number, number>;
  importReverse?: Record<number, number>;
  tujuanEkspor: DiplomasiCountryValueItem[];
  tujuanImpor?: DiplomasiCountryValueItem[];
  kompetitorGlobalTopTujuanEkspor: DiplomasiCountryValueItem[];
  kompetitorAseanTopTujuanEkspor: DiplomasiCountryValueItem[];
  kompetitorGlobalTopTujuanImpor?: DiplomasiCountryValueItem[];
  kompetitorAseanTopTujuanImpor?: DiplomasiCountryValueItem[];
};

export type TopProdukTableProps = {
  raw: unknown;
  unitLabel: string;
  expanded?: boolean;
  onRegisterDownload?: (handler: (() => void) | null) => void;
  onSortColumnChange?: (columnLabel: string) => void;
  downloadTitle?: string;
  downloadFilename?: string;
  downloadSource?: string;
  downloadNotes?: string | string[];
  downloadVariant?: "default" | "ekspor" | "impor";
  emptyMessage?: string;
  onHsClick?: (item: TopProdukItem) => void;
  valueLabel?: string;
  shareLabel?: string;
  shareContextLabel?: string;
  totalLabel?: string;
  changeLabel?: string;
  invoiceMode?: "ekspor" | "impor" | null;
  invoiceHighlightTone?: "split" | "warning";
  columnMode?:
    | "default"
    | "trade_pair"
    | "analysis_export"
    | "potensi_simple"
    | "potensi_calc";
  showShareBadge?: boolean;
  showDeltaBadge?: boolean;
  showLimitControl?: boolean;
  shareTotalValue?: number | null;
  enableRowHoverTooltip?: boolean;
  showCode?: boolean;
  defaultLimit?: string;
  fitHeightToContainer?: boolean;
  tableViewportClassName?: string;
  limitOptions?: string[];
  columnInfoByKey?: Partial<Record<string, React.ReactNode>>;
  onCompetitorClick?: (item: TopProdukItem, group: "asean" | "global") => void;
};

export type MultiLineSeries = {
  label: string;
  values: number[];
};

export type MultiLineExtraMeta = {
  delta?: number;
};

export type MultiLineTrendChartProps = {
  series: MultiLineSeries[];
  years: Array<string | number>;
  height?: number;
  unit?: string;
  extrasByYear?: Record<string | number, MultiLineExtraMeta>;
  minimal?: boolean;
  variant?: "default" | "kinerja-ekonomi";
};

export type PartnerSeries = {
  name: string;
  export: number[];
  import: number[];
  balance: number[];
};

export type PartnerMixedChartProps = {
  years: Array<string | number>;
  partners: PartnerSeries[];
  unit?: string;
  height?: number;
};
