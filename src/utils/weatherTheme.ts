export type WeatherTheme =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "snow"
  | "fog"
  | "thunderstorm"
  | "windy";

interface ThemeConfig {
  theme: WeatherTheme;
  isDay: boolean;
}

export function getWeatherTheme(
  weathercode?: number,
  conditionText?: string,
  isDay: boolean = true,
): ThemeConfig {
  const text = conditionText?.toLowerCase() || "";

  if (
    text.includes("rain") ||
    text.includes("drizzle") ||
    text.includes("shower")
  ) {
    return { theme: "rain", isDay };
  }
  if (
    text.includes("thunder") ||
    text.includes("storm") ||
    text.includes("tstorm")
  ) {
    return { theme: "thunderstorm", isDay };
  }
  if (
    text.includes("snow") ||
    text.includes("ice") ||
    text.includes("sleet") ||
    text.includes("blizzard")
  ) {
    return { theme: "snow", isDay };
  }
  if (text.includes("fog") || text.includes("mist") || text.includes("haze")) {
    return { theme: "fog", isDay };
  }

  if (weathercode !== undefined) {
    if (weathercode === 0) return { theme: "clear", isDay };
    if (weathercode === 1 || weathercode === 2)
      return { theme: "partly-cloudy", isDay };
    if (weathercode === 3) return { theme: "cloudy", isDay };
    if (
      [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weathercode)
    )
      return { theme: "rain", isDay };
    if ([71, 73, 75, 77, 85, 86].includes(weathercode))
      return { theme: "snow", isDay };
    if ([95, 96, 99].includes(weathercode))
      return { theme: "thunderstorm", isDay };
    if ([45, 48].includes(weathercode)) return { theme: "fog", isDay };
  }

  if (text.includes("overcast")) return { theme: "cloudy", isDay };
  if (text.includes("partly") || text.includes("cloud"))
    return { theme: "partly-cloudy", isDay };
  if (text.includes("clear") || text.includes("sunny"))
    return { theme: "clear", isDay };

  return { theme: "clear", isDay };
}
