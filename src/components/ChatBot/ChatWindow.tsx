import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  InformationCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";
import chatbotMaskotImg from "@/assets/images/chatbot-maskot.png";
import BubbleChat from "@/components/ChatBot/BubbleChat";
import ExamplePrompts from "@/components/ChatBot/ExamplePrompts";
import type { ChatMessage, ChatSector } from "@/hooks/ChatBot/useChatbot";

const SECTOR_KEYWORDS: Record<Exclude<ChatSector, null>, string[]> = {
  Perdagangan: [
    "perdagangan",
    "dagang",
    "ekspor",
    "export",
    "impor",
    "import",
    "hs",
    "hscode",
    "komoditas",
    "tarif",
    "trade"
  ],
  Pariwisata: [
    "pariwisata",
    "wisata",
    "tourism",
    "kunjungan",
    "wisman",
    "hotel",
    "akomodasi"
  ],
  Investasi: [
    "investasi",
    "investment",
    "pma",
    "pmdn",
    "fdi",
    "inbound",
    "outbound",
    "penanaman modal"
  ],
  Jasa: [
    "jasa",
    "services",
    "ekspor jasa",
    "impor jasa",
    "jasa keuangan",
    "jasa telekom"
  ]
};

function detectSectorFromText(text: string): ChatSector {
  const lower = text.toLowerCase();
  const command = lower.match(
    /\/se(k|c)tor\s+(perdagangan|pariwisata|investasi|jasa)/i
  );

  if (command?.[2]) {
    const sector = command[2].toLowerCase();

    if (sector === "perdagangan") return "Perdagangan";
    if (sector === "pariwisata") return "Pariwisata";
    if (sector === "investasi") return "Investasi";
    if (sector === "jasa") return "Jasa";
  }

  for (const [sector, words] of Object.entries(SECTOR_KEYWORDS)) {
    if (words.some((word) => lower.includes(word))) {
      return sector as Exclude<ChatSector, null>;
    }
  }

  return null;
}

type ChatWindowProps = {
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void | Promise<void>;
  loading: boolean;
  sector: ChatSector;
  setSector: (sector: ChatSector) => void;
  onClearMessages: () => void;
};

export default function ChatWindow({
  onClose,
  messages,
  onSend,
  loading,
  sector,
  setSector,
  onClearMessages
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const element = containerRef.current;
      if (element && !element.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const sectorTips = useMemo(
    () => [
      {
        name: "Perdagangan",
        keywords: SECTOR_KEYWORDS.Perdagangan.slice(0, 6)
      },
      { name: "Pariwisata", keywords: SECTOR_KEYWORDS.Pariwisata.slice(0, 6) },
      { name: "Investasi", keywords: SECTOR_KEYWORDS.Investasi.slice(0, 6) },
      { name: "Jasa", keywords: SECTOR_KEYWORDS.Jasa.slice(0, 6) }
    ],
    []
  );

  const handleDownload = () => {
    const content = messages
      .map(
        (message) =>
          `${message.sender === "user" ? "Kamu" : "Bot"}: ${message.text}`
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chatbot-${sector?.toLowerCase() ?? "log"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleChangeSector = (nextSector: ChatSector) => {
    onClearMessages();
    setSector(nextSector);
  };

  const handleSend = (text: string, sectorOverride?: ChatSector) => {
    const detectedSector = sectorOverride || detectSectorFromText(text);

    if (!sector && detectedSector) {
      setSector(detectedSector);
    }

    void onSend(text);
    setInput("");
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-28 right-4 z-50 flex h-[32rem] w-11/12 flex-col rounded-3xl border border-slate-200 bg-white shadow-xl sm:right-6 sm:w-96"
    >
      <div className="relative flex items-center justify-between rounded-t-3xl border-b border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="absolute left-5">
          <img
            src={chatbotMaskotImg}
            width="90"
            className="-mt-10"
            alt="Chatbot Maskot"
          />
        </div>
        <div className="flex-1" />
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleDownload}
              className="text-slate-500 transition hover:text-slate-700"
              title="Unduh riwayat chat"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 transition hover:bg-slate-100"
            title="Tutup chat"
          >
            <XMarkIcon className="h-5 w-5 text-slate-500 transition hover:text-slate-700" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-md bg-slate-50 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Sektor saat ini: <strong>{sector ?? "otomatis dari chat"}</strong>
          </p>
          {sector && (
            <button
              type="button"
              onClick={() => handleChangeSector(null)}
              className="text-xs text-blue-600 hover:underline"
            >
              Reset sektor
            </button>
          )}
        </div>

        <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-[9px] font-semibold">
            B
          </span>
          <span>
            Chatbot ini masih dalam tahap{" "}
            <span className="font-semibold">beta</span>. Gunakan sebagai bahan
            awal analisis, bukan keputusan final.
          </span>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="mt-0.5 h-4 w-4 text-blue-600" />
            <div>
              <p className="mb-1">
                Kamu bisa langsung tanya apa saja. Sektor akan dideteksi
                otomatis dari kata kunci.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {sectorTips.map(({ name, keywords }) => (
                  <div
                    key={name}
                    className="rounded border border-slate-200 p-2"
                  >
                    <p className="font-medium">{name}</p>
                    <p className="text-[11px] text-slate-500">
                      Kata kunci: {keywords.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ExamplePrompts
          sector={sector}
          onSelect={(payload) => {
            if (typeof payload === "string") {
              setInput(payload);
              return;
            }

            if (!sector && payload.sectorHint) {
              setSector(payload.sectorHint);
            }

            setInput(payload.text);
          }}
        />

        {messages.map((message, index) => (
          <BubbleChat
            key={index}
            message={message.text}
            sender={message.sender}
            sector={sector}
            visualization={message.visualization}
            dataset={message.dataset}
          />
        ))}

        {loading && <BubbleChat sender="bot" sector={sector} isLoading />}
      </div>

      <div className="rounded-b-3xl border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center rounded-full border border-slate-300 shadow-sm">
          <input
            type="text"
            className="flex-grow rounded-l-full bg-transparent px-4 py-2 text-sm focus:outline-none"
            placeholder={
              sector
                ? `Tulis pertanyaan sektor ${sector.toLowerCase()}...`
                : "Tulis pertanyaan, sektor akan dideteksi otomatis..."
            }
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && input.trim()) {
                handleSend(input.trim());
              }
            }}
          />
          <button
            type="button"
            className="rounded-r-full bg-[#384AA0] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#253583]"
            onClick={() => input.trim() && handleSend(input.trim())}
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
