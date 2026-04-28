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
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentMessage = messages[currentMessageIndex];
    let timeout: number;

    if (isTyping) {
      if (currentText.length < currentMessage.length) {
        timeout = setTimeout(() => {
          setCurrentText(currentMessage.slice(0, currentText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 30);
      } else {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isTyping, currentMessageIndex]);

  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative">
        <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg shadow-lg max-w-xs mb-2 text-sm border">
          {currentText}
          <span className="animate-pulse">|</span>
        </div>
        <div className="absolute bottom-0 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-secondary"></div>
      </div>
      <button
        onClick={onClick}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all duration-300 flex items-center justify-center"
        aria-label="Open chat"
      >
        <img src="/travel-assistant.jpeg" alt="Travel Assistant" className="w-full h-full object-cover rounded-full" />
      </button>
    </div>
  );
};

export default ChatToggleButton;
