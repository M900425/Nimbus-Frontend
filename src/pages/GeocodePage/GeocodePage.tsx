import "./GeocodePage.scss";
import { useState } from "react";
import { Card, Input, Button, Alert, Tabs, Typography } from "antd";
import { SearchOutlined, GlobalOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../components/Loader/Loader";
import { useTranslation } from "react-i18next";
import { ResultsList } from "./components/ResultsList/ResultsList";
import {
  useLazySearchCityQuery,
  useReverseGeocodeQuery,
} from "../../store/api/geocodingApi";
import { skipToken } from "@reduxjs/toolkit/query/react";
import type { GeocodeResult } from "../../types/geocode";

const { Title, Paragraph } = Typography;

type SearchType = "city" | "coords";

export const GeocodePage = () => {
  const { t } = useTranslation();
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<SearchType>("city");
  const [cityQuery, setCityQuery] = useState("");
  const [latQuery, setLatQuery] = useState("");
  const [lonQuery, setLonQuery] = useState("");
  const navigate = useNavigate();
  const [triggerSearch, { isLoading: isCityLoading }] =
    useLazySearchCityQuery();
  const {
    data: reverseData,
    isLoading: isCoordsLoading,
    isError: isReverseError,
    error: reverseError,
  } = useReverseGeocodeQuery(
    latQuery && lonQuery
      ? { lat: parseFloat(latQuery), lon: parseFloat(lonQuery) }
      : skipToken,
  );
  const loading = isCityLoading || isCoordsLoading;
  const handleSearch = async () => {
    setError(null);
    setResults([]);

    if (searchType === "city") {
      if (!cityQuery.trim()) return;

      try {
        const data = await triggerSearch(cityQuery).unwrap();
        if (data && data.length > 0) {
          setResults(data);
        } else {
          setError(t("location_not_found"));
        }
      } catch {
        setError(t("something_wrong"));
      }
    } else {
      if (!latQuery.trim() || !lonQuery.trim()) return;

      if (reverseData) {
        setResults([reverseData]);
      } else if (isReverseError) {
        const errMsg =
          reverseError && "data" in reverseError
            ? (reverseError.data as { error?: string })?.error ||
              t("location_not_found")
            : t("location_not_found");
        setError(errMsg);
      }
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
