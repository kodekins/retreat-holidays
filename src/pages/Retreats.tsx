import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Retreat } from '@/types/retreat';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { MessageCircle, MapPin, Calendar, DollarSign, Star, Loader2, Filter, X } from 'lucide-react';
import { calculateFinalPrice, formatPrice } from '@/utils/pricing';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRetreats();
  }, []);

  const isRetreatLive = (dates: string | null): boolean => {
    if (!dates || dates === 'Flexible Dates') return true;
    
    // Try to parse dates - look for end date patterns
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Common patterns: "Jan 15 - Jan 22, 2025", "15-22 Jan 2025", "2025-01-15 to 2025-01-22"
    const datePatterns = [
      /(\d{4})-(\d{2})-(\d{2})/g,  // ISO format
      /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})/g,  // Month Day, Year
      /(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)\s*(\d{4})/g,  // Day Month Year
    ];
    
    // Extract all year mentions
    const yearMatch = dates.match(/20\d{2}/g);
    if (yearMatch) {
      const years = yearMatch.map(y => parseInt(y));
      const maxYear = Math.max(...years);
      const currentYear = today.getFullYear();
      
      // If the retreat's latest year is in the past, it's expired
      if (maxYear < currentYear) return false;
      
      // If it's current or future year, check months if possible
      if (maxYear === currentYear) {
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const lowerDates = dates.toLowerCase();
        
        // Find the last mentioned month
        let lastMonthIndex = -1;
        monthNames.forEach((month, idx) => {
          const pos = lowerDates.lastIndexOf(month);
          if (pos !== -1 && idx > lastMonthIndex) {
            lastMonthIndex = idx;
          }
        });
        
        if (lastMonthIndex !== -1 && lastMonthIndex < today.getMonth()) {
          return false;
        }
      }
    }
    
    return true;
  };

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

      // Filter only live retreats (dates not in the past)
      const liveRetreats = formattedRetreats.filter(r => isRetreatLive(r.dates));
      setRetreats(liveRetreats);
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

  // Get unique values for filters
  const categories = useMemo(() => ['all', ...new Set(retreats.map(r => r.category))], [retreats]);
  const locations = useMemo(() => ['all', ...new Set(retreats.map(r => r.country))], [retreats]);
  const durations = useMemo(() => {
    const uniqueDurations = [...new Set(retreats.map(r => r.duration))];
    return ['all', ...uniqueDurations.sort((a, b) => {
      const getDays = (d: string) => {
        const match = d.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      };
      return getDays(a) - getDays(b);
    })];
  }, [retreats]);

  // Apply all filters
  const filteredRetreats = useMemo(() => {
    return retreats.filter(retreat => {
      // Category filter
      if (categoryFilter !== 'all' && retreat.category !== categoryFilter) {
        return false;
      }
      
      // Location filter
      if (locationFilter !== 'all' && retreat.country !== locationFilter) {
        return false;
      }
      
      // Budget filter
      if (maxBudget) {
        const budget = parseFloat(maxBudget);
        if (!isNaN(budget) && calculateFinalPrice(retreat.price) > budget) {
          return false;
        }
      }
      
      // Duration filter
      if (durationFilter !== 'all' && retreat.duration !== durationFilter) {
        return false;
      }
      
      return true;
    });
  }, [retreats, categoryFilter, locationFilter, maxBudget, durationFilter]);

  const clearFilters = () => {
    setCategoryFilter('all');
    setLocationFilter('all');
    setMaxBudget('');
    setDurationFilter('all');
  };

  const hasActiveFilters = categoryFilter !== 'all' || locationFilter !== 'all' || maxBudget || durationFilter !== 'all';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Curated Retreats
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked wellness retreats from our expert travel guides. 
              Each retreat is personally verified to ensure an unforgettable experience.
            </p>
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <div className="flex justify-center mb-6 md:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Filters Section */}
          <div className={`mb-8 ${showFilters || 'hidden md:block'}`}>
            <div className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Filter Retreats
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground gap-1">
                    <X className="w-4 h-4" />
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Type of Retreat
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Location
                  </label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location === 'all' ? 'All Locations' : location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Max Budget (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 2000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Duration
                  </label>
                  <Select value={durationFilter} onValueChange={setDurationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All durations" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration === 'all' ? 'All Durations' : duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {filteredRetreats.length} of {retreats.length} retreats
            {hasActiveFilters && <span className="text-primary"> (filtered)</span>}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRetreats.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">
                {hasActiveFilters 
                  ? 'No retreats match your filters. Try adjusting your criteria.'
                  : 'No retreats found. Check back soon for new additions!'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
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
