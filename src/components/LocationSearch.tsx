import { Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import type { Location } from "@/lib/locations";

const MIN_QUERY_LENGTH = 2;

interface LocationSearchProps {
  onSelect: (location: Location) => void;
}

function ResultsMessage({ children }: { children: ReactNode }) {
  return <p className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{children}</p>;
}

export function LocationSearch({ onSelect }: LocationSearchProps) {
  const { query, setQuery, results, status } = useLocationSearch();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const choose = (location: Location) => {
    onSelect(location);
    setQuery("");
    setOpen(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (results.length > 0) choose(results[0]);
  };

  const showPanel = open && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="location-search" className="sr-only">
          Search a city, state, or country
        </label>
        <div className="flex items-center gap-3 rounded-full border border-white/40 bg-white/95 px-4 py-3 shadow-lg shadow-sky-950/20 backdrop-blur transition focus-within:ring-4 focus-within:ring-sky-300/60 dark:border-slate-700 dark:bg-slate-900/95">
          <Search className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          <input
            id="location-search"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
            autoComplete="off"
            placeholder="Search any city, state, or country"
            aria-expanded={showPanel}
            aria-controls="location-results"
            className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-500 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
          />
        </div>
      </form>

      {showPanel && (
        <div
          id="location-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          {status === "loading" && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Searching...
            </div>
          )}
          {status === "error" && (
            <ResultsMessage>Search is unavailable right now. Please try again.</ResultsMessage>
          )}
          {status === "ready" && results.length === 0 && (
            <ResultsMessage>No places found. Try a different city, state, or country.</ResultsMessage>
          )}
          {status === "ready" && results.length > 0 && (
            <ul className="max-h-72 overflow-y-auto py-2">
              {results.map((location) => (
                <li key={`${location.lat},${location.lon}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => choose(location)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-800 transition hover:bg-sky-50 focus:bg-sky-50 focus:outline-none dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    {location.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
