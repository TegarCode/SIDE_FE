import type { SelectOption } from "@/type/indonesiaDiplomasi";

export type BilateralSectorKey =
  | "perdagangan"
  | "pariwisata"
  | "investasi"
  | "jasa";

export type BilateralTabSlug =
  | "perdagangan"
  | "pariwisata"
  | "investasi"
  | "jasa"
  | "kerjasama_pembangunan";

export type BilateralSourceBySector = Record<BilateralSectorKey, string | null>;
export type BilateralSourceOptionsBySector = Record<
  BilateralSectorKey,
  SelectOption[]
>;

export type BilateralFilterState = {
  partners: string[];
  hsCodes: string[];
  sourceBySector: BilateralSourceBySector;
};

export type BilateralApiSourceItem = {
  sektor: BilateralSectorKey;
  sumber: string;
};

export type BilateralTradeCompetitionInsightParams = {
  hsCode: string;
  negara: string;
  year?: number;
  sumber?: BilateralApiSourceItem[];
};

export type BilateralOverviewParams = {
  partners: string[];
  hsCode?: string[] | "ALL";
  sumber?: BilateralApiSourceItem[];
};

export type BilateralMasterData = {
  partnerOptions: SelectOption[];
  hsOptions: SelectOption[];
  sourceOptionsBySector: BilateralSourceOptionsBySector;
};

export type BilateralOverviewData = {
  raw: unknown;
  items: Array<Record<string, unknown>>;
  meta: Record<string, unknown>;
};
