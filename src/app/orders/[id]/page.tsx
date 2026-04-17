"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useOrderStore, OrderStatus } from "@/lib/orderStore";
import { useAuthStore } from "@/lib/authStore";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { useTranslation } from "@/lib/i18n";

const STAGES: OrderStatus[] = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { orders, updateOrderStatus } = useOrderStore();
  const orderId = params.id as string;
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  const order = (orders || []).find(o => o.id === orderId);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, router, mounted]);

  useEffect(() => {
    if (!mounted || !order || order.status === 'Delivered') return;

    const currentStageIndex = STAGES.indexOf(order.status);
    if (currentStageIndex >= 0 && currentStageIndex < STAGES.length - 1) {
      const timer = setTimeout(() => {
        updateOrderStatus(order.id, STAGES[currentStageIndex + 1]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mounted, order, updateOrderStatus]);

  if (!mounted || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary font-bold text-lg">{t("orders.loading")}</p>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGES.indexOf(order.status);
  const stageKeys: Record<string, string> = {
    'Processing': 'processing',
    'Shipped': 'shipped',
    'Out for Delivery': 'outForDelivery',
    'Delivered': 'delivered'
  };

  return (
    <ProtectedLayout>
      <div className="bg-background min-h-screen pt-28 pb-20 px-4 md:px-8">
        <main className="max-w-5xl mx-auto w-full">
          <header className="mb-12 flex flex-col sm:flex-row justify-between sm:items-end gap-6 border-b border-outline-variant/10 pb-10">
            <div>
              <h1 className="text-5xl font-black font-heading tracking-tighter text-on-surface mb-2">
                {t("orders.trackYourDelivery")}
              </h1>
              <p className="text-secondary font-medium">
                {t("orders.logisticsTimeline")} {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Link 
              href="/orders" 
              className="group flex items-center gap-2 px-6 py-2.5 bg-surface-container-high rounded-xl text-sm font-bold text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
              {t("header.catalog")}
            </Link>
          </header>

          <div className="bg-surface-container-low border border-outline-variant/10 p-10 md:p-16 rounded-[40px] shadow-sm mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
            
            <div className="relative">
              <div className="absolute top-5 left-0 w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
                  style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                ></div>
              </div>
              
              <div className="relative flex justify-between">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const key = stageKeys[stage] || stage.toLowerCase();
                  
                  return (
                    <div key={stage} className="flex flex-col items-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black relative z-10 transition-all duration-700 shadow-xl ${
                        isCompleted ? 'bg-primary text-on-primary scale-110 shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant border-2 border-outline-variant/20'
                      }`}>
                        {isCompleted ? <span className="material-symbols-outlined text-xl">check</span> : (idx + 1)}
                        {isCurrent && (
                          <div className="absolute -inset-3 rounded-full border-2 border-primary/30 animate-ping"></div>
                        )}
                      </div>
                      <span className={`mt-6 text-[10px] sm:text-xs font-black tracking-widest uppercase text-center max-w-[80px] sm:max-w-none transition-colors duration-500 ${
                        isCompleted ? 'text-on-surface' : 'text-secondary/40'
                      }`}>
                        {t(`orders.${key}`)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 xl:col-span-8 bg-surface-container-low border border-outline-variant/10 p-8 md:p-10 rounded-[40px] shadow-sm">
              <h3 className="text-2xl font-heading font-black mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
                {t("orders.manifestInfo")}
              </h3>
              <div className="grid gap-6">
                {!(order?.items && order.items.length > 0) ? (
                   <div className="py-12 text-center text-secondary font-bold border border-dashed border-outline-variant/20 rounded-3xl">
                     {t("orders.noItemsFound")}
                   </div>
                ) : (
                  order.items.map((item) => (
                    <div key={item?._id} className="flex items-center gap-6 p-4 bg-surface-container-high/50 rounded-2xl hover:bg-surface-container-high transition-colors group">
                      <div className="w-20 h-20 bg-white rounded-xl border border-outline-variant/10 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                        <img 
                          alt={item?.name || 'Item'} 
                          className="object-cover w-full h-full" 
                          src={item?.imageUrl} 
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-lg font-black text-on-surface line-clamp-1">{item?.name || 'Unknown'}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            Qty: {item?.quantity || 1}
                          </span>
                          <span className="text-sm font-black text-on-surface-variant">
                            {(item?.price || 0).toLocaleString()} {t("cart.currency")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xl font-black text-primary">
                          {((item?.price || 0) * (item?.quantity || 1)).toLocaleString()} <span className="text-xs">{t("cart.currency")}</span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-12 xl:col-span-4 space-y-8">
              <div className="bg-surface-container-low border border-outline-variant/10 p-8 rounded-[40px] shadow-sm">
                <h3 className="text-[10px] uppercase tracking-widest font-black text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">payments</span>
                  {t("orders.financials")}
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center"><span className="text-secondary font-bold text-sm uppercase tracking-widest">{t("orders.subtotal")}</span><span className="font-black">{order.subtotal?.toLocaleString()} {t("cart.currency")}</span></div>
                   <div className="flex justify-between items-center"><span className="text-secondary font-bold text-sm uppercase tracking-widest">{t("orders.tax")}</span><span className="font-black text-error">+{order.tax?.toLocaleString()} {t("cart.currency")}</span></div>
                   <div className="flex justify-between items-center"><span className="text-secondary font-bold text-sm uppercase tracking-widest">{t("orders.logistics")}</span><span className="font-black text-primary">+{order.deliveryFee?.toLocaleString()} {t("cart.currency")}</span></div>
                   <div className="pt-6 mt-6 border-t border-outline-variant/10 flex justify-between items-center">
                     <span className="font-black uppercase tracking-widest text-primary text-sm">{t("orders.total")}</span>
                     <span className="text-3xl font-black text-primary">{order.totalAmount?.toLocaleString()} <span className="text-sm">{t("cart.currency")}</span></span>
                   </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/10 p-8 rounded-[40px]">
                <h3 className="text-[10px] uppercase tracking-widest font-black text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  {t("orders.deliveryDropsite")}
                </h3>
                <div className="space-y-1">
                  <p className="font-black text-xl text-on-surface leading-snug">{order.shippingDetails?.fullName}</p>
                  <p className="text-on-surface-variant font-medium mt-3 leading-relaxed">{order.shippingDetails?.address}</p>
                  <p className="text-on-surface-variant font-bold">{order.shippingDetails?.city}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-primary/10 flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined">call</span>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Contact Receiver</p>
                     <p className="font-black text-on-surface">{order.shippingDetails?.phone}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
