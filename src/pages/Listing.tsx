import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Compass, Globe, Search, Calendar, LayoutGrid, List, Flame, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import CoverImage from '@/components/common/CoverImage';
import AccessBadge from '@/components/common/AccessBadge';
import Pagination from '@/components/common/Pagination';
import { Input } from '@/components/ui/input';
import {
  getWorks,
  getWorkCategories,
  getTools,
  getLearns,
  getResources,
  getLearnCategories,
  getLearnSubjects,
  getLearnLevels,
  countTags,
  isProvinceTag,
  isResourceGated,
  isResourceViewOnly,
  SUBJECT_META,
  LEARN_SUBJECTS,
  resourceGroup,
  resourceDocType,
  resourceStdLevel,
  resourcePlanLevel,
  normDataFormat,
  getAreaFacets,
  matchArea,
  areaLabel,
  sortSubjects,
  DL_GROUP_LITERATURE,
  DL_GROUP_DATA,
  DL_GROUP_ORDER,
  DL_DOC_TYPES,
  DL_STD_LEVELS,
  DL_PLAN_LEVELS,
  type ContentItem,
} from '@/lib/content';
import { searchAll } from '@/lib/knowledge';
import { useSearchTracking } from '@/hooks/use-search-tracking';
import { SubjectIcon } from '@/lib/subjectIcons';
import KnowledgeCard from '@/components/knowledge/KnowledgeCard';
import SectionLabel from '@/components/knowledge/SectionLabel';
import subdomainsData from '@/data/subdomains.json';

type ListingType = 'work' | 'tool' | 'subdomain' | 'learn' | 'resource';

// 浏览量格式化：1200 -> 1.2k
const fmtHeat = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

// 卡片上的热度标记（仅在有真实浏览量时显示），与 /maps、/games 一致
const HeatTag: React.FC<{ heat?: number }> = ({ heat }) =>
  (heat || 0) > 0 ? (
    <span className="inline-flex items-center gap-1 text-xs text-orange-500 shrink-0">
      <Flame className="w-3.5 h-3.5" />
      {fmtHeat(heat ?? 0)}
    </span>
  ) : null;

const meta: Record<ListingType, { title: string; subtitle: string; base: string }> = {
  work: {
    title: '精选作品',
    subtitle: '从海平面模拟到河流分布，用交互可视化把复杂的地理数据变成可感知的体验——地理与数据的直观对话。',
    base: 'works',
  },
  tool: {
    title: '地理小工具',
    subtitle:
      '带完整说明的在线工具：每条都有独立介绍页（功能特点、使用教程、常见问题），先看清能干什么，再点开前往。',
    base: 'tools',
  },
  subdomain: {
    title: '子站导航',
    subtitle:
      '星球小捕手旗下各主题子站入口，只做跳转、不设介绍页（需要详细说明的工具请见「地理小工具」）——按需前往。',
    base: 'subdomains',
  },
  learn: {
    title: '地理知识库',
    subtitle:
      '按自然地理、人文地理、区域地理、地理信息技术分科组织的自助知识库——支持正文检索，随时来翻、随手可读。',
    base: 'learn',
  },
  resource: {
    title: '资料下载',
    subtitle: '板牙整理的地理论文、数据集、地图素材与工具包——按更新时间排序，支持标签检索；关注公众号【那山那海那座城】后可解锁下载。',
    base: 'downloads',
  },
};

// 卡片入场动画：initial 保持 opacity:1，确保 SSG 静态 HTML 中文本天生可见。
const CardAnim: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 1, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    viewport={{ once: true }}
  >
    {children}
  </motion.div>
);

