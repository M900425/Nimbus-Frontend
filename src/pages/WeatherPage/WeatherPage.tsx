import "./WeatherPage.scss";
import { useParams, useSearchParams } from "react-router-dom";
import {
  useGetWeatherByCityQuery,
  useGetWeatherByCoordsQuery,
} from "../../store/api/weatherApi";
import { Card, Alert, Typography } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { toTitleCase } from "../../utils/string";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useState, useRef, useEffect } from "react";
import { Loader } from "../../components/Loader/Loader";
import { useTranslation } from "react-i18next";
import { getTranslatedCondition } from "../../utils/weatherConditions";
import {
  getWeatherIcon,
  createWaterLabel,
  getDayMinMax,
  getEffectiveDates,
  getHourLabel,
  formatDate,
  getDayLabel,
  getWindDirection,
} from "../../utils/weatherHelpers";
import { WaterTemps } from "./components/WaterTemps/WaterTemps";
import { HourlyForecast } from "./components/HourlyForecast/HourlyForecast";
import { DayDetails } from "./components/DayDetails/DayDetails";
import { ExtendedDetails } from "./components/ExtendedDetails/ExtendedDetails";
import { DayList } from "./components/DayList/DayList";

const { Title } = Typography;

export const WeatherPage = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { city } = useParams<{ city: string }>();
  const [searchParams] = useSearchParams();
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const cityFromQuery = searchParams.get("city");
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
  const displayCity = cityFromQuery
    ? toTitleCase(decodeURIComponent(cityFromQuery))
    : data.city
      ? toTitleCase(data.city)
      : coords
        ? `${coords.lat}, ${coords.lon}`
        : searchCity;

  const dailyDates = daily?.time || [];
  const days = data.days || [];
  const selectedDay = days[selectedDayIndex] || null;
  const hourlyData = selectedDay?.hours || [];
  const effectiveDates = getEffectiveDates(dailyDates, days.length);
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
  const selectedMinMax = getDayMinMax(hourlyData);
  const maxTempFromHours = selectedMinMax.max;
  const minTempFromHours = selectedMinMax.min;
  const tempMaxDisplay =
    maxTempFromHours !== null
      ? Math.round(maxTempFromHours)
      : Math.round(selectedDay?.temp || 0);
  const tempMinDisplay =
    minTempFromHours !== null
      ? Math.round(minTempFromHours)
      : Math.round(selectedDay?.temp || 0);
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
  const isToday = selectedDayIndex === 0;
  const currentHour = new Date().getHours();
  const activeHourIndex =
    isToday && hourlyData.length === 24 ? currentHour : undefined;
  const getWaterLabel = createWaterLabel(t);

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
      <WaterTemps water={water} getWaterLabel={getWaterLabel} t={t} />
      <Title level={4} className="section-title">
        {t("hourly_forecast")}
      </Title>
      <HourlyForecast
        ref={hourlyRef}
        hours={hourlyData}
        getHourLabel={getHourLabel}
        getWeatherIcon={getWeatherIcon}
        t={t}
        activeHourIndex={activeHourIndex}
      />
      {days.length > 0 && effectiveDates.length > 0 && (
        <>
          <Title level={4} className="section-title">
            {t("day_details")}
          </Title>
          <DayDetails
            selectedDay={selectedDay}
            effectiveDate={effectiveDates[selectedDayIndex]}
            getDayLabel={(date) => getDayLabel(date, locale)}
            formatDate={(date) => formatDate(date, locale)}
            goToPreviousDay={goToPreviousDay}
            goToNextDay={goToNextDay}
            isFirstDay={selectedDayIndex === 0}
            isLastDay={selectedDayIndex === days.length - 1}
            tempMaxDisplay={tempMaxDisplay}
            tempMinDisplay={tempMinDisplay}
            feelslike={current.feelslike}
            t={t}
            getWeatherIcon={getWeatherIcon}
            getTranslatedCondition={getTranslatedCondition}
          >
            {isToday && (
              <ExtendedDetails
                current={current}
                getWindDirection={getWindDirection}
                t={t}
              />
            )}
          </DayDetails>
          <Title level={4} className="section-title">
            {t("days")}
          </Title>
          <DayList
            ref={dayListRef}
            days={daysWithMinMax}
            selectedDayIndex={selectedDayIndex}
            effectiveDates={effectiveDates}
            getDayLabel={(date) => getDayLabel(date, locale)}
            getWeatherIcon={getWeatherIcon}
            onDaySelect={(idx) => {
              setSelectedDayIndex(idx);
              if (hourlyRef.current) hourlyRef.current.scrollLeft = 0;
            }}
          />
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
