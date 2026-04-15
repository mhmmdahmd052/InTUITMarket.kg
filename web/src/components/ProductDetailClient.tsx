"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";
import { getLocalized } from "@/lib/utils";
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
  const description = getLocalized(project, 'description', language);
  const imageUrl = project.imageUrl;

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
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-8">{description}</p>
              
              <div className="flex items-end gap-3 mb-10 p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
                <span className="text-4xl font-black text-blue-600 dark:text-blue-400">
                  {project.price ? `${project.price.toLocaleString()}` : "POA"}
                </span>
                <span className="text-gray-500 dark:text-gray-400 mb-1 font-bold text-sm">{t("cart.currency")}</span>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-600/20 active:scale-95 translate-y-0 hover:-translate-y-1 text-xs"
                >
                  <span className="material-symbols-outlined text-xs">shopping_cart</span>
                  {t("catalog.addToCart")}
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">verified</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{t("catalog.isoQuality")}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">local_shipping</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{t("catalog.fastShipping")}</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="mt-auto pt-10 border-t border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-6">{t("catalog.technicalProfile")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t("catalog.materialType")}</span>
                    <span className="font-bold">{t("catalog.structural")}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t("catalog.standardCompliance")}</span>
                    <span className="font-bold">{t("catalog.gostCertified")}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t("catalog.primaryUsage")}</span>
                    <span className="font-bold">{t("catalog.construction")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
