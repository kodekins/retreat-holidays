import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RetreatPricingOption } from '@/types/retreat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, X, Upload, Image as ImageIcon, Link } from 'lucide-react';

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
  const [isUploading, setIsUploading] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const [imagePreview, setImagePreview] = useState<string | null>(retreat?.image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    pricingVariations: (retreat?.pricing_variations || retreat?.pricingVariations || []) as RetreatPricingOption[],
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'image_url' && value) {
      setImagePreview(value);
    }
  };

  const toggleActivity = (activity: string) => {
    const current = formData.activities;
    if (current.includes(activity)) {
      handleChange('activities', current.filter((a: string) => a !== activity));
    } else {
      handleChange('activities', [...current, activity]);
    }
  };

  const handleAddPricingVariation = () => {
    handleChange('pricingVariations', [
      ...formData.pricingVariations,
      { id: `variation-${Date.now()}`, name: 'Flights included', description: 'Optional flights and transfers', price: 0, currency: formData.currency, includes: [] },
    ]);
  };

  const handleUpdatePricingVariation = (index: number, updates: Partial<RetreatPricingOption>) => {
    const next = [...formData.pricingVariations];
    next[index] = { ...next[index], ...updates };
    handleChange('pricingVariations', next);
  };

  const handleRemovePricingVariation = (index: number) => {
    handleChange('pricingVariations', formData.pricingVariations.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from('retreat-images')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('retreat-images')
        .getPublicUrl(fileName);

      handleChange('image_url', publicUrl);
      setImagePreview(publicUrl);
      
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    handleChange('image_url', '');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const parsedPrice = Number.parseFloat(formData.price);
      const retreatData = {
        name: formData.name,
        location: formData.location,
        country: formData.country,
        description: formData.description,
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        currency: formData.currency,
        duration: formData.duration,
        dates: formData.dates || null,
        image_url: formData.image_url || null,
        activities: Array.isArray(formData.activities) ? formData.activities : [],
        category: formData.category,
        rating: formData.rating ? Number.parseFloat(formData.rating) : null,
        featured: formData.featured,
        booking_url: formData.booking_url || null,
        whatsapp_number: formData.whatsapp_number || null,
        pricing_variations: formData.pricingVariations,
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
              <CardTitle>Pricing Variations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Add optional package variations such as flights, visa, or transfers.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={handleAddPricingVariation}>
                  Add option
                </Button>
              </div>

              {formData.pricingVariations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No pricing variations yet. Add one to offer package choices to travelers.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.pricingVariations.map((variation, index) => (
                    <div key={variation.id || index} className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">Option {index + 1}</p>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemovePricingVariation(index)}>
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Option name</Label>
                          <Input
                            value={variation.name}
                            onChange={(e) => handleUpdatePricingVariation(index, { name: e.target.value })}
                            placeholder="Flights included"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Option price</Label>
                          <Input
                            type="number"
                            value={variation.price}
                            onChange={(e) => handleUpdatePricingVariation(index, { price: Number(e.target.value) })}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={variation.description || ''}
                          onChange={(e) => handleUpdatePricingVariation(index, { description: e.target.value })}
                          placeholder="Includes flights and airport transfers"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Includes (comma separated)</Label>
                        <Input
                          value={(variation.includes || []).join(', ')}
                          onChange={(e) => handleUpdatePricingVariation(index, { includes: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })}
                          placeholder="Flights, Visa, Transfers"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label>Retreat Image</Label>
                
                {/* Toggle between URL and Upload */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={imageSource === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageSource('url')}
                    className="gap-2"
                  >
                    <Link className="w-4 h-4" />
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={imageSource === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageSource('upload')}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </div>

                {imageSource === 'url' ? (
                  <div className="space-y-2">
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => handleChange('image_url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide a URL to an image of your retreat
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full h-24 border-dashed gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Click to upload image
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Max file size: 5MB. Supported formats: JPEG, PNG, WebP
                    </p>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative mt-3">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                      <img
                        src={imagePreview}
                        alt="Retreat preview"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview(null)}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {formData.image_url}
                    </p>
                  </div>
                )}
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
