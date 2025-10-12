'use client';

import { useState, useEffect, useRef } from 'react';
import type { CustomerDocument } from '@/types/customerTypes';

interface CustomerSearchProps {
  onSelectCustomer: (customer: CustomerDocument | null) => void;
  selectedCustomer: CustomerDocument | null;
}

export default function CustomerSearch({ onSelectCustomer, selectedCustomer }: CustomerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ricerca con debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (response.ok) {
          setResults(data.customers || []);
          setShowDropdown(true);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Error searching customers:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce di 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectCustomer = (customer: CustomerDocument) => {
    onSelectCustomer(customer);
    setQuery(`${customer.firstName} ${customer.lastName} (${customer.email})`);
    setShowDropdown(false);
  };

  const handleClearCustomer = () => {
    onSelectCustomer(null);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-nocciola mb-2">
            Cerca cliente esistente (opzionale)
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setShowDropdown(true);
              }}
              disabled={selectedCustomer !== null}
              className="w-full px-4 py-2 pr-10 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Cerca per nome, email o telefono..."
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-olive/30 border-t-olive rounded-full animate-spin"></div>
              </div>
            )}
            {!loading && query && !selectedCustomer && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {selectedCustomer && (
          <button
            type="button"
            onClick={handleClearCustomer}
            className="mt-7 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Svuota</span>
          </button>
        )}
      </div>

      {/* Dropdown risultati */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-olive/20 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {results.map((customer) => {
            const customerId = customer._id?.toString() || '';
            return (
              <button
                key={customerId}
                type="button"
                onClick={() => handleSelectCustomer(customer)}
                className="w-full px-4 py-3 hover:bg-olive/5 text-left border-b border-olive/10 last:border-b-0 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-olive text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        {customer.phone && (
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-sm text-olive font-medium">
                      {customer.totalOrders} {customer.totalOrders === 1 ? 'ordine' : 'ordini'}
                    </p>
                    <p className="text-xs text-nocciola">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </div>
                </div>
                {customer.address && (
                  <div className="mt-2 text-xs text-gray-500 ml-10">
                    {customer.address.street}, {customer.address.city} {customer.address.postalCode}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* No results */}
      {showDropdown && query.trim().length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-olive/20 rounded-lg shadow-xl p-4">
          <p className="text-sm text-gray-500 text-center">
            Nessun cliente trovato per &quot;{query}&quot;
          </p>
        </div>
      )}

      {/* Cliente selezionato */}
      {selectedCustomer && (
        <div className="mt-2 p-3 bg-olive/5 border border-olive/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-olive text-white flex items-center justify-center font-medium">
                {selectedCustomer.firstName.charAt(0)}{selectedCustomer.lastName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Cliente esistente
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
