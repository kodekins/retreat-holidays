import { X, RefreshCw, Send, Loader2, Droplet } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Retreat } from '@/types/retreat';
import { searchRetreats } from '@/data/retreats';
import RetreatCard from './RetreatCard';
import { v4 as uuidv4 } from 'uuid';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onBookRetreat: (retreat: Retreat) => void;
}

const Chatbot = ({ isOpen, onClose, initialQuery, onBookRetreat }: ChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Retreats Holidays assistant. Tell me what kind of retreat you're looking for - yoga, meditation, surf, wellness - and I'll find the perfect match for you!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && initialQuery && messages.length === 1) {
      handleSendMessage(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const retreats = searchRetreats(text);
      
      let responseContent = '';
      if (retreats.length > 0) {
        responseContent = `I found ${retreats.length} great option${retreats.length > 1 ? 's' : ''} for you! Here's what I recommend:`;
      } else {
        responseContent = "I couldn't find retreats matching your exact criteria. Here are some of our popular retreats that you might enjoy:";
      }

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: responseContent,
        retreats: retreats.length > 0 ? retreats : searchRetreats('yoga wellness'),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleWhatsApp = (retreat: Retreat) => {
    const message = encodeURIComponent(
      `Hi! I'm interested in the "${retreat.name}" retreat in ${retreat.location}, ${retreat.country}. Can you provide more information?`
    );
    window.open(`https://wa.me/23058461923?text=${message}`, '_blank');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your Retreats Holidays assistant. Tell me what kind of retreat you're looking for - yoga, meditation, surf, wellness - and I'll find the perfect match for you!",
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] bg-background rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Droplet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Retreats Holidays</h3>
            <p className="text-xs text-muted-foreground">Your personal assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={resetChat}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Reset chat"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="animate-fade-in">
            {message.role === 'user' ? (
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%] text-sm">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%] text-sm text-foreground">
                  {message.content}
                </div>
                {message.retreats && message.retreats.length > 0 && (
                  <div className="space-y-3">
                    {message.retreats.slice(0, 3).map((retreat) => (
                      <RetreatCard
                        key={retreat.id}
                        retreat={retreat}
                        onBook={onBookRetreat}
                        onWhatsApp={handleWhatsApp}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Searching retreats...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-secondary/20">
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
