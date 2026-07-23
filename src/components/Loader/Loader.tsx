import { Spin } from "antd";
import { createPortal } from "react-dom";
import "./Loader.scss";

interface IProps {
  tip?: string;
  size?: "small" | "default" | "large";
}

export const Loader = ({ tip = "Loading...", size = "large" }: IProps) => {
  return createPortal(
    <div className="loader-overlay">
      <Spin size={size} tip={tip} />
    </div>,
    document.body,
  );
};
