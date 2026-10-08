"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode, LANGUAGES, translations } from "@/lib/i18n";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  isRtl: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("algafur_lang") as LanguageCode | null;
    if (saved && ["en", "hi", "mr", "ar", "ur"].includes(saved)) {
      setLanguageState(saved);
      const isRtl = saved === "ar" || saved === "ur";
      document.documentElement.dir = isRtl ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("algafur_lang", lang);
    const isRtl = lang === "ar" || lang === "ur";
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const isRtl = language === "ar" || language === "ur";

  const t = (key: string): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

