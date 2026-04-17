"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";
import CartBadge from "./CartBadge";
import { useTranslation } from "@/lib/i18n";

export default function HeaderActions() {
  const { isAuthenticated, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex gap-4 items-center">
      {/* Language Switcher */}
      <div className="hidden md:flex items-center bg-surface-container-highest rounded-xl border border-outline-variant/10 p-1 mr-2">
        {(['en', 'ar', 'ru'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              language === lang 
                ? "bg-primary text-on-primary shadow-sm" 
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <CartBadge />
      <div className="hidden md:flex gap-4 items-center">
        <Link href="/profile" className="text-on-surface-variant hover:text-primary transition-colors duration-300 ease-in-out hover:scale-105">
          <span className="material-symbols-outlined font-icon" data-icon="account_circle">account_circle</span>
        </Link>
        <Link href="/settings" className="text-on-surface-variant hover:text-primary transition-colors duration-300 ease-in-out hover:scale-105">
          <span className="material-symbols-outlined font-icon" data-icon="settings">settings</span>
        </Link>
        {isAuthenticated && (
          <button
            onClick={() => logout()}
            className="text-on-surface-variant hover:text-error transition-colors duration-300 ease-in-out flex items-center gap-1 text-xs font-bold uppercase cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>{t("header.logout")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
