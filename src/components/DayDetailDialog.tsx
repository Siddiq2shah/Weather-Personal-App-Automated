import { X } from "lucide-react";
import { useEffect } from "react";
import { HourlyChart, HourlyStrip } from "@/components/HourlyChart";
import { WeatherIcon } from "@/components/WeatherIcon";
import { formatFullDayLabel, type DailyForecast, type HourlyPoint } from "@/lib/weather";

interface DayDetailDialogProps {
  day: DailyForecast;
  hours: HourlyPoint[];
  timezoneOffset: number;
  locationLabel: string;
  onClose: () => void;
}

export function DayDetailDialog({ day, hours, timezoneOffset, locationLabel, onClose }: DayDetailDialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-detail-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-3xl sm:rounded-3xl dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{locationLabel}</p>
            <h2 id="day-detail-title" className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {formatFullDayLabel(day.date)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close hourly forecast"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-5 rounded-2xl bg-sky-50 p-4 dark:bg-slate-800">
          <WeatherIcon conditionId={day.conditionId} icon={day.icon} className="h-14 w-14 text-sky-600 dark:text-sky-300" />
          <div>
            <p className="text-lg font-semibold capitalize text-slate-900 dark:text-slate-100">{day.description}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              High {Math.round(day.high)}°F · Low {Math.round(day.low)}°F · Rain chance {day.precipChance}%
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Hourly temperature</h3>
          {hours.length > 0 ? (
            <>
              <div className="mt-4">
                <HourlyChart hours={hours} timezoneOffset={timezoneOffset} />
              </div>
              <HourlyStrip hours={hours} timezoneOffset={timezoneOffset} />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Forecast readings are published every three hours.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Hourly details aren't available for this day. They cover the next five days.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
