"use client";

import React, { createContext, useContext, useEffect, useCallback } from "react";
import { translations } from "@/lib/i18n";

interface LanguageContextType {
  language: "en";
  lang: "en";
  setLanguage: (lang: string) => void;
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
  useEffect(() => {
    try {
      localStorage.removeItem("algafur_lang");
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setLanguage = useCallback((_lang: string) => {
    // Language switching has been removed. English is the fixed default.
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    return translations.en[key] || fallback || key;
  }, []);

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
      const primary = record[field];
      if (typeof primary === "string" && primary.trim().length > 0) {
        return primary;
      }
      return fallback;
    },
    []
  );

  return (
    <LanguageContext.Provider
      value={{
        language: "en",
        lang: "en",
        setLanguage,
        t,
        isRtl: false,
        formatPrice,
        localizeField,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
