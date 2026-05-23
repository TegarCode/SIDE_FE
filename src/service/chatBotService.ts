import { httpRequest } from "@/service/httpClient";

type ChatbotResponsePayload = {
  answer?: string;
  visualization?: boolean;
  dataset?: Record<string, unknown>[] | null;
};

type ChatbotApiResponse = {
  data?: ChatbotResponsePayload;
};

export async function askChatbot(message: string, sector: string | null) {
  return httpRequest<ChatbotApiResponse>("/api/v1/chatbot", {
    method: "POST",
    body: {
      message,
      sector
    }
  });
}
