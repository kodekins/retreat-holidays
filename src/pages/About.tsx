import Header from '@/components/Header';
import DetailedFooter from '@/components/DetailedFooter';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Target, Gift, Plane, Heart, Smile } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80"
                  alt="Traveler exploring"
                  className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
                />
              </div>
              
              <div>
                <p className="text-primary font-semibold uppercase tracking-wider mb-4">ABOUT US</p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Retreats Holidays started as a family-run business in Dubai in 2009, born from a deep passion for travel, hospitality, and wellbeing. After over a decade of organizing holidays and welcoming visitors, our journey led us to Mauritius, where we became the first to offer yoga and kitesurfing retreats on the island. Today, we continue curating unique wellness adventures across the world, now expanding into Egypt, always choosing the most beautiful and soulful spots.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Whether you're seeking a relaxing spa escape, a transformative yoga retreat, or a thrill-filled kitesurfing holiday, we believe every experience should be personal and meaningful.
                </p>
                <p className="text-lg font-semibold text-foreground mb-8">
                  Let our chatbot guide you!
                </p>
                
                {/* Progress Bars */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Customizable Packages</span>
                      <span className="text-sm font-medium text-primary">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Friendly Service</span>
                      <span className="text-sm font-medium text-primary">70%</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Achievements</span>
                      <span className="text-sm font-medium text-primary">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="Happy travelers"
                  className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
                />
              </div>
              
              <div>
                <p className="text-primary font-semibold uppercase tracking-wider mb-4">WHY CHOOSE US?</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
                  Choose us for unforgettable adventure holidays and retreats
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Engage with our chatbot
                    </h3>
                    <p className="text-muted-foreground">
                      Searching for the ultimate adventure holiday or a serene retreat? Engage with our advanced AI chatbot to find personalized holiday recommendations tailored just for you.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Specify your needs
                    </h3>
                    <p className="text-muted-foreground">
                      Provide details like preferred destination, weather, dates, pricing, specific activities (e.g. surf, yoga, meditation, etc.). The chatbot will provide comprehensive information and answer any questions you may have.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-primary" />
                      Receive tailored suggestions
                    </h3>
                    <p className="text-muted-foreground">
                      Specify your needs with our intelligent chatbot to receive personalized suggestions that perfectly match your preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-primary font-semibold uppercase tracking-wider mb-4">Discover the Benefits of</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Our Chatbot
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plane className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Time saver</h3>
                <p className="text-muted-foreground">
                  Our chatbot is your travel agent 2.0: Tell him what will make you happy, he will find you the best offer within minutes.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Smile className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">User-friendly</h3>
                <p className="text-muted-foreground">
                  Quickly explore global destinations and receive instant answers to your queries. Our chatbot provides fast, personalized responses.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Comprehensive information</h3>
                <p className="text-muted-foreground">
                  Access detailed information and resources quickly. Our chatbot learns and improves to serve you better.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-primary font-semibold uppercase tracking-wider mb-4">Explore The World</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Experience ultimate comfort and well-being with retreats holidays
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At Retreats Holidays, we prioritize your comfort and well-being. Our website offers comprehensive details on the retreat or holiday you're seeking, including itineraries, accommodation options, pricing, and activities. With just a few clicks, book your dream retreat and start your transformative journey toward inner peace and vitality.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                <strong>Embark on your journey of rejuvenation</strong> — Discover serene getaways with Retreats Holidays, where you can escape the daily grind and immerse yourself in relaxation and wellness.
              </p>
              <a
                href="/"
                className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Start your experience
              </a>
            </div>
          </div>
        </section>
      </main>

      <DetailedFooter />
    </div>
  );
};

export default About;
