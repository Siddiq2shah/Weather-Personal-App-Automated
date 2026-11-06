import { getOpenWeatherJson, openWeatherUrl } from "@/lib/openweather";

export interface Location {
  label: string;
  lat: number;
  lon: number;
}

export const EDISON_LOCATION: Location = {
  label: "Edison, NJ",
  lat: 40.5187,
  lon: -74.4121,
};

interface GeocodeResult {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function toLocation(result: GeocodeResult): Location {
  const label = [result.name, result.state, countryName(result.country)].filter(Boolean).join(", ");
  return { label, lat: result.lat, lon: result.lon };
}

export async function searchLocations(query: string, signal?: AbortSignal): Promise<Location[]> {
  const url = openWeatherUrl("/geo/1.0/direct", { q: query, limit: "5" });
  const results = await getOpenWeatherJson<GeocodeResult[]>(url, signal);
  if (!Array.isArray(results)) {
    throw new Error("Unexpected response from the location search");
  }
  return results.map(toLocation);
}

export function isSameLocation(a: Location, b: Location): boolean {
  return Math.abs(a.lat - b.lat) < 0.01 && Math.abs(a.lon - b.lon) < 0.01;
}
