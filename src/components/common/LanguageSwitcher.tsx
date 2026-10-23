import React from 'react';
import { useLocation } from 'react-router-dom';
import { Languages } from 'lucide-react';
import { useI18n } from '@/i18n/LocaleContext';
import { LANG_LABEL, withLang } from '@/i18n/config';
import { switchTarget } from '@/i18n/useLanguage';

/**
 * 中 / EN 切换按钮。
 *
 * 用 <a href> 整页跳转，不用 navigate：Router 的 basename 在初始化时就固定了，
 * 站内跳转不会重建 Router，链接会继续指向旧语言前缀（详见 src/i18n/useLanguage.ts）。
 *
 * 地址由 useLocation() 现算，不读 window.location —— 预渲染环境没有 window，
 * 读它会让 SSG 与客户端首帧不一致。useLocation 在两端都返回不含 basename 的路径，
 * 先用 withLang 补回语言前缀再交给 switchTarget。
 */
const LanguageSwitcher: React.FC = () => {
  const { lang, t } = useI18n();
  const { pathname } = useLocation();
  const target = lang === 'zh' ? 'en' : 'zh';
  const href = switchTarget(withLang(pathname, lang), target);
  // 按钮上写「目标语言」而不是当前语言：用户点它是为了切换，不是确认自己在哪
  const label = target === 'en' ? 'EN' : '中';
  const aria = t('lang.switchTo', { name: LANG_LABEL[target] });

  return (
    <a
      href={href}
      hrefLang={target === 'en' ? 'en' : 'zh-CN'}
      aria-label={aria}
      title={aria}
      className="inline-flex items-center gap-1.5 rounded-full h-9 px-2.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted transition-colors"
    >
      <Languages className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
};

export default LanguageSwitcher;
