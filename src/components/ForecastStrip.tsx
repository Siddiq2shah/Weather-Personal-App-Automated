import { Droplets } from "lucide-react";
import { WeatherIcon } from "@/components/WeatherIcon";
import { formatDayLabel, type DailyForecast } from "@/lib/weather";

interface ForecastStripProps {
  days: DailyForecast[];
  note: string | null;
  onSelectDay: (day: DailyForecast) => void;
}

export function ForecastStrip({ days, note, onSelectDay }: ForecastStripProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">7-day forecast</h2>
        {note && <p className="text-xs text-slate-500 dark:text-slate-400">{note}</p>}
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select a day to see its hour-by-hour weather</p>

      <ul className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {days.map((day, index) => (
          <li key={day.date} className="flex min-w-[7.5rem] flex-1 snap-start">
            <button
              type="button"
              onClick={() => onSelectDay(day)}
              aria-label={`${index === 0 ? "Today" : formatDayLabel(day.date)}: view hourly forecast`}
              className="flex w-full flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-500 dark:focus-visible:ring-sky-900"
            >
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {index === 0 ? "Today" : formatDayLabel(day.date)}
              </p>
              <WeatherIcon
                conditionId={day.conditionId}
                icon={day.icon}
                className="h-10 w-10 text-sky-600 dark:text-sky-300"
              />
              <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{day.description}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-slate-900 dark:text-white">{Math.round(day.high)}°</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{Math.round(day.low)}°</span>
              </div>
              <p className="flex items-center gap-1 text-xs text-sky-700 dark:text-sky-300">
                <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
                {day.precipChance}%
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
