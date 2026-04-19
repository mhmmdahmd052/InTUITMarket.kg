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

export default function HomeContent({ projects: initialProjects }: HomeContentProps) {
  const { t, language } = useTranslation();
  const { addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    if (Array.isArray(initialProjects)) {
      setProjects(initialProjects.slice(0, 4));
    }
  }, [initialProjects]);

  if (!mounted) return null;

  try {
    return (
      <div className="flex flex-col">
        {/* Hero Section - FIXED DEFENSIVE */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gray-900">
          <div className="absolute inset-0 z-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" 
              alt="Hero" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            {/* NO STRING SPLITTING LOGIC */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white uppercase italic">
              InTUIT.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 font-medium max-w-2xl mx-auto">
              Marketplace for Industry and Construction Materials
            </p>
            <div className="flex justify-center">
              <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-105">
                View Catalog
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Projects Grid */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
          <header className="mb-20">
            <h2 className="text-4xl font-black mb-4 tracking-tight text-gray-900 dark:text-gray-100 italic">
              Featured Materials
            </h2>
            <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {projects && projects.map((project: any) => (
              <div key={project?._id || Math.random()} className="group flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border border-gray-100 dark:border-gray-700/50 p-6 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden mb-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  {/* SAFE IMAGE RENDER */}
                  {project?.imageUrl ? (
                    <img 
                      src={project.imageUrl} 
                      alt="product"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : null}
                  
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20">
                    <span className="text-blue-600 dark:text-blue-400 font-black text-sm">
                      {/* SAFE PRICE RENDER - PREVENT OBJECT AS CHILD */}
                      {typeof project?.price === "number" ? project.price : ""}
                    </span>
                    <span className="text-[10px] text-gray-500 font-black ml-1 uppercase">{t("cart.currency")}</span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 px-2">
                  <h3 className="text-base font-bold mb-4 line-clamp-2 leading-snug text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                    {/* SAFE NAME RENDER */}
                    {getLocalized(project, 'name', language) || project?.name || ""}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 line-clamp-2 leading-relaxed h-10">
                    {/* SAFE DESCRIPTION RENDER */}
                    {getLocalized(project, 'description', language) || project?.description || ""}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button 
                      onClick={() => {
                        if (!project?._id) return;
                        const name = getLocalized(project, 'name', language) || project?.name || "";
                        const desc = getLocalized(project, 'description', language) || project?.description || "";
                        
                        addToCart({
                          _id: project._id,
                          name: name,
                          price: typeof project?.price === "number" ? project.price : 0,
                          imageUrl: project?.imageUrl || "",
                          quantity: 1,
                          description: desc
                        });
                        toast.success(t("catalog.addedToCart"));
                      }}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">shopping_cart</span>
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  } catch (componentError) {
    console.error("HomeContent Render Crash:", componentError);
    return (
      <div className="p-20 text-center bg-gray-900 text-red-500 rounded-3xl m-10 border border-red-500/20">
        <h2 className="text-2xl font-black mb-4 uppercase">Component Rendering Error</h2>
        <pre className="text-xs text-gray-400">{String(componentError)}</pre>
      </div>
    );
  }
}
