import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const JOHANNA_EMBED_URL =
  'https://johanna-retreats-holidays-gxdv8a.v2.appdeploy.ai/?embed=1&channel=retreats';

const Chatbot = ({ isOpen, onClose }: ChatbotProps) => {
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  return (
    <section
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background animate-slide-up sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(720px,calc(100vh-3rem))] sm:w-[420px] sm:rounded-2xl sm:border sm:border-border sm:shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Johanna, Retreats Holidays concierge"
    >
      <header className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/20 sm:h-14 sm:w-14">
            <img
              src="/travel-assistant.jpeg"
              alt="Johanna"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">Johanna</h2>
            <p className="truncate text-sm text-muted-foreground">
              Concierge &amp; Provider Matching
            </p>
          </div>
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setIframeKey((key) => key + 1)}
            className="rounded-lg p-2 transition-colors hover:bg-secondary"
            aria-label="Restart Johanna"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-secondary"
            aria-label="Close chat"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <iframe
        key={iframeKey}
        src={JOHANNA_EMBED_URL}
        title="Johanna — Retreats Holidays concierge"
        className="min-h-0 flex-1 border-0 bg-background"
        allow="microphone; clipboard-write"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </section>
  );
};

export default Chatbot;
