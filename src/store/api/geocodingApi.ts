import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GeocodeResult } from "../../types/geocode";

const BASE_URL = import.meta.env.DEV
  ? "https://nominatim.openstreetmap.org"
  : "/";

export const geocodingApi = createApi({
  reducerPath: "geocodingApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    searchCity: builder.query<GeocodeResult[], string>({
      query: (q) => {
        const params = new URLSearchParams({
          q,
          format: "json",
          limit: "10",
          addressdetails: "1",
        });
        return import.meta.env.DEV
          ? `search?${params.toString()}`
          : `api/geocode?${params.toString()}`;
      },
    }),
    reverseGeocode: builder.query<GeocodeResult, { lat: number; lon: number }>({
      query: ({ lat, lon }) => {
        const params = new URLSearchParams({
          lat: lat.toString(),
          lon: lon.toString(),
          format: "json",
        });
        return import.meta.env.DEV
          ? `reverse?${params.toString()}`
          : `api/geocode?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useSearchCityQuery,
  useLazySearchCityQuery,
  useReverseGeocodeQuery,
} = geocodingApi;
