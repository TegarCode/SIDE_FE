import type { SelectOption } from "@/type/indonesiaDiplomasi";

export type MitraFilterState = {
  region: string | null;
  subregion: string | null;
  country: string | null;
};

export type MitraSubregionOption = SelectOption & {
  regionValue: string;
};

export type MitraCountryOption = SelectOption & {
  alpha2?: string | null;
  regionValue: string | null;
  subregionValue: string | null;
};

export type MitraMasterData = {
  regionOptions: SelectOption[];
  subregionOptions: MitraSubregionOption[];
  countryOptions: MitraCountryOption[];
};

export type MitraOverviewStatMetric = {
  title: string;
  unit: string;
  value: number | null;
  prev: {
    year: number | null;
    value: number | null;
  } | null;
  source: string | null;
};

export type MitraOverviewTopPartnerMetric = {
  title: string;
  unit: string;
  partner: {
    alpha3: string | null;
    alpha2: string | null;
    name: string;
  } | null;
  value: number | null;
  share: number | null;
  sharePercent: number | null;
  source: string | null;
};

export type MitraOverviewStatsData = {
  country: string;
  alpha3: string | null;
  alpha2: string | null;
  totalPerdagangan: MitraOverviewStatMetric | null;
  neracaPerdagangan: MitraOverviewStatMetric | null;
  ekspor: MitraOverviewStatMetric | null;
  impor: MitraOverviewStatMetric | null;
  topTradePartner: MitraOverviewTopPartnerMetric | null;
  inboundInvestment: MitraOverviewStatMetric | null;
  outboundInvestment: MitraOverviewStatMetric | null;
  outboundTourism: MitraOverviewStatMetric | null;
};

export type MitraOverviewTradeItem = {
  alpha3: string | null;
  alpha2: string | null;
  country: string;
  unit: string | null;
  export: number | null;
  exportPrev: number | null;
  exportChange: number | null;
  import: number | null;
  importPrev: number | null;
  importChange: number | null;
  balance: number | null;
  sourceCode: number | null;
};

export type MitraOverviewTradeData = {
  years: number[];
  items: MitraOverviewTradeItem[];
};

export type MitraOverviewCompetitionCountry = {
  rank: number;
  alpha2: string | null;
  alpha3: string | null;
  country: string;
  nilai: number;
};

export type MitraOverviewTradePartnerRow = {
  rank: number;
  country: string;
  alpha2: string | null;
  alpha3: string | null;
  exportLatestYear: number | null;
  importLatestYear: number | null;
  totalLatestYear: number | null;
  exportPrevYear: number | null;
  importPrevYear: number | null;
  totalPrevYear: number | null;
  shareLatestYear: number | null;
};

export type MitraOverviewTradeProduct = {
  hs: string;
  name: string;
  latestValue: number | null;
  prevValue: number | null;
  share: number | null;
  tujuanEkspor: MitraOverviewCompetitionCountry[];
  tujuanImpor: MitraOverviewCompetitionCountry[];
  kompetitorGlobalTopTujuanEkspor: MitraOverviewCompetitionCountry[];
  kompetitorAseanTopTujuanEkspor: MitraOverviewCompetitionCountry[];
  kompetitorGlobalTopTujuanImpor: MitraOverviewCompetitionCountry[];
  kompetitorAseanTopTujuanImpor: MitraOverviewCompetitionCountry[];
};

export type MitraOverviewTopTradeData = {
  latestYear: number | null;
  prevYear: number | null;
  unit: string;
  source: string | null;
  asal: string | null;
  asalAlpha2: string | null;
  asalAlpha3: string | null;
  partners: MitraOverviewTradePartnerRow[];
  exportProducts: MitraOverviewTradeProduct[];
  importProducts: MitraOverviewTradeProduct[];
};

export type MitraOverviewInvestmentRow = {
  country: string;
  alpha2: string | null;
  alpha3: string | null;
  share: number | null;
  latestValue: number | null;
  prevValue: number | null;
  change: number | null;
};

export type MitraOverviewTopInvestmentData = {
  latestYear: number | null;
  prevYear: number | null;
  tujuan: string | null;
  inboundLatestYear: number | null;
  inboundPrevYear: number | null;
  outboundLatestYear: number | null;
  outboundPrevYear: number | null;
  unit: string;
  source: string | null;
  asal: string | null;
  asalAlpha2: string | null;
  asalAlpha3: string | null;
  inbound: MitraOverviewInvestmentRow[];
  outbound: MitraOverviewInvestmentRow[];
};

export type MitraOverviewTopTourismData = {
  latestYear: number | null;
  prevYear: number | null;
  tujuan: string | null;
  unit: string;
  source: string | null;
  inbound: MitraOverviewInvestmentRow[];
  outbound: MitraOverviewInvestmentRow[];
};

export type MitraOverviewTopServiceRow = {
  label: string;
  latestValue: number | null;
  prevValue: number | null;
  share: number | null;
  change: number | null;
};

export type MitraOverviewTopServiceData = {
  latestYear: number | null;
  prevYear: number | null;
  tujuan: string | null;
  source: string | null;
  totalLatest: number | null;
  totalPrev: number | null;
  rows: MitraOverviewTopServiceRow[];
};

