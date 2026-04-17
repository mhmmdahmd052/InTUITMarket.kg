"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCartStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { useTranslation } from "@/lib/i18n";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const carts = useCartStore(state => state.carts);
  const guestCart = useCartStore(state => state.guestCart);
  const { removeFromCart, updateQuantity } = useCartStore();
  const { t } = useTranslation();

  const cart = user?.id ? (carts?.[user.id] || []) : guestCart;
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const subtotal = (cart || []).reduce((total, item) => total + ((item?.price || 0) * (item?.quantity || 1)), 0);
  const vat = subtotal * 0.12;
  const grandTotal = subtotal + vat;

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-on-surface-variant font-bold text-lg">Loading Cart...</p>
      </div>
    );
  }

  const handleCheckoutClick = () => {
    if ((cart || []).length === 0) {
      toast.error(t("cart.empty"));
    } else if (!user) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary/30 min-h-screen">
      <main className="pt-24 pb-32 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading font-bold text-3xl tracking-tight text-on-background">
              {t("cart.title")}
            </h1>
            <span className="text-secondary font-medium">
              {(cart || []).length} {t("cart.items")}
            </span>
          </div>

          {!(cart && cart.length > 0) ? (
            <div className="text-center py-12 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">remove_shopping_cart</span>
              <p className="text-secondary mb-4 text-lg">{t("cart.empty")}</p>
              <Link href="/products" className="inline-block px-8 py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                {t("cart.startBuilding")}
              </Link>
            </div>
          ) : (
            (cart || []).map((item) => (
              <div key={item?._id} className="bg-surface-container-low border border-outline-variant/30 p-4 lg:p-6 rounded-2xl flex flex-col sm:flex-row gap-6 hover:border-primary-container transition-colors group">
                <div className="w-full sm:w-32 h-32 bg-surface-container-high rounded-lg overflow-hidden shrink-0">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={item?.name || 'Product'} 
                    src={item?.imageUrl || '/products/reinforced_concrete_foundation.png'} 
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-primary">{item?.name || t("cart.unknownProduct")}</h3>
                      <p className="text-secondary text-sm font-medium line-clamp-1">{item?.description}</p>
                    </div>
                    <button 
                      onClick={() => item?._id && removeFromCart(item._id)} 
                      className="text-outline hover:text-error transition-colors p-2"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-end justify-between mt-4">
                    <div className="flex items-center bg-surface-container-highest rounded-lg p-1 border border-outline-variant/10">
                      <button 
                        onClick={() => item?._id && updateQuantity(item._id, -1)} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant rounded text-on-surface"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="px-4 font-bold font-heading text-on-surface">{item?.quantity || 1}</span>
                      <button 
                        onClick={() => item?._id && updateQuantity(item._id, 1)} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant rounded text-on-surface"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-secondary text-xs mb-1">
                        {(item?.price || 0).toLocaleString()} {t("cart.currency")} / unit
                      </p>
                      <p className="text-xl font-black font-heading text-on-surface">
                        {((item?.price || 0) * (item?.quantity || 1)).toLocaleString()} {t("cart.currency")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 sticky top-24 shadow-sm">
            <h2 className="font-heading font-bold text-xl text-on-surface mb-6 border-b border-outline-variant/10 pb-4">
              {t("cart.orderSummary")}
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-secondary">
                <span className="font-medium">{t("cart.subtotal")}</span>
                <span className="font-bold text-on-surface">{subtotal.toLocaleString()} {t("cart.currency")}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="font-medium">{t("cart.vat")}</span>
                <span className="font-bold text-on-surface">{vat.toLocaleString()} {t("cart.currency")}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="font-medium">{t("cart.delivery")}</span>
                <span className="text-primary font-bold">{t("cart.calculatedStep2")}</span>
              </div>
            </div>
            <div className="border-t border-outline-variant/10 pt-6 mb-8">
              <div className="flex justify-between items-baseline">
                <span className="font-heading font-bold text-lg text-on-surface">{t("cart.grandTotal")}</span>
                <div className="text-right">
                  <span className="block font-heading font-black text-3xl text-primary leading-none">
                    {grandTotal.toLocaleString()}
                  </span>
                  <span className="text-primary font-bold text-sm uppercase">{t("cart.currency")}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleCheckoutClick} 
              className="w-full bg-primary hover:bg-primary-container transition-all text-on-primary font-heading font-extrabold py-5 rounded-2xl shadow-lg active:scale-95 flex items-center justify-center gap-2 group outline-none"
            >
              <span>{t("cart.proceedToCheckout")}</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <div className="mt-8 flex items-center gap-3 text-secondary text-xs justify-center opacity-60">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <span>{t("cart.securePayment")}</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
