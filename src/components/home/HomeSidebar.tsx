import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, Rss, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SubjectIcon } from '@/lib/subjectIcons';

export interface SidebarNavItem {
  id: string;
  label: string;
  meta?: string;
}

export interface SidebarSubject {
  name: string;
  count: number;
  icon: string;
}

/**
 * 首页左侧目录栏：知识库门户式导航。
 * - 顶部检索直达 /learn?q=
 * - 「本页目录」跟随滚动高亮（scrollspy），点击平滑滚动
 * - 「学科方向」直达知识库分科筛选
 * 所有内容仍完整保留在右侧主区 DOM 中，不影响 SSG 预渲染与 SEO。
 */
const HomeSidebar: React.FC<{
  items: SidebarNavItem[];
  active: string;
  subjects: SidebarSubject[];
  totalEntries: number;
}> = ({ items, active, subjects, totalEntries }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const go = (id: string) => {
    const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="lg:sticky lg:top-[var(--nav-h)] lg:h-[calc(100vh-var(--nav-h))] lg:overflow-y-auto lg:border-r lg:border-border/60 lg:pr-6 py-8 lg:py-10">
      {/* 检索 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) navigate(`/learn?q=${encodeURIComponent(q.trim())}`);
        }}
        className="relative mb-7"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索地理知识点…"
          className="pl-9 rounded-full text-sm"
          aria-label="搜索地理知识点"
        />
      </form>

      {/* 本页目录（scrollspy） */}
      <nav className="hidden lg:block mb-8" aria-label="首页目录">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground/70 uppercase mb-3 px-3">
          本页目录
        </div>
        <ul className="space-y-0.5">
          {items.map((it) => {
            const on = active === it.id;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => go(it.id)}
                  className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors border-l-2 ${
                    on
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{it.label}</span>
                  {it.meta && <span className="text-[11px] opacity-70 shrink-0">{it.meta}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 学科方向 */}
      <div className="mb-8">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground/70 uppercase mb-3 px-3">
          学科方向
        </div>
        <ul className="space-y-0.5">
          {subjects.map((s) => (
            <li key={s.name}>
              <Link
                to={`/learn?subject=${encodeURIComponent(s.name)}`}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span className="inline-flex items-center gap-2 truncate">
                  <SubjectIcon name={s.icon} className="w-4 h-4 text-primary/80" />
                  {s.name}
                </span>
                <span className="text-[11px] opacity-70">{s.count}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/learn"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary font-medium hover:bg-primary/10 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              全部知识条目
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Link>
          </li>
        </ul>
      </div>

      {/* 快捷入口 */}
      <div className="mb-8">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground/70 uppercase mb-3 px-3">
          快捷入口
        </div>
        <ul className="space-y-0.5">
          <li>
            <a
              href="https://blog.planetgis.cn"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Rss className="w-4 h-4 text-primary/80" />
              科普博客
            </a>
          </li>
          <li>
            <Link
              to="/changelog"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <History className="w-4 h-4 text-primary/80" />
              更新日志
            </Link>
          </li>
        </ul>
      </div>

      {/* 底部统计 */}
      <div className="px-3 py-4 rounded-xl bg-muted/50 border border-border/50">
        <div className="text-2xl font-extrabold text-primary leading-none">{totalEntries}</div>
        <div className="text-xs text-muted-foreground mt-1">条可检索知识词条</div>
        <div className="text-xs text-muted-foreground/70 mt-2 leading-relaxed">
          自然 · 人文 · 区域 · GIS 四大方向持续更新
        </div>
      </div>
    </aside>
  );
};

/** 滚动高亮：返回当前视口顶部所在的 section id */
export const useScrollSpy = (ids: string[], offset = 140) => {
  const [active, setActive] = useState(ids[0] || '');
  const key = ids.join('|');
  useEffect(() => {
    const list = key.split('|').filter(Boolean);
    const onScroll = () => {
      const y = window.scrollY + offset;
      let cur = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [key, offset]);
  return active;
};

export default HomeSidebar;
