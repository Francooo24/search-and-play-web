"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  onSearch: (w: string) => void;
}

export default function SearchBox({ onSearch }: Props) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const stored = localStorage.getItem("recent_searches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  const suggestions = query.trim()
    ? recentSearches.filter(r => r.toLowerCase().startsWith(query.trim().toLowerCase()))
    : [];

  const handleSearch = (w: string) => {
    if (!w.trim()) return;
    const updated = [w.trim(), ...recentSearches.filter(r => r.toLowerCase() !== w.trim().toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
    onSearch(w.trim());
  };

  return (
    <form action="/search" method="GET" className="flex mb-4" onSubmit={e => { e.preventDefault(); handleSearch(query); }}>
      <div className="relative flex-grow">
        <input
          ref={inputRef}
          name="word"
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Enter a word..."
          className="w-full px-6 py-5 text-lg md:text-xl rounded-l-2xl focus:outline-none bg-white/5 border border-white/12 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/25 transition"
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
            {suggestions.map(s => (
              <li key={s}>
                <button type="button" onMouseDown={() => { setQuery(s); setShowSuggestions(false); handleSearch(s); }}
                  className="w-full text-left px-5 py-3 text-sm text-gray-300 hover:bg-orange-500/15 hover:text-orange-300 transition flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-5 text-lg font-semibold rounded-r-2xl hover:from-orange-600 hover:to-amber-600 transition shadow-xl flex items-center gap-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search
      </button>
    </form>
  );
}
