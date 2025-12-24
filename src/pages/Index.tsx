import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import AIAssistantPrompt from '@/components/AIAssistantPrompt';
import Chatbot from '@/components/Chatbot';
import ChatToggleButton from '@/components/ChatToggleButton';
import BookingModal from '@/components/BookingModal';
import { Retreat } from '@/types/retreat';
import { Droplet } from 'lucide-react';

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState<string | undefined>();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRetreat, setSelectedRetreat] = useState<Retreat | null>(null);

  const handleSearch = (query: string) => {
    setInitialQuery(query);
    setIsChatOpen(true);
  };

  const handleOpenChat = () => {
    setInitialQuery(undefined);
    setIsChatOpen(true);
  };

  const handleBookRetreat = (retreat: Retreat) => {
    setSelectedRetreat(retreat);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo */}
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
        
        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />
      </main>
      
      <Footer />
      
      {/* AI Assistant Prompt - Bottom Left */}
      <AIAssistantPrompt onClick={handleOpenChat} />
      
      {/* Chat Toggle Button - Bottom Right */}
      <ChatToggleButton 
        isOpen={isChatOpen} 
        onClick={handleOpenChat} 
      />
      
      {/* Chatbot */}
      <Chatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        initialQuery={initialQuery}
        onBookRetreat={handleBookRetreat}
      />
      
      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        retreat={selectedRetreat}
      />
    </div>
  );
};

export default Index;
