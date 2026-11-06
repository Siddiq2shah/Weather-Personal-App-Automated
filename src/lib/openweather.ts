const OPENWEATHER_API_KEY = "ba6d19dfd4b6f9ccc2221a96d498804a";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org";

export function openWeatherUrl(path: string, params: Record<string, string>): string {
  const query = new URLSearchParams({ ...params, appid: OPENWEATHER_API_KEY });
  return `${OPENWEATHER_BASE_URL}${path}?${query.toString()}`;
}

export async function getOpenWeatherJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Weather service responded with status ${response.status}`);
  }
  return (await response.json()) as T;
}
