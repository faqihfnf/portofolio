import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { saveLang, type LangType } from "@/lib/i18n";

// Bahasa aktif dibaca langsung dari i18next; useTranslation me-render ulang komponen saat bahasa berganti.
// Pemulihan bahasa tersimpan dilakukan di I18nProvider.
const useLang = () => {
  const { i18n } = useTranslation();
  const lang: LangType = i18n.language === "en" ? "en" : "id";

  // Screen reader & browser perlu tahu bahasa konten yang sedang tampil
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLanguage = (next: LangType) => {
    i18n.changeLanguage(next);
    saveLang(next);
  };

  return { lang, changeLanguage };
};

export default useLang;
