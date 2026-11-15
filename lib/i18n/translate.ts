/**
 * 翻译函数（服务端、客户端共用，不依赖 React）。
 *
 * 采用「中文原文即 key」：代码里照写中文，t('开始排盘') 在中文界面原样返回，
 * 在越南语界面查 messages/vi；查不到就退回中文原文，界面不会出现空白或 key 名。
 * 插值用 {name}：t('共 {n} 条', { n: 3 })。
 *
 * term() 专门处理术语（星名、宫名、干支、四化、亮度……），走 terms.ts 的汉越音表，
 * 不需要在 messages 里逐条登记。
 */
import type { Locale } from './config';
import { VI_MESSAGES } from './messages/vi';
import { hanViet } from './terms';

export type Vars = Record<string, string | number>;

function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function translate(locale: Locale, zh: string, vars?: Vars): string {
  if (locale === 'zh') return interpolate(zh, vars);
  return interpolate(VI_MESSAGES[zh] ?? zh, vars);
}

export function translateTerm(locale: Locale, zh: string): string {
  return locale === 'zh' ? zh : hanViet(zh);
}

export interface I18n {
  locale: Locale;
  /** 界面文案：中文原文 → 当前语言 */
  t: (zh: string, vars?: Vars) => string;
  /** 紫微术语：星名、宫名、干支、四化、亮度、局名、人名地名等 */
  term: (zh: string) => string;
}

export function createI18n(locale: Locale): I18n {
  return {
    locale,
    t: (zh, vars) => translate(locale, zh, vars),
    term: zh => translateTerm(locale, zh),
  };
}