// 精选作品总页：content/works 下只剩模拟实验类（海平面模拟实验室、地形分析器），
// 互动地图与小游戏已迁到 /maps、/games 各自独立的汇总页。
const WorkGrid = () => {
  const all = getWorks();
  const categories = useMemo(() => getWorkCategories(), []);
  const [active, setActive] = useState('全部');
  // 默认按热度（近 30 天 GA4 浏览量）降序，与资料下载页一致；可切回最新。
  const [sortMode, setSortMode] = useState<'latest' | 'heat'>('heat');
  const list = active === '全部' ? all : all.filter((w) => (w.category || '未分类') === active);

  // 排序：最新=上线日期倒序；热度=近 30 天 GA4 浏览量降序。两者以日期做并列回退。
  const sorted = [...list].sort((a, b) =>
    sortMode === 'heat'
      ? (b.heat || 0) - (a.heat || 0) ||
        (b.date || '').localeCompare(a.date || '') ||
        a.order - b.order
      : (b.date || '').localeCompare(a.date || '') || a.order - b.order,
  );

  // 分页：每页 12 个；切换分类 / 排序自动归 1
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  useEffect(() => {
    setPage(1);
  }, [active, sortMode]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {['全部', ...categories.map((c) => c.name)].map((name) => {
            const count = name === '全部' ? all.length : categories.find((c) => c.name === name)?.count ?? 0;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setActive(name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active === name
                    ? 'bg-primary text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {name} <span className="ml-1 text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 shrink-0">
          {([['latest', '最新'], ['heat', '热度']] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortMode(key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                sortMode === key ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pageItems.map((w, i) => (
          <CardAnim key={w.slug} delay={i * 0.08}>
            {/* 卡片分工：封面与标题 → 作品本体（站外，新窗口），底部链接 → /works/<slug> 详情页 */}
            <div className="group overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <a href={w.link} target="_blank" rel="noreferrer" className="block">
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={w.cover}
                    alt={`${w.title} - 星球小捕手地理可视化作品`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {w.category && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium bg-black/55 text-white backdrop-blur-sm">
                      {w.category}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="w-full text-center text-sm font-medium text-white/90">访问作品 →</span>
                  </div>
                </div>
              </a>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">
                  <a href={w.link} target="_blank" rel="noreferrer" className="group-hover:text-primary transition-colors">
                    {w.title}
                  </a>
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{w.summary}</p>
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    to={`/works/${w.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    查看详情与解读 <ArrowRight className="w-3.5 h-3.5 group-hover:gap-2 transition-all" />
                  </Link>
                  {(w.heat || 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs text-orange-500">
                      <Flame className="w-3.5 h-3.5" />
                      {fmtHeat(w.heat ?? 0)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardAnim>
        ))}
      </div>
      <Pagination
        page={currentPage}
        pageCount={totalPages}
        onChange={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </>
  );
};

const ToolGrid = () => {
  // 默认按热度（近 30 天 GA4 浏览量）降序，与资料下载页、其它列表页一致；可切回手动序。
  const [sortMode, setSortMode] = useState<'latest' | 'heat'>('heat');
  const sorted = [...getTools()].sort((a, b) =>
    sortMode === 'heat' ? (b.heat || 0) - (a.heat || 0) || a.order - b.order : a.order - b.order,
  );
  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-6">
        <p className="text-sm text-muted-foreground">
          共 <span className="font-semibold text-foreground">{sorted.length}</span> 个小工具
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 shrink-0">
          {([['heat', '热度'], ['latest', '最新']] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortMode(key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                sortMode === key ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sorted.map((t, i) => (
          <CardAnim key={t.slug} delay={i * 0.08}>
            <Link
              to={`/tools/${t.slug}`}
              className="group flex gap-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300"
            >
              <div className="shrink-0 w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                <Compass className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 className="text-lg font-bold leading-snug">{t.title}</h3>
                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <HeatTag heat={t.heat} />
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t.summary}</p>
              </div>
            </Link>
          </CardAnim>
        ))}
      </div>
    </>
  );
};

const SubdomainGrid = () => {
  const subs = subdomainsData as { title: string; description: string; link: string }[];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {subs.map((s, i) => (
        <CardAnim key={s.link} delay={i * 0.08}>
          <a
            href={s.link}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col gap-2 items-start h-full p-4 rounded-2xl border border-primary/20 hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="w-full flex items-start justify-between gap-3">
              <Globe className="w-8 h-8 text-primary shrink-0" />
              <span className="shrink-0 pt-0.5 text-xs text-primary flex items-center gap-1">
                前往 <ExternalLink className="w-3 h-3" />
              </span>
            </div>
            <span className="font-bold text-base">{s.title}</span>
            <span className="text-xs text-muted-foreground w-full text-left">{s.description}</span>
          </a>
        </CardAnim>
      ))}
    </div>
  );
};

const LearnGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const all = getLearns();
  const subjects = getLearnSubjects();
  const categories = getLearnCategories();
  const levels = getLearnLevels();
  // 标签：只统计本板块（科普文章）内的出现次数，数字与点击筛选结果一致
  const allTags = useMemo(() => countTags(all).slice(0, 14), [all]);

  const initialSubject = searchParams.get('subject');
  const initialCategory = searchParams.get('category');
  const initialLevel = searchParams.get('level');
  const [activeSubject, setActiveSubject] = useState(
    initialSubject && subjects.some((s) => s.name === initialSubject) ? initialSubject : '全部',
  );
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && categories.includes(initialCategory) ? initialCategory : '全部',
  );
  const [activeLevel, setActiveLevel] = useState(
    initialLevel && levels.includes(initialLevel) ? initialLevel : '全部',
  );
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  // 排序：默认「热度」（近 30 天 GA4 浏览量降序，整页拍平）；可切「最新」恢复学科分组
  const [sortMode, setSortMode] = useState<'latest' | 'heat'>('heat');
  const pickSort = (m: 'latest' | 'heat') => {
    setSortMode(m);
    const sp = new URLSearchParams(searchParams);
    sp.delete('page');
    setSearchParams(sp, { replace: true });
  };

  // GA4：知识库搜索关键词（防抖 + 会话内去重，避免记录输入中间态）
  useSearchTracking(query, 'learn');

  // URL → 筛选状态：支持从页脚 / 详情页 infobox 深链进入，以及浏览器前进后退
  useEffect(() => {
    const s = searchParams.get('subject');
    setActiveSubject(s && subjects.some((x) => x.name === s) ? s : '全部');
    const c = searchParams.get('category');
    setActiveCategory(c && categories.includes(c) ? c : '全部');
    const l = searchParams.get('level');
    setActiveLevel(l && levels.includes(l) ? l : '全部');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 筛选状态 → URL：点击筛选时把 学科/专题/学段 写回 query string
  const syncUrl = (next: { subject?: string; category?: string; level?: string }) => {
    const s = next.subject ?? activeSubject;
    const c = next.category ?? activeCategory;
    const l = next.level ?? activeLevel;
    const p: Record<string, string> = {};
    if (s !== '全部') p.subject = s;
    if (c !== '全部') p.category = c;
    if (l !== '全部') p.level = l;
    if (query.trim()) p.q = query.trim();
    setSearchParams(p, { replace: true });
  };

  const pickSubject = (name: string) => {
    setActiveSubject(name);
    syncUrl({ subject: name });
  };
  const pickCategory = (name: string) => {
    setActiveCategory(name);
    syncUrl({ category: name });
  };
  const pickLevel = (name: string) => {
    setActiveLevel(name);
    syncUrl({ level: name });
  };
  const toggleTag = (t: string) =>
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  // 四级过滤：学科 → 专题 → 学段 → 标签，最后正文检索
  let base = all;
  if (activeSubject !== '全部') base = base.filter((i) => i.subject === activeSubject);
  if (activeCategory !== '全部') base = base.filter((i) => i.category === activeCategory);
  if (activeLevel !== '全部') base = base.filter((i) => i.level === activeLevel);
  if (activeTags.length) base = base.filter((i) => (i.tags || []).some((t) => activeTags.includes(t)));
  const q = query.trim();
  const searched: ContentItem[] = q ? searchAll(q, base).map((h) => h.item) : base;

  // 未选学科时按学科分组呈现，强化"知识地图"结构感
  const groups =
    activeSubject === '全部'
      ? LEARN_SUBJECTS.map((name) => ({
          name,
          items: searched.filter((i) => i.subject === name),
        })).filter((g) => g.items.length)
      : [{ name: activeSubject, items: searched }];

  // 热度模式：整页按热度拍平排序；最新模式：保留学科分组（见下方 flatAll / groupedNodes 分支）
  const heatSorted = useMemo(
    () =>
      [...searched].sort(
        (a, b) => (b.heat || 0) - (a.heat || 0) || (b.date || '').localeCompare(a.date || ''),
      ),
    [searched],
  );

  // 分页 + 扁平分组（方案 A：最新模式保留学科小标题，热度模式整页拍平）
  const PAGE_SIZE = 18;
  const subjectCount: Record<string, number> = {};
  for (const g of groups) subjectCount[g.name] = g.items.length;
  const flat = groups.flatMap((g) => g.items.map((it) => ({ subject: g.name, item: it })));
  const flatAll = sortMode === 'heat' ? heatSorted.map((it) => ({ subject: '', item: it })) : flat;
  const totalPages = Math.max(1, Math.ceil(flatAll.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(searchParams.get('page')) || 1), totalPages);
  const pageItems = flatAll.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const goPage = (p: number) => {
    const sp = new URLSearchParams(searchParams);
    if (p <= 1) sp.delete('page');
    else sp.set('page', String(p));
    setSearchParams(sp, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // 搜索词变化 → 页码归 1
  useEffect(() => {
    const cur = Number(searchParams.get('page')) || 1;
    if (cur > 1) {
      const sp = new URLSearchParams(searchParams);
      sp.delete('page');
      setSearchParams(sp, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // 当页条目按学科分段渲染：某学科在当页首次出现时显示其小标题（跨页重显示）
  const groupedNodes: React.ReactNode[] = [];
  {
    let curSubj: string | null = null;
    let buffer: ContentItem[] = [];
    const flush = () => {
      if (curSubj && buffer.length) {
        groupedNodes.push(
          <section key={`${curSubj}-${groupedNodes.length}`}>
            <div className="flex items-center gap-3 mb-4">
              <SubjectIcon name={SUBJECT_META[curSubj]?.icon || 'Globe'} className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg font-bold">{curSubj}</h2>
              <span className="text-xs text-muted-foreground">{subjectCount[curSubj]} 篇</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {buffer.map((a, i) => (
                <CardAnim key={a.slug} delay={i * 0.05}>
                  <KnowledgeCard item={a} />
                </CardAnim>
              ))}
            </div>
          </section>,
        );
        buffer = [];
      }
    };
    for (const { subject, item } of pageItems) {
      if (subject !== curSubj) {
        flush();
        curSubj = subject;
      }
      buffer.push(item);
    }
    flush();
  }

  return (
    <div className="lg:grid lg:grid-cols-[236px_1fr] lg:gap-8">
      {/* 左侧筛选栏 */}
      <aside className="lg:sticky lg:top-24 self-start space-y-6 mb-8 lg:mb-0">
        {/* 搜索框：与资料下载页一致，放在左侧筛选栏顶部 */}
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="知识点 / 正文关键词…"
              className="pl-9 rounded-full text-xs"
            />
          </div>
        </div>
        <div>
          <SectionLabel className="mb-3 !text-[11px]">学科方向</SectionLabel>
          <div className="space-y-1">
            {['全部', ...subjects.map((s) => s.name)].map((name) => {
              const count = name === '全部' ? all.length : subjects.find((s) => s.name === name)?.count ?? 0;
              const active = activeSubject === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => pickSubject(name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {name !== '全部' && (
                      <SubjectIcon name={subjects.find((s) => s.name === name)?.icon || 'Globe'} className="w-3.5 h-3.5" />
                    )}
                    {name}
                  </span>
                  <span className="text-[11px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <SectionLabel className="mb-3 !text-[11px]">专题</SectionLabel>
          <div className="space-y-1">
            {['全部', ...categories].map((name) => {
              const count = name === '全部' ? all.length : all.filter((i) => i.category === name).length;
              const active = activeCategory === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => pickCategory(name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <span>{name}</span>
                  <span className="text-[11px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
        {levels.length > 0 && (
          <div>
            <SectionLabel className="mb-3 !text-[11px]">学段</SectionLabel>
            <div className="space-y-1">
              {['全部', ...levels].map((name) => {
                const count = name === '全部' ? all.filter((i) => i.level).length : all.filter((i) => i.level === name).length;
                const active = activeLevel === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => pickLevel(name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${
                      active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <span>{name}</span>
                    <span className="text-[11px] opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* 主区 */}
      <div>
        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">已选标签：</span>
            {activeTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                #{t} ✕
              </button>
            ))}
            <button
              type="button"
              onClick={() => setActiveTags([])}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              清除
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm text-muted-foreground">
            共 <span className="font-semibold text-foreground">{searched.length}</span> 篇
            {activeSubject !== '全部' && ` · ${activeSubject}`}
            {activeCategory !== '全部' && ` · ${activeCategory}`}
            {activeLevel !== '全部' && ` · ${activeLevel}`}
            {q && ` · 含“${q}”`}
          </p>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 shrink-0">
            {([['latest', '最新'], ['heat', '热度']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => pickSort(key)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  sortMode === key ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {searched.length === 0 ? (
          <p className="text-muted-foreground">该筛选下还没有内容，敬请期待。</p>
        ) : sortMode === 'heat' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {pageItems.map(({ item }) => (
              <CardAnim key={item.slug} delay={0}>
                <KnowledgeCard item={item} />
              </CardAnim>
            ))}
          </div>
        ) : (
          <div className="space-y-10">{groupedNodes}</div>
        )}

        {allTags.length > 0 && activeTags.length === 0 && (
          <div className="mt-10 pt-6 border-t border-border/60">
            <SectionLabel className="mb-3">按标签浏览</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => toggleTag(t.tag)}
                  className="px-3 py-1.5 rounded-full text-sm bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  #{t.tag} <span className="ml-1 text-xs opacity-70">{t.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <Pagination page={currentPage} pageCount={totalPages} onChange={goPage} />
      </div>
    </div>
  );
};

const ResourceCover: React.FC<{ item: ContentItem; className?: string }> = ({ item, className = '' }) => {
  if (item.cover) {
    return (
      <div className={`relative overflow-hidden bg-muted ${className}`}>
        <CoverImage
          cover={item.cover}
          title={item.title}
          lazy
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10 flex items-center justify-center ${className}`}
      aria-hidden
    >
      <span className="px-4 text-center font-serif text-2xl font-bold leading-tight text-primary/70 line-clamp-3">
        {item.title}
      </span>
    </div>
  );
};

const Badges: React.FC<{ item: ContentItem; hideFormatOnMobile?: boolean }> = ({
  item,
  hideFormatOnMobile = false,
}) => (
  <>
    {item.category && (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-foreground/80 text-background">
        {item.category}
      </span>
    )}
    {item.format && (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary ${
          hideFormatOnMobile ? 'hidden sm:inline-block' : ''
        }`}
      >
        {item.format}
      </span>
    )}
    <AccessBadge item={item} />
  </>
);

const FacChip: React.FC<{ label: string; count?: number; active: boolean; onClick: () => void }> = ({
  label,
  count,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
      active ? 'bg-primary text-white' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    {label}
    {count !== undefined && <span className="ml-1 opacity-70">{count}</span>}
  </button>
);

const ResourceGrid = () => {
  const all = getResources();
  const [searchParams, setSearchParams] = useSearchParams();
  // 与知识库页一致：支持从 URL ?q= 进入（「我的学习」的搜索历史点回来能直接带出关键词）
  const [query, setQuery] = useState(searchParams.get('q') || '');

  // GA4 + 本地搜索历史：资料下载搜索关键词
  useSearchTracking(query, 'resources');

  // 区域轴取值：region 参数（世界）优先，其次 province / 省级标签（中国）。编码为 R:x / P:x。
  const readArea = (sp: URLSearchParams): string => {
    const rg = sp.get('region');
    if (rg) return `R:${rg}`;
    const pv = sp.get('province');
    if (pv) return `P:${pv}`;
    const tg = sp.get('tag');
    if (tg && isProvinceTag(tg)) return `P:${tg}`;
    return '全部';
  };

  const [activeGroup, setActiveGroup] = useState<string>(() => {
    const g = searchParams.get('group');
    return g && (DL_GROUP_ORDER as readonly string[]).includes(g) ? g : '全部';
  });
  const [activeType, setActiveType] = useState<string>(() => {
    const t = searchParams.get('type');
    return t && (DL_DOC_TYPES as readonly string[]).includes(t) ? t : '全部';
  });
  const [activeSubject, setActiveSubject] = useState<string>(() => searchParams.get('subject') || '全部');
  const [activeStdLevel, setActiveStdLevel] = useState<string>(() => searchParams.get('stdLevel') || '全部');
  const [activePlanLevel, setActivePlanLevel] = useState<string>(() => searchParams.get('planLevel') || '全部');
  const [activeFormat, setActiveFormat] = useState<string>(() => searchParams.get('format') || '全部');
  const [activeArea, setActiveArea] = useState<string>(() => readArea(searchParams));
  const [activeAccess, setActiveAccess] = useState<'all' | 'download' | 'view' | 'gated'>(() => {
    const a = searchParams.get('access');
    return a === 'download' || a === 'view' || a === 'gated' ? a : 'all';
  });
  const [activeTag, setActiveTag] = useState<string | null>(() => {
    const t = searchParams.get('tag');
    return t && !isProvinceTag(t) ? t : null;
  });

  // 从 URL 同步（支持从资料详情页点标签/区域跳转过来自动过滤，以及浏览器前进后退）
  useEffect(() => {
    const g = searchParams.get('group');
    setActiveGroup(g && (DL_GROUP_ORDER as readonly string[]).includes(g) ? g : '全部');
    const ty = searchParams.get('type');
    setActiveType(ty && (DL_DOC_TYPES as readonly string[]).includes(ty) ? ty : '全部');
    setActiveSubject(searchParams.get('subject') || '全部');
    setActiveStdLevel(searchParams.get('stdLevel') || '全部');
    setActivePlanLevel(searchParams.get('planLevel') || '全部');
    setActiveFormat(searchParams.get('format') || '全部');
    setActiveArea(readArea(searchParams));
    const a = searchParams.get('access');
    setActiveAccess(a === 'download' || a === 'view' || a === 'gated' ? a : 'all');
    const t = searchParams.get('tag');
    setActiveTag(t && !isProvinceTag(t) ? t : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [view, setView] = useState<'grid' | 'list'>('list');
  const [sortMode, setSortMode] = useState<'heat' | 'date'>('heat');
  // 移动端筛选区默认收起（桌面端 lg:block 常显）
  const [filtersOpen, setFiltersOpen] = useState(false);

  // 顶层「文献资料」范围：第二层与学科/级别/层级均在此范围内统计
  const lit = useMemo(() => all.filter((i) => resourceGroup(i) === DL_GROUP_LITERATURE), [all]);
  const groupCounts = useMemo(() => {
    const m: Record<string, number> = { 全部: all.length, [DL_GROUP_LITERATURE]: 0, [DL_GROUP_DATA]: 0 };
    for (const r of all) {
      const g = resourceGroup(r);
      m[g] = (m[g] || 0) + 1;
    }
    return m;
  }, [all]);
  // 第二层：资料性质（图书教材 / 标准规范 / 规划文本）
  const docTypeCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of lit) {
      const t = resourceDocType(r);
      m.set(t, (m.get(t) || 0) + 1);
    }
    return DL_DOC_TYPES.filter((t) => m.has(t)).map((t) => ({ name: t, count: m.get(t)! }));
  }, [lit]);
  // 图书教材 → 学科（= category）
  const subjectCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of lit) {
      if (resourceDocType(r) !== '图书教材') continue;
      const c = r.category || '未分类';
      m.set(c, (m.get(c) || 0) + 1);
    }
    return sortSubjects(Array.from(m.keys())).map((n) => ({ name: n, count: m.get(n)! }));
  }, [lit]);
  // 标准规范 → 级别
  const stdLevelCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of lit) {
      if (resourceDocType(r) !== '标准规范') continue;
      const c = resourceStdLevel(r);
      m.set(c, (m.get(c) || 0) + 1);
    }
    return DL_STD_LEVELS.filter((n) => m.has(n)).map((n) => ({ name: n, count: m.get(n)! }));
  }, [lit]);
  // 规划文本 → 层级
  const planLevelCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of lit) {
      if (resourceDocType(r) !== '规划文本') continue;
      const c = resourcePlanLevel(r);
      m.set(c, (m.get(c) || 0) + 1);
    }
    return DL_PLAN_LEVELS.filter((n) => m.has(n)).map((n) => ({ name: n, count: m.get(n)! }));
  }, [lit]);
  // 地理数据 → 格式
  const formatCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of all) {
      if (resourceGroup(r) !== DL_GROUP_DATA) continue;
      const c = normDataFormat(r.dataFormat);
      m.set(c, (m.get(c) || 0) + 1);
    }
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [all]);
  // 结构层筛选（主分类 / 资料性质 / 类内维度 / 访问方式）：两根横切轴的公共基数。
  // 区域、标签、关键词**不在**这里收窄——它们各自在下方单独参与，避免互相吃掉。
  const baseScope = useMemo(() => {
    let s = all;
    if (activeGroup !== '全部') s = s.filter((i) => resourceGroup(i) === activeGroup);
    if (activeGroup === DL_GROUP_LITERATURE && activeType !== '全部') {
      s = s.filter((i) => resourceDocType(i) === activeType);
    }
    if (activeType === '图书教材' && activeSubject !== '全部') {
      s = s.filter((i) => (i.category || '未分类') === activeSubject);
    }
    if (activeType === '标准规范' && activeStdLevel !== '全部') {
      s = s.filter((i) => resourceStdLevel(i) === activeStdLevel);
    }
    if (activeType === '规划文本' && activePlanLevel !== '全部') {
      s = s.filter((i) => resourcePlanLevel(i) === activePlanLevel);
    }
    if (activeGroup === DL_GROUP_DATA && activeFormat !== '全部') {
      s = s.filter((i) => normDataFormat(i.dataFormat) === activeFormat);
    }
    if (activeAccess !== 'all') {
      // 三态：直接下载（有文件、无门禁）/ 在线观看（仅官方在线阅读链接）/ 需验证码
      s = s.filter((i) =>
        activeAccess === 'gated'
          ? isResourceGated(i)
          : activeAccess === 'view'
            ? isResourceViewOnly(i)
            : !isResourceGated(i) && !isResourceViewOnly(i),
      );
    }
    return s;
  }, [all, activeGroup, activeType, activeSubject, activeStdLevel, activePlanLevel, activeFormat, activeAccess]);

  // 区域轴（全局横切）：region 字段 + 省级标签合成一根轴，分「世界 / 中国」两组。
  // 计数口径＝结构层基数叠加「已选标签」，但**不含区域自身的选择**——
  // 这样数字恒等于点击该项后筛出的条数，且不会出现「地理数据」视图里点省份得 0 条的死角。
  const areaScope = useMemo(
    () => (activeTag ? baseScope.filter((i) => (i.tags || []).includes(activeTag)) : baseScope),
    [baseScope, activeTag],
  );
  const areas = useMemo(() => {
    const list = getAreaFacets(areaScope);
    // 已选区域若因基数收窄而落榜，补回列表（计数即真实结果数，可能为 0），免得"筛了却看不到选中项"
    if (activeArea !== '全部' && !list.some((a) => a.value === activeArea)) {
      list.push({ group: activeArea.startsWith('R:') ? '世界' : '中国', name: areaLabel(activeArea), value: activeArea, count: 0 });
    }
    return list;
  }, [areaScope, activeArea]);

  // 标签轴：同理，基数＝结构层叠加「已选区域」，不含标签自身；数字即点击后筛出的条数。
  // 省份标签已由「区域」轴承载，这里剔除，避免同一维度在两处重复出现。
  const tagScope = useMemo(
    () => (activeArea !== '全部' ? baseScope.filter((i) => matchArea(i, activeArea)) : baseScope),
    [baseScope, activeArea],
  );
  const tags = useMemo(() => {
    const pool = countTags(tagScope).filter((t) => !isProvinceTag(t.tag));
    const top = pool.slice(0, 40);
    // 已选标签若因基数收窄掉出前 40，补回首位，免得"筛了却看不到选中项"
    if (activeTag && !top.some((t) => t.tag === activeTag)) {
      top.unshift(pool.find((t) => t.tag === activeTag) ?? { tag: activeTag, count: 0 });
    }
    return top;
  }, [tagScope, activeTag]);

  // 主列表：结构层 → 区域 → 标签 → 正文检索。
  // 与两根横切轴的计数口径保持一致（各轴计数 = 该轴其余条件 + 本轴选项）。
  let list: ContentItem[] = baseScope;
  if (activeArea !== '全部') list = list.filter((i) => matchArea(i, activeArea));
  if (activeTag) list = list.filter((i) => (i.tags || []).includes(activeTag));
  const q = query.trim();
  if (q) list = searchAll(q, list).map((h) => h.item);

  // 排序：默认按热度（近 30 天 GA4 浏览量）降序；可切到按更新时间倒序。
  // 热度并列或无数据时回退到日期倒序，保证稳定。新页面（0 热度）会沉底，
  // 用户可一键切「最新」排序查看刚上线的内容。
  const sortedList = [...list].sort((a, b) => {
    if (sortMode === 'date') return (b.date || '').localeCompare(a.date || '');
    return (b.heat || 0) - (a.heat || 0) || (b.date || '').localeCompare(a.date || '');
  });

  // 分页：每页 24 条；页码走 URL ?page=N（筛选/搜索变化自动归 1）
  const PAGE_SIZE = 24;
  const totalPages = Math.max(1, Math.ceil(sortedList.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(searchParams.get('page')) || 1), totalPages);
  const pageItems = sortedList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const goPage = (p: number) => {
    const sp = new URLSearchParams(searchParams);
    if (p <= 1) sp.delete('page');
    else sp.set('page', String(p));
    setSearchParams(sp, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // 搜索词变化 → 页码归 1
  useEffect(() => {
    const cur = Number(searchParams.get('page')) || 1;
    if (cur > 1) {
      const sp = new URLSearchParams(searchParams);
      sp.delete('page');
      setSearchParams(sp, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // 各轴写回 URL，便于分享与浏览器前进后退。
  // 区域轴取值为 R:x / P:x，写回时拆成可读的 region / province 两个参数。
  const syncUrl = (patch: Record<string, string | null | undefined> = {}) => {
    const g = (patch.group ?? activeGroup) as string;
    const ty = (patch.type ?? activeType) as string;
    const sub = (patch.subject ?? activeSubject) as string;
    const sl = (patch.stdLevel ?? activeStdLevel) as string;
    const pl = (patch.planLevel ?? activePlanLevel) as string;
    const fm = (patch.format ?? activeFormat) as string;
    const ar = (patch.area ?? activeArea) as string;
    const ac = (patch.access ?? activeAccess) as string;
    const tg = patch.tag !== undefined ? patch.tag : activeTag;
    const p: Record<string, string> = {};
    if (g !== '全部') p.group = g;
    if (ty !== '全部') p.type = ty;
    if (sub !== '全部') p.subject = sub;
    if (sl !== '全部') p.stdLevel = sl;
    if (pl !== '全部') p.planLevel = pl;
    if (fm !== '全部') p.format = fm;
    if (ar.startsWith('R:')) p.region = ar.slice(2);
    else if (ar.startsWith('P:')) p.province = ar.slice(2);
    if (ac !== 'all') p.access = ac;
    if (tg) p.tag = tg;
    const qq = query.trim();
    if (qq) p.q = qq;
    setSearchParams(p, { replace: true });
  };

  // 一键清空所有筛选（右栏底部 + 已选摘要行共用）
  const clearAll = () => {
    setActiveGroup('全部');
    setActiveType('全部');
    setActiveSubject('全部');
    setActiveStdLevel('全部');
    setActivePlanLevel('全部');
    setActiveFormat('全部');
    setActiveArea('全部');
    setActiveAccess('all');
    setActiveTag(null);
    setQuery('');
    setSearchParams({}, { replace: true });
  };

  // 已选条件摘要（可视化展示当前生效的筛选，供一眼核对/清空）
  const activeFilters: string[] = [];
  if (activeGroup !== '全部') activeFilters.push(activeGroup);
  if (activeType !== '全部') activeFilters.push(activeType);
  if (activeSubject !== '全部') activeFilters.push(`学科=${activeSubject}`);
  if (activeStdLevel !== '全部') activeFilters.push(`级别=${activeStdLevel}`);
  if (activePlanLevel !== '全部') activeFilters.push(`层级=${activePlanLevel}`);
  if (activeFormat !== '全部') activeFilters.push(`格式=${activeFormat}`);
  if (activeArea !== '全部') {
    activeFilters.push(`区域=${areaLabel(activeArea)}`);
  }
  if (activeAccess === 'download') activeFilters.push('直接下载');
  if (activeAccess === 'view') activeFilters.push('在线观看');
  if (activeAccess === 'gated') activeFilters.push('需验证码');
  if (activeTag) activeFilters.push(`#${activeTag}`);
  if (q) activeFilters.push(`含“${q}”`);

  // 空态指引：有任一筛选/搜索生效时才提示「清空全部筛选」。
  // 仅做通用引导：各分类都可能有 region/省份标签（如历史地理类带省志标签），
  // 不做「某分类必无某区域」的预设，避免给用户错误暗示。
  const hasAnyFilter = activeFilters.length > 0;
  const emptyHint = hasAnyFilter
    ? q
      ? `没有匹配「${q}」的资料，换个关键词或清空筛选试试。`
      : '这个筛选组合下暂无资料，试试清空部分条件或换个分类。'
    : '该分类下暂无资料，稍后再来看看。';

  // 各轴选择器：切换上一层时清掉下层的残留选择，避免 chips 显示为选中却不生效。
  // 区域/标签是横切轴，换主分类或资料类型后原文可能整体不存在（如图书教材没有省份），
  // 留着必然出现「0 条」死角，所以一并清空；访问方式三态对任何资料都成立，保留。
  const pickGroup = (name: string) => {
    setActiveGroup(name);
    setActiveType('全部');
    setActiveSubject('全部');
    setActiveStdLevel('全部');
    setActivePlanLevel('全部');
    setActiveFormat('全部');
    setActiveArea('全部');
    setActiveTag(null);
    syncUrl({ group: name, type: '全部', subject: '全部', stdLevel: '全部', planLevel: '全部', format: '全部', area: '全部', tag: null });
  };
  const pickType = (name: string) => {
    setActiveType(name);
    setActiveSubject('全部');
    setActiveStdLevel('全部');
    setActivePlanLevel('全部');
    setActiveArea('全部');
    setActiveTag(null);
    syncUrl({ type: name, subject: '全部', stdLevel: '全部', planLevel: '全部', area: '全部', tag: null });
  };
  const pickSubject = (name: string) => { setActiveSubject(name); syncUrl({ subject: name }); };
  const pickStdLevel = (name: string) => { setActiveStdLevel(name); syncUrl({ stdLevel: name }); };
  const pickPlanLevel = (name: string) => { setActivePlanLevel(name); syncUrl({ planLevel: name }); };
  const pickFormat = (name: string) => { setActiveFormat(name); syncUrl({ format: name }); };
  const pickArea = (value: string) => { setActiveArea(value); syncUrl({ area: value }); };

  return (
    <div className="lg:grid lg:grid-cols-[1fr_236px] lg:gap-8">
      {/* 右侧筛选栏：按资料类型。桌面端限高一屏并自身滚动——
          鼠标悬停在筛选栏时只滚筛选栏（overscroll-contain 阻止滚动穿透带动整页），
          悬停在左侧列表时正常滚动页面；避免筛选栏高于视口时下半部分永远看不到。 */}
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1 self-start space-y-6 mb-8 lg:mb-0 lg:order-2">
        {/* 搜索框 */}
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="资料名称 / 说明 / 标签…"
              className="pl-9 rounded-full text-xs"
            />
          </div>
        </div>

        {/* 移动端：筛选区折叠开关（桌面端隐藏，右栏常显） */}
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="lg:hidden w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-muted/30 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            筛选{activeFilters.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px]">{activeFilters.length}</span>
            )}
          </span>
          {filtersOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {/* 移动端可折叠、桌面端常显的筛选主体 */}
        <div className={`space-y-6 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
        {/* 主分类：顶层互斥切换（共性层，按文件形态分），用分段控件强视觉 */}
        <div>
          <SectionLabel className="mb-3">主分类</SectionLabel>
          <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
            {['全部', DL_GROUP_LITERATURE, DL_GROUP_DATA].map((name) => {
              const count = name === '全部' ? all.length : groupCounts[name] ?? 0;
              const active = activeGroup === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => pickGroup(name)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs text-center transition-colors ${
                    active ? 'bg-primary text-white font-medium' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {name}
                  <span className={`ml-1 text-[10px] ${active ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 第二层 + 第三层：文献资料先按「资料性质」细分，选定后再挂该类自己的维度
            （图书教材→学科 / 标准规范→级别 / 规划文本→层级）；地理数据只挂格式。 */}
        {activeGroup !== '全部' && (
          <div className="border-t border-border/60 pt-3 space-y-4">
            <p className="text-[11px] text-muted-foreground/70">子维度 · 随主分类变化</p>

            {activeGroup === DL_GROUP_LITERATURE && (
              <div>
                <SectionLabel className="mb-3">资料类型</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <FacChip label="全部" active={activeType === '全部'} onClick={() => pickType('全部')} count={lit.length} />
                  {docTypeCounts.map((c) => (
                    <FacChip key={c.name} label={c.name} active={activeType === c.name} onClick={() => pickType(c.name)} count={c.count} />
                  ))}
                </div>
              </div>
            )}

            {activeType === '图书教材' && (
              <div>
                <SectionLabel className="mb-3">学科</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <FacChip label="全部" active={activeSubject === '全部'} onClick={() => pickSubject('全部')} count={subjectCounts.reduce((s, c) => s + c.count, 0)} />
                  {subjectCounts.map((c) => (
                    <FacChip key={c.name} label={c.name} active={activeSubject === c.name} onClick={() => pickSubject(c.name)} count={c.count} />
                  ))}
                </div>
              </div>
            )}

            {activeType === '标准规范' && (
              <div>
                <SectionLabel className="mb-3">级别</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <FacChip label="全部" active={activeStdLevel === '全部'} onClick={() => pickStdLevel('全部')} count={stdLevelCounts.reduce((s, c) => s + c.count, 0)} />
                  {stdLevelCounts.map((c) => (
                    <FacChip key={c.name} label={c.name} active={activeStdLevel === c.name} onClick={() => pickStdLevel(c.name)} count={c.count} />
                  ))}
                </div>
              </div>
            )}

            {activeType === '规划文本' && (
              <div>
                <SectionLabel className="mb-3">层级</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <FacChip label="全部" active={activePlanLevel === '全部'} onClick={() => pickPlanLevel('全部')} count={planLevelCounts.reduce((s, c) => s + c.count, 0)} />
                  {planLevelCounts.map((c) => (
                    <FacChip key={c.name} label={c.name} active={activePlanLevel === c.name} onClick={() => pickPlanLevel(c.name)} count={c.count} />
                  ))}
                </div>
              </div>
            )}

            {activeGroup === DL_GROUP_DATA && (
              <div>
                <SectionLabel className="mb-3">格式</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <FacChip label="全部" active={activeFormat === '全部'} onClick={() => pickFormat('全部')} count={formatCounts.reduce((s, c) => s + c.count, 0)} />
                  {formatCounts.map((c) => (
                    <FacChip key={c.name} label={c.name} active={activeFormat === c.name} onClick={() => pickFormat(c.name)} count={c.count} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 区域：全局横切轴。把数据集的 region 字段（世界）与规划类的省份标签（中国）
            合成同一根轴——省份不再单列，避免同一维度在两处重复出现。
            分两组呈现：世界（全球 / 国外）在前，中国（全国 / 各省·自治区·直辖市）在后。 */}
        {areas.length > 0 && (
          <div className="border-t border-border/60 pt-3">
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>区域</SectionLabel>
              {activeArea !== '全部' && (
                <button
                  type="button"
                  onClick={() => pickArea('全部')}
                  className="text-[11px] text-muted-foreground underline hover:text-foreground"
                >
                  清除
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              {(['世界', '中国'] as const).map((g) => {
                const items = areas.filter((a) => a.group === g);
                if (!items.length) return null;
                return (
                  <div key={g} className="space-y-1.5">
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground/70">{g}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((a) => {
                        const active = activeArea === a.value;
                        return (
                          <button
                            key={a.value}
                            type="button"
                            onClick={() => pickArea(a.value)}
                            title={`${a.name} · ${a.count} 份资料`}
                            className={`px-2 py-1 rounded-full text-[11px] font-medium transition-colors ${
                              active
                                ? 'bg-primary text-white'
                                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {a.name}
                            <span className={`ml-1 text-[10px] ${active ? 'opacity-80' : 'opacity-60'}`}>{a.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 全局筛选：不依赖主分类的横向维度 */}
        <div className="border-t border-border/60 pt-3">
          <SectionLabel className="mb-3">访问方式</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {([['all', '全部'], ['download', '直接下载'], ['view', '在线观看'], ['gated', '需验证码']] as const).map(([key, label]) => (
              <FacChip key={key} label={label} active={activeAccess === key} onClick={() => setActiveAccess(key)} />
            ))}
          </div>
        </div>

        {/* 标签：全局横向维度 */}
        <div className="border-t border-border/60 pt-3">
          <SectionLabel className="mb-3">标签</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setActiveTag(null); syncUrl({ tag: null }); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTag === null
                  ? 'bg-primary text-white'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              全部
            </button>
            {tags.map((t) => (
              <button
                key={t.tag}
                type="button"
                onClick={() => { setActiveTag(t.tag); syncUrl({ tag: t.tag }); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeTag === t.tag
                    ? 'bg-primary text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                #{t.tag} <span className="ml-1 text-xs opacity-70">{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 一键清空 */}
        <div className="border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={clearAll}
            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-colors"
          >
            清空全部筛选
          </button>
        </div>
        </div>
      </aside>

      {/* 主区 */}
      <div className="lg:order-1">
        {/* 访问方式筛选已移至右侧「全局筛选」；排序/视图作为结果操作留在主区顶部 */}

        <div className="flex items-center justify-between gap-3 mb-5">
          <p className="text-xs text-muted-foreground">
            共 <span className="font-semibold text-foreground">{list.length}</span> 份资料
            {sortMode === 'heat' && (
              <span className="hidden sm:inline-block ml-2 text-muted-foreground/60">
                · 按近 30 天热度排序，新资料可切「最新」查看
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              {([['heat', '热度'], ['date', '最新']] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortMode(key)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    sortMode === key ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-label="网格视图"
                className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-label="列表视图"
                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            <span className="text-[11px] text-muted-foreground/70">已选</span>
            {activeFilters.map((f) => (
              <span key={f} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-primary/10 text-primary">
                {f}
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] text-muted-foreground underline hover:text-foreground ml-1"
            >
              清空
            </button>
          </div>
        )}

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-muted-foreground">{emptyHint}</p>
            {hasAnyFilter && (
              <button
                type="button"
                onClick={clearAll}
                className="px-4 py-2 rounded-lg text-xs font-medium text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                清空全部筛选
              </button>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pageItems.map((r, i) => (
              <CardAnim key={r.slug} delay={i * 0.05}>
                <Link
                  to={`/downloads/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl bg-background border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 h-full"
                >
                  <ResourceCover item={r} className="aspect-[3/4]" />
                  <div className="flex flex-col flex-1 p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badges item={r} />
                    </div>
                    <h3 className="font-serif text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <div className="mt-2 h-px w-8 bg-primary/40 group-hover:w-14 transition-all" />
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{r.summary}</p>
                    <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      {r.date && <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{r.date}</span>}
                      {r.size && <span>· {r.size}</span>}
                      {(r.heat || 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-orange-500 ml-auto">
                          <Flame className="w-3.5 h-3.5" />{fmtHeat(r.heat!)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </CardAnim>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {pageItems.map((r, i) => (
              <CardAnim key={r.slug} delay={i * 0.04}>
                <Link
                  to={`/downloads/${r.slug}`}
                  className="group flex gap-3 p-2.5 rounded-xl bg-background border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300 h-full"
                >
                  <ResourceCover item={r} className="w-20 sm:w-28 aspect-[3/4] rounded-lg shrink-0" />
                  <div className="flex flex-col flex-1 min-w-0 py-0.5">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badges item={r} hideFormatOnMobile />
                    </div>
                    <h3 className="font-serif text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{r.summary}</p>
                    <div className="mt-auto pt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      {r.date && <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{r.date}</span>}
                      {r.size && <span>· {r.size}</span>}
                      {(r.heat || 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-orange-500 ml-auto">
                          <Flame className="w-3.5 h-3.5" />{fmtHeat(r.heat!)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </CardAnim>
            ))}
          </div>
        )}
        <Pagination page={currentPage} pageCount={totalPages} onChange={goPage} />
      </div>
    </div>
  );
};

const Listing: React.FC<{ type: ListingType }> = ({ type }) => {
  const m = meta[type];
  return (
    <>
      <PageMeta
        title={`${m.title} - 星球小捕手`}
        description={m.subtitle}
        canonical={`https://planetgis.cn/${m.base}`}
      />
      <Breadcrumb />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <header className="mb-10">
            <div className="flex items-end gap-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{m.title}</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2" />
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">{m.subtitle}</p>
          </header>

          {type === 'work' && <WorkGrid />}
          {type === 'tool' && <ToolGrid />}
          {type === 'subdomain' && <SubdomainGrid />}
          {type === 'learn' && <LearnGrid />}
          {type === 'resource' && <ResourceGrid />}
        </div>
      </div>
    </>
  );
};

export default Listing;
