"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";
import { useOrderStore } from "@/lib/orderStore";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { useTranslation } from "@/lib/i18n";

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const orders = useOrderStore((state) => state.orders);
  const userOrders = (orders || []).filter(o => o.userId === user?.id);
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, router, mounted]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary font-bold text-lg">{t("orders.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedLayout>
      <div className="bg-background min-h-screen pt-28 pb-20 px-4 md:px-8">
        <main className="max-w-5xl mx-auto w-full">
          <header className="mb-12 flex flex-col sm:flex-row justify-between sm:items-end gap-6 border-b border-outline-variant/10 pb-10">
            <div>
              <h1 className="text-5xl font-black font-heading tracking-tighter text-on-surface mb-2">
                {t("orders.title")}
              </h1>
              <p className="text-secondary font-medium">{userOrders.length} {t("orders.title").toLowerCase()} placed</p>
            </div>
            <Link 
              href="/profile" 
              className="group flex items-center gap-2 px-6 py-2.5 bg-surface-container-high rounded-xl text-sm font-bold text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
              {t("orders.backToProfile")}
            </Link>
          </header>

          <div className="grid gap-6">
            {!(userOrders && userOrders.length > 0) ? (
              <div className="bg-surface-container-low p-20 rounded-[40px] flex flex-col items-center justify-center text-center border border-dashed border-outline-variant/30">
                <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-secondary/40 text-5xl">inventory_2</span>
                </div>
                <h3 className="text-2xl font-black text-on-surface mb-4">{t("orders.noOrders")}</h3>
                <Link 
                  href="/products" 
                  className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                >
                  {t("cart.startBuilding")}
                </Link>
              </div>
            ) : (
              userOrders.map((order) => (
                <div 
                  key={order?.id} 
                  className="bg-surface-container-low border border-outline-variant/10 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all hover:border-primary/20 group"
                >
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 border-b border-outline-variant/10 pb-8 mb-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                          {t("orders.orderId")}: {order?.id?.slice(0, 8)?.toUpperCase()}
                        </p>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border
                         ${order?.status === 'Processing' ? 'bg-primary/10 text-primary border-primary/20' : ''}
                         ${order?.status === 'Shipped' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                         ${order?.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                       `}>
                          {t(`orders.${order?.status?.toLowerCase()}`)}
                        </span>
                      </div>
                      <p className="text-lg text-on-surface font-black mt-2">
                        {new Date(order?.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between lg:text-right gap-12">
                      <div className="bg-surface-container-high px-6 py-3 rounded-2xl border border-outline-variant/10 text-center">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{t("orders.total")}</p>
                        <p className="font-heading font-black text-2xl text-primary">
                          {(order?.totalAmount || 0).toLocaleString()} <span className="text-sm">{t("cart.currency")}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="flex items-center -space-x-4">
                        {(order.items || []).slice(0, 4).map((item, idx) => (
                          <div key={idx} className="w-16 h-16 bg-white rounded-2xl overflow-hidden border-2 border-surface-container-high shadow-sm relative group-hover:scale-110 transition-transform duration-500" style={{ zIndex: 10 - idx }}>
                            <img 
                              src={item?.imageUrl} 
                              alt={item?.name || 'Item'} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ))}
                        {(order?.items?.length || 0) > 4 && (
                        <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center font-black text-sm text-secondary border-2 border-surface-container-high relative z-0">
                          +{(order.items.length || 0) - 4}
                        </div>
                      )}
                    </div>
                    
                    <Link 
                      href={`/orders/${order?.id}`} 
                      className="w-full sm:w-auto px-8 py-3.5 bg-primary text-on-primary rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 group/link"
                    >
                      {t("orders.viewOrder")} 
                      <span className="material-symbols-outlined text-lg transition-transform group-hover/link:translate-x-1">navigate_next</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
