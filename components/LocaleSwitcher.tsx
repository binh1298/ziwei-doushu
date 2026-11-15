'use client';
import { useI18n } from '@/lib/i18n/client';
import { LOCALE_LABEL } from '@/lib/i18n/config';

/** 中文 ⇄ Tiếng Việt 切换按钮；放在各页顶部导航里，样式跟随主题变量 */
export default function LocaleSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const next = locale === 'zh' ? 'vi' : 'zh';
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={t('切换语言')}
      title={t('切换语言')}
      className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-all duration-300 hover:opacity-80 ${className}`}
      style={{ borderColor: 'var(--t-border, rgba(212,168,67,0.3))', color: 'var(--t-muted, inherit)' }}
    >
      {LOCALE_LABEL[next]}
    </button>
  );
}
