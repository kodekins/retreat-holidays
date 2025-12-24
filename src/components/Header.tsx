import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-primary font-semibold text-lg hover:text-primary-dark transition-colors">
            Your Retreats Holidays Assistant
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/retreats" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Retreats
            </Link>
            <Link 
              to="/about" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Menu"
          >
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-foreground rounded-full" />
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-background z-50 md:hidden animate-fade-in">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-primary font-semibold">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-4">
              <Link 
                to="/retreats" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium py-3 border-b border-border hover:text-primary transition-colors"
              >
                Retreats
              </Link>
              <Link 
                to="/about" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium py-3 border-b border-border hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium py-3 border-b border-border hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
