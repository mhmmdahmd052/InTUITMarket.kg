"use client";

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useState, useEffect } from 'react';

export default function TermsPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-background min-h-screen pt-32 pb-24 px-8 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-32 pb-24 px-8">
      <div className="max-w-4xl mx-auto bg-surface-container-low p-10 md:p-16 rounded-[40px] border border-outline-variant/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        
        <header className="relative mb-12">
          <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter text-on-surface leading-none mb-4">
            {t("legal.termsTitle")}
          </h1>
          <p className="text-secondary font-black uppercase tracking-widest text-xs">
            {t("legal.effectiveDate")}
          </p>
        </header>

        <div className="relative prose prose-invert prose-slate max-w-none text-on-surface-variant space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-on-surface font-heading flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
              {t("legal.termsSection1Title")}
            </h2>
            <p className="text-lg leading-relaxed font-medium">
              {t("legal.termsSection1Desc")}
            </p>
          </section>

          <section className="space-y-4 pt-4">
            <h2 className="text-2xl font-black text-on-surface font-heading flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
              {t("legal.termsSection2Title")}
            </h2>
            <p className="text-lg leading-relaxed font-medium">
              {t("legal.termsSection2Desc")}
            </p>
          </section>

          <div className="mt-16 pt-10 border-t border-outline-variant/10 flex items-center justify-between">
            <Link href="/products" className="group bg-surface-container-high text-on-surface-variant font-black px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-primary hover:text-on-primary transition-all shadow-sm active:scale-95">
              <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
              {t("legal.returnToCatalog")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
