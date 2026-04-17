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
