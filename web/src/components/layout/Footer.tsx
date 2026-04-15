"use client";

import Link from "next/link";
import ToastButton from "@/components/ToastButton";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full py-12 px-8 bg-surface-container border-t border-outline-variant/10 mt-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="space-y-4">
          <span className="inline-block font-sans text-xs uppercase tracking-widest text-on-surface-variant font-bold">InTUITMarket.kg</span>
          <p className="text-on-surface-variant font-sans text-xs uppercase tracking-widest leading-relaxed max-w-xs">
              {t("footer.description")}
          </p>
          <p className="text-on-surface-variant font-sans text-xs uppercase tracking-widest opacity-50">© 2026 InTUITMarket.kg.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-tertiary-container font-bold font-sans text-xs uppercase tracking-widest">{t("footer.connect")}</h4>
            <ul className="space-y-2">
              <li><Link className="text-on-surface-variant font-sans text-xs uppercase tracking-widest hover:text-primary transition-colors" href="/support">{t("footer.contact")}</Link></li>
              <li><ToastButton className="text-on-surface-variant font-sans text-xs uppercase tracking-widest hover:text-primary transition-colors" message={t("footer.newsletterSubscribed")}>{t("footer.newsletter")}</ToastButton></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-end justify-center">
          <div className="bg-surface-container-highest p-6 rounded-2xl text-right border border-outline-variant/10">
            <p className="text-xs font-bold text-on-surface mb-2">{t("footer.locationCenter")}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{t("footer.bishkek")}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{t("footer.street")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
