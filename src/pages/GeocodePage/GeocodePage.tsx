import "./GeocodePage.scss";
import { useState } from "react";
import { Card, Input, Button, Table, Alert, Tabs, Typography } from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { GeocodeResult } from "../../types/geocode";
import { Loader } from "../../components/Loader/Loader";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

type SearchType = "city" | "coords";

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
        ? `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityQuery)}&format=json&limit=10&addressdetails=1`
        : `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(latQuery)}&lon=${encodeURIComponent(lonQuery)}&format=json`;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(url, {
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("something_wrong");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t("location"),
      dataIndex: "display_name",
      key: "display_name",
      render: (text: string) => (
        <span>
          <EnvironmentOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          {text}
        </span>
      ),
    },
    {
      title: t("coordinates"),
      key: "coords",
      render: (_: unknown, record: GeocodeResult) => (
        <span>
          {parseFloat(record.lat).toFixed(4)},{" "}
          {parseFloat(record.lon).toFixed(4)}
        </span>
      ),
    },
    {
      title: t("type"),
      dataIndex: "class",
      key: "class",
      render: (text: string) => text || "—",
    },
    {
      title: t("action"),
      key: "action",
      render: (_: unknown, record: GeocodeResult) => (
        <Button
          type="link"
          size="small"
          onClick={() =>
            navigate(`/weather?lat=${record.lat}&lon=${record.lon}`)
          }
        >
          {t("view_weather")}
        </Button>
      ),
    },
  ];

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
          <Table
            dataSource={results}
            columns={columns}
            rowKey="place_id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: true }}
          />
        </Card>
      )}
    </div>
  );
};
