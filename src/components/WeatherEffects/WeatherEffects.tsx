import React, { useMemo } from "react";
import "./WeatherEffects.scss";

interface WeatherEffectsProps {
  theme: string;
}

function seededRandom(seed: string, index: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char + index;
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ theme }) => {
  const rainDrops = useMemo(() => {
    if (theme !== "rain") return [];
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${seededRandom(theme + "left", i) * 100}%`,
      animationDelay: `${seededRandom(theme + "delay", i) * 2}s`,
      animationDuration: `${0.6 + seededRandom(theme + "dur", i) * 0.6}s`,
    }));
  }, [theme]);
  const snowFlakes = useMemo(() => {
    if (theme !== "snow") return [];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${seededRandom(theme + "left", i) * 100}%`,
      animationDelay: `${seededRandom(theme + "delay", i) * 5}s`,
      animationDuration: `${4 + seededRandom(theme + "dur", i) * 6}s`,
    }));
  }, [theme]);
  const thunderFlashes = useMemo(() => {
    if (theme !== "thunderstorm") return [];
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      animationDelay: `${i * 3 + seededRandom(theme + "flash", i) * 2}s`,
    }));
  }, [theme]);

  switch (theme) {
    case "rain":
      return (
        <div className="weather-effects rain">
          {rainDrops.map((drop) => (
            <div
              key={drop.id}
              className="drop"
              style={{
                left: drop.left,
                animationDelay: drop.animationDelay,
                animationDuration: drop.animationDuration,
              }}
            />
          ))}
        </div>
      );
    case "snow":
      return (
        <div className="weather-effects snow">
          {snowFlakes.map((flake) => (
            <div
              key={flake.id}
              className="flake"
              style={{
                left: flake.left,
                animationDelay: flake.animationDelay,
                animationDuration: flake.animationDuration,
              }}
            />
          ))}
        </div>
      );
    case "thunderstorm":
      return (
        <div className="weather-effects thunderstorm">
          {thunderFlashes.map((flash) => (
            <div
              key={flash.id}
              className="flash"
              style={{ animationDelay: flash.animationDelay }}
            />
          ))}
        </div>
      );
    case "fog":
      return <div className="weather-effects fog" />;
    default:
      return null;
  }
};

export default WeatherEffects;
