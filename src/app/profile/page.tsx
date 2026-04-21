"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/authStore";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { useTranslation } from "@/lib/i18n";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-secondary font-black uppercase tracking-[0.3em] text-xs animate-pulse">{t("profile.loading")}</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success(t("settings.loggedOut"));
    router.push("/");
  };

  return (
    <ProtectedLayout>
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 mt-24 p-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar Profile Card */}
            <aside className="lg:col-span-4 space-y-6">
               <div className="bg-surface-container-low p-4 rounded-[40px] border border-outline-variant/10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-primary/10 text-primary flex items-center justify-center rounded-[24px] text-2xl font-black mb-4 mx-auto shadow-inner border border-primary/20 group-hover:scale-105 transition-transform duration-500">
                      {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <h2 className="text-xl font-semibold font-heading tracking-tight text-on-surface mb-1">{user?.name}</h2>
                    <p className="text-secondary text-sm font-medium mb-6 opacity-60">{user?.email}</p>
                    
                    <div className="space-y-2 pt-6 border-t border-outline-variant/10">
                      <Link href="/settings" className="w-full flex items-center justify-center gap-2 bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-black uppercase tracking-widest py-3 rounded-xl border border-outline-variant/10 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-base">settings</span>
                        {t("settings.accountSettings")}
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-error/5 hover:bg-error/10 text-error text-xs font-black uppercase tracking-widest py-3 rounded-xl border border-error/10 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-base">logout</span>
                        {t("header.logout")}
                      </button>
                    </div>
                  </div>
               </div>
            </aside>

            {/* Quick Actions Grid */}
            <section className="lg:col-span-8 space-y-6">
               <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 ml-2">{t("profile.quickAccess")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                     <Link href="/orders" className="p-4 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 rounded-xl group transition-all hover:shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700"></div>
                        <span className="material-symbols-outlined text-primary text-2xl mb-2 block relative z-10">dock</span>
                        <h4 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors relative z-10 tracking-tight">{t("orders.title")}</h4>
                        <p className="text-sm text-secondary font-medium leading-tight relative z-10 opacity-80">{t("profile.ordersDesc")}</p>
                     </Link>

                     <Link href="/support" className="p-4 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 rounded-xl group transition-all hover:shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700"></div>
                        <span className="material-symbols-outlined text-primary text-2xl mb-2 block relative z-10">support_agent</span>
                        <h4 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors relative z-10 tracking-tight">{t("header.contact")}</h4>
                        <p className="text-sm text-secondary font-medium leading-tight relative z-10 opacity-80">{t("profile.supportDesc")}</p>
                     </Link>

                     <Link href="/products" className="p-4 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 rounded-xl group transition-all hover:shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700"></div>
                        <span className="material-symbols-outlined text-primary text-2xl mb-2 block relative z-10">inventory_2</span>
                        <h4 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors relative z-10 tracking-tight">{t("header.catalog")}</h4>
                        <p className="text-sm text-secondary font-medium leading-tight relative z-10 opacity-80">{t("profile.catalogDesc")}</p>
                     </Link>

                  </div>
               </div>
            </section>

          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
