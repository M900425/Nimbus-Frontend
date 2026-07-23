import { Tag } from "antd";
import { WaterTempHelp } from "../../../../components/WaterTempHelp/WaterTempHelp";
import type { Water } from "../../../../types/weather";

interface IProps {
  water: Water;
  getWaterLabel: (temp: number | null, source: string) => string;
  t: (key: string) => string;
}

export const WaterTemps = ({ water, getWaterLabel, t }: IProps) => {
  return (
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
  );
};
