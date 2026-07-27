import "./GeocodePage.scss";
import { useState } from "react";
import { Card, Input, Button, Alert, Tabs, Typography } from "antd";
import { SearchOutlined, GlobalOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../components/Loader/Loader";
import { useTranslation } from "react-i18next";
import { ResultsList } from "./components/ResultsList/ResultsList";
import type { GeocodeResult } from "../../types/geocode";

const { Title, Paragraph } = Typography;

type SearchType = "city" | "coords";
interface PhotonProperties {
  osm_id: number;
  osm_key?: string;
  osm_type?: string;
  name?: string;
  city?: string;
  state?: string;
  country?: string;
}
interface PhotonFeature {
  properties: PhotonProperties;
  geometry: {
    coordinates: [number, number];
  };
}
interface PhotonResponse {
  features: PhotonFeature[];
}

async function searchCityPhoton(query: string): Promise<GeocodeResult[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Photon error ${response.status}`);
  const data: PhotonResponse = await response.json();
  if (!data.features || data.features.length === 0) return [];

  return data.features.map((item: PhotonFeature) => {
    const props = item.properties;
    const [lon, lat] = item.geometry.coordinates;
    return {
      place_id: props.osm_id,
      display_name: [props.name, props.state, props.country]
        .filter(Boolean)
        .join(", "),
      lat: lat.toString(),
      lon: lon.toString(),
      class: props.osm_key || "place",
      type: props.osm_type || "node",
      address: {
        city: props.city || props.name,
        state: props.state,
        country: props.country,
      },
    };
  });
}

async function reverseGeocodePhoton(
  lat: string,
  lon: string,
): Promise<GeocodeResult> {
  const url = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Photon error ${response.status}`);
  const data: PhotonResponse = await response.json();
  if (!data.features || data.features.length === 0) {
    throw new Error("Location not found");
  }
  const feature = data.features[0];
  const props = feature.properties;
  const [lonR, latR] = feature.geometry.coordinates;
  return {
    place_id: props.osm_id,
    display_name: [props.name, props.state, props.country]
      .filter(Boolean)
      .join(", "),
    lat: latR.toString(),
    lon: lonR.toString(),
    class: props.osm_key || "place",
    type: props.osm_type || "node",
    address: {
      city: props.city || props.name,
      state: props.state,
      country: props.country,
    },
  };
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

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      if (searchType === "city") {
        const data = await searchCityPhoton(cityQuery);
        if (data.length > 0) {
          setResults(data);
        } else {
          setError(t("location_not_found"));
        }
      } else {
        const data = await reverseGeocodePhoton(latQuery, lonQuery);
        setResults([data]);
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
