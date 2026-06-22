import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Retreat } from '@/types/retreat';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, getConciergeFee } from '@/utils/pricing';

interface PayForDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  retreat: Retreat | null;
}

const PayForDetailsModal = ({ isOpen, onClose, retreat }: PayForDetailsModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retreat) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          customerEmail: email.trim(),
          customerName: fullName.trim(),
          retreat: {
            id: retreat.id,
            name: retreat.name,
            location: retreat.location,
            country: retreat.country,
            duration: retreat.duration,
            dates: retreat.dates,
            price: retreat.price,
            currency: retreat.currency,
            description: retreat.description,
            image: retreat.image,
            sourceUrl: retreat.sourceUrl,
          },
        },
      });

      if (error) throw error;
      const url = (data as { url?: string })?.url;
      if (!url) throw new Error('No checkout URL returned');

      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      toast({
        title: 'Payment could not start',
        description: err instanceof Error ? err.message : 'Try again or contact support.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !retreat) return null;

  const conciergeFee = getConciergeFee(retreat.price);
  const listingPrice = formatPrice(retreat.price, retreat.currency);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-border">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="font-display text-lg font-semibold text-foreground">Concierge redirection fee</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 border-b border-border bg-secondary/30">
          <p className="text-sm text-muted-foreground mb-2">
            Pay <span className="font-semibold text-foreground">{formatPrice(conciergeFee, retreat.currency)}</span>{' '}
            (5% concierge/redirection fee) to unlock the official vendor booking link. This fee is paid by you as the
            traveler — the vendor does not pay in this model.
          </p>
          <p className="text-xs text-muted-foreground">
            Vendor listing price: <span className="text-foreground">{listingPrice}</span> (you book and pay the vendor
            directly on their site).
          </p>
        </div>

        <form onSubmit={handlePay} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to secure payment…
              </>
            ) : (
              `Pay ${formatPrice(conciergeFee, retreat.currency)} with Stripe`
            )}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            After payment, the official vendor booking link unlocks in chat and we email it to you. Your final booking
            happens directly with the provider.
          </p>
        </form>
      </div>
    </div>
  );
};

export default PayForDetailsModal;
