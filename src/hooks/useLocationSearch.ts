import { useEffect, useState } from "react";
import { searchLocations, type Location } from "@/lib/locations";

const SEARCH_DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

export type LocationSearchStatus = "idle" | "loading" | "ready" | "error";

export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [status, setStatus] = useState<LocationSearchStatus>("idle");

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    const timer = window.setTimeout(() => {
      searchLocations(trimmed, controller.signal)
        .then((found) => {
          setResults(found);
          setStatus("ready");
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setResults([]);
          setStatus("error");
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { query, setQuery, results, status };
}
