import { useState } from "react";
import { askChatbot } from "@/service/chatBotService";

export type ChatSector =
  | "Perdagangan"
  | "Pariwisata"
  | "Investasi"
  | "Jasa"
  | null;

export type ChatMessage = {
  text: string;
  sender: "user" | "bot";
  sector: ChatSector;
  visualization?: boolean;
  dataset?: Record<string, unknown>[] | null;
};

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sector, setSector] = useState<ChatSector>(null);

  const sendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      text,
      sender: "user",
      sector
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await askChatbot(text, sector);
      const response = res.data.data ?? {};
      const botText = response.answer ?? "Data tidak ditemukan.";

      const botMessage: ChatMessage = {
        text: botText,
        sender: "bot",
        sector,
        visualization: response.visualization ?? false,
        dataset: response.dataset ?? null
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: "Terjadi kesalahan saat menghubungi server.",
          sender: "bot",
          sector
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    sendMessage,
    sector,
    setSector,
    clearMessages
  };
}
