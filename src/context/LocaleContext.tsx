import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

interface IProps {
  children: ReactNode;
}

export const LocaleProvider = ({ children }: IProps) => {
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem("app-locale");
    if (saved) return saved;
    return navigator.language || "en-US";
  });
  const handleSetLocale = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem("app-locale", newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
};
