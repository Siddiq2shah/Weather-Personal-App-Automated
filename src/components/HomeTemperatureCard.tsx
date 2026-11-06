import { ArrowRight, MapPin } from "lucide-react";
import { WeatherIcon } from "@/components/WeatherIcon";
import type { CurrentWeather } from "@/lib/weather";

interface HomeTemperatureCardProps {
  label: string;
  current: CurrentWeather;
  onOpen: () => void;
}

export function HomeTemperatureCard({ label, current, onOpen }: HomeTemperatureCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Show weather for ${label}`}
      className="group flex w-full items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-600 dark:focus-visible:ring-sky-900"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          Home
        </p>
        <p className="mt-1 truncate font-medium text-slate-900 dark:text-slate-100">{label}</p>
        <p className="text-sm capitalize text-slate-500 dark:text-slate-400">{current.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <WeatherIcon conditionId={current.conditionId} icon={current.icon} className="h-12 w-12 text-sky-600 dark:text-sky-300" />
        <p className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">{Math.round(current.temp)}°F</p>
        <ArrowRight
          className="hidden h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-600 sm:block dark:group-hover:text-sky-300"
          aria-hidden="true"
        />
      </div>
    </button>
  );
}
