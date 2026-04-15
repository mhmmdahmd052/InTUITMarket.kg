"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/authStore";
import { useThemeStore } from "@/lib/themeStore";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile, logout } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useThemeStore();
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize theme application
    const stored = localStorage.getItem('intuit-theme');
    if (stored) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(stored);
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, router, mounted]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Apply theme when it changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('intuit-theme', theme);
    }
  }, [theme, mounted]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary font-bold text-lg">{t("settings.loadingSettings")}</p>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      return;
    }
    const res = await updateProfile({ name, email });
    if (res.success) {
      toast.success(t("settings.profileUpdated"));
    } else {
      toast.error(t(res.error || "Update failed"));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.newPasswordMismatch"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("settings.passwordShort"));
      return;
    }
    
    // Supabase handles password updates via updateUser
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast.error(t(error.message));
    } else {
      toast.success(t("settings.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(t("settings.loggedOut"));
    router.push("/");
  };

  return (
    <ProtectedLayout>
      <div className="bg-background text-on-surface min-h-screen pt-28 pb-20 px-4 md:px-8 transition-colors duration-300">
        <main className="max-w-3xl mx-auto w-full space-y-12">
          <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 border-b border-outline-variant/10 pb-10">
            <div>
              <h1 className="text-5xl font-black font-heading tracking-tighter text-on-surface mb-2">
                {t("settings.accountSettings")}
              </h1>
              <p className="text-secondary font-medium">Manage your professional credentials and preferences</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-6 py-2.5 bg-error/10 text-error rounded-xl text-sm font-bold hover:bg-error hover:text-on-error transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              {t("header.logout")}
            </button>
          </header>

          <div className="grid gap-8">
            <section className="bg-surface-container-low p-8 md:p-10 rounded-[40px] border border-outline-variant/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:scale-150 duration-700"></div>
              
              <h2 className="text-2xl font-black font-heading mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">person</span>
                {t("settings.accountInformation")}
              </h2>
              <form noValidate onSubmit={handleProfileUpdate} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">{t("settings.fullName")}</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
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
                        className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30 text-on-surface" 
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

                  <div className="flex flex-col">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">{t("settings.emailAddress")}</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
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
                <button type="submit" className="w-full bg-primary text-on-primary font-black py-4 rounded-2xl text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95">
                  {t("settings.saveProfile")}
                </button>
              </form>
            </section>

            {/* NEW THEME SELECTOR SECTION */}
            <section className="bg-surface-container-low p-8 md:p-10 rounded-[40px] border border-outline-variant/10 shadow-sm">
              <h2 className="text-2xl font-black font-heading mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">dark_mode</span>
                {t("settings.theme") || "Preferred Theme"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-4 p-8 rounded-[32px] border-2 transition-all active:scale-95 ${theme === 'light' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-outline-variant/10 hover:border-primary/30'}`}
                >
                  <span className="material-symbols-outlined text-4xl text-primary">light_mode</span>
                  <span className="font-black uppercase tracking-widest text-xs">{t("settings.light")}</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-4 p-8 rounded-[32px] border-2 transition-all active:scale-95 ${theme === 'dark' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-outline-variant/10 hover:border-primary/30'}`}
                >
                  <span className="material-symbols-outlined text-4xl text-primary">dark_mode</span>
                  <span className="font-black uppercase tracking-widest text-xs">{t("settings.dark")}</span>
                </button>
              </div>
            </section>

            <section className="bg-surface-container-low p-8 md:p-10 rounded-[40px] border border-outline-variant/10 shadow-sm">
              <h2 className="text-2xl font-black font-heading mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">translate</span>
                {t("settings.language")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {[
                   { id: "en", label: t("settings.english") },
                   { id: "ar", label: t("settings.arabic") },
                   { id: "ru", label: t("settings.russian") }
                 ].map(lang => (
                   <button 
                      key={lang.id}
                      onClick={() => setLanguage(lang.id as any)}
                      className={`group relative overflow-hidden py-4 rounded-2xl font-black text-sm border-2 transition-all active:scale-95 ${language === lang.id ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' : 'border-outline-variant/10 hover:border-primary/30 text-secondary'}`}
                   >
                      {lang.label}
                      {language === lang.id && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      )}
                   </button>
                 ))}
              </div>
            </section>

            <section className="bg-surface-container-low p-8 md:p-10 rounded-[40px] border border-outline-variant/10 shadow-sm relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16 blur-3xl transition-all group-hover:scale-150 duration-700"></div>
              
              <h2 className="text-2xl font-black font-heading mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">key</span>
                {t("settings.changePassword")}
              </h2>
              <form noValidate onSubmit={handlePasswordChange} className="space-y-6 relative z-10">
                <div className="flex flex-col">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">{t("settings.currentPassword")}</label>
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      required 
                      ref={el => {
                        if (!validationRefs.current['currentPassword']) validationRefs.current['currentPassword'] = { input: null, span: null };
                        validationRefs.current['currentPassword'].input = el;
                      }}
                      onInvalid={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const key = "form.required";
                        input.dataset.errorKey = key;
                        const span = validationRefs.current['currentPassword']?.span;
                        if (span) {
                          span.textContent = t(key);
                          span.style.display = 'block';
                        }
                      }}
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.setCustomValidity("");
                        delete input.dataset.errorKey;
                        const span = validationRefs.current['currentPassword']?.span;
                        if (span) span.style.display = 'none';
                      }}
                      className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-on-surface" 
                    />
                  </div>
                  <span 
                    ref={el => {
                      if (!validationRefs.current['currentPassword']) validationRefs.current['currentPassword'] = { input: null, span: null };
                      validationRefs.current['currentPassword'].span = el;
                    }}
                    className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-widest hidden"
                  ></span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">{t("settings.newPassword")}</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                        minLength={6}
                        ref={el => {
                          if (!validationRefs.current['newPassword']) validationRefs.current['newPassword'] = { input: null, span: null };
                          validationRefs.current['newPassword'].input = el;
                        }}
                        onInvalid={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const key = "form.required";
                          input.dataset.errorKey = key;
                          const span = validationRefs.current['newPassword']?.span;
                          if (span) {
                            span.textContent = t(key);
                            span.style.display = 'block';
                          }
                        }}
                        onInput={(e) => {
                          const input = e.currentTarget;
                          input.setCustomValidity("");
                          delete input.dataset.errorKey;
                          const span = validationRefs.current['newPassword']?.span;
                          if (span) span.style.display = 'none';
                        }}
                        className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-on-surface" 
                      />
                    </div>
                    <span 
                      ref={el => {
                        if (!validationRefs.current['newPassword']) validationRefs.current['newPassword'] = { input: null, span: null };
                        validationRefs.current['newPassword'].span = el;
                      }}
                      className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-widest hidden"
                    ></span>
                  </div>

                  <div className="flex flex-col">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">{t("settings.confirmNewPassword")}</label>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        minLength={6}
                        ref={el => {
                          if (!validationRefs.current['confirmPassword']) validationRefs.current['confirmPassword'] = { input: null, span: null };
                          validationRefs.current['confirmPassword'].input = el;
                        }}
                        onInvalid={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const key = "form.required";
                          input.dataset.errorKey = key;
                          const span = validationRefs.current['confirmPassword']?.span;
                          if (span) {
                            span.textContent = t(key);
                            span.style.display = 'block';
                          }
                        }}
                        onInput={(e) => {
                          const input = e.currentTarget;
                          input.setCustomValidity("");
                          delete input.dataset.errorKey;
                          const span = validationRefs.current['confirmPassword']?.span;
                          if (span) span.style.display = 'none';
                        }}
                        className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-on-surface" 
                      />
                    </div>
                    <span 
                      ref={el => {
                        if (!validationRefs.current['confirmPassword']) validationRefs.current['confirmPassword'] = { input: null, span: null };
                        validationRefs.current['confirmPassword'].span = el;
                      }}
                      className="error-msg text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-widest hidden"
                    ></span>
                  </div>
                </div>
                <button type="submit" className="w-full bg-surface-container-highest text-on-surface font-black py-4 rounded-2xl text-sm hover:bg-primary hover:text-on-primary hover:shadow-xl transition-all active:scale-95 border border-outline-variant/10">
                  {t("settings.updatePassword")}
                </button>
              </form>
            </section>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
