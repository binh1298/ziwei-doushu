/**
 * 界面语言配置。语言存在 cookie 里（不改路由），服务端组件和客户端组件读同一个值，避免水合不一致。
 */
export type Locale = 'zh' | 'vi';

export const LOCALES: Locale[] = ['zh', 'vi'];

export const DEFAULT_LOCALE: Locale =
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE === 'vi' ? 'vi' : 'zh';

export const LOCALE_COOKIE = 'ziwei-locale';

/** <html lang> 用的 BCP 47 标签 */
export const HTML_LANG: Record<Locale, string> = { zh: 'zh-CN', vi: 'vi' };

/** 切换按钮上显示的语言名 */
export const LOCALE_LABEL: Record<Locale, string> = { zh: '中文', vi: 'Tiếng Việt' };

export function isLocale(v: unknown): v is Locale {
  return v === 'zh' || v === 'vi';
}

/** 没有 cookie 时按 Accept-Language 选：vi 与 zh 谁排在前面用谁，都没有则用默认语言 */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  for (const part of header.split(',')) {
    const tag = part.trim().toLowerCase();
    if (tag.startsWith('vi')) return 'vi';
    if (tag.startsWith('zh')) return 'zh';
  }
  return DEFAULT_LOCALE;
}
