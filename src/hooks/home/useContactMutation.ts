import { useMutation } from "@tanstack/react-query";
import { submitContact } from "@/service/homeService";

export function useContactMutation() {
  return useMutation({
    mutationKey: ["home", "contact"],
    mutationFn: submitContact
  });
}
