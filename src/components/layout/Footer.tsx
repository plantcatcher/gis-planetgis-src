import { Link } from 'react-router-dom';
import { Globe, Heart } from 'lucide-react';
import { useT } from '@/i18n/LocaleContext';

const Footer = () => {
  const t = useT();
  return (
    <footer className="bg-muted border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* 三栏同排：品牌 / 关于 / 支持创作者。支持创作者做成独立卡片，视觉权重一致、转化突出 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">{t('brand.name')}</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {t('footer.slogan')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">{t('footer.about')}</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">{t('footer.aboutUs')}</Link>
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
              <Link to="/changelog" className="hover:text-primary transition-colors">{t('footer.changelog')}</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contact')}</Link>
            </div>
          </div>

          <div className="md:justify-self-end w-full md:max-w-xs">
            <div className="h-full rounded-2xl border border-border bg-background p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
                  <Heart className="w-4 h-4" /> {t('footer.supportTitle')}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t('footer.supportDesc')}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="h-24 w-24 overflow-hidden rounded-lg border border-border bg-white p-1">
                  <img
                    src="/images/wechat-reward-qr.png"
                    alt={t('footer.rewardAlt')}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{t('footer.rewardTip')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground font-mono">
          <span>{t('footer.copyright')}</span>
          <span className="flex items-center gap-1">
            {/* 占位文本走 dangerouslySetInnerHTML：不蒜子会改写它，React 不能接管（详见 src/lib/busuanzi.tsx） */}
            {t('common.visitors')}{' '}
            <span
              id="busuanzi_value_site_uv"
              className="text-primary font-semibold"
              dangerouslySetInnerHTML={{ __html: '—' }}
            />
            <span className="opacity-40 mx-1">·</span>
            {t('common.pageViews')}{' '}
            <span
              id="busuanzi_value_site_pv"
              className="text-primary font-semibold"
              dangerouslySetInnerHTML={{ __html: '—' }}
            />
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
