"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  return <button type="button" onClick={() => void changeLanguage(language === "en" ? "ur" : "en")} className="flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 transition hover:bg-gray-200" aria-label="Switch language"><Globe className="h-4 w-4 text-gray-600" /><span className="text-sm font-semibold text-gray-700">{language === "en" ? "EN" : "اردو"}</span></button>;
}
