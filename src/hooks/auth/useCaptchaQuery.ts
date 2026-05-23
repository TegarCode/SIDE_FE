import { useQuery } from "@tanstack/react-query";
import { fetchCaptcha } from "@/service/authService";

export function useCaptchaQuery() {
  const query = useQuery({
    queryKey: ["auth", "captcha"],
    queryFn: fetchCaptcha,
    staleTime: 0,
    refetchOnWindowFocus: false
  });

  return {
    captchaId: query.data?.id ?? "",
    captchaImage: query.data?.image ?? "",
    isCaptchaLoading: query.isLoading || query.isRefetching,
    refreshCaptcha: query.refetch
  };
}
