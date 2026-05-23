import { useState } from "react";
import chatbotMaskotImg from "@/assets/images/chatbot-maskot.png";
import ChatWindow from "@/components/ChatBot/ChatWindow";
import { useChatbot } from "@/hooks/ChatBot/useChatbot";

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [launcherHidden, setLauncherHidden] = useState(false);
  const { messages, loading, sendMessage, sector, setSector, clearMessages } =
    useChatbot();

  return (
    <>
      {open && (
        <ChatWindow
          onClose={() => setOpen(false)}
          messages={messages}
          onSend={sendMessage}
          loading={loading}
          sector={sector}
          setSector={setSector}
          onClearMessages={clearMessages}
        />
      )}

      {!launcherHidden && !open && (
        <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="focus:outline-none"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg sm:h-20 sm:w-20">
                <img
                  src={chatbotMaskotImg}
                  alt="Chatbot"
                  className="mb-6 w-20"
                />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLauncherHidden(true)}
              className="absolute -top-5 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800/90 text-xs text-white shadow-md transition hover:bg-slate-900"
              aria-label="Sembunyikan chatbot"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {launcherHidden && !open && (
        <button
          type="button"
          onClick={() => setLauncherHidden(false)}
          className="fixed bottom-4 right-4 z-40 rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-sky-700 sm:bottom-6 sm:right-6"
        >
          Tampilkan Chatbot
        </button>
      )}
    </>
  );
}
