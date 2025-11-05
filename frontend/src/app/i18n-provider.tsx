'use client';

import React from "react";

export type Lang = 'en' | 'it';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

const I18nContext = React.createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = React.useState<Lang>('en');

  // read from URL ?lang= and/or localStorage on mount
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('lang') as Lang | null;
    const stored = window.localStorage.getItem('lang') as Lang | null;
    const initial = q ?? stored ?? 'en';
    setLang(initial);
  }, []);

  // persist
  React.useEffect(() => {
    if (lang) window.localStorage.setItem('lang', lang);
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
