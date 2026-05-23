import type { ChatSector } from "@/hooks/ChatBot/useChatbot";
import { getExamplesForSector } from "@/components/ChatBot/sectorExamples";

type ExamplePromptPayload =
  | string
  | { text: string; sectorHint: Exclude<ChatSector, null> };

type ExamplePromptsProps = {
  sector: ChatSector;
  onSelect: (payload: ExamplePromptPayload) => void;
};

export default function ExamplePrompts({
  sector,
  onSelect
}: ExamplePromptsProps) {
  const examples = getExamplesForSector(sector);

  if (!sector) {
    const groupedExamples = examples as Record<string, string[]>;

    return (
      <div className="mb-2 text-xs text-slate-600">
        <p className="mb-1 font-semibold">Contoh pertanyaan:</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(groupedExamples).map(([sectorName, list]) => (
            <div
              key={sectorName}
              className="rounded-md border border-slate-200 bg-white p-2"
            >
              <p className="mb-1 font-semibold text-slate-700">{sectorName}</p>
              <ul className="ml-4 list-disc space-y-1">
                {list.slice(0, 3).map((example: string, index: number) => (
                  <li key={`${sectorName}-${index}`}>
                    <button
                      type="button"
                      onClick={() =>
                        onSelect({
                          text: example,
                          sectorHint: sectorName as Exclude<ChatSector, null>
                        })
                      }
                      className="text-left text-blue-700 hover:underline"
                    >
                      {example}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sectorExamples = examples as string[];

  return (
    <div className="mb-2 text-xs text-slate-600">
      <p className="mb-1 font-semibold">Contoh pertanyaan:</p>
      <ul className="ml-5 list-disc space-y-1">
        {sectorExamples.map((example: string, index: number) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => onSelect(example)}
              className="text-left text-blue-700 hover:underline"
            >
              {example}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
