import { Phone } from 'lucide-react';

interface AIAssistantPromptProps {
  onClick: () => void;
}

const AIAssistantPrompt = ({ onClick }: AIAssistantPromptProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 z-40 flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30 group"
    >
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Phone className="w-5 h-5 text-primary" />
      </div>
      <div className="text-left">
        <p className="font-medium text-foreground text-sm">Want to go?</p>
        <p className="text-muted-foreground text-xs">Talk with Johanna, your concierge</p>
      </div>
    </button>
  );
};

export default AIAssistantPrompt;
