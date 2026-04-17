"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { useOrderStore, Order } from '@/lib/orderStore';
import { useTranslation } from "@/lib/i18n";

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { clearCart } = useCartStore();
  const carts = useCartStore(state => state.carts);
  const guestCart = useCartStore(state => state.guestCart);
  const cart = user?.id ? (carts?.[user.id] || []) : guestCart;
  const { t, language } = useTranslation();
  const validationRefs = useRef<Record<string, { input: HTMLInputElement | HTMLTextAreaElement | null, span: HTMLElement | null }>>({});

  useEffect(() => {
    Object.values(validationRefs.current).forEach(({ input, span }) => {
      if (input?.dataset.errorKey && span) {
        span.textContent = t(input.dataset.errorKey);
      }
    });
  }, [language, t]);

  const [delivery, setDelivery] = useState('standard');
  const [payment, setPayment] = useState('card');
  const { createOrder } = useOrderStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login?redirect=/checkout');
    }
  }, [mounted, isAuthenticated, router]);

  const handlePlaceOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((cart || []).length === 0) {
      toast.error(t("cart.empty"));
      return;
    }
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const loadingToast = toast.loading(t("orders.authorizing"));
    
    setTimeout(async () => {
      toast.dismiss(loadingToast);
      
      const newOrder: Order = {
        id: crypto.randomUUID(),
        userId: user?.id || '',
        items: cart,
        subtotal,
        tax: vat,
        deliveryFee,
        totalAmount,
        status: 'Processing',
        createdAt: new Date().toISOString(),
        shippingDetails: {
          fullName: formData.get('fullName') as string,
          email: user?.email || '',
          address: formData.get('address') as string,
          city: t("orders.defaultCity"), 
          phone: formData.get('phone') as string
        }
      };

      createOrder(newOrder);
      
      try {
        await fetch('/api/send-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ...newOrder,
    name: newOrder.shippingDetails.fullName
  })
});
      } catch (err) {
        console.error("Failed to send order email:", err);
      }

      toast.success(t("orders.orderPlacedSuccess"));
      clearCart();
      router.push(`/orders/${newOrder.id}`);
    }, 1500);
  };

  const calculateSubtotal = () => (cart || []).reduce((total: number, item: any) => total + ((item?.price || 0) * (item?.quantity || 1)), 0);
  const subtotal = calculateSubtotal();
  const vat = subtotal * 0.12;
  const deliveryFee = delivery === 'crane' ? 8500 : 2500;
  const totalAmount = subtotal + vat + deliveryFee;

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary font-bold text-lg">{t("checkout.loading") || "Loading Checkout..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-20">
      <form onSubmit={handlePlaceOrder} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-12">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <div className="flex flex-col items-center group">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold mb-2 shadow-lg scale-110">1</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t("checkout.shipping")}</span>
            </div>
            <div className="w-24 h-0.5 bg-outline-variant/30 mx-4"></div>
            <div className="flex flex-col items-center opacity-40">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center font-bold mb-2">2</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{t("checkout.payment")}</span>
            </div>
            <div className="w-24 h-0.5 bg-outline-variant/30 mx-4"></div>
            <div className="flex flex-col items-center opacity-40">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center font-bold mb-2">3</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{t("checkout.confirm")}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <section className="bg-surface-container-low p-8 md:p-10 rounded-[40px] border border-outline-variant/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:scale-150 duration-700"></div>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
                </div>
                <h2 className="text-3xl font-heading font-black tracking-tight">{t("checkout.shippingInformation")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 flex flex-col">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-3 ml-1">{t("checkout.fullName")}</label>
                    <input 
                      name="fullName" 
                      required 
                      ref={el => {
                        if (!validationRefs.current['fullName']) validationRefs.current['fullName'] = { input: null, span: null };
                        validationRefs.current['fullName'].input = el;
                      }}
                      onInvalid={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const key = "form.required";
                        input.dataset.errorKey = key;
                        const span = validationRefs.current['fullName']?.span;
                        if (span) {
                          span.textContent = t(key);
                          span.style.display = 'block';
                        }
                      }}
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.setCustomValidity("");
                        delete input.dataset.errorKey;
                        const span = validationRefs.current['fullName']?.span;
                        if (span) span.style.display = 'none';
                      }}
                      className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl p-5 text-on-surface font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30" 
                      placeholder={t("orders.namePlaceholder")} 
                      type="text" 
                    />
                  </div>
                  <span 
                    ref={el => {
                      if (!validationRefs.current['fullName']) validationRefs.current['fullName'] = { input: null, span: null };
                      validationRefs.current['fullName'].span = el;
                    }}
                    className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-widest hidden"
                  ></span>
                </div>

                <div className="flex flex-col">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-3 ml-1">{t("checkout.phoneNumber")}</label>
                    <input 
                      name="phone" 
                      required 
                      type="tel"
                      ref={el => {
                        if (!validationRefs.current['phone']) validationRefs.current['phone'] = { input: null, span: null };
                        validationRefs.current['phone'].input = el;
                      }}
                      onInput={(e) => { 
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+\s()-]/g, ''); 
                        e.currentTarget.setCustomValidity("");
                        delete e.currentTarget.dataset.errorKey;
                        const span = validationRefs.current['phone']?.span;
                        if (span) span.style.display = 'none';
                      }}
                      onInvalid={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const key = "form.required";
                        input.dataset.errorKey = key;
                        const span = validationRefs.current['phone']?.span;
                        if (span) {
                          span.textContent = t(key);
                          span.style.display = 'block';
                        }
                      }}
                      className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl p-5 text-on-surface font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30" 
                      placeholder={t("orders.phonePlaceholder")} 
                    />
                  </div>
                  <span 
                    ref={el => {
                      if (!validationRefs.current['phone']) validationRefs.current['phone'] = { input: null, span: null };
                      validationRefs.current['phone'].span = el;
                    }}
                    className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-widest hidden"
                  ></span>
                </div>

                <div className="flex flex-col">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-3 ml-1">{t("checkout.company")}</label>
                    <input 
                      name="company" 
                      className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl p-5 text-on-surface font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30" 
                      placeholder={t("orders.companyPlaceholder")} 
                      type="text" 
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-3 ml-1">{t("checkout.address")}</label>
                    <textarea 
                      name="address" 
                      required 
                      ref={el => {
                        if (!validationRefs.current['address']) validationRefs.current['address'] = { input: null, span: null };
                        validationRefs.current['address'].input = el;
                      }}
                      onInvalid={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const key = "form.required";
                        input.dataset.errorKey = key;
                        const span = validationRefs.current['address']?.span;
                        if (span) {
                          span.textContent = t(key);
                          span.style.display = 'block';
                        }
                      }}
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.setCustomValidity("");
                        delete input.dataset.errorKey;
                        const span = validationRefs.current['address']?.span;
                        if (span) span.style.display = 'none';
                      }}
                      className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl p-5 text-on-surface font-bold focus:ring-2 focus:ring-primary outline-none resize-none transition-all placeholder:text-secondary/30" 
                      placeholder={t("orders.addressPlaceholder")} 
                      rows={4}
                    ></textarea>
                  </div>
                  <span 
                    ref={el => {
                      if (!validationRefs.current['address']) validationRefs.current['address'] = { input: null, span: null };
                      validationRefs.current['address'].span = el;
                    }}
                    className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-widest hidden"
                  ></span>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-low p-8 md:p-10 rounded-[40px] border border-outline-variant/10 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">precision_manufacturing</span>
                </div>
                <h2 className="text-3xl font-heading font-black tracking-tight">{t("checkout.deliveryMethod")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label onClick={() => setDelivery('standard')} className={`group relative flex flex-col p-8 bg-surface-container-high border-2 transition-all cursor-pointer rounded-[32px] ${delivery === 'standard' ? 'border-primary shadow-xl shadow-primary/5' : 'border-outline-variant/10 hover:border-primary/30'}`}>
                  <input className="sr-only" name="delivery" type="radio" checked={delivery === 'standard'} readOnly />
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-black text-xl text-on-surface">{t("checkout.standardNextDay")}</span>
                    <span className="bg-primary/10 text-primary font-black px-3 py-1 rounded-lg text-sm">2,500 {t("cart.currency")}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{t("checkout.standardDesc")}</p>
                  {delivery === 'standard' && <div className="absolute top-4 right-4 text-primary"><span className="material-symbols-outlined font-black">check_circle</span></div>}
                </label>
                <label onClick={() => setDelivery('crane')} className={`group relative flex flex-col p-8 bg-surface-container-high border-2 transition-all cursor-pointer rounded-[32px] ${delivery === 'crane' ? 'border-primary shadow-xl shadow-primary/5' : 'border-outline-variant/10 hover:border-primary/30'}`}>
                  <input className="sr-only" name="delivery" type="radio" checked={delivery === 'crane'} readOnly />
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-black text-xl text-on-surface">{t("checkout.craneAssisted")}</span>
                    <span className="bg-primary/10 text-primary font-black px-3 py-1 rounded-lg text-sm">8,500 {t("cart.currency")}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{t("checkout.craneDesc")}</p>
                  {delivery === 'crane' && <div className="absolute top-4 right-4 text-primary"><span className="material-symbols-outlined font-black">check_circle</span></div>}
                </label>
              </div>
            </section>

            <section className="bg-surface-container-low p-8 md:p-10 rounded-[40px] border border-outline-variant/10 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                </div>
                <h2 className="text-3xl font-heading font-black tracking-tight">{t("checkout.paymentMethod")}</h2>
              </div>
              <div className="grid gap-4">
                {[
                  { id: 'card', icon: 'credit_card', title: t("checkout.bankCard"), desc: t("orders.cardDesc") },
                  { id: 'intuit', icon: 'account_balance_wallet', title: t("checkout.intuitPay"), desc: t("orders.intuitDesc") },
                  { id: 'transfer', icon: 'receipt_long', title: t("checkout.bankTransfer"), desc: t("orders.transferDesc") }
                ].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setPayment(item.id)} 
                    className={`flex items-center p-6 bg-surface-container-high border-2 rounded-[28px] cursor-pointer transition-all group ${payment === item.id ? 'border-primary bg-primary/5' : 'border-outline-variant/10 hover:border-primary/30'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 group-hover:scale-110 transition-transform ${payment === item.id ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-primary'}`}>
                      <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="font-black text-lg text-on-surface">{item.title}</div>
                      <div className="text-[10px] text-secondary uppercase font-black tracking-widest mt-0.5">{item.desc}</div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${payment === item.id ? 'border-primary bg-primary shadow-lg shadow-primary/20' : 'border-outline-variant/20'}`}>
                      {payment === item.id && <span className="material-symbols-outlined text-on-primary text-lg font-black">check</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-[40px] overflow-hidden shadow-sm">
              <div className="p-8 bg-surface-container-high/50 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">{t("cart.orderSummary")}</h3>
                <span className="bg-primary text-on-primary font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">{(cart || []).length} {t("cart.items")}</span>
              </div>
              <div className="p-8 space-y-8">
                <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {!(cart && cart.length > 0) ? (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-secondary/20 text-4xl mb-2">shopping_bag</span>
                      <p className="text-sm text-secondary font-bold">{t("cart.empty")}</p>
                    </div>
                  ) : (
                    (cart || []).map((item: any) => (
                      <div key={item?._id} className="flex gap-4 group">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-outline-variant/10 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                          <img 
                            alt={item?.name || 'Product'} 
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                            src={item?.imageUrl} 
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-black leading-tight text-on-surface truncate">{item?.name || t("cart.unknownProduct")}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Qty: {item?.quantity || 1}</span>
                          </div>
                          <div className="text-sm font-black mt-1 text-primary">{(item?.price || 0).toLocaleString()} {t("cart.currency")}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="space-y-4 pt-8 border-t border-outline-variant/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{t("cart.subtotal")}</span>
                    <span className="font-black text-on-surface">{subtotal.toLocaleString()} {t("cart.currency")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{t("cart.vat")}</span>
                    <span className="font-black text-on-surface">{vat.toLocaleString()} {t("cart.currency")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{t("checkout.delivery")}</span>
                    <span className="font-black text-primary">+{deliveryFee.toLocaleString()} {t("cart.currency")}</span>
                  </div>
                  <div className="pt-8 flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-widest text-primary">{t("checkout.totalAmount")}</span>
                      <p className="text-[8px] text-secondary uppercase font-black tracking-widest">{t("checkout.allTaxesIncluded")}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black font-heading text-primary leading-none tracking-tighter">{totalAmount.toLocaleString()}</div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t("cart.currency")}</span>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={(cart || []).length === 0} 
                  type="submit" 
                  className="w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-container text-on-primary font-black py-5 rounded-[24px] shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
                >
                  {t("checkout.placeOrderPay")}
                </button>

              </div>
            </div>
            <p className="mt-8 text-[9px] text-center text-secondary/60 px-6 font-bold leading-relaxed uppercase tracking-widest">
              By placing your order, you agree to InTUIT Market&apos;s <Link className="text-primary hover:underline" href="/terms">{t("footer.terms")}</Link> and <Link className="text-primary hover:underline" href="/privacy">{t("footer.privacy")}</Link>.
            </p>
          </aside>
        </div>
      </form>
    </div>
  );
}
