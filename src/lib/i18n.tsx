"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuthStore } from "./authStore";
import { useThemeStore } from "./themeStore";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import ru from "../locales/ru.json";

type Language = "en" | "ar" | "ru";
type Translations = typeof en;

export const activeLocales: Language[] = ["en", "ar", "ru"];
export const defaultLocale: Language = "en";
const translations: Record<Language, Translations> = { en, ar, ru };

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: () => "",
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("intuit-language") as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    }
    // Initialize auth and theme store once on client side
    useAuthStore.getState().initialize();
    useThemeStore.getState().initialize();
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("intuit-language", lang);
    if (lang === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  };

  useEffect(() => {
    if (mounted) {
      if (language === "ar") {
        document.documentElement.dir = "rtl";
      } else {
        document.documentElement.dir = "ltr";
      }
    }
  }, [mounted, language]);

  const t = (keyPath: string): string => {
    const keys = keyPath.split(".");
    
    const getValue = (data: any, path: string[]) => {
      let current = data;
      for (const key of path) {
        if (!current || typeof current !== 'object' || current[key] === undefined) {
          return undefined;
        }
        current = current[key];
      }
      return typeof current === 'string' ? current : undefined;
    };

    // 1. Try Target Language
    const val = getValue(translations[language], keys);
    if (val !== undefined) return val;

    // 2. Try English Fallback
    if (language !== "en") {
      const engVal = getValue(translations["en"], keys);
      if (engVal !== undefined) return engVal;
    }

    // 3. Ultimate Fallback
    return "N/A";
  };

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
