import { useMutation } from "@tanstack/react-query";
import { loginWithPassword } from "@/service/authService";

export function useLoginMutation() {
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: loginWithPassword
  });
}
