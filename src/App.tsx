import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TravelGuideLogin from "./pages/TravelGuideLogin";
import TravelGuideDashboard from "./pages/TravelGuideDashboard";
import Retreats from "./pages/Retreats";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import SeoManager from "./components/SeoManager";
import GccLanding from "./pages/GccLanding";
import GccLandingAr from "./pages/ar/GccLandingAr";
import SaudiArabia from "./pages/locations/SaudiArabia";
import Uae from "./pages/locations/Uae";
import Qatar from "./pages/locations/Qatar";
import Kuwait from "./pages/locations/Kuwait";
import Oman from "./pages/locations/Oman";
import Egypt from "./pages/locations/Egypt";
import SaudiArabiaAr from "./pages/ar/locations/SaudiArabiaAr";
import UaeAr from "./pages/ar/locations/UaeAr";
import QatarAr from "./pages/ar/locations/QatarAr";
import KuwaitAr from "./pages/ar/locations/KuwaitAr";
import OmanAr from "./pages/ar/locations/OmanAr";
import EgyptAr from "./pages/ar/locations/EgyptAr";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SeoManager />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gcc" element={<GccLanding />} />
          <Route path="/ar/gcc" element={<GccLandingAr />} />
          <Route path="/retreats" element={<Retreats />} />
          <Route path="/our-exclusive-retreats" element={<Retreats />} />
          <Route path="/retreats/saudi-arabia" element={<SaudiArabia />} />
          <Route path="/retreats/uae" element={<Uae />} />
          <Route path="/retreats/qatar" element={<Qatar />} />
          <Route path="/retreats/kuwait" element={<Kuwait />} />
          <Route path="/retreats/oman" element={<Oman />} />
          <Route path="/retreats/egypt" element={<Egypt />} />
          <Route path="/ar/retreats/saudi-arabia" element={<SaudiArabiaAr />} />
          <Route path="/ar/retreats/uae" element={<UaeAr />} />
          <Route path="/ar/retreats/qatar" element={<QatarAr />} />
          <Route path="/ar/retreats/kuwait" element={<KuwaitAr />} />
          <Route path="/ar/retreats/oman" element={<OmanAr />} />
          <Route path="/ar/retreats/egypt" element={<EgyptAr />} />
          <Route path="/about" element={<About />} />
          <Route path="/about-retreats-holidays" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/travel-guide" element={<TravelGuideLogin />} />
          <Route path="/travel-guide/dashboard" element={<TravelGuideDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
