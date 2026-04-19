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

  return (
    <div className="flex flex-col">
      {/* Hero Section - FIXED DEFENSIVE */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white uppercase italic">
            InTUIT.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 font-medium max-w-2xl mx-auto">
            Industrial and Construction Materials
          </p>
          <div className="flex justify-center">
            <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all">
              Catalog
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-black mb-12 text-gray-900 dark:text-gray-100 italic">
          Featured
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {projects && projects.map((project: any) => (
            <div key={project?._id || Math.random()} className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-[40px] p-6 border border-gray-100 dark:border-gray-700">
              <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden mb-8 bg-white dark:bg-gray-900">
                {/* SAFE IMAGE RENDER */}
                {project?.imageUrl ? (
                  <img 
                    src={project.imageUrl} 
                    alt="product"
                    className="w-full h-full object-cover" 
                  />
                ) : null}
                
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-2xl shadow-lg border border-white/20">
                  <span className="text-blue-600 dark:text-blue-400 font-black text-sm">
                    {/* SAFE PRICE RENDER */}
                    {typeof project?.price === "number" ? project.price : ""}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <h3 className="text-base font-bold mb-4 line-clamp-2 text-gray-900 dark:text-gray-100">
                  {/* SAFE NAME RENDER */}
                  {project?.name || ""}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 line-clamp-2">
                  {project?.description || ""}
                </p>
                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => {
                      if (!project) return;
                      const name = project?.name || "";
                      const desc = project?.description || "";
                      addToCart({
                        _id: project?._id || "",
                        name: name,
                        price: typeof project?.price === "number" ? project.price : 0,
                        imageUrl: project?.imageUrl || "",
                        quantity: 1,
                        description: desc
                      });
                      toast.success(t("catalog.addedToCart"));
                    }}
                    className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold uppercase tracking-widest text-xs"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
