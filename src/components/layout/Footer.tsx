import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { getLearnSubjects, getLearnCategories } from '@/lib/content';

const Footer = () => {
  const subjects = getLearnSubjects();
  const levels = getLearnCategories();
  return (
    <footer className="bg-muted py-12 px-4 border-t mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">星球小捕手</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            致力于普及地理知识，探索地球奥秘——自然、人文、区域、GIS 四大方向的自助知识库。
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">学科方向</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {subjects.map((s) => (
              <li key={s.name}>
                <Link to={`/learn?subject=${encodeURIComponent(s.name)}`} className="hover:text-primary transition-colors">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">学段</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {levels.map((l) => (
              <li key={l}>
                <Link to="/learn" className="hover:text-primary transition-colors">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">内容板块</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/works" className="hover:text-primary transition-colors">可视化作品</Link></li>
            <li><Link to="/articles" className="hover:text-primary transition-colors">科普文章</Link></li>
            <li><Link to="/tools" className="hover:text-primary transition-colors">地理工具</Link></li>
            <li><Link to="/subdomains" className="hover:text-primary transition-colors">子站导航</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">关于</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary transition-colors">关于我们</Link></li>
            <li><Link to="/changelog" className="hover:text-primary transition-colors">更新日志</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">联系我们</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">隐私政策</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition-colors">服务条款</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground font-mono">
        <span>© 2026 星球小捕手. 保留所有权利.</span>
        <span className="flex items-center gap-1">
          访客 <span id="busuanzi_value_site_uv" className="text-primary font-semibold">—</span>
          <span className="opacity-40 mx-1">·</span>
          访问量 <span id="busuanzi_value_site_pv" className="text-primary font-semibold">—</span>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
