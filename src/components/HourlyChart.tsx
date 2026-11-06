import { Droplets } from "lucide-react";
import { WeatherIcon } from "@/components/WeatherIcon";
import { formatHourLabel, hourOfDay, type HourlyPoint } from "@/lib/weather";

interface TemperatureBand {
  label: string;
  max: number;
  fill: string;
  swatch: string;
}

const TEMPERATURE_BANDS: TemperatureBand[] = [
  { label: "Under 50°F", max: 50, fill: "#38bdf8", swatch: "bg-sky-400" },
  { label: "50–69°F", max: 70, fill: "#34d399", swatch: "bg-emerald-400" },
  { label: "70–84°F", max: 85, fill: "#fbbf24", swatch: "bg-amber-400" },
  { label: "85°F and up", max: Infinity, fill: "#fb7185", swatch: "bg-rose-400" },
];

function bandFor(temp: number): TemperatureBand {
  return TEMPERATURE_BANDS.find((band) => temp < band.max) ?? TEMPERATURE_BANDS[TEMPERATURE_BANDS.length - 1];
}

const WIDTH = 640;
const HEIGHT = 250;
const LEFT = 40;
const RIGHT = 16;
const PLOT_TOP = 20;
const PLOT_HEIGHT = 150;
const RAIN_TOP = 184;
const RAIN_HEIGHT = 36;
const LABEL_Y = 240;
const INNER_WIDTH = WIDTH - LEFT - RIGHT;
const TICK_HOURS = [0, 6, 12, 18, 24];
const TICK_LABELS = ["12a", "6a", "12p", "6p", "12a"];

function xForHour(hour: number): number {
  return LEFT + (hour / 24) * INNER_WIDTH;
}

interface HourlyChartProps {
  hours: HourlyPoint[];
  timezoneOffset: number;
}

export function HourlyChart({ hours, timezoneOffset }: HourlyChartProps) {
  const temps = hours.map((point) => point.temp);
  const minTemp = Math.floor(Math.min(...temps) - 4);
  const maxTemp = Math.ceil(Math.max(...temps) + 4);
  const yForTemp = (temp: number) =>
    PLOT_TOP + (1 - (temp - minTemp) / (maxTemp - minTemp)) * PLOT_HEIGHT;

  const plotted = hours.map((point) => ({
    ...point,
    x: xForHour(hourOfDay(point.time, timezoneOffset)),
    y: yForTemp(point.temp),
    band: bandFor(point.temp),
  }));
  const barWidth = (INNER_WIDTH / 8) * 0.6;
  const gridTemps = [minTemp, Math.round((minTemp + maxTemp) / 2), maxTemp];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Hourly temperature line chart with rain chance bars"
      >
        {gridTemps.map((temp) => (
          <g key={temp}>
            <line
              x1={LEFT}
              x2={WIDTH - RIGHT}
              y1={yForTemp(temp)}
              y2={yForTemp(temp)}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeDasharray="4 4"
            />
            <text x={LEFT - 8} y={yForTemp(temp) + 4} textAnchor="end" className="fill-slate-500 text-[11px] dark:fill-slate-400">
              {temp}°
            </text>
          </g>
        ))}

        <line
          x1={LEFT}
          x2={WIDTH - RIGHT}
          y1={RAIN_TOP}
          y2={RAIN_TOP}
          className="stroke-slate-200 dark:stroke-slate-700"
        />

        {plotted.map((point) => (
          <rect
            key={`rain-${point.time}`}
            x={point.x - barWidth / 2}
            y={RAIN_TOP + RAIN_HEIGHT * (1 - point.precipChance / 100)}
            width={barWidth}
            height={(RAIN_HEIGHT * point.precipChance) / 100}
            rx={3}
            className="fill-sky-400/70 dark:fill-sky-500/70"
          >
            <title>{`${point.precipChance}% chance of rain`}</title>
          </rect>
        ))}

        {hours.length > 1 && (
          <polyline
            points={plotted.map((point) => `${point.x},${point.y}`).join(" ")}
            fill="none"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="stroke-slate-400 dark:stroke-slate-500"
          />
        )}

        {plotted.map((point) => (
          <g key={point.time}>
            <circle cx={point.x} cy={point.y} r={6} fill={point.band.fill} className="stroke-white dark:stroke-slate-900" strokeWidth={2}>
              <title>{`${formatHourLabel(point.time, timezoneOffset)}: ${Math.round(point.temp)}°F, ${point.description}`}</title>
            </circle>
            <text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-slate-700 text-[12px] font-semibold dark:fill-slate-200">
              {Math.round(point.temp)}°
            </text>
          </g>
        ))}

        {TICK_HOURS.map((hour, index) => (
          <text
            key={hour}
            x={xForHour(hour)}
            y={LABEL_Y}
            textAnchor={index === 0 ? "start" : index === TICK_HOURS.length - 1 ? "end" : "middle"}
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            {TICK_LABELS[index]}
          </text>
        ))}
      </svg>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600 dark:text-slate-300" aria-label="Chart key">
        {TEMPERATURE_BANDS.map((band) => (
          <li key={band.label} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${band.swatch}`} aria-hidden="true" />
            {band.label}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-sky-400/70" aria-hidden="true" />
          Rain chance (bars)
        </li>
      </ul>
    </div>
  );
}

interface HourlyStripProps {
  hours: HourlyPoint[];
  timezoneOffset: number;
}

export function HourlyStrip({ hours, timezoneOffset }: HourlyStripProps) {
  return (
    <ul className="mt-6 flex gap-3 overflow-x-auto pb-2">
      {hours.map((point) => (
        <li
          key={point.time}
          className="flex min-w-[5.5rem] flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center dark:border-slate-700 dark:bg-slate-800"
        >
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {formatHourLabel(point.time, timezoneOffset)}
          </p>
          <WeatherIcon conditionId={point.conditionId} icon={point.icon} className="h-7 w-7 text-sky-600 dark:text-sky-300" />
          <p className="text-base font-semibold text-slate-900 dark:text-white">{Math.round(point.temp)}°</p>
          <p className="flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-300">
            <Droplets className="h-3 w-3" aria-hidden="true" />
            {point.precipChance}%
          </p>
        </li>
      ))}
    </ul>
  );
}
