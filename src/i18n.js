import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import your translations
import translationsEN from "./locales/en.json";
import translationsAR from "./locales/ar.json";

// Get default language from environment variables (support both Vite and Next.js)
const getDefaultLang = () => {
  if (typeof process !== "undefined" && process.env) {
    return process.env.NEXT_PUBLIC_DEFAULT_LANG;
  }
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_DEFAULT_LANG;
  }
  return "ar";
};

const defaultLang = getDefaultLang() || "ar";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: translationsEN,
      },
      ar: {
        translation: translationsAR,
      },
    },
    lng: defaultLang, // default language
    fallbackLng: defaultLang, // fallback language
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
