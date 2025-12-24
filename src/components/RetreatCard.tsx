import { forwardRef } from 'react';
import { Retreat } from '@/types/retreat';
import { MessageCircle } from 'lucide-react';
import { calculateFinalPrice, formatPrice } from '@/utils/pricing';

interface RetreatCardProps {
  retreat: Retreat;
  onBook: (retreat: Retreat) => void;
  onWhatsApp: (retreat: Retreat) => void;
}

const RetreatCard = forwardRef<HTMLDivElement, RetreatCardProps>(({ retreat, onBook, onWhatsApp }, ref) => {
  const finalPrice = calculateFinalPrice(retreat.price);

  return (
    <div ref={ref} className="bg-card rounded-lg overflow-hidden shadow-md border border-border animate-slide-up">
      <div className="relative">
        <img
          src={retreat.image}
          alt={retreat.name}
          className="w-full h-36 object-cover"
        />
        <div className="absolute bottom-2 right-2">
          <span className="bg-background/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-foreground font-medium">
            {retreat.duration}
          </span>
        </div>
      </div>
      
      <div className="p-3">
        <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-2 font-display">
          {retreat.name}
        </h4>
        
        <ul className="text-xs text-muted-foreground space-y-0.5 mb-2">
          <li>
            <span className="font-medium text-foreground">Location:</span> {retreat.location}, {retreat.country}
          </li>
          <li>
            <span className="font-medium text-foreground">Dates:</span> {retreat.dates}
          </li>
          <li>
            <span className="font-medium text-foreground">Budget:</span> {formatPrice(finalPrice, retreat.currency)}
          </li>
        </ul>
        
        <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
          <span className="font-medium text-foreground">Details:</span> {retreat.description}
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={() => onBook(retreat)}
            className="flex-1 bg-primary text-primary-foreground text-xs py-2 px-3 rounded-md font-medium hover:bg-primary-dark transition-colors"
          >
            Book Now
          </button>
          <button
            onClick={() => onWhatsApp(retreat)}
            className="flex items-center justify-center gap-1 bg-whatsapp text-whatsapp-foreground text-xs py-2 px-3 rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
});

RetreatCard.displayName = 'RetreatCard';

export default RetreatCard;
