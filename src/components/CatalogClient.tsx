"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { getLocalized } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface CatalogClientProps {
  initialProjects: any[];
  initialQuery?: string;
}

export default function CatalogClient({ initialProjects, initialQuery = "" }: CatalogClientProps) {
  const { t, language } = useTranslation();
  const { addToCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { id: "all", label: t("catalog.allMaterials") },
    { id: "cement", label: t("catalog.cement") },
    { id: "bricks", label: t("catalog.bricks") },
    { id: "steel", label: t("catalog.steel") },
    { id: "paint", label: t("catalog.paint") },
    { id: "tools", label: t("catalog.tools") }
  ];

  const filteredProjects = useMemo(() => {
    return initialProjects.filter(project => {
      const name = getLocalized(project, 'name', language).toLowerCase().trim();
      const desc = getLocalized(project, 'description', language).toLowerCase().trim();
      const slug = (project.slug?.current || "").toLowerCase().trim();
      const id = (project._id || "").toLowerCase().trim();
      const query = searchQuery.toLowerCase().trim();
      
      if (!query) return selectedCategory === "all" || project.category === selectedCategory;

      const keywords = query.split(/\s+/);
      const matchesSearch = keywords.every(word => 
        name.includes(word) || 
        desc.includes(word) || 
        slug.includes(word) || 
        id.includes(word) ||
        (project._id === query) // Exact ID support
      );
      
      const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [initialProjects, searchQuery, selectedCategory, language]);

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">{t("catalog.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">{t("catalog.matchingCount")} ({filteredProjects.length})</p>
        </div>
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <form noValidate>
            <input 
              type="text"
              placeholder={t("catalog.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
            />
          </form>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 mb-12">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-3 rounded-xl font-bold transition-all text-sm tracking-wide ${
              selectedCategory === cat.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      
      {filteredProjects.length === 0 && searchQuery !== '' && (
        <div className="py-20 text-center col-span-full">
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">{t("catalog.noProductsFound")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProjects.map(project => {
          const name = getLocalized(project, 'name', language);
          const imgUrl = project.imageUrl;

          return (
            <div key={project._id} className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-500">
              <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                <img src={imgUrl} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold line-clamp-2 leading-snug flex-1 pr-2 text-gray-900 dark:text-gray-100">{name}</h3>
                  <span className="text-blue-600 dark:text-blue-400 font-black text-sm whitespace-nowrap">
                    {project.price ? `${project.price.toLocaleString()}` : "POA"} {t("cart.currency")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 h-10">{getLocalized(project, 'description', language)}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      addToCart({
                        _id: project._id,
                        name: name,
                        price: project.price || 0,
                        imageUrl: imgUrl,
                        quantity: 1,
                        description: getLocalized(project, 'description', language)
                      });
                      toast.success(t("catalog.addedToCart"));
                    }}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-sm leading-none"
                  >
                    <span className="material-symbols-outlined text-xs">shopping_cart</span>
                  </button>
                  <Link href={`/products/${project._id}`} className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-bold uppercase tracking-widest text-xs text-gray-900 dark:text-gray-100 transition-all border border-transparent px-3 py-1.5 flex items-center justify-center gap-2 leading-none">
                    {t("catalog.details")}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
