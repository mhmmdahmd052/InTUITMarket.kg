"use client";

import { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import toast from 'react-hot-toast';
import ToastButton from '@/components/ToastButton';
import { useTranslation } from "@/lib/i18n";

export default function SupportPage() {
  const { t, language } = useTranslation();
  const validationRefs = useRef<Record<string, { input: HTMLInputElement | HTMLTextAreaElement | null, span: HTMLElement | null }>>({});

  useEffect(() => {
    Object.values(validationRefs.current).forEach(({ input, span }) => {
      if (input?.dataset.errorKey && span) {
        span.textContent = t(input.dataset.errorKey);
      }
    });
  }, [language, t]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    toast.success(t("support.successMessage"));
    form.reset();
  };

  const faqs = [
    { q: t("support.faq1Q"), a: t("support.faq1A") },
    { q: t("support.faq2Q"), a: t("support.faq2A") },
    { q: t("support.faq3Q"), a: t("support.faq3A") },
    { q: t("support.faq4Q"), a: t("support.faq4A") }
  ];

  const handleInvalid = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const input = e.currentTarget;
    if (input.validity.valueMissing) {
      input.setCustomValidity(t("form.required"));
    } else if (input.validity.typeMismatch) {
      input.setCustomValidity(t("form.invalidEmail"));
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.setCustomValidity("");
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-32 pb-24 px-8 flex flex-col justify-between">
      <main className="max-w-7xl mx-auto w-full flex-grow">
        <header className="mb-20 text-center lg:text-left">
          <h1 className="font-heading text-6xl md:text-8xl font-extrabold tracking-tighter text-on-surface leading-[0.8] mb-6">
            {t("support.getInTouch").split('.')[0]}<span className="text-primary">.</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl font-medium mx-auto lg:mx-0">
            {t("support.description")}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="lg:col-span-1 space-y-12">
            <section className="bg-surface-container-low border border-outline-variant/10 p-8 md:p-12 rounded-[40px] shadow-sm">
              <form noValidate onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">{t("support.fullName")}</label>
                      <input 
                        required 
                        type="text"
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
                        className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30 text-on-surface" 
                        placeholder={t("support.fullNamePlaceholder")} 
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">{t("support.emailAddress")}</label>
                      <input 
                        required 
                        type="email"
                        ref={el => {
                          if (!validationRefs.current['email']) validationRefs.current['email'] = { input: null, span: null };
                          validationRefs.current['email'].input = el;
                        }}
                        onInvalid={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const key = input.validity.valueMissing ? "form.required" : "form.invalidEmail";
                          input.dataset.errorKey = key;
                          const span = validationRefs.current['email']?.span;
                          if (span) {
                            span.textContent = t(key);
                            span.style.display = 'block';
                          }
                        }}
                        onInput={(e) => {
                          const input = e.currentTarget;
                          input.setCustomValidity("");
                          delete input.dataset.errorKey;
                          const span = validationRefs.current['email']?.span;
                          if (span) span.style.display = 'none';
                        }}
                        className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30 text-on-surface" 
                        placeholder={t("support.emailPlaceholder")} 
                      />
                    </div>
                    <span 
                      ref={el => {
                        if (!validationRefs.current['email']) validationRefs.current['email'] = { input: null, span: null };
                        validationRefs.current['email'].span = el;
                      }}
                      className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-widest hidden"
                    ></span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">{t("support.projectInquiry")}</label>
                    <textarea 
                      required 
                      rows={6}
                      ref={el => {
                        if (!validationRefs.current['message']) validationRefs.current['message'] = { input: null, span: null };
                        validationRefs.current['message'].input = el;
                      }}
                      onInvalid={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const key = "form.required";
                        input.dataset.errorKey = key;
                        const span = validationRefs.current['message']?.span;
                        if (span) {
                          span.textContent = t(key);
                          span.style.display = 'block';
                        }
                      }}
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.setCustomValidity("");
                        delete input.dataset.errorKey;
                        const span = validationRefs.current['message']?.span;
                        if (span) span.style.display = 'none';
                      }}
                      className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30 text-on-surface resize-none" 
                      placeholder={t("support.messagePlaceholder")} 
                    />
                  </div>
                  <span 
                    ref={el => {
                      if (!validationRefs.current['message']) validationRefs.current['message'] = { input: null, span: null };
                      validationRefs.current['message'].span = el;
                    }}
                    className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-widest hidden"
                  ></span>
                </div>

                <button type="submit" className="w-full bg-primary text-on-primary font-black py-5 rounded-2xl text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-widest">
                  {t("support.sendMessage")}
                </button>
              </form>
            </section>

            <section>
               <h3 className="text-2xl font-black font-heading mb-8">{t("support.faqTitle")}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {faqs.map((faq, i) => (
                    <div key={i} className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl">
                       <h4 className="font-bold text-on-surface mb-2">{faq.q}</h4>
                       <p className="text-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="relative group h-64 w-full bg-surface-container-highest rounded-3xl overflow-hidden shadow-sm">
              <iframe 
                className="w-full h-full border-0 transition-opacity duration-300" 
                src="https://maps.google.com/maps?q=International+University+of+Innovation,+Bishkek&t=k&z=17&ie=UTF8&iwloc=&output=embed"
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0}
                title="Headquarters Location"
              ></iframe>
              <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur px-4 py-3 rounded-xl text-xs font-bold font-heading tracking-tight text-on-surface shadow-md pointer-events-none border border-outline-variant/20">
                {t("support.address")}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-surface-container-low p-6 rounded-2xl flex items-start gap-4 border border-outline-variant/20 hover:border-primary/30 transition-colors">
                <span className="material-symbols-outlined text-primary">apartment</span>
                <div>
                  <h4 className="font-heading font-extrabold text-sm tracking-tighter uppercase">{t("support.headquarters")}</h4>
                  <p className="text-sm text-on-surface-variant font-medium mt-1 whitespace-pre-line">{t("support.address")}</p>
                </div>
              </div>
              <div className="bg-surface-container-low p-6 rounded-2xl flex items-start gap-4 border border-outline-variant/20 hover:border-primary/30 transition-colors">
                <span className="material-symbols-outlined text-primary">support_agent</span>
                <div>
                  <h4 className="font-heading font-extrabold text-sm tracking-tighter uppercase">{t("support.operatingHours")}</h4>
                  <p className="text-sm text-on-surface-variant font-medium mt-1 uppercase tracking-tight">{t("support.hours")}</p>
                </div>
              </div>
              <div className="bg-surface-container-low p-6 rounded-2xl flex items-start gap-4 border border-outline-variant/20 hover:border-primary/30 transition-colors">
                <span className="material-symbols-outlined text-primary">call</span>
                <div>
                  <h4 className="font-heading font-extrabold text-sm tracking-tighter uppercase">{t("support.directLine")}</h4>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">+996 (123) 456-789</p>
                  <p className="text-sm text-on-surface-variant font-medium">support@intuitmarket.kg</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 justify-center lg:justify-start">
              <ToastButton message="Loading analytics..." className="w-14 h-14 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center hover:bg-primary hover:text-on-primary hover:-translate-y-1 transition-all duration-300">
                <span className="material-symbols-outlined">social_leaderboard</span>
              </ToastButton>
              <ToastButton message="Opening media gallery..." className="w-14 h-14 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center hover:bg-primary hover:text-on-primary hover:-translate-y-1 transition-all duration-300">
                <span className="material-symbols-outlined">photo_camera</span>
              </ToastButton>
              <ToastButton message="Launching email client..." className="w-14 h-14 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center hover:bg-primary hover:text-on-primary hover:-translate-y-1 transition-all duration-300">
                <span className="material-symbols-outlined">alternate_email</span>
              </ToastButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
