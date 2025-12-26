import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, X } from 'lucide-react';

interface RetreatFormProps {
  retreat?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Yoga',
  'Meditation',
  'Wellness',
  'Surf',
  'Detox',
  'Spiritual',
  'Adventure',
  'Ayurveda',
  'Healing',
  'Silent',
];

const ACTIVITIES = [
  'Yoga',
  'Meditation',
  'Surfing',
  'Spa',
  'Wellness',
  'Detox',
  'Hiking',
  'Ayurveda',
  'Massage',
  'Healing',
  'Pilates',
  'Breathwork',
  'Sound Healing',
  'Cooking Class',
  'Cultural Tours',
];

const RetreatForm = ({ retreat, onClose, onSuccess }: RetreatFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: retreat?.name || '',
    location: retreat?.location || '',
    country: retreat?.country || '',
    description: retreat?.description || '',
    price: retreat?.price?.toString() || '',
    currency: retreat?.currency || 'USD',
    duration: retreat?.duration || '',
    dates: retreat?.dates || '',
    image_url: retreat?.image_url || '',
    activities: retreat?.activities || [],
    category: retreat?.category || '',
    rating: retreat?.rating?.toString() || '',
    featured: retreat?.featured || false,
    booking_url: retreat?.booking_url || '',
    whatsapp_number: retreat?.whatsapp_number || '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleActivity = (activity: string) => {
    const current = formData.activities;
    if (current.includes(activity)) {
      handleChange('activities', current.filter((a: string) => a !== activity));
    } else {
      handleChange('activities', [...current, activity]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const retreatData = {
        name: formData.name,
        location: formData.location,
        country: formData.country,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration: formData.duration,
        dates: formData.dates || null,
        image_url: formData.image_url || null,
        activities: formData.activities,
        category: formData.category,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        featured: formData.featured,
        booking_url: formData.booking_url || null,
        whatsapp_number: formData.whatsapp_number || null,
        created_by: user.id,
      };

      if (retreat?.id) {
        // Update existing
        const { error } = await supabase
          .from('curated_retreats')
          .update(retreatData)
          .eq('id', retreat.id);

        if (error) throw error;

        toast({
          title: 'Updated!',
          description: 'Retreat has been updated successfully.',
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('curated_retreats')
          .insert([retreatData]);

        if (error) throw error;

        toast({
          title: 'Created!',
          description: 'New retreat has been added successfully.',
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Form error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save retreat.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-semibold text-foreground">
              {retreat ? 'Edit Retreat' : 'Add New Retreat'}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Retreat Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="7 Day Yoga & Meditation Retreat"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Ubud"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Bali, Indonesia"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the retreat experience, what's included, and what makes it special..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="999"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    placeholder="7 days"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dates">Available Dates</Label>
                  <Input
                    id="dates"
                    value={formData.dates}
                    onChange={(e) => handleChange('dates', e.target.value)}
                    placeholder="Year-round or specific dates"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category & Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Activities Included *</Label>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITIES.map((activity) => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => toggleActivity(activity)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        formData.activities.includes(activity)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-secondary'
                      }`}
                    >
                      {activity}
                      {formData.activities.includes(activity) && (
                        <X className="w-3 h-3 inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Provide a URL to an image of your retreat
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_url">Booking URL</Label>
                <Input
                  id="booking_url"
                  type="url"
                  value={formData.booking_url}
                  onChange={(e) => handleChange('booking_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                <Input
                  id="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  value={formData.rating}
                  onChange={(e) => handleChange('rating', e.target.value)}
                  placeholder="4.8"
                  min="1"
                  max="5"
                  step="0.1"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Featured Retreat</Label>
                  <p className="text-sm text-muted-foreground">
                    Featured retreats appear first in search results
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(v) => handleChange('featured', v)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : retreat ? (
                'Update Retreat'
              ) : (
                'Add Retreat'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RetreatForm;
