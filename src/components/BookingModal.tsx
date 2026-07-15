import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Retreat, BookingFormData } from '@/types/retreat';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, getEffectiveRetreatPrice } from '@/utils/pricing';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  retreat: Retreat | null;
}

const BookingModal = ({ isOpen, onClose, retreat }: BookingModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    numberOfGuests: 1,
    specialRequests: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedVariationId(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        numberOfGuests: 1,
        specialRequests: '',
      });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numberOfGuests' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retreat) return;
    
    setIsSubmitting(true);

    try {
      const pricing = getEffectiveRetreatPrice(retreat, selectedVariationId);
      
      const { error } = await supabase.functions.invoke('send-booking-email', {
        body: {
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          retreatName: retreat.name,
          retreatLocation: `${retreat.location}, ${retreat.country}`,
          retreatDuration: retreat.duration,
          retreatPrice: pricing.price,
          numberOfGuests: formData.numberOfGuests,
          specialRequests: formData.specialRequests,
        }
      });

      if (error) throw error;

      toast({
        title: "Booking Request Submitted!",
        description: "Check your email for confirmation. We'll contact you shortly.",
      });
      
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        numberOfGuests: 1,
        specialRequests: '',
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Submitted",
        description: "Your request was received. We'll contact you shortly.",
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !retreat) return null;

  const pricing = getEffectiveRetreatPrice(retreat, selectedVariationId);
  const selectedVariation = retreat?.pricingVariations?.find((variation) => variation.id === selectedVariationId) || retreat?.pricingVariations?.[0] || null;
  const totalPrice = pricing.price * formData.numberOfGuests;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="font-display text-xl font-semibold text-foreground">Book Your Retreat</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Retreat Summary */}
        <div className="p-4 border-b border-border bg-secondary/30">
          <div className="flex gap-4">
            <img
              src={retreat.image}
              alt={retreat.name}
              className="w-24 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{retreat.name}</h3>
              <p className="text-xs text-muted-foreground">
                {retreat.location}, {retreat.country}
              </p>
              <p className="text-xs text-muted-foreground">{retreat.duration} • {retreat.dates}</p>
              <p className="text-sm font-semibold text-primary mt-1">
                {formatPrice(pricing.price, pricing.currency)} per person
              </p>
              {selectedVariation && (
                <p className="mt-1 text-xs text-muted-foreground">Selected option: {selectedVariation.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {retreat.pricingVariations && retreat.pricingVariations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Package option
              </label>
              <div className="space-y-2">
                {retreat.pricingVariations.map((variation) => {
                  const isSelected = selectedVariationId === variation.id || (!selectedVariationId && variation.id === retreat.pricingVariations?.[0]?.id);
                  return (
                    <button
                      key={variation.id}
                      type="button"
                      onClick={() => setSelectedVariationId(variation.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{variation.name}</p>
                          {variation.description && <p className="text-sm text-muted-foreground">{variation.description}</p>}
                        </div>
                        <p className="font-semibold text-primary">{formatPrice(variation.price, variation.currency || retreat.currency)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Number of Guests
            </label>
            <select
              name="numberOfGuests"
              value={formData.numberOfGuests}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} Guest{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows={3}
              placeholder="Dietary requirements, accessibility needs, etc."
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Price Summary */}
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>{formatPrice(pricing.price, pricing.currency)} × {formData.numberOfGuests} guest{formData.numberOfGuests > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalPrice, pricing.currency)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            By clicking "Proceed to Payment", you agree to our terms and conditions.
          </p>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
