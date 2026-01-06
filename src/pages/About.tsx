import Header from '@/components/Header';
import DetailedFooter from '@/components/DetailedFooter';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Target, Gift, Plane, Heart, Smile, MapPin, Users, Star, Globe, Sparkles, Award } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Users, value: '10,000+', label: 'Happy Travelers' },
    { icon: Globe, value: '25+', label: 'Destinations' },
    { icon: Star, value: '15+', label: 'Years Experience' },
    { icon: Award, value: '98%', label: 'Satisfaction Rate' },
  ];

  const destinations = [
    { name: 'Mauritius', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
    { name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
    { name: 'Egypt', image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=400&q=80' },
    { name: 'Thailand', image: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=400&q=80' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="container mx-auto px-4 relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Sparkles className="w-4 h-4" />
                  ABOUT RETREATS HOLIDAYS
                </div>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Your Journey to <span className="text-primary">Wellness</span> Starts Here
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Retreats Holidays started as a family-run business in Dubai in 2009, born from a deep passion for travel, hospitality, and wellbeing. After over a decade of organizing holidays and welcoming visitors, our journey led us to Mauritius, where we became the first to offer yoga and kitesurfing retreats on the island.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Today, we continue curating unique wellness adventures across the world, now expanding into Egypt, always choosing the most beautiful and soulful spots.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat with AI Assistant
                  </a>
                  <a
                    href="/our-exclusive-retreats"
                    className="inline-flex items-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-all hover:scale-105"
                  >
                    Explore Retreats
                  </a>
                </div>
              </div>
              
              <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80"
                    alt="Yoga meditation retreat"
                    className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">15+ Years</p>
                        <p className="text-sm text-muted-foreground">of Excellence</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg animate-fade-in" style={{ animationDelay: '0.7s' }}>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold">4.9/5 Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-primary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <stat.icon className="w-10 h-10 mx-auto mb-3 text-primary-foreground/80" />
                  <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">{stat.value}</p>
                  <p className="text-primary-foreground/80 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <p className="text-primary font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-primary"></span>
                  OUR STORY
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                  From Dubai to the World
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  What started as a small family venture in 2009 has blossomed into a global wellness platform. Our founders believed that travel should be more than sightseeing—it should be a transformative experience that nourishes the body, mind, and soul.
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Whether you're seeking a relaxing spa escape, a transformative yoga retreat, or a thrill-filled kitesurfing holiday, we believe every experience should be personal and meaningful. Our AI-powered chatbot makes finding your perfect retreat effortless.
                </p>
                
                {/* Progress Bars */}
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Customizable Packages</span>
                      <span className="text-sm font-bold text-primary">95%</span>
                    </div>
                    <Progress value={95} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Customer Satisfaction</span>
                      <span className="text-sm font-bold text-primary">98%</span>
                    </div>
                    <Progress value={98} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Expert Support</span>
                      <span className="text-sm font-bold text-primary">100%</span>
                    </div>
                    <Progress value={100} className="h-3" />
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2 grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80"
                  alt="Yoga practice"
                  className="rounded-xl shadow-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="https://images.unsplash.com/photo-1540202404-a2f29016b523?w=400&q=80"
                  alt="Spa treatment"
                  className="rounded-xl shadow-lg w-full h-48 object-cover mt-8 hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80"
                  alt="Kitesurfing"
                  className="rounded-xl shadow-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80"
                  alt="Meditation"
                  className="rounded-xl shadow-lg w-full h-48 object-cover mt-8 hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-gradient-to-br from-secondary/50 to-accent/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold uppercase tracking-wider mb-4">WHY CHOOSE US?</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your Perfect Retreat, Just a Chat Away
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform makes finding and booking your dream retreat effortless
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group">
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Engage with AI</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our advanced AI chatbot understands your preferences and provides personalized retreat recommendations tailored just for you.
                </p>
              </div>
              
              <div className="bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group">
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Specify Your Needs</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Share your preferred destination, dates, budget, and activities. Our chatbot provides comprehensive information instantly.
                </p>
              </div>
              
              <div className="bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group">
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Gift className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Get Tailored Suggestions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Receive curated retreat options that perfectly match your preferences, complete with pricing, reviews, and availability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations Preview */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-primary font-semibold uppercase tracking-wider mb-4">EXPLORE THE WORLD</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Featured Destinations
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From tropical beaches to ancient wonders, discover wellness retreats in the world's most breathtaking locations
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destinations.map((dest, index) => (
                <div 
                  key={dest.name} 
                  className="relative group overflow-hidden rounded-2xl cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white">
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold">{dest.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold uppercase tracking-wider mb-4">DISCOVER THE BENEFITS</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Why Our Platform Stands Out
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plane className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Save Time</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI chatbot is your personal travel agent 2.0. Tell it what makes you happy, and it will find the perfect retreat within minutes—not hours.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Smile className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">User-Friendly</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Quickly explore global destinations with instant, personalized responses. No complicated forms or endless searching required.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Expert Curation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every retreat is hand-picked by our wellness experts. Access detailed information, reviews, and resources for informed decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          </div>
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
                Ready to Start Your Wellness Journey?
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                Experience ultimate comfort and well-being with Retreats Holidays. Our platform offers comprehensive details on retreats worldwide—itineraries, accommodations, pricing, and activities.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start Chatting Now
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <DetailedFooter />
    </div>
  );
};

export default About;