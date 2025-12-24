import { Search, Mic } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = "4-day retreat holiday in Bali with yoga, surf, and vegan food" }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/15 transition-all duration-300 opacity-0 group-hover:opacity-100" />
        <div className="relative flex items-center bg-background border-2 border-primary/30 rounded-full px-5 py-3 shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-300">
          <Search className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
          />
          <button
            type="button"
            className="ml-3 p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="Voice search"
          >
            <Mic className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        className="mt-5 mx-auto block px-8 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary-dark transition-colors duration-300 shadow-md hover:shadow-lg"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
