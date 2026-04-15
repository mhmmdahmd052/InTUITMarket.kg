"use client";

import { useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";

export default function NewsletterForm() {
  const { t, language } = useTranslation();
  const validationRefs = useRef<Record<string, { input: HTMLInputElement | null, span: HTMLElement | null }>>({});

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
      return;
    }
    toast.success(t("newsletter.success"));
    form.reset();
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex flex-col">
          <div className="flex bg-surface-container-high rounded-2xl p-1.5 border border-outline-variant/10 focus-within:ring-2 focus-within:ring-primary transition-all shadow-inner relative">
            <input 
              type="email" 
              required
              placeholder={t("newsletter.placeholder")} 
              className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-bold text-on-surface placeholder:text-secondary/50" 
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
            />
          </div>
          <span 
            ref={el => {
              if (!validationRefs.current['email']) validationRefs.current['email'] = { input: null, span: null };
              validationRefs.current['email'].span = el;
            }}
            className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-4 uppercase tracking-widest hidden"
          ></span>
        </div>
        <button 
          type="submit" 
          className="bg-primary text-on-primary px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary-container/40 hover:-translate-y-1 active:scale-95 transition-all whitespace-nowrap h-fit"
        >
          {t("newsletter.subscribe")}
        </button>
      </div>
    </form>
  );
}
