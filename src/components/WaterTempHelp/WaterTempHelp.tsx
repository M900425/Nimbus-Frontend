import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "./WaterTempHelp.scss";

type WaterType = "sea" | "lake" | "river";

interface IProps {
  type: WaterType;
}

const tooltipKeyMap: Record<WaterType, string> = {
  sea: "sea_tooltip",
  lake: "lake_tooltip",
  river: "river_tooltip",
};

export const WaterTempHelp = ({ type }: IProps) => {
  const { t } = useTranslation();
  const key = tooltipKeyMap[type];
  return (
    <Tooltip title={t(key)} placement="top" overlayStyle={{ maxWidth: 250 }}>
      <QuestionCircleOutlined className="water-temp-help" />
    </Tooltip>
  );
};
