import { X, RefreshCw, Send, Loader2, Droplet } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Retreat } from '@/types/retreat';
import RetreatCard from './RetreatCard';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onBookRetreat: (retreat: Retreat) => void;
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface APIRetreat {
  id: string;
  name: string;
  location: string;
  country: string;
  duration: string;
  price: number;
  currency: string;
  description: string;
  activities: string[];
  source: string;
  url?: string;
  image?: string;
}

const Chatbot = ({ isOpen, onClose, initialQuery, onBookRetreat }: ChatbotProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there! 👋 I'm Sarah, your personal retreat specialist. I've helped hundreds of people find their perfect wellness getaway. What's bringing you to look for a retreat today? Whether you need to destress, reconnect with yourself, or just want an adventure - I'm here to help!",
      timestamp: new Date(),
    },
  ]);
  const [conversationHistory, setConversationHistory] = useState<AIMessage[]>([]);
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

  // Convert API retreat to app Retreat format
  const convertToRetreat = (apiRetreat: APIRetreat): Retreat => ({
    id: apiRetreat.id,
    name: apiRetreat.name,
    location: apiRetreat.location,
    country: apiRetreat.country,
    dates: 'Flexible Dates',
    duration: apiRetreat.duration,
    price: apiRetreat.price,
    currency: apiRetreat.currency || 'USD',
    image: apiRetreat.image || 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
    description: apiRetreat.description,
    activities: apiRetreat.activities,
    category: apiRetreat.activities[0]?.toLowerCase() || 'wellness',
    rating: 4.8,
  });

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

    const newConversationHistory: AIMessage[] = [
      ...conversationHistory,
      { role: 'user', content: text }
    ];

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { messages: newConversationHistory }
      });

      if (error) throw error;

      const aiContent = data?.content || "Here are some great retreat options for you!";
      
      // Convert API retreats to app format
      const retreats: Retreat[] = (data?.retreats || []).map(convertToRetreat);

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiContent,
        retreats: retreats.length > 0 ? retreats : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationHistory([
        ...newConversationHistory,
        { role: 'assistant', content: aiContent }
      ]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });

      const fallbackMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
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
        content: "Hey there! 👋 I'm Sarah, your personal retreat specialist. I've helped hundreds of people find their perfect wellness getaway. What's bringing you to look for a retreat today? Whether you need to destress, reconnect with yourself, or just want an adventure - I'm here to help!",
        timestamp: new Date(),
      },
    ]);
    setConversationHistory([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] bg-background rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" 
              alt="Sarah"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Sarah</h3>
            <p className="text-xs text-muted-foreground">Your Retreat Specialist</p>
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
                  <div className="space-y-3 mt-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Found {message.retreats.length} retreats matching your preferences:
                    </p>
                    {message.retreats.slice(0, 5).map((retreat) => (
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
              <span className="text-sm text-muted-foreground">Thinking...</span>
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
