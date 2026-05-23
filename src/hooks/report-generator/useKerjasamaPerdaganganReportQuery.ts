import { useQuery } from "@tanstack/react-query";
import {
  fetchKerjasamaPerdaganganReport,
  type KerjasamaPerdaganganFilterParams
} from "@/service/report-generator/kerjasamaPerdagangan";

export function useKerjasamaPerdaganganReportQuery(
  params: KerjasamaPerdaganganFilterParams | null
) {
  return useQuery({
    queryKey: ["report-generator", "kerjasama-perdagangan", params],
    queryFn: () =>
      fetchKerjasamaPerdaganganReport(
        params as KerjasamaPerdaganganFilterParams
      ),
    enabled: Boolean(
      params?.origin &&
      params?.destinations?.length &&
      params?.sumber &&
      params?.year_start &&
      params?.year_end
    ),
    staleTime: 1000 * 60 * 5
  });
}
