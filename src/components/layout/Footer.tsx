import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* 三栏同排：品牌 / 关于 / 支持创作者。支持创作者做成独立卡片，视觉权重一致、转化突出 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">星球小捕手</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              致力于普及地理知识，探索地球奥秘——自然、人文、区域、GIS 四大方向的自助知识库。
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">关于</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">关于我们</Link>
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">隐私政策</Link>
              <Link to="/changelog" className="hover:text-primary transition-colors">更新日志</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">服务条款</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">联系我们</Link>
            </div>
          </div>

          <div className="md:justify-self-end w-full md:max-w-xs">
            <div className="h-full rounded-2xl border border-border bg-background p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
                  <Heart className="w-4 h-4" /> 支持创作者
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  星球小捕手维护网站运行需要持续的成本投入。如果这里的地理内容帮到了你，欢迎用微信赞赏请作者喝杯咖啡。
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="h-24 w-24 overflow-hidden rounded-lg border border-border bg-white p-1">
                  <img
                    src="/images/wechat-reward-qr.png"
                    alt="微信赞赏码"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">微信扫一扫 · 赞赏</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground font-mono">
          <span>© 2026 星球小捕手. 保留所有权利.</span>
          <span className="flex items-center gap-1">
            {/* 占位文本走 dangerouslySetInnerHTML：不蒜子会改写它，React 不能接管（详见 src/lib/busuanzi.tsx） */}
            访客{' '}
            <span
              id="busuanzi_value_site_uv"
              className="text-primary font-semibold"
              dangerouslySetInnerHTML={{ __html: '—' }}
            />
            <span className="opacity-40 mx-1">·</span>
            访问量{' '}
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
