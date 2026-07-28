import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GlobalOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "./MobileDock.scss";

interface LastViewedCity {
  displayName: string;
  cityName: string;
  lat: number | null;
  lon: number | null;
}

function getLastViewedCity(): LastViewedCity | null {
  const stored = localStorage.getItem("lastViewedCity");
  return stored ? JSON.parse(stored) : null;
}

const MobileDock = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const lastCity = getLastViewedCity();

  useEffect(() => {
    const checkMobile = () => setVisible(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const goToLastCity = () => {
    if (!lastCity) return;
    if (lastCity.lat !== null && lastCity.lon !== null) {
      navigate(
        `/weather?lat=${lastCity.lat}&lon=${lastCity.lon}&city=${encodeURIComponent(lastCity.cityName)}`,
      );
    } else {
      navigate(`/weather/${encodeURIComponent(lastCity.cityName)}`);
    }
  };

  if (!visible) return null;

  const isWeatherActive = location.pathname.startsWith("/weather");
  const isGeocodeActive = location.pathname.startsWith("/geocode");

  return (
    <div className="mobile-dock">
      <div className="dock-group">
        <button
          className={`dock-btn ${isGeocodeActive ? "active" : ""}`}
          onClick={() => navigate("/geocode")}
          title={t("geocoding_tool")}
        >
          <GlobalOutlined />
          <span className="dock-label">{t("geocoding")}</span>
        </button>
      </div>
      {lastCity && (
        <div className="dock-group">
          <button
            className={`dock-btn ${isWeatherActive ? "active" : ""}`}
            onClick={goToLastCity}
            title={t("back_to_last_city")}
          >
            <ThunderboltOutlined />
            <span className="dock-label">{t("back_to_weather")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileDock;
