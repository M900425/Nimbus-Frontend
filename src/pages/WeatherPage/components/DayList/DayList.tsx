import { forwardRef } from "react";

interface DayItem {
  time: string;
  conditions: string;
  computedMax: number;
  computedMin: number;
}

interface IProps {
  days: DayItem[];
  selectedDayIndex: number;
  effectiveDates: string[];
  getDayLabel: (date: string) => string;
  getWeatherIcon: (condition: string) => string;
  onDaySelect: (index: number) => void;
}

export const DayList = forwardRef<HTMLDivElement, IProps>(
  (
    {
      days,
      selectedDayIndex,
      effectiveDates,
      getDayLabel,
      getWeatherIcon,
      onDaySelect,
    },
    ref,
  ) => {
    return (
      <div className="day-list" ref={ref}>
        {days.map((day, idx) => {
          const dateStr = effectiveDates[idx] || "";
          return (
            <div
              key={idx}
              className={`day-item ${idx === selectedDayIndex ? "active" : ""}`}
              onClick={() => onDaySelect(idx)}
            >
              <div className="day-name">{getDayLabel(dateStr)}</div>
              <div className="day-date">
                {dateStr ? new Date(dateStr).getDate() : "—"}
              </div>
              <div className="day-icon">{getWeatherIcon(day.conditions)}</div>
              <div className="day-temps">
                <span className="day-high">{day.computedMax}°</span>
                <span className="day-low">{day.computedMin}°</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

DayList.displayName = "DayList";
