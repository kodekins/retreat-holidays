import { MessageCircle } from 'lucide-react';

interface ChatToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const ChatToggleButton = ({ isOpen, onClick }: ChatToggleButtonProps) => {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all duration-300 flex items-center justify-center animate-chat-bounce"
      aria-label="Open chat"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
};

export default ChatToggleButton;
