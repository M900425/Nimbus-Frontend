import { forwardRef, useEffect, useRef } from "react";
import type { DayHour } from "../../../../types/weather";

interface IProps {
  hours: DayHour[];
  getHourLabel: (index: number) => string;
  getWeatherIcon: (condition: string) => string;
  t: (key: string) => string;
  activeHourIndex?: number;
}

export const HourlyForecast = forwardRef<HTMLDivElement, IProps>(
  ({ hours, getHourLabel, getWeatherIcon, t, activeHourIndex }, ref) => {
    const activeItemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (activeHourIndex !== undefined && activeItemRef.current) {
        activeItemRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }, [activeHourIndex]);

    if (!hours || hours.length === 0) {
      return <div className="hourly-forecast-empty">{t("no_hourly_data")}</div>;
    }

    return (
      <div className="hourly-scroll" ref={ref}>
        {hours.map((hour, idx) => {
          const isActive = activeHourIndex === idx;
          return (
            <div
              key={idx}
              ref={isActive ? activeItemRef : null}
              className={`hour-item ${isActive ? "active" : ""}`}
            >
              <div className="hour-time">{getHourLabel(idx)}</div>
              <div className="hour-icon">{getWeatherIcon(hour.conditions)}</div>
              <div className="hour-temp">{Math.round(hour.temp)}°C</div>
            </div>
          );
        })}
      </div>
    );
  },
);

HourlyForecast.displayName = "HourlyForecast";
