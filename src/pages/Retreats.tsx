import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Retreat } from '@/types/retreat';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { MessageCircle, MapPin, Calendar, DollarSign, Star, Loader2 } from 'lucide-react';
import { calculateFinalPrice, formatPrice } from '@/utils/pricing';

interface CuratedRetreat {
  id: string;
  name: string;
  location: string;
  country: string;
  duration: string;
  price: number;
  currency: string;
  description: string;
  activities: string[];
  category: string;
  image_url: string | null;
  dates: string | null;
  rating: number | null;
  featured: boolean | null;
  whatsapp_number: string | null;
}

const Retreats = () => {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRetreat, setSelectedRetreat] = useState<Retreat | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchRetreats();
  }, []);

  const fetchRetreats = async () => {
    try {
      const { data, error } = await supabase
        .from('curated_retreats')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRetreats: Retreat[] = (data || []).map((r: CuratedRetreat) => ({
        id: r.id,
        name: r.name,
        location: r.location,
        country: r.country,
        dates: r.dates || 'Flexible Dates',
        duration: r.duration,
        price: r.price,
        currency: r.currency || 'USD',
        image: r.image_url || 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
        description: r.description,
        activities: r.activities || [],
        category: r.category,
        rating: r.rating || 4.8,
      }));

      setRetreats(formattedRetreats);
    } catch (error) {
      console.error('Error fetching retreats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookRetreat = (retreat: Retreat) => {
    setSelectedRetreat(retreat);
    setIsBookingModalOpen(true);
  };

  const handleWhatsApp = (retreat: Retreat) => {
    const message = encodeURIComponent(
      `Hi! I'm interested in the "${retreat.name}" retreat in ${retreat.location}, ${retreat.country}.\n\nDuration: ${retreat.duration}\nPrice: ${formatPrice(calculateFinalPrice(retreat.price), retreat.currency)}\n\nCan you provide more information about this retreat?`
    );
    window.open(`https://wa.me/23058461923?text=${message}`, '_blank');
  };

  const categories = ['all', ...new Set(retreats.map(r => r.category))];
  const filteredRetreats = filter === 'all' 
    ? retreats 
    : retreats.filter(r => r.category === filter);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Curated Retreats
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked wellness retreats from our expert travel guides. 
              Each retreat is personally verified to ensure an unforgettable experience.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRetreats.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No retreats found. Check back soon for new additions!
              </p>
            </div>
          ) : (
            /* Retreats Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRetreats.map((retreat) => (
                <div
                  key={retreat.id}
                  className="bg-card rounded-xl overflow-hidden shadow-lg border border-border hover:shadow-xl transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={retreat.image}
                      alt={retreat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                        {retreat.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        {retreat.rating}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {retreat.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{retreat.location}, {retreat.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{retreat.duration} • {retreat.dates}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span>{formatPrice(calculateFinalPrice(retreat.price), retreat.currency)}</span>
                        <span className="font-normal text-muted-foreground">per person</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {retreat.description}
                    </p>

                    {/* Activities */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {retreat.activities.slice(0, 3).map((activity, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-secondary text-foreground px-2 py-1 rounded"
                        >
                          {activity}
                        </span>
                      ))}
                      {retreat.activities.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{retreat.activities.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBookRetreat(retreat)}
                        className="flex-1 bg-primary text-primary-foreground py-2.5 px-4 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                      >
                        Book Now
                      </button>
                      <button
                        onClick={() => handleWhatsApp(retreat)}
                        className="flex items-center justify-center gap-2 bg-whatsapp text-whatsapp-foreground py-2.5 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        retreat={selectedRetreat}
      />
    </div>
  );
};

export default Retreats;
