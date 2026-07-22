import "./HomePage.scss";
import { Typography, Card, Space } from "antd";
import {
  CloudOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

export const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <div className="hero-section">
        <Title level={2} className="hero-title">
          {t("welcome")}
        </Title>
        <Paragraph className="hero-subtitle">{t("enter_city_desc")}</Paragraph>
      </div>

      <Space direction="vertical" size="large" className="cards-container">
        <Card className="feature-card" bordered={false}>
          <div className="card-header">
            <CloudOutlined className="card-icon" />
            <Title level={4}>{t("water_temperature")}</Title>
          </div>
          <Paragraph>
            <strong>{t("sea")}</strong> — {t("sea_tooltip")}
            <br />
            <strong>
              {t("lake")} &amp; {t("river")}
            </strong>{" "}
            — {t("lake_tooltip")}
          </Paragraph>
        </Card>

        <Card className="feature-card" bordered={false}>
          <div className="card-header">
            <DatabaseOutlined className="card-icon" />
            <Title level={4}>{t("data_sources")}</Title>
          </div>
          <Paragraph>{t("aggregates_info")}</Paragraph>
        </Card>

        <Card className="feature-card" bordered={false}>
          <div className="card-header">
            <GlobalOutlined className="card-icon" />
            <Title level={4}>{t("search_by_coords")}</Title>
          </div>
          <Paragraph>
            {t("prefer_exact_prefix")} <code>48.46, 30.73</code>{" "}
            {t("prefer_exact_suffix")}
          </Paragraph>
        </Card>

        <Card className="feature-card" bordered={false}>
          <div className="card-header">
            <EnvironmentOutlined className="card-icon" />
            <Title level={4}>{t("geocoding_tool")}</Title>
          </div>
          <Paragraph>
            {t("need_coords_prefix")}{" "}
            <Link to="/geocode">{t("geocoding_tool")}</Link>{" "}
            {t("need_coords_suffix")}
          </Paragraph>
        </Card>

        <Card className="feature-card" bordered={false}>
          <div className="card-header">
            <ThunderboltOutlined className="card-icon" />
            <Title level={4}>{t("extra_features")}</Title>
          </div>
          <Paragraph>
            {t("handles_both")}
            <br />
            {t("water_calculated")}
          </Paragraph>
        </Card>
      </Space>
    </div>
  );
};
