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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/retreats" element={<Retreats />} />
          <Route path="/our-exclusive-retreats" element={<Retreats />} />
          <Route path="/about" element={<About />} />
          <Route path="/about-retreats-holidays" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/travel-guide" element={<TravelGuideLogin />} />
          <Route path="/travel-guide/dashboard" element={<TravelGuideDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
