"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";
import { getLocalized, getProjectSpecs, cleanDescription } from "@/lib/utils";
import Link from "next/link";

interface ProductDetailClientProps {
  project: any;
}

export default function ProductDetailClient({ project }: ProductDetailClientProps) {
  const { t, language } = useTranslation();
  const { addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const name = getLocalized(project, 'name', language);
  const rawDescription = getLocalized(project, 'description', language);
  const description = cleanDescription(rawDescription);
  const imageUrl = project.imageUrl;
  
  const specs = getProjectSpecs(project, t);

  const handleAddToCart = () => {
    addToCart({
      _id: project._id,
      name: name,
      price: project.price || 0,
      imageUrl: imageUrl,
      quantity: 1,
      description: description
    });
    toast.success(t("catalog.addedToCart"));
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen pt-32 pb-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-12">
          <Link href="/products" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t("catalog.allMaterials")}
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Showcase */}
          <div className="space-y-6">
            <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-[40px] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm relative group">
              <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            </div>
          </div>

          {/* Product Specs */}
          <div className="flex flex-col">
            <header className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">ID: {project.slug?.current || project._id?.slice(-8)}</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{name}</h1>
              <div className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-8">
                <div className="mt-4">
                  <p className="leading-relaxed">{description}</p>

                  <div className="mt-3 text-sm space-y-1 opacity-90">
                    <p>
                      <span className="font-medium">{t("materialType")}:</span> Structural
                    </p>
                    <p>
                      <span className="font-medium">{t("standardCompliance")}:</span> GOST Certified Standards
                    </p>
                    <p>
                      <span className="font-medium">{t("primaryUsage")}:</span> {specs.usage}
                    </p>
                    <p>
                      <span className="font-medium">{t("dimensions")}:</span> {specs.dimensions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-3 mb-10 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
                <span className="text-base font-black text-blue-600 dark:text-blue-400">
                  {project.price ? `${project.price.toLocaleString()}` : "POA"}
                </span>
                <span className="text-gray-500 dark:text-gray-400 mb-0.5 font-bold text-xs">{t("cart.currency")}</span>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-600/20 active:scale-95 translate-y-0 hover:-translate-y-1 text-xs"
                >
                  <span className="material-symbols-outlined text-xs">shopping_cart</span>
                  {t("catalog.addToCart")}
                </button>
              </div>
            </header>
          </div>
        </div>
      </div>
    </div>
  );
}
