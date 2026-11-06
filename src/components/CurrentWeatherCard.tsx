import { Droplets, Wind, type LucideIcon } from "lucide-react";
import { WeatherIcon } from "@/components/WeatherIcon";
import type { CurrentWeather } from "@/lib/weather";

interface CurrentWeatherCardProps {
  label: string;
  current: CurrentWeather;
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
      <Icon className="h-5 w-5 text-sky-100" aria-hidden="true" />
      <div>
        <dt className="text-xs text-sky-100/90">{label}</dt>
        <dd className="text-base font-medium text-white">{value}</dd>
      </div>
    </div>
  );
}

export function CurrentWeatherCard({ label, current }: CurrentWeatherCardProps) {
  return (
    <section
      aria-label={`Current weather in ${label}`}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 p-6 text-white shadow-xl shadow-sky-900/20 sm:p-8 dark:from-slate-800 dark:via-sky-900 dark:to-slate-900"
    >
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <p className="text-sm font-medium text-sky-50/90">{label}</p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-7xl font-semibold leading-none tracking-tight sm:text-8xl">
            {Math.round(current.temp)}°F
          </p>
          <p className="mt-3 text-lg capitalize text-white">{current.description}</p>
          <p className="text-sm text-sky-100/90">Feels like {Math.round(current.feelsLike)}°F</p>
        </div>
        <WeatherIcon
          conditionId={current.conditionId}
          icon={current.icon}
          className="h-28 w-28 shrink-0 animate-float text-white drop-shadow-lg sm:h-36 sm:w-36"
        />
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3">
        <Stat icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
        <Stat icon={Wind} label="Wind" value={`${Math.round(current.windSpeed)} mph`} />
      </dl>
    </section>
  );
}
