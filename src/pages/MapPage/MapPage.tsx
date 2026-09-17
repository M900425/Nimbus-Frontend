import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPage.scss";
import { Modal, Button, Typography, message } from "antd";
import {
  CompassOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  AimOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLazyGetWeatherByCoordsQuery } from "../../store/api/weatherApi";
import { getWeatherIcon, getDayMinMax } from "../../utils/weatherHelpers";
import { getTranslatedCondition } from "../../utils/weatherConditions";
import type { WeatherResponse } from "../../types/weather";

const { Title, Text } = Typography;

export const MapPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ dark: L.TileLayer; classic: L.TileLayer } | null>(null);
  const layersControlRef = useRef<L.Control.Layers | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const lastRequestIdRef = useRef<number>(0);
  const [clickedCoords, setClickedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [modalWeather, setModalWeather] = useState<WeatherResponse | null>(null);
  const [localizedCityName, setLocalizedCityName] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingPoint, setIsLoadingPoint] = useState(false);
  const [geolocationGranted, setGeolocationGranted] = useState<boolean>(true);
  const [triggerGetWeather] = useLazyGetWeatherByCoordsQuery();
  const createPinIcon = (isLoading = false) => {
    return L.divIcon({
      className: "custom-map-marker-container",
      html: `
        <div class="custom-pin-wrapper ${isLoading ? "loading" : ""}">
          <div class="custom-pin-pulse"></div>
          <div class="custom-pin">${isLoading ? "⏳" : "📍"}</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 34],
      popupAnchor: [0, -32],
    });
  };

  const fetchWeatherForPoint = async (
    lat: number,
    lon: number,
    map?: L.Map | null,
  ) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
      markerRef.current.setIcon(createPinIcon(true));
    } else if (map) {
      markerRef.current = L.marker([lat, lon], {
        icon: createPinIcon(true),
      }).addTo(map);
    }

    setClickedCoords({ lat, lon });
    setIsLoadingPoint(true);
    const currentRequestId = ++lastRequestIdRef.current;

    try {
      const [weatherRes, locName] = await Promise.all([
        triggerGetWeather({ lat, lon }, false).unwrap(),
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${i18n.language}`,
        )
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (!d) return null;
            const addr = d.address;
            return (
              addr?.city ||
              addr?.town ||
              addr?.village ||
              addr?.municipality ||
              d.display_name?.split(",")?.[0]?.trim() ||
              null
            );
          })
          .catch(() => null),
      ]);

      if (lastRequestIdRef.current === currentRequestId) {
        setModalWeather(weatherRes);
        setLocalizedCityName(locName);
        setIsModalOpen(true);
      }
    } catch {
      if (lastRequestIdRef.current === currentRequestId) {
        message.error(t("server_error"));
      }
    } finally {
      if (lastRequestIdRef.current === currentRequestId) {
        setIsLoadingPoint(false);
        if (markerRef.current) {
          markerRef.current.setIcon(createPinIcon(false));
        }
      }
    }
  };

  const fetchWeatherForPointRef = useRef(fetchWeatherForPoint);
  useEffect(() => {
    fetchWeatherForPointRef.current = fetchWeatherForPoint;
  });

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setGeolocationGranted(result.state !== 'denied');
        result.addEventListener('change', () => {
          setGeolocationGranted(result.state !== 'denied');
        });
      });
    }
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const defaultCenter: [number, number] = [49.0, 31.0];
    const defaultZoom = 5;
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
      attributionControl: false,
    });
    const osmDark = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        className: 'map-theme-dark',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
    );
    const osmClassic = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
    );
    layersRef.current = { dark: osmDark, classic: osmClassic };
    osmDark.addTo(map);

    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 7, {
            duration: 1.5,
          });
        },
        () => {},
        { timeout: 5000 },
      );
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lon = parseFloat(e.latlng.lng.toFixed(4));
      fetchWeatherForPointRef.current(lat, lon, map);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layersControlRef.current = null;
      layersRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current) return;

    if (layersControlRef.current) {
      mapInstanceRef.current.removeControl(layersControlRef.current);
    }

    const baseMaps = {
      [t("map_theme_dark")]: layersRef.current.dark,
      [t("map_theme_classic")]: layersRef.current.classic,
    };

    layersControlRef.current = L.control
      .layers(baseMaps, undefined, { position: "bottomleft" })
      .addTo(mapInstanceRef.current);
  }, [t, i18n.language]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const lat = parseFloat(latitude.toFixed(4));
        const lon = parseFloat(longitude.toFixed(4));

        mapInstanceRef.current?.flyTo([lat, lon], 10, { duration: 1.5 });
        fetchWeatherForPoint(lat, lon, mapInstanceRef.current);
      },
      () => {},
      { timeout: 8000 },
    );
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalWeather(null);
    setLocalizedCityName(null);
  };
  const handleGoToFullForecast = () => {
    if (!clickedCoords) return;
    handleCloseModal();
    navigate(`/weather?lat=${clickedCoords.lat}&lon=${clickedCoords.lon}`);
  };
  const currentConditionText =
    modalWeather?.current?.conditions ||
    modalWeather?.current?.condition?.text ||
    "";
  const weatherIcon = getWeatherIcon(currentConditionText);
  const translatedCondition = getTranslatedCondition(
    currentConditionText,
    (key) => t(key),
  );
  const todayHours = modalWeather?.days?.[0]?.hours || [];
  const todayMinMax = getDayMinMax(todayHours);
  let maxTemp =
    todayMinMax.max !== null
      ? Math.round(todayMinMax.max)
      : modalWeather?.daily?.temperature_2m_max?.[0] !== undefined
        ? Math.round(modalWeather.daily.temperature_2m_max[0])
        : modalWeather?.days?.[0]?.tempMax !== undefined
          ? Math.round(modalWeather.days[0].tempMax)
          : null;
  let minTemp =
    todayMinMax.min !== null
      ? Math.round(todayMinMax.min)
      : modalWeather?.daily?.temperature_2m_min?.[0] !== undefined
        ? Math.round(modalWeather.daily.temperature_2m_min[0])
        : modalWeather?.days?.[0]?.tempMin !== undefined
          ? Math.round(modalWeather.days[0].tempMin)
          : null;
  const currentT = modalWeather?.current?.temperature !== undefined ? Math.round(modalWeather.current.temperature) : null;
  if (currentT !== null) {
    if (maxTemp !== null && currentT > maxTemp) maxTemp = currentT;
    if (minTemp !== null && currentT < minTemp) minTemp = currentT;
  }
  const displayTitle =
    localizedCityName ||
    modalWeather?.city ||
    (clickedCoords
      ? `${clickedCoords.lat}, ${clickedCoords.lon}`
      : t("location"));

  return (
    <div className="map-page">
      <div className="map-header-overlay">
        <div className="map-hint-pill">
          {isLoadingPoint ? (
            <LoadingOutlined className="hint-icon spin" />
          ) : (
            <CompassOutlined className="hint-icon" />
          )}
          <span>
            {isLoadingPoint
              ? t("loading_weather")
              : t("click_map_hint")}
          </span>
        </div>
        <Button
          className="locate-btn"
          type="primary"
          icon={<AimOutlined />}
          loading={isLoadingPoint}
          onClick={handleLocateMe}
          disabled={!geolocationGranted}
          title={!geolocationGranted ? t("geolocation_denied") : ""}
        >
          {t("my_location")}
        </Button>
      </div>
      <div className="map-container" ref={mapContainerRef} />
      <Modal
        open={isModalOpen && !!modalWeather}
        onCancel={handleCloseModal}
        footer={null}
        centered
        className="weather-map-modal"
        destroyOnClose={true}
      >
        {modalWeather && (
          <div className="modal-inner">
            <div className="modal-header-info">
              <EnvironmentOutlined className="location-icon" />
              <div className="titles">
                <Title level={4} className="location-title">
                  {displayTitle}
                </Title>
                {clickedCoords && (
                  <Text className="coords-sub">
                    {clickedCoords.lat}, {clickedCoords.lon}
                  </Text>
                )}
              </div>
            </div>
            <div className="weather-preview-content">
              <div className="temp-hero">
                <span className="big-icon">{weatherIcon}</span>
                <div className="temp-info">
                  <div className="temp-row">
                    <span className="temperature">
                      {Math.round(modalWeather.current.temperature)}°
                    </span>
                    {(maxTemp !== null || minTemp !== null) && (
                      <div className="temp-minmax">
                        {maxTemp !== null && (
                          <span
                            className="temp-high"
                            title={t("max_temp")}
                          >
                            ↑ {maxTemp}°
                          </span>
                        )}
                        {minTemp !== null && (
                          <span
                            className="temp-low"
                            title={t("min_temp")}
                          >
                            ↓ {minTemp}°
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="condition-label">
                    {translatedCondition || currentConditionText}
                  </span>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-name">
                    {t("feels_like")}
                  </span>
                  <span className="stat-val">
                    {Math.round(modalWeather.current.feelslike)}°
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-name">{t("wind")}</span>
                  <span className="stat-val">
                    {Math.round(modalWeather.current.windspeed)} km/h
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-name">
                    {t("max_temp")}
                  </span>
                  <span className="stat-val temp-high">
                    {maxTemp !== null ? `${maxTemp}°` : "-"}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-name">
                    {t("min_temp")}
                  </span>
                  <span className="stat-val temp-low">
                    {minTemp !== null ? `${minTemp}°` : "-"}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-name">{t("humidity")}</span>
                  <span className="stat-val">
                    {modalWeather.current.humidity}%
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-name">{t("pressure")}</span>
                  <span className="stat-val">
                    {Math.round(modalWeather.current.pressure)} hPa
                  </span>
                </div>
              </div>
              <Button
                type="primary"
                size="large"
                block
                className="full-forecast-btn"
                onClick={handleGoToFullForecast}
                icon={<ArrowRightOutlined />}
              >
                {t("view_full_forecast")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
