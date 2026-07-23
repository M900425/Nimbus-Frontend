export interface Condition {
  text: string;
  icon: string;
  code: number;
}

export interface WeatherCurrent {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  condition: Condition;
  pressure: number;
  precipitation: number;
  humidity: number;
  cloudcover: number;
  feelslike: number;
  visibility: number;
  uvindex: number;
  windgust: number;
  conditions: string;
}

export interface HourlyData {
  time: string[];
  temperature_2m: number[];
  relativehumidity_2m: number[];
  windspeed_10m: number[];
  windgusts_10m: number[];
  precipitation: number[];
  snowfall: number[];
  cloudcover: number[];
  visibility: number[];
  shortwave_radiation?: number[];
}

export interface DailyData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  uv_index_max: number[];
  apparent_temperature_max: number[];
  precipitation_sum: number[];
  windspeed_10m_max: number[];
}

export interface WaterTemperature {
  temperature: number | null;
  source: "real" | "calculated" | "unavailable";
}

export interface Water {
  sea: WaterTemperature;
  lake: WaterTemperature;
  river: WaterTemperature;
}

export interface DayHour {
  time: string;
  temp: number;
  humidity: number;
  precip: number;
  windgust: number;
  windspeed: number;
  uvindex: number;
  conditions: string;
}

export interface Day {
  time: string;
  temp: number;
  tempMax?: number;
  tempMin?: number;
  humidity: number;
  precip: number;
  windgust: number;
  windspeed: number;
  uvindex: number;
  conditions: string;
  hours: DayHour[];
}

export interface CurrentConditions {
  temp: number;
  humidity: number;
  precip: number;
  windgust: number;
  windspeed: number;
  uvindex: number;
  conditions: string;
}

export interface WeatherResponse {
  city: string;
  coords: {
    lat: number;
    lon: number;
  };
  current: WeatherCurrent;
  hourly: HourlyData;
  daily: DailyData;
  sources: string[];
  water: Water;
  days: Day[];
  currentConditions: CurrentConditions;
  queryCost?: number;
  latitude?: number;
  longitude?: number;
  resolvedAddress?: string;
  address?: string;
  timezone?: string;
  tzoffset?: number;
}

export interface CityCoords {
  lat: number;
  lon: number;
}
