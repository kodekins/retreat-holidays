import { useState } from 'react';
import { X, Loader2, MessageCircle } from 'lucide-react';
import { Retreat, BookingFormData } from '@/types/retreat';
import { useToast } from '@/hooks/use-toast';
import { calculateFinalPrice, formatPrice } from '@/utils/pricing';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  retreat: Retreat | null;
}

const BookingModal = ({ isOpen, onClose, retreat }: BookingModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    numberOfGuests: 1,
    specialRequests: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numberOfGuests' ? parseInt(value) : value,
    }));
  };

  const handleWhatsAppBooking = () => {
    if (!retreat) return;
    const finalPrice = calculateFinalPrice(retreat.price);
    const message = encodeURIComponent(
      `Hi! I'd like to book the "${retreat.name}" retreat.\n\n` +
      `📍 Location: ${retreat.location}, ${retreat.country}\n` +
      `📅 Duration: ${retreat.duration}\n` +
      `💰 Price: ${formatPrice(finalPrice, retreat.currency)}\n\n` +
      `My Details:\n` +
      `Name: ${formData.firstName} ${formData.lastName}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone}\n` +
      `Guests: ${formData.numberOfGuests}\n` +
      `${formData.specialRequests ? `Special Requests: ${formData.specialRequests}` : ''}`
    );
    window.open(`https://wa.me/23058461923?text=${message}`, '_blank');
    
    toast({
      title: "Opening WhatsApp",
      description: "Complete your booking via WhatsApp.",
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retreat) return;
    handleWhatsAppBooking();
  };

  if (!isOpen || !retreat) return null;

  const finalPrice = calculateFinalPrice(retreat.price);
  const totalPrice = finalPrice * formData.numberOfGuests;

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
                {formatPrice(finalPrice, retreat.currency)} per person
              </p>
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
              <span>{formatPrice(finalPrice, retreat.currency)} × {formData.numberOfGuests} guest{formData.numberOfGuests > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalPrice, retreat.currency)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-whatsapp text-whatsapp-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Book via WhatsApp
          </button>

          <p className="text-xs text-muted-foreground text-center">
            You'll be redirected to WhatsApp to complete your booking.
          </p>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
