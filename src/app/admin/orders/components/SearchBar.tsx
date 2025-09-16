import React, { useState, useRef } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Cerca per ID, nome cliente, email, telefono...",
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-nocciola" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="block w-full pl-10 pr-20 py-3 border border-olive/20 rounded-lg bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-olive focus:border-transparent placeholder-nocciola text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {searchTerm && (
            <button
              onClick={handleClear}
              className="p-1 mr-1 hover:text-olive transition-colors cursor-pointer"
              type="button"
              title="Pulisci ricerca"
            >
              <svg 
                className="h-4 w-4 text-nocciola hover:text-olive" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 mr-1 text-olive hover:bg-olive hover:text-white rounded transition-colors disabled:opacity-50 cursor-pointer"
            title="Cerca"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-olive/30 border-t-olive rounded-full animate-spin"></div>
            ) : (
              <svg 
                className="h-4 w-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-2 text-sm text-nocciola">
        Digita e premi Invio per cercare, oppure clicca il bottone di ricerca
      </div>
    </form>
  );
};

export default SearchBar;