export type GroupedFilterOption = {
  value: string;
  label: string;
  code: string;
  description: string;
  groupLabel?: string;
};

export type GroupedFilterOptionGroup = {
  label: string;
  options: GroupedFilterOption[];
  optionCount: number;
};

export type SektorHsCodeGroupResult = {
  sektor: string | null;
  sourceDescription: string | null;
  groups: GroupedFilterOptionGroup[];
  totalCount: number;
};

export type TikTradeFlowItem = {
  negara: string;
  kode_alpha2: string | null;
  kode_alpha3: string | null;
  nilai_perdagangan: Record<number, number>;
  neraca: Record<number, number>;
  proporsi: Record<number, number>;
};

export type TikTradeFlowResult = {
  items: TikTradeFlowItem[];
  years: number[];
  totalWorld: number;
  totalWorldPerYear: Record<number, number>;
  sourceName: string | null;
  unit: string | null;
  filters: {
    origin: string[];
    dest: string[];
    hsList: string[];
  };
};

export type TikTradeProductItem = {
  kodeHS: string;
  namaHS: string;
  ekspor: Record<number, number>;
  impor: Record<number, number>;
  total: Record<number, number>;
  share: Record<number, number>;
};

export type TikTradeProductsResult = {
  products: TikTradeProductItem[];
  latestYear: number | null;
  prevYear: number | null;
  years: number[];
  sourceName: string | null;
  unit: string | null;
  partners: Array<{
    a3: string;
    a2: string | null;
    nama: string;
  }>;
  reporters: Array<{
    a3: string;
    a2: string | null;
    nama: string;
  }>;
  hsApplied: string[];
};

export type EnergyTradeFlowItem = TikTradeFlowItem;

export type EnergyTradeFlowResult = TikTradeFlowResult;

export type EnergyTradeProductItem = TikTradeProductItem;

export type EnergyTradeProductsResult = TikTradeProductsResult;

export type MineralKritisTradeFlowItem = TikTradeFlowItem;

export type MineralKritisTradeFlowResult = TikTradeFlowResult;

export type MineralKritisTradeProductItem = TikTradeProductItem;

export type MineralKritisTradeProductsResult = TikTradeProductsResult;

export type KesehatanTradeFlowItem = TikTradeFlowItem;

export type KesehatanTradeFlowResult = TikTradeFlowResult;

export type KesehatanTradeProductItem = TikTradeProductItem;

export type KesehatanTradeProductsResult = TikTradeProductsResult;

export type PanganTradeFlowItem = TikTradeFlowItem;

export type PanganTradeFlowResult = TikTradeFlowResult;

export type PanganTradeProductItem = TikTradeProductItem;

export type PanganTradeProductsResult = TikTradeProductsResult;

export type PertahananTradeFlowItem = TikTradeFlowItem;

export type PertahananTradeFlowResult = TikTradeFlowResult;

export type PertahananTradeProductItem = TikTradeProductItem;

export type PertahananTradeProductsResult = TikTradeProductsResult;

export type HilirisasiTradeFlowItem = TikTradeFlowItem;

export type HilirisasiTradeFlowResult = TikTradeFlowResult;

export type HilirisasiTradeProductItem = TikTradeProductItem & {
  sektor?: string | null;
};

export type HilirisasiTradeProductsResult = {
  products: HilirisasiTradeProductItem[];
  latestYear: number | null;
  prevYear: number | null;
  years: number[];
  sourceName: string | null;
  unit: string | null;
  partners: Array<{
    a3: string;
    a2: string | null;
    nama: string;
  }>;
  reporters: Array<{
    a3: string;
    a2: string | null;
    nama: string;
  }>;
  hsApplied: string[];
};
