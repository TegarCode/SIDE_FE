import { useQuery } from "@tanstack/react-query";
import { fetchFaqTopics } from "@/service/homeService";

export function useFaqTopicsQuery(options?: { featuredOnly?: boolean }) {
  return useQuery({
    queryKey: [
      "home",
      "faq-topics",
      options?.featuredOnly ? "featured" : "all"
    ],
    queryFn: () => fetchFaqTopics(options),
    staleTime: 1000 * 60 * 10
  });
}
