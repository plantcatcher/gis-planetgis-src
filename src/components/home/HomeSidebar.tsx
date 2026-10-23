import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SubjectIcon } from '@/lib/subjectIcons';
import { trackSearch } from '@/lib/analytics';
import { recordSearch } from '@/services/learningService';
import HotBadge from '@/components/common/HotBadge';
import { useT } from '@/i18n/LocaleContext';

export interface SidebarSubject {
  name: string;
  count: number;
  icon: string;
  /** 用于查询参数的原值。英文站下 name 已本地化成英文，但 /learn?subject= 仍要传中文 */
  value?: string;
}

export interface SidebarNavItem {
  id: string;
  label: string;
  meta?: string;
  /** 分组名，侧栏按此分段渲染 */
  group?: string;
  /** 是否显示 HOT 徽章（如「资料下载」） */
  hot?: boolean;
  /** 可展开的二级项（目前用于「地理知识库」下的学科方向） */
  subjects?: SidebarSubject[];
}

export interface SidebarUpdate {
  date: string;
  title: string;
}

/**
 * 首页左侧目录栏：本页控制器 + 回访钩子。
 * - 顶部检索直达 /learn?q=
 * - 「本页目录」分组 + 跟随滚动高亮（scrollspy），点击平滑滚动
 * - 「地理知识库」下嵌学科二级项
 * - 底部「最近更新」替代纯计数统计卡，给出可点的回访入口
 *
 * 吸顶与限高说明：top-24 / max-h 用固定值，不读 --nav-h。
 * 首页导航栏会随滚动收起并把 --nav-h 归零，若侧栏跟着该变量变化，
 * 整栏位置与高度会与顶部栏互相拉扯并反复跳动。
 * 所有内容仍完整保留在右侧主区 DOM 中，不影响 SSG 预渲染与 SEO。
 */
const HomeSidebar: React.FC<{
  items: SidebarNavItem[];
  active: string;
  updates: SidebarUpdate[];
}> = ({ items, active, updates }) => {
  const navigate = useNavigate();
  const t = useT();
  const [q, setQ] = useState('');

  const go = (id: string) => {
    const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 按 group 顺序切段，保持 items 原有次序
  const groups: { name: string; items: SidebarNavItem[] }[] = [];
  for (const it of items) {
    const last = groups[groups.length - 1];
    const name = it.group || t('home.sidebar.toc');
    if (!last || last.name !== name) groups.push({ name, items: [it] });
    else last.items.push(it);
  }

  return (
    <aside className="hidden lg:block lg:sticky lg:top-24 self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:border-r lg:border-border/60 lg:pr-5 pb-8">
      {/* 检索 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const kw = q.trim();
          if (!kw) return;
          // 埋点关键词上报。与知识库页共用 'learn' 上下文：跳转后那边再上报时
          // 会被 trackSearch 的会话内去重拦掉，同一次搜索只记一条。
          trackSearch(kw, 'learn');
          // 同步写入本地学习档案的搜索历史（「我的学习」页可回看与回跳）
          recordSearch(kw, 'learn');
          navigate(`/learn?q=${encodeURIComponent(kw)}`);
        }}
        className="relative mb-6"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('common.searchPlaceholder')}
          className="pl-9 rounded-full text-sm"
          aria-label={t('common.search')}
        />
      </form>

      {/* 本页目录（scrollspy，分组） */}
      <nav className="mb-6" aria-label="首页目录">
        {groups.map((g, gi) => (
          <div key={g.name} className={gi > 0 ? 'mt-4 pt-4 border-t border-border/40' : ''}>
            {groups.length > 1 && (
              <div className="text-[11px] font-semibold tracking-widest text-muted-foreground/60 uppercase mb-2 px-3">
                {g.name}
              </div>
            )}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const on = active === it.id;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => go(it.id)}
                      className={`w-full text-left flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors border-l-2 ${
                        on
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{it.label}</span>
                        {it.hot && <HotBadge className="shrink-0" />}
                      </span>
                      {it.meta && <span className="text-[11px] opacity-70 shrink-0">{it.meta}</span>}
                    </button>

                    {/* 二级：学科方向，仅在「地理知识库」项下 */}
                    {it.subjects?.length ? (
                      <ul className="mt-0.5 mb-1 space-y-0.5">
                        {it.subjects.map((s) => (
                          <li key={s.name}>
                            <Link
                              to={`/learn?subject=${encodeURIComponent(s.value || s.name)}`}
                              className="flex items-center justify-between gap-2 pl-7 pr-3 py-1 rounded-md text-[13px] text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                            >
                              <span className="inline-flex items-center gap-1.5 truncate">
                                <SubjectIcon name={s.icon} className="w-3.5 h-3.5 text-primary/70" />
                                {s.name}
                              </span>
                              <span className="text-[11px] opacity-60">{s.count}</span>
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            to="/learn"
                            className="flex items-center gap-1.5 pl-7 pr-3 py-1 rounded-md text-[13px] text-primary hover:bg-primary/10 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {t('home.learn.allEntries')}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </li>
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 最近更新：给回访一个可点的入口，比纯计数更有用 */}
      {updates.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground/60 uppercase mb-2 px-3">
            <History className="w-3.5 h-3.5" />
            {t('home.updates.recent')}
          </div>
          <ul className="space-y-2 px-3">
            {updates.map((u) => (
              <li key={u.date + u.title}>
                <Link to="/changelog" className="block group">
                  <div className="text-[11px] text-muted-foreground/70 tabular-nums">{u.date}</div>
                  <div className="text-[13px] leading-snug text-muted-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {u.title}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/changelog"
            className="flex items-center gap-1 px-3 mt-2 text-[13px] text-primary font-medium hover:gap-2 transition-all"
          >
            {t('home.sidebar.fullLog')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
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
