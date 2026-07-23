export const getWindDirection = (deg: number): string => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return dirs[index];
};

export const getWeatherIcon = (condition: string): string => {
  if (!condition) return "☀️";
  const lower = condition.toLowerCase();
  if (lower.includes("rain")) return "🌧️";
  if (lower.includes("cloud")) return "☁️";
  if (lower.includes("overcast")) return "☁️";
  if (lower.includes("clear")) return "☀️";
  if (lower.includes("snow")) return "❄️";
  if (lower.includes("thunder")) return "⛈️";
  return "🌤️";
};

export const createWaterLabel = (t: (key: string) => string) => {
  return (temp: number | null, source: string): string => {
    if (temp !== null) return `${temp}°C`;
    if (source === "unavailable") return t("no_sea_nearby");
    return t("na");
  };
};

export const getDayMinMax = (
  hours: { temp: number }[],
): { max: number | null; min: number | null } => {
  if (!hours || hours.length === 0) return { max: null, min: null };
  const temps = hours
    .map((h) => h.temp)
    .filter((t) => t !== undefined && t !== null);
  if (temps.length === 0) return { max: null, min: null };
  return {
    max: Math.max(...temps),
    min: Math.min(...temps),
  };
};

export const formatDate = (dateString: string, locale: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const getDayLabel = (dateString: string, locale: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0 || diffDays === 1 || diffDays === -1) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    return rtf.format(diffDays, "day");
  }

  return date.toLocaleDateString(locale, { weekday: "short" });
};

export const getEffectiveDates = (
  dailyDates: string[],
  daysLength: number,
): string[] => {
  if (dailyDates.length >= daysLength) {
    return dailyDates.slice(0, daysLength);
  }
  const result = [...dailyDates];
  const lastDate =
    dailyDates.length > 0
      ? new Date(dailyDates[dailyDates.length - 1])
      : new Date();
  for (let i = dailyDates.length; i < daysLength; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + (i - dailyDates.length + 1));
    result.push(nextDate.toISOString().split("T")[0]);
  }
  return result;
};

export const getHourLabel = (index: number): string => {
  return `${String(index).padStart(2, "0")}:00`;
};
