import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, LogOut, Edit, Trash2, Loader2, MapPin, Eye } from 'lucide-react';
import RetreatForm from '@/components/RetreatForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CuratedRetreat {
  id: string;
  name: string;
  location: string;
  country: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  dates: string | null;
  image_url: string | null;
  activities: string[];
  category: string;
  rating: number | null;
  featured: boolean;
  booking_url: string | null;
  whatsapp_number: string | null;
  created_at: string;
}

const TravelGuideDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [retreats, setRetreats] = useState<CuratedRetreat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRetreat, setEditingRetreat] = useState<CuratedRetreat | null>(null);
  const [deletingRetreat, setDeletingRetreat] = useState<CuratedRetreat | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/travel-guide');
        return;
      }

      setUser(user);

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== 'travel_guide' && profile.role !== 'admin') {
        await supabase.auth.signOut();
        navigate('/travel-guide');
        return;
      }

      setProfile(profile);
      await fetchRetreats(user.id, profile.role);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/travel-guide');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRetreats = async (userId: string, role: string) => {
    try {
      let query = supabase
        .from('curated_retreats')
        .select('*')
        .order('created_at', { ascending: false });

      // If not admin, only show their own retreats
      if (role !== 'admin') {
        query = query.eq('created_by', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRetreats(data || []);
    } catch (error) {
      console.error('Error fetching retreats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch retreats.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/travel-guide');
  };

  const handleDelete = async () => {
    if (!deletingRetreat) return;

    try {
      const { error } = await supabase
        .from('curated_retreats')
        .delete()
        .eq('id', deletingRetreat.id);

      if (error) throw error;

      setRetreats(retreats.filter(r => r.id !== deletingRetreat.id));
      toast({
        title: 'Deleted',
        description: 'Retreat has been deleted successfully.',
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete retreat.',
        variant: 'destructive',
      });
    } finally {
      setDeletingRetreat(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingRetreat(null);
    if (user && profile) {
      fetchRetreats(user.id, profile.role);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showForm || editingRetreat) {
    return (
      <RetreatForm
        retreat={editingRetreat}
        onClose={() => {
          setShowForm(false);
          setEditingRetreat(null);
        }}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Travel Guide Dashboard</h1>
                <p className="text-sm text-muted-foreground">{profile?.full_name || profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Retreats</h2>
            <p className="text-muted-foreground">Manage your curated retreat listings</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Retreat
          </Button>
        </div>

        {retreats.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No retreats yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start by adding your first retreat listing
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Retreat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {retreats.map((retreat) => (
              <Card key={retreat.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={retreat.image_url || 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80'}
                    alt={retreat.name}
                    className="w-full h-full object-cover"
                  />
                  {retreat.featured && (
                    <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{retreat.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {retreat.location}, {retreat.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary">
                      ${retreat.price} {retreat.currency}
                    </span>
                    <span className="text-sm text-muted-foreground">{retreat.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {retreat.activities.slice(0, 3).map((activity, i) => (
                      <span
                        key={i}
                        className="text-xs bg-secondary px-2 py-1 rounded-full"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingRetreat(retreat)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingRetreat(retreat)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingRetreat} onOpenChange={() => setDeletingRetreat(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Retreat?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingRetreat?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TravelGuideDashboard;
