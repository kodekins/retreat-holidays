import Header from "@/components/Header";
import DetailedFooter from "@/components/DetailedFooter";
import { Link } from "react-router-dom";
import { Globe, MapPin, Sparkles, MessageSquare, ArrowRight } from "lucide-react";

const GccLanding = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20">
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                GCC Wellness Retreats
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
                Wellness & Yoga Retreats for Travelers in the Gulf
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Retreats Holidays curates wellness, yoga, and adventure retreats for guests traveling from{" "}
                <strong>Saudi Arabia</strong>, <strong>UAE (Dubai)</strong>, <strong>Qatar</strong>,{" "}
                <strong>Kuwait</strong>, <strong>Oman</strong>, and <strong>Egypt</strong>. Chat with our AI
                assistant to shortlist options by destination, dates, budget, and style.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  Ask the AI Assistant
                </Link>
                <Link
                  to="/retreats"
                  className="inline-flex items-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Browse Retreats
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { to: "/retreats/saudi-arabia", label: "Saudi Arabia", note: "Riyadh • Jeddah • Eastern Province" },
                  { to: "/retreats/uae", label: "UAE (Dubai)", note: "Dubai • Abu Dhabi • Sharjah" },
                  { to: "/retreats/qatar", label: "Qatar", note: "Doha • Lusail" },
                  { to: "/retreats/kuwait", label: "Kuwait", note: "Kuwait City" },
                  { to: "/retreats/oman", label: "Oman", note: "Muscat • Salalah" },
                  { to: "/retreats/egypt", label: "Egypt", note: "Cairo • Red Sea • Sinai" },
                ].map((c) => (
                  <Link
                    key={c.to}
                    to={c.to}
                    className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{c.label}</div>
                        <div className="text-sm text-muted-foreground">{c.note}</div>
                      </div>
                    </div>
                    <div className="text-sm text-primary font-medium inline-flex items-center gap-1">
                      View retreats <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-12 bg-muted/30 border border-border rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      Designed for GCC travel needs
                    </h2>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>Shortlist retreats fast with AI (dates, budget, activities).</li>
                      <li>Curated options for wellness, yoga, spa, and adventure escapes.</li>
                      <li>Support for travelers with flexible timing and group trips.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-sm text-muted-foreground">
                Prefer Arabic?{" "}
                <Link to="/ar/gcc" className="text-primary underline hover:text-primary/90">
                  View the Arabic page
                </Link>
                .
              </div>
            </div>
          </div>
        </section>
      </main>

      <DetailedFooter />
    </div>
  );
};

export default GccLanding;

