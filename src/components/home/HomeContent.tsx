"use client";

import { useTranslation } from "@/lib/i18n";
import { getLocalized } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

interface HomeContentProps {
  projects: any[];
}

export default function HomeContent({ projects }: HomeContentProps) {
  const { t, language } = useTranslation();
  const { addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0 opacity-60">
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" 
            alt="Industrial Background" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-900"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mb-20">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none text-white">
            {t("home.title").split(".")[0]}<span className="text-blue-500">.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
            {t("home.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/30 hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-widest">
              {t("home.exploreCatalog")}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Floating Stat Bar */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 hidden md:block">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 grid grid-cols-3 gap-8 text-white shadow-2xl">
            <div className="text-center group">
              <div className="text-4xl font-black mb-1 group-hover:text-blue-400 transition-colors">50+</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Construction Categories</div>
            </div>
            <div className="text-center border-x border-white/10 group">
              <div className="text-4xl font-black mb-1 group-hover:text-blue-400 transition-colors">24h</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Fast Delivery Service</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-black mb-1 group-hover:text-blue-400 transition-colors">99%</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Quality Compliance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Featured Grid */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-gray-900 dark:text-gray-100 italic">
              {t("home.featuredTitle")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed">
              {t("home.featuredSubtitle")}
            </p>
          </div>
          <Link href="/products" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline mb-2 transition-all">
            {t("home.viewAll")}
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {projects.map((project) => {
            const name = getLocalized(project, 'name', language);
            const desc = getLocalized(project, 'description', language);
            
            return (
              <div key={project._id} className="group flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border border-gray-100 dark:border-gray-700/50 p-6 transition-all duration-700 hover:shadow-2xl hover:shadow-blue-600/5 hover:-translate-y-2">
                <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden mb-8 bg-white dark:bg-gray-900 shadow-inner">
                  <img 
                    src={project.imageUrl} 
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50">
                    <span className="text-blue-600 dark:text-blue-400 font-black text-sm">
                      {project.price ? `${project.price.toLocaleString()}` : "POA"}
                    </span>
                    <span className="text-[10px] text-gray-500 font-black ml-1 uppercase">{t("cart.currency")}</span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 px-2">
                  <h3 className="text-base font-bold mb-4 line-clamp-2 leading-snug text-gray-900 dark:text-gray-100">{name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 line-clamp-2 leading-relaxed h-10">{desc}</p>
                                     <div className="mt-auto grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => {
                          addToCart({
                            _id: project._id,
                            name: name,
                            price: project.price || 0,
                            imageUrl: project.imageUrl,
                            quantity: 1,
                            description: desc
                          });
                          toast.success(t("catalog.addedToCart"));
                        }}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-sm leading-none"
                      >
                        <span className="material-symbols-outlined text-xs">shopping_cart</span>
                      </button>
                      <Link 
                        href={`/products/${project._id}`}
                        className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-bold uppercase tracking-widest text-xs text-gray-900 dark:text-gray-100 transition-all border border-transparent px-3 py-1.5 flex items-center justify-center gap-2 leading-none"
                      >
                        {t("catalog.details")}
                      </Link>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
