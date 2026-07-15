import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Retreat } from '@/types/retreat';
import { formatPrice, getEffectiveRetreatPrice } from '@/utils/pricing';

interface RetreatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  retreat: Retreat | null;
  onBook: (retreat: Retreat) => void;
}

const RetreatDetailsModal = ({ isOpen, onClose, retreat, onBook }: RetreatDetailsModalProps) => {
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);

  const pricing = useMemo(() => getEffectiveRetreatPrice(retreat, selectedVariationId), [retreat, selectedVariationId]);

  if (!isOpen || !retreat) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl animate-slide-up">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-sm font-medium text-primary">Retreat details</p>
            <h2 className="font-display text-xl font-semibold text-foreground">{retreat.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-secondary"
            aria-label="Close details"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5">
          <img
            src={retreat.image}
            alt={retreat.name}
            className="mb-5 h-56 w-full rounded-xl object-cover"
          />

          <div className="mb-5 grid gap-3 rounded-xl border border-border bg-secondary/30 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</p>
              <p className="text-sm text-foreground">{retreat.location}, {retreat.country}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Duration</p>
              <p className="text-sm text-foreground">{retreat.duration}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dates</p>
              <p className="text-sm text-foreground">{retreat.dates}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Starting from</p>
              <p className="text-sm font-semibold text-primary">{formatPrice(pricing.price, pricing.currency)}</p>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="mb-2 font-semibold text-foreground">About this retreat</h3>
            <p className="text-sm leading-6 text-muted-foreground">{retreat.description}</p>
          </div>

          {retreat.pricingVariations && retreat.pricingVariations.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-foreground">Pricing options</h3>
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
                        <div className="text-right">
                          <p className="font-semibold text-primary">{formatPrice(variation.price, variation.currency || retreat.currency)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-2 font-semibold text-foreground">Highlights</h3>
            {retreat.activities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {retreat.activities.map((activity, index) => (
                  <span key={`${activity}-${index}`} className="rounded-full bg-secondary px-3 py-1 text-sm text-foreground">
                    {activity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity details were provided for this retreat.</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onBook(retreat)}
              className="flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Book this retreat
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-3 font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetreatDetailsModal;
