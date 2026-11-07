import { MapPin, RefreshCw, TriangleAlert } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { CurrentWeatherCard } from "@/components/CurrentWeatherCard";
import { DayDetailDialog } from "@/components/DayDetailDialog";
import { ForecastStrip } from "@/components/ForecastStrip";
import { HomeTemperatureCard } from "@/components/HomeTemperatureCard";
import { LocationSearch } from "@/components/LocationSearch";
import { OutfitSuggestions } from "@/components/OutfitSuggestions";
import { PhotoImage } from "@/components/PhotoImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import { useWeather } from "@/hooks/useWeather";
import { recommendOutfits } from "@/lib/outfits";
import { EDISON_LOCATION, isSameLocation, type Location } from "@/lib/locations";
import { hourlyForDay, isPrecipitation, summarizeWeatherForChat, type DailyForecast } from "@/lib/weather";

const HERO_IMAGE_URL =
  "https://images.pexels.com/photos/39837568/pexels-photo-39837568.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

function LoadingCards() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeLocation, setActiveLocation] = useState<Location>(EDISON_LOCATION);
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);
  const { state, reload } = useWeather(activeLocation);
  const { state: homeState } = useWeather(EDISON_LOCATION);

  const snapshot = state.status === "ready" ? state.data : null;
  const weatherContext = useMemo(
    () => (snapshot ? summarizeWeatherForChat(snapshot) : ""),
    [snapshot],
  );
  const selectedHours = useMemo(
    () => (snapshot && selectedDay ? hourlyForDay(snapshot.hourly, selectedDay.date, snapshot.timezoneOffset) : []),
    [snapshot, selectedDay],
  );
  const closeDayDetail = useCallback(() => setSelectedDay(null), []);
  const changeLocation = useCallback((location: Location) => {
    setSelectedDay(null);
    setActiveLocation(location);
  }, []);
  const isHomeActive = isSameLocation(activeLocation, EDISON_LOCATION);
  const homeSnapshot = homeState.status === "ready" ? homeState.data : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <header className="relative z-30">
        <div className="absolute inset-x-0 top-0 bottom-24 -z-10 overflow-hidden bg-gradient-to-br from-sky-600 via-sky-800 to-sky-950">
          <PhotoImage src={HERO_IMAGE_URL} alt="" loading="eager" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/70 via-sky-900/50 to-slate-50 dark:to-slate-950" />
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-32 pt-6 sm:px-6 sm:pt-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-white/90">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{activeLocation.label}</span>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          <div className="pt-4 sm:pt-6">
            <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Welcome back</p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Hello, Eshal Qazi
            </h1>
            <p className="mt-3 max-w-md text-base text-sky-50/90">
              Here is how the sky looks today, what to wear, and what the week ahead holds.
            </p>
          </div>

          <LocationSearch onSelect={changeLocation} />
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-24 max-w-5xl px-4 pb-32 sm:px-6">
        {state.status === "loading" && <LoadingCards />}

        {state.status === "error" && (
          <div
            role="alert"
            className="flex flex-col items-start gap-4 rounded-3xl border border-rose-200 bg-white p-6 shadow-lg dark:border-rose-900 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-slate-200">{state.message}</p>
            </div>
            <button
              type="button"
              onClick={reload}
              className="flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        {snapshot && (
          <div className="flex flex-col gap-6">
            {!isHomeActive && homeSnapshot && (
              <HomeTemperatureCard
                label={homeSnapshot.location.label}
                current={homeSnapshot.current}
                onOpen={() => changeLocation(EDISON_LOCATION)}
              />
            )}
            <ForecastStrip days={snapshot.daily} note={snapshot.forecastNote} onSelectDay={setSelectedDay} />
            <CurrentWeatherCard label={snapshot.location.label} current={snapshot.current} />
            <OutfitSuggestions
              outfits={recommendOutfits(snapshot.current.temp, isPrecipitation(snapshot.current.conditionId))}
              temp={snapshot.current.temp}
            />
          </div>
        )}
      </main>

      {snapshot && selectedDay && (
        <DayDetailDialog
          day={selectedDay}
          hours={selectedHours}
          timezoneOffset={snapshot.timezoneOffset}
          locationLabel={snapshot.location.label}
          onClose={closeDayDetail}
        />
      )}

      <ChatPanel weatherContext={weatherContext} />
    </div>
  );
}

export default App;
