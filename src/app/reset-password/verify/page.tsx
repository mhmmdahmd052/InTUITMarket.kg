"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { t } = useTranslation();

  const [otp, setOtp] = useState("");
  const [mounted, setMounted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    setMounted(true);
    if (!email) {
      toast.error(t("auth.invalidResetSession"));
      router.replace("/login");
    }
  }, [email, router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      toast.error(t(error.message));
    } else {
      toast.success(t("auth.codeVerified"));
      router.replace("/reset-password/new");
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      toast.error(t(error.message));
    } else {
      toast.success(t("auth.codeSent"));
      setResendCooldown(60);
    }
  };

  if (!mounted || !email) {
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
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-black font-heading tracking-tighter text-on-surface mb-2">
              {t("auth.enterCode")}
            </h1>
            <p className="text-secondary font-medium text-sm leading-relaxed px-4">
              {t("auth.enterCodeDesc")}
            </p>
          </header>

          <form noValidate onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col">
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-surface-container-high border-2 border-primary/20 rounded-[24px] px-4 py-6 text-primary tracking-[0.5em] text-center text-3xl font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="CODE"
                  inputMode="numeric"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-black py-5 rounded-2xl text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-[0.2em]"
            >
              {t("auth.verifyCode")}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="w-full text-primary font-bold py-3 text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {resendCooldown > 0
                ? t("auth.resendCodeWait").replace("{seconds}", String(resendCooldown))
                : t("auth.resendCode")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
