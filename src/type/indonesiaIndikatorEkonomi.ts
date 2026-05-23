import type { SelectOption } from "@/type/indonesiaDiplomasi";

export type EconomicIndicatorOption = SelectOption;

export type EconomicIndicatorFilterState = {
  year: string | null;
  indicatorId: string | null;
};

export type EconomicIndicatorMasterData = {
  yearOptions: SelectOption[];
  indicatorOptions: EconomicIndicatorOption[];
};

export type EconomicIndicatorOverviewParams = {
  indicator_id: string;
  year: number;
};

export type EconomicIndicatorOverviewData = {
  raw: unknown;
  meta: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
};
