import Header from "@/components/Header";
import DetailedFooter from "@/components/DetailedFooter";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight, MapPin } from "lucide-react";

export type LocationLandingProps = {
  locale: "en" | "ar";
  countryName: string;
  countrySlug: string;
  intro: string;
  bullets: string[];
  faq: Array<{ q: string; a: string }>;
};

const LocationTemplate = ({
  locale,
  countryName,
  countrySlug,
  intro,
  bullets,
  faq,
}: LocationLandingProps) => {
  const isAr = locale === "ar";
  const basePrefix = isAr ? "/ar" : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20" dir={isAr ? "rtl" : "ltr"}>
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className={`max-w-4xl mx-auto ${isAr ? "text-right" : ""}`}>
              <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                <MapPin className="w-5 h-5" />
                <span>
                  {isAr ? "رحلات استجمام" : "Wellness Retreats"} — {countryName}
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
                {isAr
                  ? `أفضل رحلات اليوغا والاستجمام للمسافرين من ${countryName}`
                  : `Wellness & Yoga Retreats for Travelers from ${countryName}`}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">{intro}</p>

              <div className={`flex flex-wrap gap-3 mb-10 ${isAr ? "justify-end" : ""}`}>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  {isAr ? "اسأل المساعد الذكي" : "Ask the AI Assistant"}
                </Link>
                <Link
                  to="/retreats"
                  className="inline-flex items-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                >
                  {isAr ? "تصفح الرحلات" : "Browse retreats"}
                  <ArrowRight className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                    {isAr ? "ماذا نقدم" : "What you get"}
                  </h2>
                  <ul className="space-y-2 text-muted-foreground leading-relaxed">
                    {bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-muted/30 border border-border rounded-2xl p-6">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                    {isAr ? "مقترحات سريعة" : "Quick suggestions"}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed space-y-3">
                    <p>
                      {isAr
                        ? "اطلب من المساعد الذكي: “أفضل رحلة يوغا لمدة 7 أيام، ميزانية 2000 دولار، وجهة شاطئية”."
                        : 'Ask the AI: "Best 7-day yoga retreat, $2000 budget, beach destination".'}
                    </p>
                    <p>
                      {isAr
                        ? "أو: “رحلة استجمام مع سبا وأنشطة خفيفة، مناسبة للأصدقاء/العائلة”."
                        : 'Or: "Wellness retreat with spa + light activities, suitable for friends/family".'}
                    </p>
                    <p className="text-sm">
                      {isAr ? "صفحة الخليج:" : "GCC page:"}{" "}
                      <Link to={`${basePrefix}/gcc`} className="text-primary underline hover:text-primary/90">
                        {isAr ? "عرض" : "View"}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  {isAr ? "أسئلة شائعة" : "FAQs"}
                </h2>
                <div className="space-y-4">
                  {faq.map((item) => (
                    <div key={item.q} className="bg-card border border-border rounded-2xl p-6">
                      <div className="font-semibold text-foreground mb-2">{item.q}</div>
                      <div className="text-muted-foreground leading-relaxed">{item.a}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 text-sm text-muted-foreground">
                {isAr ? (
                  <>
                    English version?{" "}
                    <Link
                      to={`/retreats/${countrySlug}`}
                      className="text-primary underline hover:text-primary/90"
                    >
                      View English
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    النسخة العربية؟{" "}
                    <Link
                      to={`/ar/retreats/${countrySlug}`}
                      className="text-primary underline hover:text-primary/90"
                    >
                      عرض العربية
                    </Link>
                    .
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <DetailedFooter />
    </div>
  );
};

export default LocationTemplate;

