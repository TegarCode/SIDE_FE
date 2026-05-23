import type { DiplomasiOverviewData } from "@/type/indonesiaDiplomasi";

export type DiplomasiTabPanelProps = {
  overview: DiplomasiOverviewData | null;
  loading: boolean;
  error: string | null;
  periodLabel: string;
};
