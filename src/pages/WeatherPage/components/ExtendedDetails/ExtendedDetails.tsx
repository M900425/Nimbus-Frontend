import { Button, Typography } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Text } = Typography;

interface IProps {
  current: {
    pressure: number;
    visibility: number;
    windgust: number;
    winddirection: number;
    cloudcover: number;
    precipitation: number;
  };
  getWindDirection: (deg: number) => string;
  t: (key: string) => string;
}

export const ExtendedDetails = ({
  current,
  getWindDirection,
  t,
}: IProps) => {
  const [showExtended, setShowExtended] = useState(false);

  return (
    <div className="extended-section">
      <Button
        className="extended-toggle"
        onClick={() => setShowExtended(!showExtended)}
        icon={showExtended ? <UpOutlined /> : <DownOutlined />}
      >
        {showExtended ? t("show_less") : t("show_more")}
      </Button>
      <div className={`extended-content ${showExtended ? "open" : ""}`}>
        <div className="extended-details">
          <div className="extended-grid">
            <div className="extended-item">
              <Text type="secondary">{t("pressure")}</Text>
              <Text strong>{current.pressure} hPa</Text>
            </div>
            <div className="extended-item">
              <Text type="secondary">{t("visibility")}</Text>
              <Text strong>{current.visibility} km</Text>
            </div>
            <div className="extended-item">
              <Text type="secondary">{t("wind_gust")}</Text>
              <Text strong>{Math.round(current.windgust)} km/h</Text>
            </div>
            <div className="extended-item">
              <Text type="secondary">{t("wind_direction")}</Text>
              <Text strong>
                {current.winddirection !== undefined
                  ? `${getWindDirection(current.winddirection)} (${current.winddirection}°)`
                  : "—"}
              </Text>
            </div>
            <div className="extended-item">
              <Text type="secondary">{t("cloud_cover")}</Text>
              <Text strong>{current.cloudcover}%</Text>
            </div>
            <div className="extended-item">
              <Text type="secondary">{t("precipitation_now")}</Text>
              <Text strong>{current.precipitation} mm</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
