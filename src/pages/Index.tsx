import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import AIAssistantPrompt from '@/components/AIAssistantPrompt';
import Chatbot from '@/components/Chatbot';
import ChatToggleButton from '@/components/ChatToggleButton';
import PayForDetailsModal from '@/components/PayForDetailsModal';
import { Retreat } from '@/types/retreat';
import { Droplet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { appendUnlockedRetreatKey, readUnlockedRetreatKeys } from '@/utils/retreatUnlock';

const Index = () => {
  const { toast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState<string | undefined>();
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedRetreat, setSelectedRetreat] = useState<Retreat | null>(null);
  const [unlockedRetreatIds, setUnlockedRetreatIds] = useState<string[]>(() => readUnlockedRetreatKeys());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    if (payment === 'cancel') {
      toast({
        title: 'Payment cancelled',
        description: 'You can pay the concierge fee anytime from the chat.',
      });
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (payment !== 'success' || !sessionId) return;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stripe-verify-retreat-payment', {
          body: { sessionId },
        });

        if (error) throw error;
        const payload = data as { success?: boolean; error?: string; retreatId?: string };
        if (!payload?.success || !payload.retreatId) {
          throw new Error(payload?.error || 'Could not verify payment.');
        }

        setUnlockedRetreatIds((prev) => {
          const next = appendUnlockedRetreatKey({ id: payload.retreatId }, prev);
          return next;
        });

        setIsChatOpen(true);

        toast({
          title: 'Payment successful',
          description: 'The official vendor booking link is unlocked. Check your email and book directly with the provider.',
        });
      } catch (e) {
        console.error(e);
        toast({
          title: 'Could not confirm payment',
          description: e instanceof Error ? e.message : 'Try again or contact support.',
          variant: 'destructive',
        });
      } finally {
        window.history.replaceState({}, '', window.location.pathname);
      }
    })();
  }, [toast]);

  const handleSearch = (query: string) => {
    setInitialQuery(query);
    setIsChatOpen(true);
  };

  const handleOpenChat = () => {
    setInitialQuery(undefined);
    setIsChatOpen(true);
  };

  const handlePayForDetails = (retreat: Retreat) => {
    setSelectedRetreat(retreat);
    setIsPayModalOpen(true);
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
        initialQuery={initialQuery}
        onBookRetreat={handlePayForDetails}
        unlockedRetreatIds={unlockedRetreatIds}
      />

      <PayForDetailsModal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setSelectedRetreat(null);
        }}
        retreat={selectedRetreat}
      />
    </div>
  );
};

export default Index;
