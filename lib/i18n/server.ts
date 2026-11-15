import 'server-only';
import { cookies, headers } from 'next/headers';
import { isLocale, localeFromAcceptLanguage, LOCALE_COOKIE, type Locale } from './config';
import { createI18n, type I18n } from './translate';

/** 服务端组件 / generateMetadata 取当前语言：cookie 优先，其次 Accept-Language */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  return localeFromAcceptLanguage((await headers()).get('accept-language'));
}

export async function getI18n(): Promise<I18n> {
  return createI18n(await getLocale());
}
