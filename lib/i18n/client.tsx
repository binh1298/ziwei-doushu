'use client';
import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HTML_LANG, LOCALE_COOKIE, type Locale } from './config';
import { createI18n, type I18n } from './translate';

interface I18nContextValue extends I18n {
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  ...createI18n('zh'),
  setLocale: () => {},
});

/** 初始语言由根 layout 从 cookie 读出后传入，保证服务端渲染与客户端首屏一致 */
export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback((l: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = HTML_LANG[l];
    setLocaleState(l);
    // 服务端组件（知识库、古籍页）靠 cookie 取语言，需要刷新一次
    router.refresh();
  }, [router]);

  const value = useMemo(() => ({ ...createI18n(locale), setLocale }), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
