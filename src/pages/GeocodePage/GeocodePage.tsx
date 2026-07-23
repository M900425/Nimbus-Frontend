import "./GeocodePage.scss";
import { useState } from "react";
import { Card, Input, Button, Alert, Tabs, Typography } from "antd";
import { SearchOutlined, GlobalOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { GeocodeResult } from "../../types/geocode";
import { Loader } from "../../components/Loader/Loader";
import { useTranslation } from "react-i18next";
import { ResultsList } from "./components/ResultsList/ResultsList";

const { Title, Paragraph } = Typography;

type SearchType = "city" | "coords";
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 && i < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      return response;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("Failed to fetch");
}

export const GeocodePage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<SearchType>("city");
  const [cityQuery, setCityQuery] = useState("");
  const [latQuery, setLatQuery] = useState("");
  const [lonQuery, setLonQuery] = useState("");
  const navigate = useNavigate();
  const handleSearch = async () => {
    if (searchType === "city") {
      if (!cityQuery.trim()) return;
    } else {
      if (!latQuery.trim() || !lonQuery.trim()) return;
    }
    const url =
      searchType === "city"
        ? `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            cityQuery,
          )}&format=json&limit=10&addressdetails=1`
        : `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
            latQuery,
          )}&lon=${encodeURIComponent(lonQuery)}&format=json`;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetchWithRetry(url, {
        headers: {
          "User-Agent": "NimbusWeatherApp/1.0 (your-email@example.com)",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (searchType === "coords") {
        if (data && data.display_name) {
          setResults([data]);
        } else {
          throw new Error(t("location_not_found"));
        }
      } else {
        if (data && data.length > 0) {
          setResults(data);
        } else {
          throw new Error(t("location_not_found"));
        }
      }
    } catch (err: unknown) {
      let message = t("something_wrong");
      if (err instanceof Error) {
        if (err.message === "Failed to fetch") {
          message = t("network_error_check_connection");
        } else if (err.message.includes("HTTP error")) {
          message = t("server_error");
        } else if (err.message !== t("location_not_found")) {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  const handleViewWeather = (lat: number, lon: number) => {
    navigate(`/weather?lat=${lat}&lon=${lon}`);
  };
  const tabItems = [
    {
      key: "city",
      label: "🌍 " + t("city_name"),
      children: (
        <div className="search-section">
          <Input.Search
            placeholder={t("enter_city_name")}
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            onSearch={handleSearch}
            enterButton={t("search")}
            size="large"
            loading={loading}
          />
          <div className="hint">
            <small>{t("examples")}</small>
          </div>
        </div>
      ),
    },
    {
      key: "coords",
      label: "📍 " + t("coordinates"),
      children: (
        <div className="search-section coords-input">
          <Input
            placeholder={t("latitude")}
            value={latQuery}
            onChange={(e) => setLatQuery(e.target.value)}
            style={{ width: 150 }}
            size="large"
            onPressEnter={handleSearch}
          />
          <Input
            placeholder={t("longitude")}
            value={lonQuery}
            onChange={(e) => setLonQuery(e.target.value)}
            style={{ width: 150 }}
            size="large"
            onPressEnter={handleSearch}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
          >
            {t("search")}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loader tip={t("searching")} />;
  }

  return (
    <div className="geocode-page">
      <Card className="geocode-card" bordered={false}>
        <div className="header">
          <GlobalOutlined className="header-icon" />
          <Title level={2}>{t("geocoding_title")}</Title>
          <Paragraph type="secondary">{t("geocoding_desc")}</Paragraph>
        </div>
        <Tabs
          activeKey={searchType}
          onChange={(key) => setSearchType(key as SearchType)}
          items={tabItems}
        />
      </Card>
      {error && (
        <Alert
          message={t("error")}
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="error-alert"
        />
      )}
      {results.length > 0 && (
        <Card
          title={t("results", { count: results.length })}
          className="results-card"
          bordered={false}
        >
          <ResultsList
            results={results}
            onViewWeather={handleViewWeather}
            t={t}
          />
        </Card>
      )}
    </div>
  );
};
