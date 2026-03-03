import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import your translations
import translationsEN from "@/locales/en.json";
import translationsAR from "@/locales/ar.json";

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

// Initialize i18n with error handling
try {
  i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      resources: {
        en: {
          translation: translationsEN || {},
        },
        ar: {
          translation: translationsAR || {},
        },
      },
      lng: defaultLang, // default language
      fallbackLng: defaultLang, // fallback language
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
      // Prevent errors if translations are missing
      react: {
        useSuspense: false,
      },
      // Fallback to key if translation is missing
      returnEmptyString: false,
      returnNull: false,
    });
} catch (error) {
  console.error("Failed to initialize i18n:", error);
  // Initialize with minimal config to prevent app crash
  i18n.init({
    resources: {
      en: { translation: {} },
      ar: { translation: {} },
    },
    lng: defaultLang,
    fallbackLng: defaultLang,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
