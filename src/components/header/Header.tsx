import "./Header.scss";
import { Layout, Input } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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

function debounce(fn: (...args: string[]) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: string[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export const Header = () => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const abortRef = useRef<AbortController | null>(null);
  const debouncedFetchRef = useRef<ReturnType<typeof debounce> | undefined>(
    undefined,
  );
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    debouncedFetchRef.current = debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setDropdownVisible(false);
        return;
      }

      if (parseCoordinates(query)) {
        setSuggestions([]);
        setDropdownVisible(false);
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
          setDropdownVisible(list.length > 0);
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
      const cityParam = encodeURIComponent(toTitleCase(searchValue.trim()));
      navigate(
        `/weather?lat=${suggestion.lat}&lon=${suggestion.lon}&city=${cityParam}`,
      );
      setSearchValue("");
      setSuggestions([]);
      setDropdownVisible(false);
    },
    [navigate, searchValue],
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
      setSearchValue("");
      setSuggestions([]);
      setDropdownVisible(false);
    },
    [navigate],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AntHeader className="app-header">
      <div className="header-left">
        <Link to="/" className="logo">
          Nimbus
        </Link>
        <Link
          to="/geocode"
          className="geocode-link"
          title={t("geocoding_tool")}
        >
          <GlobalOutlined />
        </Link>
      </div>
      <div className="search-wrapper" ref={inputRef}>
        <Input.Search
          className="search-input"
          placeholder={t("search_placeholder")}
          value={searchValue}
          onChange={handleChange}
          onSearch={handleSearch}
          enterButton
          loading={loading}
        />
        {isDropdownVisible && suggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectSuggestion(s)}
                className="suggestion-item"
              >
                {s.displayName}
              </li>
            ))}
          </ul>
        )}
      </div>
      <LanguageSwitcher />
    </AntHeader>
  );
};
