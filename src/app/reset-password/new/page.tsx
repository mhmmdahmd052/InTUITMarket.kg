"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/authStore";

export default function NewPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t("auth.invalidResetSession"));
        router.replace("/login");
      }
    };
    checkSession();
  }, [router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("auth.passwordsMustMatch"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("auth.passwordAtLeast6"));
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error(t(error.message));
      } else {
        toast.success(t("auth.resetSuccess"));
        // Finalize logout to force the user to log in with new credentials
        await supabase.auth.signOut();
        useAuthStore.setState({ isAuthenticated: false, user: null });
        router.replace("/login");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full -ml-48 -mb-48 blur-3xl opacity-50"></div>
        
        <div className="w-full max-w-md bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/10 shadow-2xl relative z-10">
          <header className="mb-10">
            <h1 className="text-4xl font-black font-heading tracking-tighter text-on-surface mb-2">
              {t("auth.resetPasswordTitle")}
            </h1>
            <p className="text-secondary font-medium text-sm leading-relaxed">
              {t("auth.resetPasswordDesc").replace("{email}", "your account")}
            </p>
          </header>
          
          <form noValidate onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">
                  {t("auth.newPassword")}
                </label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-4 text-on-surface font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">
                  {t("auth.confirmPassword")}
                </label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-4 text-on-surface font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-secondary/30" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-primary text-on-primary font-black py-5 rounded-2xl text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all">
              {t("auth.saveNewPassword")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
