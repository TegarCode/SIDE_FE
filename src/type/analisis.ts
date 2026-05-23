export type AnalisisKomoditasEksporUtamaCompetitor = {
  kode: string;
  nama: string;
  a2: string | null;
  nilai: number;
  sharePct: number | null;
  rank: number | null;
  rankGlobal?: number | null;
};

export type AnalisisKomoditasEksporUtamaItem = {
  hs4: string;
  hsDesc: string;
  exportValues: Record<number, number>;
  exportMirrorValues: Record<number, number>;
  sharePct: Record<number, number>;
  growthCagrPct: number | null;
  competitorGlobal: AnalisisKomoditasEksporUtamaCompetitor[];
  competitorAsean: AnalisisKomoditasEksporUtamaCompetitor[];
};

export type AnalisisKomoditasEksporUtamaMeta = {
  origin: string | null;
  originName: string | null;
  originA2: string | null;
  destinations: string[];
  destinationNames: Record<string, string>;
  destinationA2: Record<string, string>;
  years: number[];
  unit: string | null;
  limit: number | null;
  sourceName: string | null;
};

export type AnalisisKomoditasEksporUtamaResult = {
  items: AnalisisKomoditasEksporUtamaItem[];
  meta: AnalisisKomoditasEksporUtamaMeta;
  tableRaw: {
    top_produk: Array<Record<string, unknown>>;
  };
  raw: unknown;
};

export type AnalisisKomoditasEksporUtamaParams = {
  origin: string;
  dest: string[];
};

export type AnalisisPotensiDayaSaingRouteParams = {
  origin: string;
  dest: string;
  level?: number;
  x_model?: string | null;
};

export type AnalisisPotensiDayaSaingSimpleRow = {
  rank: number | null;
  hs4: string;
  kode: string | null;
  nama: string;
  strategi: string | null;
  nilai: number | null;
};

export type AnalisisPotensiDayaSaingOverviewResult = {
  sourceName: string | null;
  origin: {
    code: string | null;
    name: string | null;
  };
  destination: {
    code: string | null;
    name: string | null;
  };
  totals: {
    exportCount: number;
    importCount: number;
    fdiInboundCount: number;
    fdiOutboundCount: number;
    allCount: number;
    exportSum: number | null;
    importSum: number | null;
    fdiInboundSum: number | null;
    fdiOutboundSum: number | null;
  };
  buckets: {
    export: AnalisisPotensiDayaSaingSimpleRow[];
    import: AnalisisPotensiDayaSaingSimpleRow[];
    fdiInbound: AnalisisPotensiDayaSaingSimpleRow[];
    fdiOutbound: AnalisisPotensiDayaSaingSimpleRow[];
  };
  raw: unknown;
};

export type AnalisisPotensiDayaSaingCalcRow = {
  hs4: string;
  kode: string | null;
  nama: string;
  strategi: string | null;
  rcaAsal: number | null;
  cmsaAsal: number | null;
  classAsal: string | null;
  rcaTujuan: number | null;
  cmsaTujuan: number | null;
  classTujuan: string | null;
  asalWorld: number | null;
  tujuanWorld: number | null;
};

export type AnalisisPotensiDayaSaingCalculationResult = {
  sourceName: string | null;
  origin: {
    code: string | null;
    name: string | null;
  };
  destination: {
    code: string | null;
    name: string | null;
  };
  rows: AnalisisPotensiDayaSaingCalcRow[];
  raw: unknown;
};

export type AnalisisRscaTbiRow = {
  hs4: string;
  kode: string | null;
  nama: string;
  rsca2019: number | null;
  rsca2023: number | null;
  tbi2019: number | null;
  tbi2023: number | null;
  share2019: number | null;
  share2023: number | null;
  pm2019: string | null;
  pm2023: string | null;
};

export type AnalisisRscaTbiResult = {
  sourceName: string | null;
  origin: {
    code: string | null;
    name: string | null;
  };
  destination: {
    code: string | null;
    name: string | null;
  };
  rows: AnalisisRscaTbiRow[];
  raw: unknown;
};

export type AnalisisRscaTbiCalculationRow = {
  hs4: string;
  kode: string | null;
  nama: string;
  nilai2019: number | null;
  nilai2023: number | null;
  dunia2019: number | null;
  dunia2023: number | null;
  rca2019: number | null;
  rca2023: number | null;
  rsca2019: number | null;
  rsca2023: number | null;
  tbi2019: number | null;
  tbi2023: number | null;
  groupRsca2019: number | null;
  groupRsca2023: number | null;
  groupTbi2019: number | null;
  groupTbi2023: number | null;
  pm2019: string | null;
  pm2023: string | null;
};

