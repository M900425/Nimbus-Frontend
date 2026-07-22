export const weatherConditionMap: Record<string, string> = {
  Clear: "clear",
  "Partly cloudy": "partly_cloudy",
  Overcast: "overcast",
  Rain: "rain",
  "Light rain": "light_rain",
  "Heavy rain": "heavy_rain",
  Cloudy: "cloudy",
  Sunny: "sunny",
  Snow: "snow",
  Thunderstorm: "thunderstorm",
  Fog: "fog",
  Mist: "mist",
  "Patchy rain nearby": "patchy_rain",
  "Light rain shower": "light_rain_shower",
  "Moderate rain": "moderate_rain",
  "Partially cloudy": "partly_cloudy",
};

export const getTranslatedCondition = (
  condition: string | undefined,
  t: (key: string) => string,
): string => {
  if (!condition) return "";
  const parts = condition.split(/,\s*/);
  const translatedParts = parts.map((part) => {
    const key = weatherConditionMap[part.trim()];
    return key ? t(key) : part.trim();
  });
  return translatedParts.join(", ");
};
