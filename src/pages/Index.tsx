import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import AIAssistantPrompt from '@/components/AIAssistantPrompt';
import Chatbot from '@/components/Chatbot';
import ChatToggleButton from '@/components/ChatToggleButton';
import { Droplet } from 'lucide-react';

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSearch = (_query: string) => {
    setIsChatOpen(true);
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Droplet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wide text-primary mb-2">
            RETREATS
          </h1>
          <p className="text-xl md:text-2xl tracking-[0.4em] text-muted-foreground font-light">
            HOLIDAYS
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />
      </main>

      <Footer />

      <AIAssistantPrompt onClick={handleOpenChat} />

      <ChatToggleButton isOpen={isChatOpen} onClick={handleOpenChat} />

      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default Index;
