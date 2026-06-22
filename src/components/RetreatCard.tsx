import { forwardRef } from 'react';
import { Retreat } from '@/types/retreat';
import { ExternalLink, MessageCircle } from 'lucide-react';
import { calculateFinalPrice, formatPrice, getConciergeFee } from '@/utils/pricing';

interface RetreatCardProps {
  retreat: Retreat;
  unlocked: boolean;
  onBook: (retreat: Retreat) => void;
  onWhatsApp: (retreat: Retreat) => void;
}

const RetreatCard = forwardRef<HTMLDivElement, RetreatCardProps>(
  ({ retreat, unlocked, onBook, onWhatsApp }, ref) => {
    const listingPrice = calculateFinalPrice(retreat.price);
    const conciergeFee = getConciergeFee(retreat.price);

    return (
      <div ref={ref} className="bg-card rounded-lg overflow-hidden shadow-md border border-border animate-slide-up">
        <div className="relative">
          <img
            src={retreat.image}
            alt={retreat.name}
            className={
              unlocked
                ? 'w-full h-36 object-cover'
                : 'w-full h-36 object-cover blur-md scale-[1.04] brightness-75'
            }
          />
          {!unlocked && <div className="absolute inset-0 bg-background/30 backdrop-blur-md" />}
          <div className="absolute bottom-2 right-2">
            <span className="bg-background/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-foreground font-medium">
              {retreat.duration}
            </span>
          </div>
        </div>

        <div className="p-3">
          <h4
            className={
              unlocked
                ? 'font-semibold text-sm text-foreground mb-1 line-clamp-2 font-display'
                : 'font-semibold text-sm text-foreground mb-1 line-clamp-2 font-display blur-sm select-none'
            }
          >
            {retreat.name}
          </h4>

          <ul
            className={
              unlocked
                ? 'text-xs text-muted-foreground space-y-0.5 mb-2'
                : 'text-xs text-muted-foreground space-y-0.5 mb-2 blur-sm select-none'
            }
          >
            <li>
              <span className="font-medium text-foreground">Location:</span> {retreat.location},{' '}
              {retreat.country}
            </li>
            <li>
              <span className="font-medium text-foreground">Dates:</span> {retreat.dates}
            </li>
            <li>
              <span className="font-medium text-foreground">Vendor price:</span>{' '}
              {formatPrice(listingPrice, retreat.currency)}
            </li>
            {!unlocked && (
              <li>
                <span className="font-medium text-foreground">Concierge fee (5%):</span>{' '}
                {formatPrice(conciergeFee, retreat.currency)}
              </li>
            )}
          </ul>

          <p
            className={
              unlocked
                ? 'text-xs text-muted-foreground line-clamp-4 mb-3'
                : 'text-xs text-muted-foreground line-clamp-3 mb-3 blur-sm select-none'
            }
          >
            <span className="font-medium text-foreground">Details:</span> {retreat.description}
          </p>

          {unlocked && retreat.sourceUrl && (
            <a
              href={retreat.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-3"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Official vendor booking link
            </a>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={unlocked}
              onClick={() => !unlocked && onBook(retreat)}
              className="flex-1 bg-primary text-primary-foreground text-xs py-2 px-3 rounded-md font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-default disabled:hover:bg-primary"
            >
              {unlocked ? 'Link unlocked — book with vendor' : `Pay ${formatPrice(conciergeFee, retreat.currency)} concierge fee`}
            </button>
            <button
              type="button"
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
  },
);

RetreatCard.displayName = 'RetreatCard';

export default RetreatCard;
