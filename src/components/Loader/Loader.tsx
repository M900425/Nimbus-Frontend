import { Spin } from "antd";
import { createPortal } from "react-dom";
import "./Loader.scss";

interface LoaderProps {
  tip?: string;
  size?: "small" | "default" | "large";
}

export const Loader = ({ tip = "Loading...", size = "large" }: LoaderProps) => {
  return createPortal(
    <div className="loader-overlay">
      <Spin size={size} tip={tip} />
    </div>,
    document.body,
  );
};
