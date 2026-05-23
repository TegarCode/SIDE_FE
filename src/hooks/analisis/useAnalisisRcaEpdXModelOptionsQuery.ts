import { useQuery } from "@tanstack/react-query";
import { fetchAnalisisRcaEpdXModelOptions } from "@/service/analisis";
import type { AnalisisRcaEpdXModelOptionResult } from "@/type/analisis";

type UseAnalisisRcaEpdXModelOptionsQueryParams = {
  origin: string | null;
  dest: string | null;
  level?: number;
  enabled?: boolean;
};

export function useAnalisisRcaEpdXModelOptionsQuery({
  origin,
  dest,
  level,
  enabled = true
}: UseAnalisisRcaEpdXModelOptionsQueryParams) {
  return useQuery<AnalisisRcaEpdXModelOptionResult>({
    queryKey: [
      "analisis",
      "potensi-daya-saing",
      "rca-epd-xmodel-options",
      origin ?? null,
      dest ?? null,
      level ?? null
    ],
    queryFn: () =>
      fetchAnalisisRcaEpdXModelOptions({
        origin: origin ?? "",
        dest: dest ?? "",
        level
      }),
    enabled: enabled && Boolean(origin) && Boolean(dest),
    staleTime: 1000 * 60 * 10
  });
}
