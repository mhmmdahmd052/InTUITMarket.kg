"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/authStore";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

function RegisterContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";
  const router = useRouter();
  const { register } = useAuthStore();
  const { t, language } = useTranslation();
  const validationRefs = useRef<Record<string, { input: HTMLInputElement | null, span: HTMLElement | null }>>({});

  useEffect(() => {
    Object.values(validationRefs.current).forEach(({ input, span }) => {
      if (input?.dataset.errorKey && span) {
        span.textContent = t(input.dataset.errorKey);
      }
    });
  }, [language, t]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      return;
    }

    const res = await register({ name, email, password });
    if (res.success) {
      toast.success(t("auth.registerSuccess"));
      router.replace(redirectTarget);
    } else {
      toast.error(t(res.error || "auth.registerFailed"));
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 mt-20 p-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black font-heading tracking-tight mb-3 text-on-surface">{t("auth.registerTitle")}</h1>
            <p className="text-secondary font-medium text-sm leading-relaxed px-4">{t("auth.registerDesc")}</p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">{t("auth.fullName")}</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors text-xl">person</span>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  ref={el => {
                    if (!validationRefs.current['name']) validationRefs.current['name'] = { input: null, span: null };
                    validationRefs.current['name'].input = el;
                  }}
                  onInvalid={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget;
                    const key = "form.required";
                    input.dataset.errorKey = key;
                    const span = validationRefs.current['name']?.span;
                    if (span) {
                      span.textContent = t(key);
                      span.style.display = 'block';
                    }
                  }}
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.setCustomValidity("");
                    delete input.dataset.errorKey;
                    const span = validationRefs.current['name']?.span;
                    if (span) span.style.display = 'none';
                  }}
                  className="w-full bg-surface-container-high border border-outline-variant/10 rounded-[20px] pl-12 pr-6 py-4 text-on-surface font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30" 
                  placeholder={t("orders.namePlaceholder")} 
                  autoComplete="name"
                />
              </div>
              <span 
                ref={el => {
                  if (!validationRefs.current['name']) validationRefs.current['name'] = { input: null, span: null };
                  validationRefs.current['name'].span = el;
                }}
                className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-widest hidden"
              ></span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">{t("auth.emailAddress")}</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors text-xl">mail</span>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  className="w-full bg-surface-container-high border border-outline-variant/10 rounded-[20px] pl-12 pr-6 py-4 text-on-surface font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30" 
                  placeholder="marat@intuit.kg" 
                  autoComplete="email"
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
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">{t("auth.password")}</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors text-xl">lock</span>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  ref={el => {
                    if (!validationRefs.current['password']) validationRefs.current['password'] = { input: null, span: null };
                    validationRefs.current['password'].input = el;
                  }}
                  onInvalid={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget;
                    const key = "form.required";
                    input.dataset.errorKey = key;
                    const span = validationRefs.current['password']?.span;
                    if (span) {
                      span.textContent = t(key);
                      span.style.display = 'block';
                    }
                  }}
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.setCustomValidity("");
                    delete input.dataset.errorKey;
                    const span = validationRefs.current['password']?.span;
                    if (span) span.style.display = 'none';
                  }}
                  className="w-full bg-surface-container-high border border-outline-variant/10 rounded-[20px] pl-12 pr-6 py-4 text-on-surface font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30" 
                  placeholder="••••••••" 
                  autoComplete="new-password"
                />
              </div>
              <span 
                ref={el => {
                  if (!validationRefs.current['password']) validationRefs.current['password'] = { input: null, span: null };
                  validationRefs.current['password'].span = el;
                }}
                className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-widest hidden"
              ></span>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary text-on-primary font-black py-5 rounded-[24px] mt-4 shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs">
              {t("auth.registerSecurely")}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
              {t("auth.alreadyHaveAccount")} <Link href="/login" className="text-primary hover:underline ml-1">{t("auth.logIn")}</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
