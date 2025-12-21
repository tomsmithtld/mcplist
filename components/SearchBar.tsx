'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import MiniSearch from 'minisearch';

interface Server {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  tags: string[];
  bestFor: string[];
}

interface SearchBarProps {
  servers: Server[];
  onSearch: (results: string[] | null) => void;
  onCategoryFilter: (category: string | null) => void;
  activeCategory: string | null;
  categories: string[];
}

const categoryLabels: Record<string, string> = {
  'filesystem': 'Filesystem',
  'database': 'Database',
  'browser-automation': 'Browser',
  'cloud-platforms': 'Cloud',
  'version-control': 'Git',
  'communication': 'Communication',
  'search': 'Search',
  'ai-tools': 'AI Tools',
  'code-execution': 'Code Exec',
  'media': 'Media',
  'productivity': 'Productivity',
  'utilities': 'Utilities',
};

export function SearchBar({
  servers,
  onSearch,
  onCategoryFilter,
  activeCategory,
  categories,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Initialize MiniSearch
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch({
      fields: ['name', 'description', 'author', 'tags', 'bestFor'],
      storeFields: ['id', 'name'],
      searchOptions: {
        boost: { name: 3, tags: 2, bestFor: 1.5 },
        fuzzy: 0.2,
        prefix: true,
      },
    });

    // Flatten arrays for indexing
    const documents = servers.map((s) => ({
      ...s,
      tags: s.tags.join(' '),
      bestFor: s.bestFor.join(' '),
    }));

    ms.addAll(documents);
    return ms;
  }, [servers]);

  // Handle search
  useEffect(() => {
    if (!query.trim()) {
      onSearch(null);
      setResultCount(null);
      setSuggestions([]);
      return;
    }

    const results = miniSearch.search(query);
    const ids = results.map((r) => r.id as string);
    onSearch(ids.length > 0 ? ids : []);
    setResultCount(ids.length);

    // Generate suggestions
    const autoSuggestions = miniSearch.autoSuggest(query, { boost: { name: 2 } });
    setSuggestions(autoSuggestions.slice(0, 5).map((s) => s.suggestion));
  }, [query, miniSearch, onSearch]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search servers by name, author, or use case..."
            className="search-input pl-14"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface-3 transition-colors"
            >
              <svg
                className="w-5 h-5 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Result count */}
        {resultCount !== null && (
          <p className="absolute -bottom-6 left-0 text-sm text-text-muted">
            {resultCount === 0 ? (
              'No servers found'
            ) : (
              <>
                Found <span className="text-accent font-medium">{resultCount}</span>{' '}
                {resultCount === 1 ? 'server' : 'servers'}
              </>
            )}
          </p>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-2 border border-surface-4 rounded-xl overflow-hidden z-50 animate-slide-down"
          >
            {suggestions.map((suggestion, i) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-5 py-3 text-left text-text-secondary hover:bg-surface-3 hover:text-text-primary transition-colors flex items-center gap-3"
              >
                <svg
                  className="w-4 h-4 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mt-8">
        <button
          onClick={() => onCategoryFilter(null)}
          className={`pill ${activeCategory === null ? 'pill-active' : ''}`}
        >
          All Servers
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryFilter(category)}
            className={`pill ${activeCategory === category ? 'pill-active' : ''}`}
          >
            {categoryLabels[category] || category}
          </button>
        ))}
      </div>
    </div>
  );
}
