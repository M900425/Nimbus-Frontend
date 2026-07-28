import "./Header.scss";
import { Layout, Input } from "antd";
import {
  GlobalOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toTitleCase, parseCoordinates } from "../../utils/string";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import type { NominatimPlace } from "../../types/nominatim";

const { Header: AntHeader } = Layout;

interface Suggestion {
  displayName: string;
  cityName: string;
  lat: number;
  lon: number;
}

interface LastViewedCity {
  displayName: string;
  cityName: string;
  lat: number | null;
  lon: number | null;
}

function debounce(fn: (...args: string[]) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: string[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  const stored = localStorage.getItem("recentSearches");
  return stored ? JSON.parse(stored) : [];
}

function saveRecentSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearches();
  let recent = getRecentSearches();
  recent = recent.filter((item) => item !== trimmed);
  recent.unshift(trimmed);
  if (recent.length > MAX_RECENT) recent.pop();
  localStorage.setItem("recentSearches", JSON.stringify(recent));
  return recent;
}

function saveLastViewedCity(city: LastViewedCity): void {
  localStorage.setItem("lastViewedCity", JSON.stringify(city));
}

function getLastViewedCityFromStorage(): LastViewedCity | null {
  const stored = localStorage.getItem("lastViewedCity");
  return stored ? JSON.parse(stored) : null;
}

export const Header = () => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] =
    useState<string[]>(getRecentSearches());
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isWeatherActive = location.pathname.startsWith("/weather");
  const isGeocodeActive = location.pathname.startsWith("/geocode");
  const abortRef = useRef<AbortController | null>(null);
  const debouncedFetchRef = useRef<ReturnType<typeof debounce> | undefined>(
    undefined,
  );
  const inputRef = useRef<HTMLDivElement>(null);
  const lastCity = useMemo<LastViewedCity | null>(() => {
    const params = new URLSearchParams(location.search);
    const lat = params.get("lat");
    const lon = params.get("lon");
    const city = params.get("city");

    if (lat && lon) {
      const cityName = city || `${lat},${lon}`;
      const cityData: LastViewedCity = {
        displayName: cityName,
        cityName,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      };
      saveLastViewedCity(cityData);
      return cityData;
    } else if (location.pathname.startsWith("/weather/")) {
      const pathCity = decodeURIComponent(
        location.pathname.split("/weather/")[1],
      );
      if (pathCity) {
        const cityData: LastViewedCity = {
          displayName: pathCity,
          cityName: pathCity,
          lat: null,
          lon: null,
        };
        saveLastViewedCity(cityData);
        return cityData;
      }
    }
    return getLastViewedCityFromStorage();
  }, [location]);

  useEffect(() => {
    debouncedFetchRef.current = debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      if (parseCoordinates(query)) {
        setSuggestions([]);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query,
        )}&format=json&limit=5&addressdetails=1`;

        const res = await fetch(url, { signal: controller.signal });
        const data: NominatimPlace[] = await res.json();

        if (!controller.signal.aborted) {
          const list: Suggestion[] = data.map((item) => {
            const addr = item.address;
            const cityName =
              addr?.city ||
              addr?.town ||
              addr?.village ||
              addr?.municipality ||
              item.display_name.split(",")[0].trim();

            return {
              displayName: item.display_name,
              cityName,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            };
          });
          setSuggestions(list);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);

    return () => abortRef.current?.abort();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedFetchRef.current?.(value);
  }, []);
  const handleSelectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      const cityName = suggestion.cityName || suggestion.displayName;
      const cityParam = encodeURIComponent(toTitleCase(cityName));
      navigate(
        `/weather?lat=${suggestion.lat}&lon=${suggestion.lon}&city=${cityParam}`,
      );
      const updated = saveRecentSearch(cityName);
      setRecentSearches(updated);
      setSearchValue("");
      setSuggestions([]);
      setIsFocused(false);
    },
    [navigate, setRecentSearches],
  );
  const handleSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      const coords = parseCoordinates(trimmed);
      if (coords) {
        navigate(`/weather?lat=${coords.lat}&lon=${coords.lon}`);
      } else {
        navigate(`/weather/${encodeURIComponent(toTitleCase(trimmed))}`);
      }
      const updated = saveRecentSearch(trimmed);
      setRecentSearches(updated);
      setSearchValue("");
      setSuggestions([]);
      setIsFocused(false);
    },
    [navigate, setRecentSearches],
  );
  const handleRecentClick = useCallback(
    (query: string) => {
      handleSearch(query);
    },
    [handleSearch],
  );
  const goToLastCity = useCallback(() => {
    if (!lastCity) return;
    if (lastCity.lat !== null && lastCity.lon !== null) {
      const cityParam = encodeURIComponent(toTitleCase(lastCity.cityName));
      navigate(
        `/weather?lat=${lastCity.lat}&lon=${lastCity.lon}&city=${cityParam}`,
      );
    } else {
      navigate(
        `/weather/${encodeURIComponent(toTitleCase(lastCity.cityName))}`,
      );
    }
  }, [lastCity, navigate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showSuggestions = suggestions.length > 0;
  const showRecent =
    isFocused && !searchValue.trim() && recentSearches.length > 0;

  return (
    <AntHeader className="app-header">
      <div className="header-left">
        <Link to="/" className="logo">
          Nimbus
        </Link>
        <Link
          to="/geocode"
          className={`geocode-link ${isGeocodeActive ? "active" : ""}`}
          title={t("geocoding_tool")}
        >
          <GlobalOutlined />
        </Link>
        {lastCity && (
          <button
            className={`geocode-link last-city-btn ${isWeatherActive ? "active" : ""}`}
            onClick={goToLastCity}
            title={t("back_to_last_city")}
          >
            <ThunderboltOutlined />
          </button>
        )}
      </div>
      <div className="search-wrapper" ref={inputRef}>
        <Input.Search
          className="search-input"
          placeholder={t("search_placeholder")}
          value={searchValue}
          onChange={handleChange}
          onSearch={handleSearch}
          onFocus={() => setIsFocused(true)}
          enterButton
          loading={loading}
        />
        {(showSuggestions || showRecent) && (
          <ul className="suggestions-dropdown">
            {showSuggestions &&
              suggestions.map((s, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelectSuggestion(s)}
                  className="suggestion-item"
                >
                  {s.displayName}
                </li>
              ))}
            {!showSuggestions &&
              showRecent &&
              recentSearches.map((q, idx) => (
                <li
                  key={idx}
                  onClick={() => handleRecentClick(q)}
                  className="suggestion-item recent-item"
                >
                  <ClockCircleOutlined
                    style={{ marginRight: 8, opacity: 0.5 }}
                  />
                  {q}
                </li>
              ))}
          </ul>
        )}
      </div>
      <LanguageSwitcher />
    </AntHeader>
  );
};
