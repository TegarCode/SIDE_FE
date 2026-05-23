import BubbleChart from "@/components/ChatBot/BubbleChart";
import type { ChatSector } from "@/hooks/ChatBot/useChatbot";

type BubbleChatProps = {
  message?: string;
  sector: ChatSector;
  sender: "user" | "bot";
  isLoading?: boolean;
  visualization?: boolean;
  dataset?: Record<string, unknown>[] | null;
};

export default function BubbleChat({
  message,
  sector,
  sender,
  isLoading = false,
  visualization = false,
  dataset = null
}: BubbleChatProps) {
  const isBot = sender === "bot";

  return (
    <div className="mb-4">
      <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
        <div
          className={`max-w-[80%] whitespace-pre-wrap rounded-xl px-4 py-2 text-sm shadow-sm ${
            isBot
              ? "rounded-tl-none bg-slate-100 text-slate-800"
              : "rounded-tr-none bg-[#384AA0] text-white"
          }`}
        >
          {isLoading ? (
            <span className="flex animate-pulse space-x-1">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span className="h-2 w-2 rounded-full bg-slate-400" />
            </span>
          ) : (
            message?.split("\n").map((line, index) => <p key={index}>{line}</p>)
          )}
        </div>
      </div>

      {visualization && !isLoading && dataset && (
        <div className="ml-6 mt-2 max-w-[80%]">
          <BubbleChart sector={sector} dataset={dataset} />
        </div>
      )}
    </div>
  );
}
