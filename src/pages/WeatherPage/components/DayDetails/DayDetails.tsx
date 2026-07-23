import { Button, Typography } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { Day } from "../../../../types/weather";

const { Text } = Typography;

interface IProps {
  selectedDay: Day | null;
  effectiveDate: string;
  getDayLabel: (date: string) => string;
  formatDate: (date: string) => string;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  isFirstDay: boolean;
  isLastDay: boolean;
  tempMaxDisplay: number;
  tempMinDisplay: number;
  feelslike: number;
  t: (key: string) => string;
  getWeatherIcon: (condition: string) => string;
  getTranslatedCondition: (
    condition: string | undefined,
    t: (key: string) => string,
  ) => string;
  children?: React.ReactNode;
}

export const DayDetails = ({
  selectedDay,
  effectiveDate,
  getDayLabel,
  formatDate,
  goToPreviousDay,
  goToNextDay,
  isFirstDay,
  isLastDay,
  tempMaxDisplay,
  tempMinDisplay,
  feelslike,
  t,
  getWeatherIcon,
  getTranslatedCondition,
  children,
}: IProps) => {
  return (
    <>
      <div className="day-navigation">
        <Button
          icon={<LeftOutlined />}
          onClick={goToPreviousDay}
          disabled={isFirstDay}
          shape="circle"
        />
        <div className="day-label">
          <CalendarOutlined style={{ marginRight: 8 }} />
          <Text strong>{getDayLabel(effectiveDate)}</Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            {formatDate(effectiveDate)}
          </Text>
        </div>
        <Button
          icon={<RightOutlined />}
          onClick={goToNextDay}
          disabled={isLastDay}
          shape="circle"
        />
      </div>
      <div className="day-details">
        <div className="day-stats">
          <div className="stat-item">
            <Text type="secondary">{t("temperature")}</Text>
            <Text strong>{Math.round(selectedDay?.temp || 0)}°C</Text>
          </div>
          <div className="stat-item">
            <Text type="secondary">{t("feels_like")}</Text>
            <Text strong>{Math.round(feelslike)}°C</Text>
          </div>
          <div className="stat-item">
            <Text type="secondary">{t("max_temp")}</Text>
            <Text strong className="temp-high">
              {tempMaxDisplay}°C
            </Text>
          </div>
          <div className="stat-item">
            <Text type="secondary">{t("min_temp")}</Text>
            <Text strong className="temp-low">
              {tempMinDisplay}°C
            </Text>
          </div>
          <div className="stat-item">
            <Text type="secondary">{t("humidity")}</Text>
            <Text strong>{selectedDay?.humidity}%</Text>
          </div>
          <div className="stat-item">
            <Text type="secondary">{t("wind")}</Text>
            <Text strong>{Math.round(selectedDay?.windspeed || 0)} km/h</Text>
          </div>
          <div className="stat-item">
            <Text type="secondary">{t("precipitation")}</Text>
            <Text strong>{selectedDay?.precip || 0} mm</Text>
          </div>
          <div className="stat-item">
            <Text type="secondary">{t("uv_index")}</Text>
            <Text strong>{selectedDay?.uvindex || 0}</Text>
          </div>
        </div>
        <div className="day-condition">
          <span className="condition-icon">
            {getWeatherIcon(selectedDay?.conditions || "")}
          </span>
          <span className="condition-text">
            {getTranslatedCondition(selectedDay?.conditions, t)}
          </span>
        </div>
      </div>
      {children}
    </>
  );
};
