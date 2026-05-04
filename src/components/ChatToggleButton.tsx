import { useState, useEffect } from 'react';

interface ChatToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const messages = [
  "Not sure what you want? I'll help you find it",
  "Tell me your vibe, I'll find the perfect retreat",
  "Let's build your dream holiday together",
  "I've got the best retreats based on your taste",
  "Answer a few questions & I'll do the rest"
];

const ChatToggleButton = ({ isOpen, onClick }: ChatToggleButtonProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const holdTimeout = window.setTimeout(() => {
      setIsFading(true);
    }, 2500);

    const swapTimeout = window.setTimeout(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      setIsFading(false);
    }, 2900);

    return () => {
      window.clearTimeout(holdTimeout);
      window.clearTimeout(swapTimeout);
    };
  }, [currentMessageIndex]);

  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="flex items-end gap-3">
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-[hsl(189_85%_43%_/_0.35)] bg-gradient-to-br from-[hsl(189_85%_43%_/_0.28)] via-[hsl(189_85%_43%_/_0.18)] to-background/95 px-4 py-3 shadow-[0_10px_30px_-12px_hsl(189_85%_43%_/_0.65)] backdrop-blur-md max-w-[280px] min-h-[52px] flex items-center">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(189_85%_43%_/_0.25)] to-transparent opacity-80" />
            <span
              className={`relative z-10 text-sm font-medium text-foreground transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}
            >
              {messages[currentMessageIndex]}
            </span>
          </div>
          <div className="absolute bottom-3 -right-2 w-4 h-4 rotate-45 border-r border-b border-[hsl(189_85%_43%_/_0.35)] bg-[hsl(189_85%_43%_/_0.22)] backdrop-blur-md" />
        </div>
        <button
          onClick={onClick}
          className="group w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all duration-300 flex items-center justify-center ring-2 ring-primary/30 hover:ring-primary/50"
          aria-label="Open chat"
        >
          <img
            src="/travel-assistant.jpeg"
            alt="Travel Assistant"
            className="w-full h-full object-cover rounded-full scale-100 group-hover:scale-105 transition-transform duration-300"
          />
        </button>
      </div>
    </div>
  );
};

export default ChatToggleButton;
