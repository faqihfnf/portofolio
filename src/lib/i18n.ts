import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import idJson from "@/translation/id.json";
import enJson from "@/translation/en.json";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: {
        translation: enJson,
      },
      id: {
        translation: idJson,
      },
    },
    // Bahasa Indonesia sebagai default: server merender versi Indonesia, jadi itulah yang diindeks Google
    lng: "id",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

export default i18n;

// ============================================================
// Pilihan bahasa pengunjung, disimpan di localStorage.
// localStorage bisa melempar error (mode privat Safari, situs diblokir) — bahasa tetap jalan tanpanya.
// ============================================================
export type LangType = "en" | "id";

const STORAGE_KEY = "lang";

export const readSavedLang = (): LangType | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "id" || saved === "en" ? saved : null;
  } catch {
    return null;
  }
};

export const saveLang = (lang: LangType) => {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Pilihan bahasa hanya tidak diingat
  }
};
