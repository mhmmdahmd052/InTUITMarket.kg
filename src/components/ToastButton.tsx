"use client";

import toast from "react-hot-toast";
import React from "react";

export default function ToastButton({ 
  children, 
  message, 
  className 
}: { 
  children: React.ReactNode, 
  message: string, 
  className?: string 
}) {
  return (
    <button 
      onClick={() => toast(message, { icon: '✨' })} 
      className={className}
    >
      {children}
    </button>
  );
}
