import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";

function iconForCondition(conditionId: number, icon: string): LucideIcon {
  const isNight = icon.endsWith("n");
  if (conditionId >= 200 && conditionId < 300) return CloudLightning;
  if (conditionId >= 300 && conditionId < 400) return CloudDrizzle;
  if (conditionId >= 500 && conditionId < 600) return CloudRain;
  if (conditionId >= 600 && conditionId < 700) return CloudSnow;
  if (conditionId === 781) return Wind;
  if (conditionId >= 700 && conditionId < 800) return CloudFog;
  if (conditionId === 800) return isNight ? Moon : Sun;
  if (conditionId === 801 && !isNight) return CloudSun;
  return Cloud;
}

interface WeatherIconProps {
  conditionId: number;
  icon: string;
  className?: string;
}

export function WeatherIcon({ conditionId, icon, className }: WeatherIconProps) {
  const Icon = iconForCondition(conditionId, icon);
  return <Icon className={className} aria-hidden="true" strokeWidth={1.75} />;
}
