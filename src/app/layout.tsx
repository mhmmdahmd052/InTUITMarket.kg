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
  title: "InTUITMarket - Premium Digital Marketplace",
  description: "Experience excellence with InTUITMarket. Premium high-end architectural and engineering supplies.",
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: "InTUITMarket",
    description: "Premium digital marketplace for high-end supplies.",
    url: "https://intuitmarket.store",
    siteName: "InTUITMarket",
    images: [{ url: 'https://intuitmarket.store/logo.png', width: 600, height: 600 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InTUITMarket",
    description: "Premium digital marketplace",
    images: ['https://intuitmarket.store/logo.png'],
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
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} font-sans min-h-screen flex flex-col antialiased bg-background text-on-surface selection:bg-primary/30 transition-colors duration-300`}
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
