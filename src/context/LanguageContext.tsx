"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LanguageCode, LANGUAGES, translations } from "@/lib/i18n";

interface LanguageContextType {
  language: LanguageCode;
  lang: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  isRtl: boolean;
  formatPrice: (amount: number, currency?: string) => string;
  localizeField: (record: Record<string, any> | null | undefined, field: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  lang: "en",
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isRtl: false,
  formatPrice: (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`,
  localizeField: (record, field, fallback = "") => (record && record[field]) || fallback,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("algafur_lang") as LanguageCode | null;
      if (saved && ["en", "hi", "mr", "ar", "ur"].includes(saved)) {
        setLanguageState(saved);
        const isRtl = saved === "ar" || saved === "ur";
        document.documentElement.dir = isRtl ? "rtl" : "ltr";
        document.documentElement.lang = saved;
      } else {
        document.documentElement.dir = "ltr";
        document.documentElement.lang = "en";
      }
    } catch {
      // Ignore storage access errors in private browsing
    }
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("algafur_lang", lang);
    } catch {
      // Ignore storage errors
    }
    const isRtl = lang === "ar" || lang === "ur";
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, []);

  const isRtl = language === "ar" || language === "ur";

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = translations[language] || translations.en;
      return dict[key] || translations.en[key] || fallback || key;
    },
    [language]
  );

  const formatPrice = useCallback((amount: number, currency = "INR"): string => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    if (currency === "INR" || !currency) {
      return `₹${safeAmount.toLocaleString("en-IN")}`;
    }
    return `${currency} ${safeAmount.toLocaleString("en-IN")}`;
  }, []);

  const localizeField = useCallback(
    (record: Record<string, any> | null | undefined, field: string, fallback = ""): string => {
      if (!record) return fallback;
      if (language !== "en") {
        const localizedKey = `${field}_${language}`;
        const candidate = record[localizedKey];
        if (typeof candidate === "string" && candidate.trim().length > 0) {
          return candidate;
        }
      }
      const primary = record[field];
      if (typeof primary === "string" && primary.trim().length > 0) {
        return primary;
      }
      return fallback;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{ language, lang: language, setLanguage, t, isRtl, formatPrice, localizeField }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
