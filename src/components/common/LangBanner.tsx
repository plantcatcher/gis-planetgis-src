import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Languages, X } from 'lucide-react';
import { useI18n } from '@/i18n/LocaleContext';
import { withLang } from '@/i18n/config';
import { switchTarget } from '@/i18n/useLanguage';

const DISMISS_KEY = 'planetgis.langBanner.dismissed';

/**
 * 「本站有英文版」提示浮层。
 *
 * 只对浏览器语言偏英文、且当前停在中文站的访客出现一次；关掉后写 localStorage，不再打扰。
 *
 * ⚠️ 状态初始必须是 false：预渲染环境没有 window / navigator / localStorage，
 *    若首帧就按浏览器语言算出 visible=true，服务端产出的 DOM 与客户端首帧不一致，
 *    hydrateRoot 会判 mismatch 并整棵重建。判定一律推迟到 useEffect 里做。
 *
 * ⚠️ `if (!visible) return null` 必须排在所有 Hook 之后。放到 Hook 之前会让
 *    「首帧不显示 / 后续显示」两种渲染路径的 Hook 数不一致，触发 React #310 白屏。
 */
const LangBanner: React.FC = () => {
  const { lang, t } = useI18n();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lang !== 'zh') return;
    if (typeof navigator === 'undefined') return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      /* 隐私模式下 localStorage 可能抛错，按未关闭处理 */
    }
    if (dismissed) return;

    const prefs = (
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language]
    ).filter(Boolean) as string[];
    // 首选语言含 en 且不含 zh 时才提示：把中文排在前面的双语用户不该被打扰
    const wantsEn =
      prefs.some((l) => /^en\b/i.test(l)) && !prefs.some((l) => /^zh\b/i.test(l));
    if (wantsEn) setVisible(true);
  }, [lang]);

  const href = switchTarget(withLang(pathname, lang), 'en');

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* 写不进去也不影响本次关闭 */
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:bottom-4 sm:left-auto sm:right-24 sm:max-w-sm z-[60]">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-lg p-4">
        <Languages className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{t('lang.bannerText')}</p>
          <a
            href={href}
            hrefLang="en"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
          >
            {t('lang.bannerAction')} →
          </a>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('lang.bannerDismiss')}
          title={t('lang.bannerDismiss')}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LangBanner;
