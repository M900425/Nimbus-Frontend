import "./Header.scss";
import { Layout, Input } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toTitleCase, parseCoordinates } from "../../utils/string";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const { Header: AntHeader } = Layout;
const { Search } = Input;

export const Header = () => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const coords = parseCoordinates(trimmed);
    if (coords) {
      navigate(`/weather?lat=${coords.lat}&lon=${coords.lon}`);
    } else {
      const formatted = toTitleCase(trimmed);
      navigate(`/weather/${encodeURIComponent(formatted)}`);
    }
    setSearchValue("");
  };

  return (
    <AntHeader className="app-header">
      <div className="header-left">
        <Link to="/" className="logo">
          Nimbus
        </Link>
        <Link
          to="/geocode"
          className="geocode-link"
          title={t("geocoding_tool")}
        >
          <GlobalOutlined />
        </Link>
      </div>
      <div className="search-wrapper">
        <Search
          className="search-input"
          placeholder={t("search_placeholder")}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          enterButton
        />
      </div>
      <LanguageSwitcher />
    </AntHeader>
  );
};
