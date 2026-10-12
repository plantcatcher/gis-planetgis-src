import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Compass, Globe, Search, Calendar, LayoutGrid, List, Flame, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import CoverImage from '@/components/common/CoverImage';
import AccessBadge from '@/components/common/AccessBadge';
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
  isResourceGated,
  isResourceViewOnly,
  SUBJECT_META,
  LEARN_SUBJECTS,
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

// 精选作品总页：按 category（真实子分类：互动地图 / 地理游戏 / 模拟实验 / 趣味测试）筛选。
// 作品归属哪个系列页由 frontmatter 的 series 声明，这里只做展示层筛选。
const WorkGrid = () => {
  const all = getWorks();
  const categories = useMemo(() => getWorkCategories(), []);
  const [active, setActive] = useState('全部');
  const list = active === '全部' ? all : all.filter((w) => (w.category || '未分类') === active);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {list.map((w, i) => (
          <CardAnim key={w.slug} delay={i * 0.08}>
            <Link
              to={`/works/${w.slug}`}
              className="group block overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
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
                  <span className="w-full text-center text-sm font-medium text-white/90">查看详情与解读 →</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{w.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{w.summary}</p>
              </div>
            </Link>
          </CardAnim>
        ))}
      </div>
    </>
  );
};

const ToolGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {getTools().map((t, i) => (
      <CardAnim key={t.slug} delay={i * 0.08}>
        <Link
          to={`/tools/${t.slug}`}
          className="group flex gap-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300"
        >
          <div className="shrink-0 w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
            <Compass className="w-8 h-8" />
          </div>
          <div>
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                {t.title} <ExternalLink className="w-4 h-4" />
              </h3>
              <p className="text-sm text-muted-foreground">{t.summary}</p>
          </div>
        </Link>
      </CardAnim>
    ))}
  </div>
);

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
            <Globe className="w-8 h-8 text-primary" />
            <span className="font-bold text-base">{s.title}</span>
            <span className="text-xs text-muted-foreground w-full text-left">{s.description}</span>
            <span className="mt-auto text-xs text-primary flex items-center gap-1">
              前往 <ExternalLink className="w-3 h-3" />
            </span>
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

        <p className="text-sm text-muted-foreground mb-5">
          共 <span className="font-semibold text-foreground">{searched.length}</span> 篇
          {activeSubject !== '全部' && ` · ${activeSubject}`}
          {activeCategory !== '全部' && ` · ${activeCategory}`}
          {activeLevel !== '全部' && ` · ${activeLevel}`}
          {q && ` · 含“${q}”`}
        </p>

        {searched.length === 0 ? (
          <p className="text-muted-foreground">该筛选下还没有内容，敬请期待。</p>
        ) : (
          <div className="space-y-10">
            {groups.map((g) => (
              <section key={g.name}>
                <div className="flex items-center gap-3 mb-4">
                  <SubjectIcon name={SUBJECT_META[g.name]?.icon || 'Globe'} className="w-5 h-5 text-primary" />
                  <h2 className="font-serif text-lg font-bold">{g.name}</h2>
                  <span className="text-xs text-muted-foreground">{g.items.length} 篇</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {g.items.map((a, i) => (
                    <CardAnim key={a.slug} delay={i * 0.05}>
                      <KnowledgeCard item={a} />
                    </CardAnim>
                  ))}
                </div>
              </section>
            ))}
          </div>
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

  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get('tag'));
  // 从 URL ?tag= 同步（支持从资料详情页点标签跳转过来自动过滤）
  useEffect(() => {
    setActiveTag(searchParams.get('tag'));
  }, [searchParams]);
  const [activeGroup, setActiveGroup] = useState<string>('全部');
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [activeRegion, setActiveRegion] = useState<string>('全部');
  const [activeFormat, setActiveFormat] = useState<string>('全部');
  const [activeAccess, setActiveAccess] = useState<'all' | 'download' | 'view' | 'gated'>('all');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [sortMode, setSortMode] = useState<'heat' | 'date'>('heat');
  // 移动端筛选区默认收起（桌面端 lg:block 常显）
  const [filtersOpen, setFiltersOpen] = useState(false);
  // 标签栏：计数与排序均基于「本页资料」，数字即点击后筛出的条数；
  // 数量上限 30，保证省级标签（广西/安徽/福建…）不被截断
  const tags = useMemo(() => countTags(all).slice(0, 30), [all]);
  // 顶层分组 + 双轴筛选
  const grp = (i: ContentItem) => i.group || (i.category === '地理数据' ? '地理数据' : '书籍');
  const groupCounts = useMemo(() => {
    const m: Record<string, number> = { 书籍: 0, 地理数据: 0 };
    for (const r of all) m[grp(r)] = (m[grp(r)] || 0) + 1;
    return m;
  }, [all]);
  // 书籍学科子类（书籍范围内计数）
  const bookCats = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of all) if (grp(r) === '书籍') { const c = r.category || '未分类'; map.set(c, (map.get(c) || 0) + 1); }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [all]);
  // 地理数据：区域 × 格式 两轴计数
  const regionCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of all) if (grp(r) === '地理数据') { const c = r.region || '其他'; map.set(c, (map.get(c) || 0) + 1); }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [all]);
  const formatCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of all) if (grp(r) === '地理数据') { const c = r.dataFormat || '其他'; map.set(c, (map.get(c) || 0) + 1); }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [all]);

  const q = query.trim();
  // 1) 顶层分组
  let scope = activeGroup === '全部' ? all : all.filter((i) => grp(i) === activeGroup);
  // 2) 书籍按学科；地理数据按 区域 × 格式（两轴独立 AND）
  if (activeGroup === '书籍' && activeCategory !== '全部') {
    scope = scope.filter((i) => (i.category || '未分类') === activeCategory);
  }
  if (activeGroup === '地理数据') {
    if (activeRegion !== '全部') scope = scope.filter((i) => (i.region || '其他') === activeRegion);
    if (activeFormat !== '全部') scope = scope.filter((i) => (i.dataFormat || '其他') === activeFormat);
  }
  let list: ContentItem[] = q ? searchAll(q, scope).map((h) => h.item) : scope;
  if (activeTag) list = list.filter((i) => (i.tags || []).includes(activeTag));
  if (activeAccess !== 'all') {
    // 三态：直接下载（有文件、无门禁）/ 在线观看（仅官方在线阅读链接）/ 需验证码
    list = list.filter((i) =>
      activeAccess === 'gated'
        ? isResourceGated(i)
        : activeAccess === 'view'
          ? isResourceViewOnly(i)
          : !isResourceGated(i) && !isResourceViewOnly(i),
    );
  }

  // 排序：默认按热度（近 30 天 GA4 浏览量）降序；可切到按更新时间倒序。
  // 热度并列或无数据时回退到日期倒序，保证稳定。新页面（0 热度）会沉底，
  // 用户可一键切「最新」排序查看刚上线的内容。
  const sortedList = [...list].sort((a, b) => {
    if (sortMode === 'date') return (b.date || '').localeCompare(a.date || '');
    return (b.heat || 0) - (a.heat || 0) || (b.date || '').localeCompare(a.date || '');
  });

  // 一键清空所有筛选（右栏底部 + 已选摘要行共用）
  const clearAll = () => {
    setActiveGroup('全部');
    setActiveCategory('全部');
    setActiveRegion('全部');
    setActiveFormat('全部');
    setActiveAccess('all');
    setActiveTag(null);
    setQuery('');
    setSearchParams({}, { replace: true });
  };

  // 已选条件摘要（可视化展示当前生效的筛选，供一眼核对/清空）
  const activeFilters: string[] = [];
  if (activeGroup !== '全部') activeFilters.push(activeGroup);
  if (activeGroup === '书籍' && activeCategory !== '全部') activeFilters.push(`学科=${activeCategory}`);
  if (activeGroup === '地理数据' && activeRegion !== '全部') activeFilters.push(`区域=${activeRegion}`);
  if (activeGroup === '地理数据' && activeFormat !== '全部') activeFilters.push(`格式=${activeFormat}`);
  if (activeAccess === 'download') activeFilters.push('直接下载');
  if (activeAccess === 'view') activeFilters.push('在线观看');
  if (activeAccess === 'gated') activeFilters.push('需验证码');
  if (activeTag) activeFilters.push(`#${activeTag}`);
  if (q) activeFilters.push(`含“${q}”`);

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
        {/* 主分类：顶层互斥切换，用分段控件强视觉 */}
        <div>
          <SectionLabel className="mb-3">主分类</SectionLabel>
          <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
            {['全部', '书籍', '地理数据'].map((name) => {
              const count = name === '全部' ? all.length : groupCounts[name] ?? 0;
              const active = activeGroup === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActiveGroup(name)}
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

        {/* 子维度：依赖主分类，用分隔线 + 说明区隔层级 */}
        {(activeGroup === '书籍' || activeGroup === '地理数据') && (
          <div className="border-t border-border/60 pt-3 space-y-4">
            <p className="text-[11px] text-muted-foreground/70">子维度 · 随主分类变化</p>
            {activeGroup === '书籍' && (
              <div>
                <SectionLabel className="mb-3">学科</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <FacChip label="全部" active={activeCategory === '全部'} onClick={() => setActiveCategory('全部')} count={bookCats.reduce((s, c) => s + c.count, 0)} />
                  {bookCats.map((c) => (
                    <FacChip key={c.name} label={c.name} active={activeCategory === c.name} onClick={() => setActiveCategory(c.name)} count={c.count} />
                  ))}
                </div>
              </div>
            )}
            {activeGroup === '地理数据' && (
              <>
                <div>
                  <SectionLabel className="mb-3">区域</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    <FacChip label="全部" active={activeRegion === '全部'} onClick={() => setActiveRegion('全部')} count={regionCounts.reduce((s, c) => s + c.count, 0)} />
                    {regionCounts.map((c) => (
                      <FacChip key={c.name} label={c.name} active={activeRegion === c.name} onClick={() => setActiveRegion(c.name)} count={c.count} />
                    ))}
                  </div>
                </div>
                <div>
                  <SectionLabel className="mb-3">格式</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    <FacChip label="全部" active={activeFormat === '全部'} onClick={() => setActiveFormat('全部')} count={formatCounts.reduce((s, c) => s + c.count, 0)} />
                    {formatCounts.map((c) => (
                      <FacChip key={c.name} label={c.name} active={activeFormat === c.name} onClick={() => setActiveFormat(c.name)} count={c.count} />
                    ))}
                  </div>
                </div>
              </>
            )}
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
              onClick={() => { setActiveTag(null); setSearchParams({}, { replace: true }); }}
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
                onClick={() => { setActiveTag(t.tag); setSearchParams({ tag: t.tag }); }}
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
          <p className="text-muted-foreground">没有匹配的资料，换个筛选条件试试。</p>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedList.map((r, i) => (
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
            {sortedList.map((r, i) => (
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
                    <h3 className="font-serif text-sm font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
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
