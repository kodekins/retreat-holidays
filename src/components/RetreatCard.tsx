import { forwardRef } from 'react';
import { Retreat } from '@/types/retreat';
import { ExternalLink, Lock, MessageCircle } from 'lucide-react';
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
      <div
        ref={ref}
        className={`bg-card rounded-lg overflow-hidden shadow-md border animate-slide-up ${
          unlocked ? 'border-border' : 'border-primary/20'
        }`}
      >
        <div className="relative">
          <img
            src={retreat.image}
            alt={unlocked ? retreat.name : 'Retreat preview'}
            className={
              unlocked
                ? 'w-full h-36 object-cover'
                : 'w-full h-36 object-cover blur-lg scale-[1.06] brightness-[0.55]'
            }
          />
          {!unlocked && (
            <div className="absolute inset-0 bg-background/45 backdrop-blur-md flex flex-col items-center justify-center gap-1.5">
              <div className="bg-background/80 rounded-full p-2 shadow-sm">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[11px] font-medium text-foreground/90 px-3 text-center">
                Preview locked — pay fee to unlock
              </p>
            </div>
          )}
          <div className="absolute bottom-2 right-2 z-[1]">
            <span className="bg-background/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-foreground font-medium">
              {retreat.duration}
            </span>
          </div>
        </div>

        <div className="p-3">
          <div className="relative">
            <div
              className={
                unlocked ? '' : 'blur-[6px] select-none pointer-events-none opacity-80'
              }
            >
              <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-2 font-display">
                {retreat.name}
              </h4>

              <ul className="text-xs text-muted-foreground space-y-0.5 mb-2">
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

              <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                <span className="font-medium text-foreground">Details:</span> {retreat.description}
              </p>
            </div>

            {!unlocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/35 backdrop-blur-[1px] rounded-md">
                <Lock className="w-3.5 h-3.5 text-muted-foreground mb-1" />
                <p className="text-[10px] text-muted-foreground font-medium">Provider details hidden</p>
              </div>
            )}
          </div>

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
