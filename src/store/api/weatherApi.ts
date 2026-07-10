import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { WeatherResponse, CityCoords } from "../../types/weather";

const BASE_URL = "https://nimbus-backend-zg3x.onrender.com";

export const weatherApi = createApi({
  reducerPath: "weatherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Weather"],
  endpoints: (builder) => ({
    getWeatherByCity: builder.query<WeatherResponse, string>({
      query: (city) => `/weather/${encodeURIComponent(city)}`,
      providesTags: (_, __, city) => [{ type: "Weather", id: city }],
    }),

    getWeatherByCoords: builder.query<WeatherResponse, CityCoords>({
      query: ({ lat, lon }) => `/weather?lat=${lat}&lon=${lon}`,
      providesTags: (_, __, { lat, lon }) => [
        { type: "Weather", id: `${lat}_${lon}` },
      ],
    }),
  }),
});

export const {
  useGetWeatherByCityQuery,
  useGetWeatherByCoordsQuery,
  useLazyGetWeatherByCityQuery,
  useLazyGetWeatherByCoordsQuery,
} = weatherApi;
