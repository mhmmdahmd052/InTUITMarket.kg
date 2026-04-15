"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/authStore";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

function LoginContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";
  const router = useRouter();
  const { login } = useAuthStore();
  const { t, language } = useTranslation();
  const validationRefs = useRef<Record<string, { input: HTMLInputElement | null, span: HTMLElement | null }>>({});

  useEffect(() => {
    Object.values(validationRefs.current).forEach(({ input, span }) => {
      if (input?.dataset.errorKey && span) {
        span.textContent = t(input.dataset.errorKey);
      }
    });
  }, [language, t]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [mode, setMode] = useState<"login" | "forgot" | "verify">("login");
  const [inputCode, setInputCode] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      return;
    }

    if (mode === "login") {
      const res = await login(email, password);
      if (res.success) {
        toast.success(t("auth.loginSuccess"));
        router.replace(redirectTarget === "null" ? "/" : redirectTarget);
      } else {
        toast.error(t(res.error || "auth.loginFailed"));
      }
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(t("auth.codeSent"));
      router.push(`/reset-password/verify?email=${encodeURIComponent(email)}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 mt-20 p-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black font-heading tracking-tight mb-3 text-on-surface">
              {mode === "login" ? t("auth.welcomeBack") : mode === "forgot" ? t("auth.forgotPasswordTitle") : t("auth.enterCode")}
            </h1>
            <p className="text-secondary font-medium text-sm leading-relaxed px-4">
              {mode === "login" ? t("auth.signInDesc") : mode === "forgot" ? t("auth.forgotPasswordDesc") : t("auth.enterCodeDesc")}
            </p>
          </div>
          
          <form noValidate onSubmit={handleSubmit} className="space-y-8">
            {(mode === "login" || mode === "forgot") && (
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
                      className="w-full bg-surface-container-high border border-outline-variant/10 rounded-[20px] pl-12 pr-6 py-4 text-on-surface font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-secondary/30" 
                      placeholder="procurement@company.kg" 
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
            )}
            
            {mode === "login" && (
              <div className="flex flex-col">
                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary">{t("auth.password")}</label>
                    <button type="button" onClick={() => setMode("forgot")} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline transition-all">{t("auth.forgotPassword")}</button>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors text-xl">lock</span>
                    <input 
                      type="password" 
                      required
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
                      className="w-full bg-surface-container-high border border-outline-variant/10 rounded-[20px] pl-12 pr-6 py-4 text-on-surface font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-secondary/30" 
                      placeholder="••••••••" 
                      autoComplete="current-password"
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
            )}

            {mode === "verify" && (
              <div className="flex flex-col">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary text-center block">{t("auth.sixDigitCode")}</label>
                  <input 
                    type="text" 
                    required
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    ref={el => {
                      if (!validationRefs.current['code']) validationRefs.current['code'] = { input: null, span: null };
                      validationRefs.current['code'].input = el;
                    }}
                    onInvalid={(e) => {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const key = "form.required";
                      input.dataset.errorKey = key;
                      const span = validationRefs.current['code']?.span;
                      if (span) {
                        span.textContent = t(key);
                        span.style.display = 'block';
                      }
                    }}
                    onInput={(e) => {
                      const input = e.currentTarget;
                      input.setCustomValidity("");
                      delete input.dataset.errorKey;
                      const span = validationRefs.current['code']?.span;
                      if (span) span.style.display = 'none';
                    }}
                    className="w-full bg-surface-container-high border-2 border-primary/20 rounded-[24px] px-4 py-6 text-primary tracking-[0.5em] text-center text-3xl font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                    placeholder="000000" 
                    maxLength={6}
                  />
                  <span 
                    ref={el => {
                      if (!validationRefs.current['code']) validationRefs.current['code'] = { input: null, span: null };
                      validationRefs.current['code'].span = el;
                    }}
                    className="error-msg text-[10px] font-bold text-red-500 mt-2 text-center uppercase tracking-widest hidden"
                  ></span>
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-primary text-on-primary font-black py-5 rounded-[24px] shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs mt-2">
              {mode === "login" ? t("auth.login") : mode === "forgot" ? t("auth.sendCode") : t("auth.verifyCode")}
            </button>
            
            {mode !== "login" && (
              <button type="button" onClick={() => setMode("login")} className="w-full bg-surface-container-highest text-on-surface font-black py-5 rounded-[24px] border border-outline-variant/10 hover:bg-surface-container active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs">
                {t("auth.backToLogin")}
              </button>
            )}
          </form>

          {mode === "login" && (
            <div className="mt-12 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
                {t("auth.newToIntuit")} <Link href="/register" className="text-primary hover:underline ml-1">{t("auth.createAccount")}</Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
