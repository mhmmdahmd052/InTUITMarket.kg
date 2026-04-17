"use client";

import { useCartStore } from "@/lib/store";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

interface AddToCartButtonProps {
  project: {
    _id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string | null;
  };
  fallbackImage: string;
}

export default function AddToCartButton({ project, fallbackImage }: AddToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [added, setAdded] = useState(false);
  const { t } = useTranslation();

  const handleAdd = () => {
    addToCart({
      _id: project._id,
      name: project.name,
      price: project.price || 0,
      description: project.description,
      imageUrl: project.imageUrl || fallbackImage,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button 
      onClick={handleAdd}
      className={`w-full md:w-auto bg-blue-600 text-white hover:bg-blue-500 py-2 px-4 rounded-xl font-heading font-extrabold text-xs flex items-center justify-center gap-3 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(37,99,235,0.7)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 ${added ? 'bg-green-500 hover:bg-green-500 shadow-green-500/50' : 'active:scale-95'}`}
    >
      <span className="material-symbols-outlined text-xs">{added ? 'check_circle' : 'shopping_bag'}</span>
      {added ? t("catalog.addedToCart") : t("catalog.addToCart")}
    </button>
  );
}
