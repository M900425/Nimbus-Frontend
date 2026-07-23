import "./GeocodePage.scss";
import { useState } from "react";
import { Card, Input, Alert, Typography } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../components/Loader/Loader";
import { useTranslation } from "react-i18next";
import { ResultsList } from "./components/ResultsList/ResultsList";
import type { GeocodeResult } from "../../types/geocode";

const { Title, Paragraph } = Typography;

interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

async function searchCityOpenMeteo(
  query: string,
  language: string,
): Promise<GeocodeResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=10&language=${language}&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open-Meteo error ${response.status}`);
  const data = await response.json();

  if (!data.results) return [];

  return data.results.map((item: OpenMeteoResult) => ({
    place_id: item.id,
    display_name: `${item.name}, ${item.admin1 || ""}, ${item.country || ""}`,
    lat: item.latitude.toString(),
    lon: item.longitude.toString(),
    class: "place",
    address: {
      city: item.name,
      state: item.admin1,
      country: item.country,
    },
  }));
}

export const GeocodePage = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cityQuery, setCityQuery] = useState("");
  const navigate = useNavigate();
  const handleSearch = async () => {
    if (!cityQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await searchCityOpenMeteo(cityQuery, i18n.language);
      if (data.length > 0) {
        setResults(data);
      } else {
        setError(t("location_not_found"));
      }
    } catch (err: unknown) {
      let message = t("something_wrong");
      if (err instanceof Error) {
        if (err.message === "Failed to fetch") {
          message = t("network_error_check_connection");
        } else if (err.message.includes("error")) {
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
