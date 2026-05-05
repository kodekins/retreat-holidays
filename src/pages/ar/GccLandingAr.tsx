import Header from "@/components/Header";
import DetailedFooter from "@/components/DetailedFooter";
import { Link } from "react-router-dom";
import { Globe, MapPin, Sparkles, MessageSquare, ArrowLeft } from "lucide-react";

const GccLandingAr = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20" dir="rtl">
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-right">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                رحلات الاستجمام في الخليج
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
                رحلات استجمام ويوغا مخصصة لمسافري دول الخليج
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                في <strong>Retreats Holidays</strong> نقوم بتنسيق رحلات الاستجمام واليوغا والمغامرات للمسافرين من{" "}
                <strong>السعودية</strong>، <strong>الإمارات (دبي)</strong>، <strong>قطر</strong>،{" "}
                <strong>الكويت</strong>، <strong>عُمان</strong>، و<strong>مصر</strong>. تحدث مع مساعدنا الذكي
                لاختيار أفضل الخيارات حسب الوجهة والتواريخ والميزانية.
              </p>

              <div className="flex flex-wrap gap-3 mb-10 justify-end">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  اسأل المساعد الذكي
                </Link>
                <Link
                  to="/retreats"
                  className="inline-flex items-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                >
                  تصفح الرحلات
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { to: "/ar/retreats/saudi-arabia", label: "السعودية", note: "الرياض • جدة • المنطقة الشرقية" },
                  { to: "/ar/retreats/uae", label: "الإمارات (دبي)", note: "دبي • أبوظبي • الشارقة" },
                  { to: "/ar/retreats/qatar", label: "قطر", note: "الدوحة • لوسيل" },
                  { to: "/ar/retreats/kuwait", label: "الكويت", note: "مدينة الكويت" },
                  { to: "/ar/retreats/oman", label: "عُمان", note: "مسقط • صلالة" },
                  { to: "/ar/retreats/egypt", label: "مصر", note: "القاهرة • البحر الأحمر • سيناء" },
                ].map((c) => (
                  <Link
                    key={c.to}
                    to={c.to}
                    className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2 justify-end">
                      <div>
                        <div className="font-semibold text-foreground">{c.label}</div>
                        <div className="text-sm text-muted-foreground">{c.note}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-sm text-primary font-medium inline-flex items-center gap-1">
                      عرض الرحلات <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-12 bg-muted/30 border border-border rounded-2xl p-6">
                <div className="flex items-start gap-3 justify-end">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      مصمم لاحتياجات السفر في الخليج
                    </h2>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>اختيار سريع عبر الذكاء الاصطناعي (التواريخ، الميزانية، الأنشطة).</li>
                      <li>خيارات مختارة لليوغا والسبا والاستجمام والمغامرات.</li>
                      <li>دعم لخطط مرنة ورحلات جماعية.</li>
                    </ul>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-foreground" />
                  </div>
                </div>
              </div>

              <div className="mt-10 text-sm text-muted-foreground">
                Prefer English?{" "}
                <Link to="/gcc" className="text-primary underline hover:text-primary/90">
                  View the English page
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

export default GccLandingAr;

