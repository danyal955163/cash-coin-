"use client";

/* The profile language column is added by supabase/language-preference.sql and may not be in generated types yet. */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import en from "../../messages/en.json";
import ur from "../../messages/ur.json";

type Language = "en" | "ur";
type ContextValue = { language: Language; changeLanguage: (language: Language) => Promise<void> };
const LanguageContext = createContext<ContextValue | null>(null);
const messages = { en, ur };

function readCookie() { return document.cookie.split("; ").find((item) => item.startsWith("NEXT_LOCALE="))?.split("=")[1] as Language | undefined; }

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const local = localStorage.getItem("language") as Language | null;
      const cookie = readCookie();
      let next: Language = local === "ur" || local === "en" ? local : cookie === "ur" ? "ur" : "en";
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await (supabase as unknown as { from: (table: string) => any }).from("profiles").select("language_preference").eq("id", user.id).maybeSingle();
        if (data?.language_preference === "ur" || data?.language_preference === "en") next = data.language_preference;
      }
      if (active) { setLanguage(next); setReady(true); }
    }
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("rtl", language === "ur");
  }, [language]);

  const changeLanguage = async (next: Language) => {
    setLanguage(next);
    localStorage.setItem("language", next);
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await (supabase as unknown as { from: (table: string) => any }).from("profiles").update({ language_preference: next }).eq("id", user.id);
  };

  const value = useMemo(() => ({ language, changeLanguage }), [language]);
  return <LanguageContext.Provider value={value}><NextIntlClientProvider locale={language} messages={messages[language]}>{ready ? children : children}</NextIntlClientProvider></LanguageContext.Provider>;
}

export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error("useLanguage must be used inside LanguageProvider"); return value; }
