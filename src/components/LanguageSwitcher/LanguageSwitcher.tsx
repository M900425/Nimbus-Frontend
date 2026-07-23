import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import Flag from "react-flagkit";
import "./LanguageSwitcher.scss";

const languages = [
  { code: "en", label: "English", flag: "GB" },
  { code: "uk", label: "Українська", flag: "UA" },
  { code: "pl", label: "Polski", flag: "PL" },
  { code: "de", label: "Deutsch", flag: "DE" },
  { code: "fr", label: "Français", flag: "FR" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "it", label: "Italiano", flag: "IT" },
  { code: "pt", label: "Português", flag: "PT" },
  { code: "nl", label: "Nederlands", flag: "NL" },
  { code: "sv", label: "Svenska", flag: "SE" },
  { code: "no", label: "Norsk", flag: "NO" },
  { code: "da", label: "Dansk", flag: "DK" },
  { code: "fi", label: "Suomi", flag: "FI" },
  { code: "et", label: "Eesti", flag: "EE" },
  { code: "lv", label: "Latviešu", flag: "LV" },
  { code: "lt", label: "Lietuvių", flag: "LT" },
  { code: "cs", label: "Čeština", flag: "CZ" },
  { code: "sk", label: "Slovenčina", flag: "SK" },
  { code: "hu", label: "Magyar", flag: "HU" },
  { code: "ro", label: "Română", flag: "RO" },
  { code: "bg", label: "Български", flag: "BG" },
  { code: "el", label: "Ελληνικά", flag: "GR" },
  { code: "tr", label: "Türkçe", flag: "TR" },
  { code: "hr", label: "Hrvatski", flag: "HR" },
  { code: "sl", label: "Slovenščina", flag: "SI" },
  { code: "sr", label: "Српски", flag: "RS" },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];
  const handleChangeLanguage = (code: string) => {
    localStorage.setItem("app-locale", code);
    i18n.changeLanguage(code);
  };
  const items: MenuProps["items"] = languages.map((lang) => ({
    key: lang.code,
    label: (
      <span className="language-item">
        <Flag country={lang.flag} size={20} />
        {lang.label}
      </span>
    ),
    onClick: () => handleChangeLanguage(lang.code),
  }));

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
      <div className="language-trigger">
        <Flag country={currentLang.flag} size={28} />
      </div>
    </Dropdown>
  );
};
