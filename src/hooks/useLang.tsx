import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type LangType = "en" | "id";

const useLang = () => {
  const [lang, setLang] = useState<LangType>("en");
  const { i18n } = useTranslation();
  const changeLanguage = (lang: LangType) => {
    setLang(lang);
    localStorage.setItem("lang", lang);
  };
  useEffect(() => {
    const lang = (localStorage.getItem("lang") as LangType | null) ?? "en";
    i18n.changeLanguage(lang);
    setLang(lang);
    // Screen reader & browser perlu tahu bahasa konten yang sedang tampil
    document.documentElement.lang = lang;
  }, [lang]);
  return { lang, changeLanguage };
};

export default useLang;