export type MitraTradeOverviewParams = {
  origin: string[];
  dest: string[];
  hsCodes: string[];
};

export type MitraTradeOverviewSummaryMetric = {
  valueNow: number | null;
  valuePrev: number | null;
};

export type MitraTradeOverviewTimeseriesPoint = {
  year: number;
  export: number | null;
  import: number | null;
  total: number | null;
  balance: number | null;
};

export type MitraTradeOverviewProduct = {
  code: string;
  label: string;
  valueOd: number | null;
  valueReverse: number | null;
};

export type MitraTradeOverviewData = {
  year: number | null;
  unit: string;
  sourceName: string | null;
  origin: string[];
  destination: string[];
  originNames: Record<string, string>;
  destinationNames: Record<string, string>;
  timeseries: MitraTradeOverviewTimeseriesPoint[];
  export: MitraTradeOverviewSummaryMetric;
  import: MitraTradeOverviewSummaryMetric;
  total: MitraTradeOverviewSummaryMetric;
  balance: MitraTradeOverviewSummaryMetric;
  topProductsExport: MitraTradeOverviewProduct[];
  topProductsImport: MitraTradeOverviewProduct[];
};

export type MitraSingleInvestmentSummaryMetric = {
  valueNow: number | null;
  valuePrev: number | null;
  projectsNow: number | null;
  projectsPrev: number | null;
};

export type MitraSingleInvestmentRow = {
  code: string;
  alpha2: string | null;
  label: string;
  valueNow: number | null;
  valuePrev: number | null;
  projectsNow: number | null;
  projectsPrev: number | null;
};

export type MitraSingleInvestmentData = {
  year: number | null;
  prevYear: number | null;
  country: string | null;
  countryName: string | null;
  sourceName: string | null;
  unit: string;
  summary: {
    inbound: MitraSingleInvestmentSummaryMetric;
    outbound: MitraSingleInvestmentSummaryMetric;
  };
  tableInbound: MitraSingleInvestmentRow[];
  tableOutbound: MitraSingleInvestmentRow[];
};

export type MitraMultiInvestmentTimeseriesPoint = {
  year: number;
  inboundValue: number | null;
  outboundValue: number | null;
};

export type MitraMultiInvestmentData = {
  origins: string[];
  destinations: string[];
  originNames: Record<string, string>;
  destinationNames: Record<string, string>;
  yearFrom: number | null;
  yearTo: number | null;
  unit: string;
  sourceName: string | null;
  timeseries: MitraMultiInvestmentTimeseriesPoint[];
};

export type MitraSingleTourismSummaryMetric = {
  countNow: number | null;
  countPrev: number | null;
  spendingNow: number | null;
  spendingPrev: number | null;
};

export type MitraSingleTourismRow = {
  code: string;
  alpha2: string | null;
  label: string;
  valueNow: number | null;
  valuePrev: number | null;
};

export type MitraSingleTourismData = {
  year: number | null;
  prevYear: number | null;
  country: string | null;
  countryName: string | null;
  sourceName: string | null;
  unit: string;
  summary: {
    inbound: MitraSingleTourismSummaryMetric;
    outbound: MitraSingleTourismSummaryMetric;
  };
  tableInbound: MitraSingleTourismRow[];
  tableOutbound: MitraSingleTourismRow[];
};

export type MitraMultiTourismTimeseriesPoint = {
  year: number;
  inboundCount: number | null;
  inboundSpending: number | null;
  outboundCount: number | null;
};

export type MitraMultiTourismData = {
  origins: string[];
  destinations: string[];
  originNames: Record<string, string>;
  destinationNames: Record<string, string>;
  yearFrom: number | null;
  yearTo: number | null;
  sourceName: string | null;
  timeseries: MitraMultiTourismTimeseriesPoint[];
};

export type MitraSingleServiceSummaryMetric = {
  valueNow: number | null;
  valuePrev: number | null;
};

export type MitraSingleServiceRow = {
  code: string;
  alpha2: string | null;
  label: string;
  valueNow: number | null;
  valuePrev: number | null;
};

export type MitraSingleServiceData = {
  year: number | null;
  prevYear: number | null;
  country: string | null;
  countryName: string | null;
  sourceName: string | null;
  unit: string;
  summary: {
    inbound: MitraSingleServiceSummaryMetric;
    outbound: MitraSingleServiceSummaryMetric;
  };
  tableInbound: MitraSingleServiceRow[];
  tableOutbound: MitraSingleServiceRow[];
};

export type MitraServiceCategoryRow = {
  code: string;
  label: string;
  value: number | null;
};

export type MitraMultiServiceTimeseriesPoint = {
  year: number;
  inboundValue: number | null;
  outboundValue: number | null;
};

export type MitraMultiServiceData = {
  origins: string[];
  destinations: string[];
  originNames: Record<string, string>;
  destinationNames: Record<string, string>;
  yearFrom: number | null;
  yearTo: number | null;
  sourceName: string | null;
  unit: string;
  timeseries: MitraMultiServiceTimeseriesPoint[];
  topServicesInbound: MitraServiceCategoryRow[];
  topServicesOutbound: MitraServiceCategoryRow[];
};
