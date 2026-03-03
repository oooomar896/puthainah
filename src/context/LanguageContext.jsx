'use client';

import { useState, createContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("lang") || "ar";
    }
    return "ar";
  });
  const { i18n } = useTranslation();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const langLocal = localStorage.getItem("lang");
      if (langLocal) {
        setLang(langLocal);
      } else {
        localStorage.setItem("lang", lang);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("lang", lang);
    }
  }, [lang]);

  const changeLanguage = (newLang) => {
    i18n.changeLanguage(newLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

