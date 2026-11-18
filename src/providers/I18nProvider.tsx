"use client";
import i18n, { readSavedLang } from "@/lib/i18n";
import React, { FC, ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";

interface I18nProviderProps {
  children: ReactNode;
}

const I18nProvider: FC<I18nProviderProps> = ({ children }) => {
  // Pulihkan bahasa terakhir setelah hidrasi. Harus di sini, di komponen paling luar: effect induk
  // berjalan setelah effect semua anaknya, jadi setiap useTranslation sudah mendengarkan event
  // pergantian bahasa saat changeLanguage dipanggil. Server selalu merender bahasa Indonesia.
  // changeLanguage sengaja dipanggil walau bahasanya sudah sama: di StrictMode effect berjalan dua kali,
  // dan event pertama bisa jatuh saat komponen sedang dilepas sementara, sehingga perlu dikirim ulang.
  useEffect(() => {
    const saved = readSavedLang();
    if (saved) i18n.changeLanguage(saved);
  }, []);

  return (
    <I18nextProvider i18n={i18n} defaultNS={"translation"}>
      {children}
    </I18nextProvider>
  );
};

export default I18nProvider;
