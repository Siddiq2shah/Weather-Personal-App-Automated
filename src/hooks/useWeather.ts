import { useCallback, useEffect, useState } from "react";
import { fetchWeather, type WeatherSnapshot } from "@/lib/weather";
import type { Location } from "@/lib/locations";

type WeatherState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: WeatherSnapshot };

export function useWeather(location: Location) {
  const [state, setState] = useState<WeatherState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const { lat, lon, label } = location;

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchWeather({ lat, lon, label })
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err: unknown) => {
        console.error("Weather fetch failed", err);
        if (!cancelled) {
          setState({
            status: "error",
            message: "We couldn't load the latest weather. Check your connection and try again.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lon, label, attempt]);

  const reload = useCallback(() => setAttempt((count) => count + 1), []);

  return { state, reload };
}
