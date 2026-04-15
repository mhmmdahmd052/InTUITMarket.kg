"use client";

import { useCartStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartBadge() {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const carts = useCartStore((state) => state.carts);
  const guestCart = useCartStore((state) => state.guestCart);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const cart = user?.id ? (carts[user.id] || []) : guestCart;
  const totalItems = mounted ? (cart || []).reduce((sum, item) => sum + (item?.quantity || 1), 0) : 0;

  if (!mounted) {
    return (
      <div className="relative p-2 text-slate-600 dark:text-slate-400 group inline-flex">
        <span className="material-symbols-outlined">shopping_cart</span>
      </div>
    );
  }

  return (
    <Link href="/cart" className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors hover:scale-105 duration-300 group inline-flex">
      <span className="material-symbols-outlined group-hover:drop-shadow-sm">shopping_cart</span>
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-lg border border-white dark:border-slate-800 translate-x-1 -translate-y-1">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
