import "./WeatherPage.scss";
import { useParams, useSearchParams } from "react-router-dom";
import {
  useGetWeatherByCityQuery,
  useGetWeatherByCoordsQuery,
} from "../../store/api/weatherApi";
import { Card, Alert, Typography, Button, Tag } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { toTitleCase } from "../../utils/string";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useState, useRef, useEffect } from "react";
import { Loader } from "../../components/Loader/Loader";
import { WaterTempHelp } from "../../components/WaterTempHelp/WaterTempHelp";
import { useTranslation } from "react-i18next";
import { getTranslatedCondition } from "../../utils/weatherConditions";

const { Title, Text } = Typography;

export const WeatherPage = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { city } = useParams<{ city: string }>();
  const [searchParams] = useSearchParams();
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  const searchCity = city || "";
  const isCoords = latParam !== null && lonParam !== null;
  const coords = isCoords
    ? { lat: parseFloat(latParam!), lon: parseFloat(lonParam!) }
    : null;

  const cityQuery = useGetWeatherByCityQuery(
    !coords && searchCity ? searchCity : skipToken,
  );
  const coordsQuery = useGetWeatherByCoordsQuery(coords ? coords : skipToken);

  const { data, isLoading, isError } = coords ? coordsQuery : cityQuery;

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const hourlyRef = useRef<HTMLDivElement>(null);
  const dayListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setSelectedDayIndex(0), 0);
  }, [data]);

  useEffect(() => {
    if (dayListRef.current) {
      const activeItem = dayListRef.current.children[
        selectedDayIndex
      ] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedDayIndex]);

  if (!searchCity && !coords) {
    return (
      <div className="weather-page">
        <Alert
          message={t("no_location")}
          description={t("enter_city_or_coords")}
          type="info"
          showIcon
        />
      </div>
    );
  }

  if (isLoading) {
    return <Loader tip={t("loading_weather")} />;
  }

  if (isError) {
    const errorMessage = coords
      ? t("location_not_found")
      : t("city_not_found", { city: toTitleCase(searchCity) });
    return (
      <div className="weather-page">
        <Alert
          message={errorMessage}
          description={t("check_spelling")}
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="weather-page">
        <Alert message={t("no_data")} type="info" showIcon />
      </div>
    );
  }

  const { current, water, daily } = data;
  const displayCity = data.city
    ? toTitleCase(data.city)
    : coords
      ? `${coords.lat}, ${coords.lon}`
      : searchCity;

  const dailyDates = daily?.time || [];
  const days = data.days || [];
  const selectedDay = days[selectedDayIndex] || null;
  const hourlyData = selectedDay?.hours || [];

  const getEffectiveDates = (): string[] => {
    if (dailyDates.length >= days.length) {
      return dailyDates.slice(0, days.length);
    }
    const result = [...dailyDates];
    const lastDate =
      dailyDates.length > 0
        ? new Date(dailyDates[dailyDates.length - 1])
        : new Date();
    for (let i = dailyDates.length; i < days.length; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + (i - dailyDates.length + 1));
      result.push(nextDate.toISOString().split("T")[0]);
    }
    return result;
  };

  const effectiveDates = getEffectiveDates();

  const goToPreviousDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
      if (hourlyRef.current) hourlyRef.current.scrollLeft = 0;
    }
  };

  const goToNextDay = () => {
    if (selectedDayIndex < days.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
      if (hourlyRef.current) hourlyRef.current.scrollLeft = 0;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) goToNextDay();
    else if (touchStartX - touchEndX < -50) goToPreviousDay();
  };

  const getHourLabel = (index: number) => {
    return `${String(index).padStart(2, "0")}:00`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDayLabel = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0 || diffDays === 1 || diffDays === -1) {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
      return rtf.format(diffDays, "day");
    }

    return date.toLocaleDateString(locale, { weekday: "short" });
  };

  const getWeatherIcon = (condition: string) => {
    if (!condition) return "☀️";
    const lower = condition.toLowerCase();
    if (lower.includes("rain")) return "🌧️";
    if (lower.includes("cloud")) return "☁️";
    if (lower.includes("overcast")) return "☁️";
    if (lower.includes("clear")) return "☀️";
    if (lower.includes("snow")) return "❄️";
    if (lower.includes("thunder")) return "⛈️";
    return "🌤️";
  };

  const getWaterLabel = (temp: number | null, source: string) => {
    if (temp !== null) return `${temp}°C`;
    if (source === "unavailable") return t("no_sea_nearby");
    return t("na");
  };

  const getDayMinMax = (hours: typeof hourlyData) => {
    if (!hours || hours.length === 0) return { max: null, min: null };
    const temps = hours
      .map((h) => h.temp)
      .filter((t) => t !== undefined && t !== null);
    if (temps.length === 0) return { max: null, min: null };
    return {
      max: Math.max(...temps),
      min: Math.min(...temps),
    };
  };

  const selectedMinMax = getDayMinMax(hourlyData);
  const maxTempFromHours = selectedMinMax.max;
  const minTempFromHours = selectedMinMax.min;

  const daysWithMinMax = days.map((day) => {
    const dayHours = day.hours || [];
    const minMax = getDayMinMax(dayHours);
    return {
      ...day,
      computedMax:
        minMax.max !== null ? Math.round(minMax.max) : Math.round(day.temp),
      computedMin:
        minMax.min !== null ? Math.round(minMax.min) : Math.round(day.temp),
    };
  });

  const tempMaxDisplay =
    maxTempFromHours !== null
      ? Math.round(maxTempFromHours)
      : Math.round(selectedDay?.temp || 0);
  const tempMinDisplay =
    minTempFromHours !== null
      ? Math.round(minTempFromHours)
      : Math.round(selectedDay?.temp || 0);

  return (
    <div className="weather-page">
      <div className="weather-header">
        <Title level={2} className="city-name">
          <EnvironmentOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          {displayCity}
        </Title>
        <div className="current-temp">
          <span className="temp-value">
            {Math.round(current.temperature)}°C
          </span>
          <span className="temp-condition">
            {getTranslatedCondition(
              current.condition?.text || current.conditions,
              t,
            )}
          </span>
        </div>
      </div>

      {water && (
        <div className="water-temps">
          <Tag color="blue">
            {t("sea")}: {getWaterLabel(water.sea.temperature, water.sea.source)}
            <WaterTempHelp type="sea" />
          </Tag>
          <Tag color="cyan">
            {t("lake")}:{" "}
            {water.lake.temperature !== null
              ? `${water.lake.temperature}°C`
              : t("na")}
            <WaterTempHelp type="lake" />
          </Tag>
          <Tag color="geekblue">
            {t("river")}:{" "}
            {water.river.temperature !== null
              ? `${water.river.temperature}°C`
              : t("na")}
            <WaterTempHelp type="river" />
          </Tag>
        </div>
      )}

      <Title level={4} className="section-title">
        {t("hourly_forecast")}
      </Title>

      <div className="hourly-scroll" ref={hourlyRef}>
        {hourlyData.map((hour, idx) => (
          <div key={idx} className="hour-item">
            <div className="hour-time">{getHourLabel(idx)}</div>
            <div className="hour-icon">{getWeatherIcon(hour.conditions)}</div>
            <div className="hour-temp">{Math.round(hour.temp)}°C</div>
          </div>
        ))}
      </div>

      {days.length > 0 && effectiveDates.length > 0 && (
        <>
          <Title level={4} className="section-title">
            {t("day_details")}
          </Title>

          <div className="day-navigation">
            <Button
              icon={<LeftOutlined />}
              onClick={goToPreviousDay}
              disabled={selectedDayIndex === 0}
              shape="circle"
            />
            <div className="day-label">
              <CalendarOutlined style={{ marginRight: 8 }} />
              <Text strong>
                {getDayLabel(effectiveDates[selectedDayIndex])}
              </Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {formatDate(effectiveDates[selectedDayIndex])}
              </Text>
            </div>
            <Button
              icon={<RightOutlined />}
              onClick={goToNextDay}
              disabled={selectedDayIndex === days.length - 1}
              shape="circle"
            />
          </div>

          <div
            className="day-details"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="day-stats">
              <div className="stat-item">
                <Text type="secondary">{t("temperature")}</Text>
                <Text strong>{Math.round(selectedDay?.temp)}°C</Text>
              </div>
              <div className="stat-item">
                <Text type="secondary">{t("feels_like")}</Text>
                <Text strong>{Math.round(current.feelslike)}°C</Text>
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
                <Text strong>{Math.round(selectedDay?.windspeed)} km/h</Text>
              </div>
              <div className="stat-item">
                <Text type="secondary">{t("precipitation")}</Text>
                <Text strong>{selectedDay?.precip} mm</Text>
              </div>
              <div className="stat-item">
                <Text type="secondary">{t("uv_index")}</Text>
                <Text strong>{selectedDay?.uvindex}</Text>
              </div>
            </div>
            <div className="day-condition">
              <span className="condition-icon">
                {getWeatherIcon(selectedDay?.conditions)}
              </span>
              <span className="condition-text">
                {getTranslatedCondition(selectedDay?.conditions, t)}
              </span>
            </div>
          </div>

          <Title level={4} className="section-title">
            {t("days")}
          </Title>

          <div className="day-list" ref={dayListRef}>
            {daysWithMinMax.map((day, idx) => {
              const dateStr = effectiveDates[idx] || "";
              return (
                <div
                  key={idx}
                  className={`day-item ${idx === selectedDayIndex ? "active" : ""}`}
                  onClick={() => {
                    setSelectedDayIndex(idx);
                    if (hourlyRef.current) hourlyRef.current.scrollLeft = 0;
                  }}
                >
                  <div className="day-name">{getDayLabel(dateStr)}</div>
                  <div className="day-date">
                    {dateStr ? new Date(dateStr).getDate() : "—"}
                  </div>
                  <div className="day-icon">
                    {getWeatherIcon(day.conditions)}
                  </div>
                  <div className="day-temps">
                    <span className="day-high">{day.computedMax}°</span>
                    <span className="day-low">{day.computedMin}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {days.length === 0 && (
        <Card title={t("current_weather")} className="weather-card">
          <div className="simple-stats">
            <div>
              {t("temperature")}: {current.temperature}°C
            </div>
            <div>
              {t("feels_like")}: {current.feelslike}°C
            </div>
            <div>
              {t("condition")}:{" "}
              {getTranslatedCondition(
                current.condition?.text || current.conditions,
                t,
              )}
            </div>
            <div>
              {t("humidity")}: {current.humidity}%
            </div>
            <div>
              {t("wind")}: {current.windspeed} km/h
            </div>
            <div>
              {t("cloud_cover")}: {current.cloudcover}%
            </div>
            <div>
              {t("uv_index")}: {current.uvindex}
            </div>
            <div>
              {t("pressure")}: {current.pressure} hPa
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
