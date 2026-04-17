"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderActions from "../HeaderActions";
import { useTranslation } from "@/lib/i18n";
import { useThemeStore } from "@/lib/themeStore";
import { useAuthStore } from "@/lib/authStore";

export default function Header() {
  const { t, language, setLanguage } = useTranslation();
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/", label: t("header.home") },
    { href: "/products", label: t("header.catalog") },
    { href: "/support", label: t("header.contact") },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-surface-container-high transition-colors duration-300">
      <div className="relative flex justify-between items-center px-8 h-20 w-full mx-auto max-w-7xl">
        <div className="flex items-center gap-8">
          <Link href="/" onClick={closeMenu} className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="InTUITMarket Logo" className="h-12 md:h-14 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={`transition-all pb-1 font-heading font-bold tracking-tight text-sm uppercase ${
                  isActive(link.href) 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-all active:scale-90 flex items-center justify-center"
                title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              >
                <span className="material-symbols-outlined text-sm">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            </div>

            <HeaderActions />
          </div>

          {/* Hamburger Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full right-0 w-64 max-w-[90vw] bg-white dark:bg-gray-900 border-l border-b border-gray-200 dark:border-gray-700 shadow-2xl z-50 py-4 flex flex-col">
            <div className="px-6 py-4 space-y-4 border-b border-gray-100 dark:border-gray-800">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block text-sm font-black uppercase tracking-widest ${
                    isActive(link.href) ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="px-6 py-6 space-y-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-50">{t("settings.theme")}</span>
                <button 
                  onClick={() => { toggleTheme(); closeMenu(); }}
                  className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-sm">
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-50 block mb-2">{t("settings.language")}</span>
                <div className="flex gap-2">
                  {(['en', 'ar', 'ru'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); closeMenu(); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        language === lang 
                          ? "bg-primary text-on-primary shadow-sm" 
                          : "text-on-surface-variant border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-4">
              <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">account_circle</span>
                {t("header.account")}
              </Link>
              <Link href="/settings" onClick={closeMenu} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">settings</span>
                {t("header.settings")}
              </Link>
              {isAuthenticated && (
                <button 
                  onClick={() => { logout(); closeMenu(); }}
                  className="w-full flex items-center gap-3 text-sm font-black uppercase tracking-widest text-error pt-2 hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  {t("header.logout")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
