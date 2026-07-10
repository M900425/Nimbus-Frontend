export interface WeatherCurrent {
  time: string;
  interval: number;
  temperature: number;
  windspeed: number;
  winddirection: number;
  is_day: number;
  weathercode: number;
}

export interface WeatherHourly {
  time: string[];
  temperature_2m: number[];
  relativehumidity_2m: number[];
  windspeed_10m: number[];
  windgusts_10m: number[];
  precipitation: number[];
  snowfall: number[];
  cloudcover: number[];
  visibility: number[];
}

export interface WeatherDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  uv_index_max: number[];
  apparent_temperature_max: number[];
  precipitation_sum: number[];
  windspeed_10m_max: number[];
}

export interface WeatherResponse {
  city: string;
  coords: {
    lat: number;
    lon: number;
  };
  current: WeatherCurrent;
  hourly: WeatherHourly;
  daily: WeatherDaily;
  sources: string[];
}

export interface CityCoords {
  lat: number;
  lon: number;
}
