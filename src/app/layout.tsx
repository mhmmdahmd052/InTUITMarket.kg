import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InTUITMarket",
  description: "Next Generation Asset Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} font-sans min-h-screen flex flex-col antialiased bg-background text-on-surface selection:bg-primary/30 transition-colors duration-300`} >
        <I18nProvider>
          <Header />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: 'bg-surface-container text-on-surface border border-outline-variant rounded-xl',
              duration: 4000,
            }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