export type AnalisisRscaTbiCalculationResult = {
  sourceName: string | null;
  origin: {
    code: string | null;
    name: string | null;
  };
  destination: {
    code: string | null;
    name: string | null;
  };
  rows: AnalisisRscaTbiCalculationRow[];
  raw: unknown;
};

export type AnalisisRscaTbiComparisonRow = Record<
  string,
  string | number | null
>;

export type AnalisisRscaTbiComparisonResult = {
  sourceName: string | null;
  origin: {
    code: string | null;
    name: string | null;
  };
  destination: {
    code: string | null;
    name: string | null;
  };
  rows: AnalisisRscaTbiComparisonRow[];
  raw: unknown;
};

export type AnalisisRcaEpdRow = {
  hs4: string;
  kode: string | null;
  komoditas: string;
  kategoriEpd: string | null;
  avgGrowthShare: number | null;
  avgGrowthDemand: number | null;
  avgRca: number | null;
  xModel: string | null;
};

export type AnalisisRcaEpdResult = {
  sourceName: string | null;
  origin: {
    code: string | null;
    name: string | null;
  };
  destination: {
    code: string | null;
    name: string | null;
  };
  rows: AnalisisRcaEpdRow[];
  raw: unknown;
};

export type AnalisisRcaEpdCalculationRow = Record<
  string,
  string | number | null
>;

export type AnalisisRcaEpdCalculationResult = {
  sourceName: string | null;
  origin: {
    code: string | null;
    name: string | null;
  };
  destination: {
    code: string | null;
    name: string | null;
  };
  rows: AnalisisRcaEpdCalculationRow[];
  raw: unknown;
};

export type AnalisisRcaEpdComparisonRow = Record<
  string,
  string | number | null
>;

export type AnalisisRcaEpdComparisonResult = {
  sourceName: string | null;
  origin: {
    code: string | null;
    name: string | null;
  };
  destination: {
    code: string | null;
    name: string | null;
  };
  rows: AnalisisRcaEpdComparisonRow[];
  raw: unknown;
};

export type AnalisisRcaEpdXModelOptionResult = {
  options: string[];
  raw: unknown;
};

export type AnalisisGeopolitikCountryMeta = {
  codeAlpha3: string;
  codeAlpha2: string | null;
  name: string;
};

export type AnalisisGeopolitikTopCountryRow = {
  rank: number | null;
  name: string;
  codeAlpha3: string | null;
  codeAlpha2: string | null;
  currentValue: number;
  previousValue: number | null;
  currentShare: number | null;
  previousShare: number | null;
  deltaPct: number | null;
};

export type AnalisisGeopolitikProductCountryMetric = {
  codeAlpha3: string;
  codeAlpha2: string | null;
  name: string;
  value: number;
  previousValue: number;
  share: number | null;
  previousShare: number | null;
};

export type AnalisisGeopolitikProductItem = {
  no: number | null;
  hs: string;
  productName: string;
  worldCurrentValue: number;
  worldPreviousValue: number;
  countryMetrics: AnalisisGeopolitikProductCountryMetric[];
  rankList: string;
};

export type AnalisisGeopolitikPerdaganganResult = {
  meta: {
    year: number | null;
    previousYear: number | null;
    unit: string | null;
    sourceName: string | null;
    topGeoLimit: number;
    topProductsLimit: number;
    geoCountries: AnalisisGeopolitikCountryMeta[];
  };
  topGeoCountries: {
    export: AnalisisGeopolitikTopCountryRow[];
    import: AnalisisGeopolitikTopCountryRow[];
  };
  comparisonProducts: {
    export: AnalisisGeopolitikProductItem[];
    import: AnalisisGeopolitikProductItem[];
  };
  top20Products: {
    export: AnalisisGeopolitikProductItem[];
    import: AnalisisGeopolitikProductItem[];
  };
  raw: unknown;
};

export type AnalisisOperationalRiskCountryRow = {
  codeAlpha3: string | null;
  codeAlpha2: string | null;
  name: string;
  scores: Record<number, number>;
};

export type AnalisisOperationalRiskBreakdownRow = {
  indicatorId: number | null;
  indicator: string;
  scores: Record<number, number>;
};

export type AnalisisOperationalRiskResult = {
  meta: {
    years: number[];
    latestYear: number | null;
    sourceName: string | null;
    selectedCountry: {
      codeAlpha3: string | null;
      codeAlpha2: string | null;
      name: string | null;
    };
  };
  totalRows: AnalisisOperationalRiskCountryRow[];
  breakdownRows: AnalisisOperationalRiskBreakdownRow[];
  raw: unknown;
};
