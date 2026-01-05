import { Link } from "react-router-dom";
import { Facebook, Youtube, Instagram, Phone, Mail, MapPin } from "lucide-react";

const DetailedFooter = () => {
  return (
    <footer className="bg-background border-t border-border/30">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="space-y-6">
            <div>
              <h2 className="text-primary text-3xl font-light tracking-[0.3em]">RETREATS</h2>
              <p className="text-muted-foreground text-sm tracking-[0.4em]">HOLIDAYS</p>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Explore the ideal retreat holiday with our advanced chatbot. Whether you're dreaming of a serene spa getaway, an adventurous nature retreat, or a transformative wellness experience, our chatbot will guide you to the perfect choice.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded border border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded border border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded border border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-primary font-semibold text-lg mb-6">Retreats Holidays</h3>
            <nav className="space-y-3">
              <Link to="/" className="block text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/our-exclusive-retreats" className="block text-muted-foreground hover:text-primary transition-colors">
                Our Recommendations
              </Link>
              <Link to="/about-retreats-holidays" className="block text-muted-foreground hover:text-primary transition-colors">
                About Retreats Holidays
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
            </nav>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-primary font-semibold text-lg mb-6">Address</h3>
            <div className="space-y-4">
              <a 
                href="tel:+23058461923" 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+230 58 46 19 23</span>
              </a>
              <a 
                href="mailto:info@retreats-holidays.com" 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>info@retreats-holidays.com</span>
              </a>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                <span>Jumeirah Lakes towers, Cluster W, JBC5, Dubai, United Arab Emirates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border/30 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Retreats Holidays, All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default DetailedFooter;
