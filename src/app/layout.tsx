import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { I18nProvider } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://intuitmarket.store'),
  title: "InTUITMarket",
  description: "Premium digital marketplace",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "InTUITMarket",
    description: "Premium digital marketplace",
    url: "https://intuitmarket.store",
    siteName: "InTUITMarket",
    images: [{ 
      url: 'https://intuitmarket.store/og-image.png?v=2', 
      width: 1200, 
      height: 630 
    }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InTUITMarket",
    description: "Premium digital marketplace",
    images: ['https://intuitmarket.store/og-image.png?v=2'],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} font-sans min-h-screen flex flex-col antialiased bg-background text-foreground selection:bg-primary/30 transition-colors duration-300`}
      >
        <I18nProvider>
          <Header />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Toaster position="bottom-right" />
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
