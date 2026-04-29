import { defaultLocale } from "./i18n";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * STRICT LOCALIZATION HELPER
 * Fetches the localized string from a Sanity locale object.
 * Logic: if language exists -> return it; else if en exists -> return en; else -> return "N/A"
 */
export const getLocalized = (obj: any, field: string, language: string) => {
  if (!obj || !obj[field]) return "N/A";
  
  const content = obj[field];
  
  if (typeof content === 'object') {
    // Standard Sanity localized object { en, ar, ru }
    if (content[language] && content[language].trim() !== "") {
      return content[language];
    }
    if (content[defaultLocale] && content[defaultLocale].trim() !== "") {
      return content[defaultLocale];
    }
  }

  // Fallback for fields that are accidentally returned as strings (e.g. legacy data)
  if (typeof content === 'string' && content.trim() !== "") {
    return content;
  }

  return "N/A";
};

/**
 * PROJECT SPEC GENERATOR
 * Generates context-aware specs for products
 */
export const getProjectSpecs = (project: any, t?: any) => {
  const name = (project.name?.en || project.name || "").toLowerCase();
  const category = (project.category || "").toLowerCase();
  
  let usageKey = "catalog.generalConstruction";
  let dimensions = "60 × 40 × 15 cm"; // Default fallback

  // PRIMARY USAGE & DIMENSIONS LOGIC
  if (name.includes("steel") || name.includes("beam") || name.includes("metal") || category === "steel") {
    usageKey = "catalog.structuralConstruction";
    dimensions = "600 × 20 × 30 cm";
  } else if (name.includes("pipe") || name.includes("fittings")) {
    usageKey = "catalog.fluidTransport";
    dimensions = "300 cm length / 10 cm diameter";
  } else if (name.includes("cement") || name.includes("concrete") || category === "cement") {
    usageKey = "catalog.foundationWork";
    dimensions = "60 × 40 × 15 cm";
  } else if (name.includes("insulation") || category === "insulation") {
    usageKey = "catalog.insulationWork";
    dimensions = "240 × 120 × 5 cm";
  } else if (category === "bricks") {
    dimensions = "25 × 12 × 6.5 cm";
  } else if (category === "paint") {
    dimensions = "Volume: 10L / H: 35 cm";
  } else {
    usageKey = "catalog.generalConstruction";
    dimensions = "Standard Sizing";
  }

  const usage = t ? t(usageKey) : (
    usageKey === "catalog.structuralConstruction" ? "Structural Construction" :
    usageKey === "catalog.fluidTransport" ? "Fluid Transport Systems" :
    usageKey === "catalog.foundationWork" ? "Building & Foundation Work" :
    usageKey === "catalog.insulationWork" ? "Thermal & Acoustic Insulation" :
    "General Construction Use"
  );

  return {
    materialType: t ? t("catalog.structural") : "Structural",
    standardCompliance: t ? t("catalog.gostCertified") : "GOST Certified Standards",
    primaryUsage: usage,
    usage: usage,
    dimensions: dimensions
  };
};

/**
 * DESCRIPTION CLEANER
 * Removes incorrect strings and formats description
 */
export const cleanDescription = (desc: string) => {
  if (!desc) return "";
  // Remove "PRIMARY USAGE: Order History" or any variation, and other junk
  return desc
    .replace(/PRIMARY USAGE:\s*Order History/gi, "")
    .replace(/MATERIAL TYPE:\s*Structural/gi, "")
    .replace(/STANDARD COMPLIANCE:\s*GOST Certified Standards/gi, "")
    .replace(/DIMENSIONS:\s*.*cm/gi, "")
    .trim();
};
