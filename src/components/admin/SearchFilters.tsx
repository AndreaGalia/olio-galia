'use client';

import { useState, FormEvent } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  statusOptions?: FilterOption[];
  feedbackFilter?: string;
  onFeedbackFilterChange?: (value: string) => void;
}

export default function SearchFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onRefresh,
  isLoading = false,
  searchPlaceholder = 'Cerca...',
  statusOptions,
  feedbackFilter,
  onFeedbackFilterChange
}: SearchFiltersProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchTerm);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-olive/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <div className="flex items-center space-x-4">
          {statusOptions && statusFilter !== undefined && onStatusChange && (
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {feedbackFilter !== undefined && onFeedbackFilterChange && (
            <select
              value={feedbackFilter}
              onChange={(e) => onFeedbackFilterChange(e.target.value)}
              className="px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
            >
              <option value="all">Tutte le recensioni</option>
              <option value="with">Con recensione</option>
              <option value="without">Senza recensione</option>
            </select>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-6 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Aggiorna</span>
          </button>
        </div>
      </div>
    </div>
  );
}