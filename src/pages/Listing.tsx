import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Compass, Globe, Search, Download, Calendar, Lock, LayoutGrid, List } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import CoverImage from '@/components/common/CoverImage';
import { Input } from '@/components/ui/input';
import {
  getWorks,
  getTools,
  getLearns,
  getResources,
  getLearnCategories,
  getLearnSubjects,
  getTags,
  isResourceGated,
  SUBJECT_META,
  LEARN_SUBJECTS,
  type ContentItem,
} from '@/lib/content';
import { searchAll } from '@/lib/knowledge';
import { SubjectIcon } from '@/lib/subjectIcons';
import KnowledgeCard from '@/components/knowledge/KnowledgeCard';
import SectionLabel from '@/components/knowledge/SectionLabel';
import subdomainsData from '@/data/subdomains.json';

type ListingType = 'work' | 'tool' | 'subdomain' | 'learn' | 'resource';

const meta: Record<ListingType, { title: string; subtitle: string; base: string }> = {
  work: {
    title: '地理可视化作品',
    subtitle: '从海平面模拟到城市路网，用交互可视化把复杂的地理数据变成可感知的体验——地理与数据的直观对话。',
    base: 'works',
  },
  tool: {
    title: '地理小工具',
    subtitle: '自研在线地理小工具，让经纬度查询、格式转换、地形分析不再有门槛。',
    base: 'tools',
  },
  subdomain: {
    title: '子站导航',
    subtitle: '星球小捕手旗下站点与专题，按需跳转。',
    base: 'subdomains',
  },
  learn: {
    title: '地理学习',
    subtitle: '按自然地理、人文地理、区域地理、地理信息技术分科组织的自助知识库——支持正文检索，随时来翻、随手可读。',
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

const WorkGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {getWorks().map((w, i) => (
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
);

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
  const levels = getLearnCategories();
  const allTags = useMemo(
    () => getTags().filter((t) => all.some((i) => (i.tags || []).includes(t.tag))).slice(0, 14),
    [all],
  );

  const initialSubject = searchParams.get('subject');
  const [activeSubject, setActiveSubject] = useState(
    initialSubject && subjects.some((s) => s.name === initialSubject) ? initialSubject : '全部',
  );
  const [activeLevel, setActiveLevel] = useState('全部');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const pickSubject = (name: string) => {
    setActiveSubject(name);
    if (name === '全部') setSearchParams({}, { replace: true });
    else setSearchParams({ subject: name }, { replace: true });
  };
  const toggleTag = (t: string) =>
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  // 三级过滤：学科 → 学段 → 标签，最后正文检索
  let base = all;
  if (activeSubject !== '全部') base = base.filter((i) => i.subject === activeSubject);
  if (activeLevel !== '全部') base = base.filter((i) => i.category === activeLevel);
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
        <div>
          <SectionLabel className="mb-3">学科方向</SectionLabel>
          <div className="space-y-1">
            {['全部', ...subjects.map((s) => s.name)].map((name) => {
              const count = name === '全部' ? all.length : subjects.find((s) => s.name === name)?.count ?? 0;
              const active = activeSubject === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => pickSubject(name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {name !== '全部' && (
                      <SubjectIcon name={subjects.find((s) => s.name === name)?.icon || 'Globe'} className="w-4 h-4" />
                    )}
                    {name}
                  </span>
                  <span className="text-xs opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <SectionLabel className="mb-3">学段</SectionLabel>
          <div className="space-y-1">
            {['全部', ...levels].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setActiveLevel(name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeLevel === name ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 主区 */}
      <div>
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索地理知识点、正文关键词…"
            className="pl-9 rounded-full"
          />
        </div>

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

const Badges: React.FC<{ item: ContentItem }> = ({ item }) => (
  <>
    {item.category && (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-foreground/80 text-background">
        {item.category}
      </span>
    )}
    {item.format && (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
        {item.format}
      </span>
    )}
    {isResourceGated(item) ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <Lock className="w-3 h-3" /> 需验证码
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Download className="w-3 h-3" /> 直接下载
      </span>
    )}
  </>
);

const ResourceGrid = () => {
  const all = getResources();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get('tag'));
  // 从 URL ?tag= 同步（支持从资料详情页点标签跳转过来自动过滤）
  useEffect(() => {
    setActiveTag(searchParams.get('tag'));
  }, [searchParams]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeAccess, setActiveAccess] = useState<'all' | 'open' | 'gated'>('all');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const tags = useMemo(
    () => getTags().filter((t) => all.some((i) => (i.tags || []).includes(t.tag))).slice(0, 14),
    [all],
  );
  // 资料类型（category）聚合，用于左侧筛选栏；缺省归为「未分类」。
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of all) {
      const c = r.category || '未分类';
      map.set(c, (map.get(c) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [all]);

  const q = query.trim();
  // 先按资料类型（category）筛选，再做正文检索、标签与访问方式过滤
  const base = activeCategory === '全部' ? all : all.filter((i) => (i.category || '未分类') === activeCategory);
  let list: ContentItem[] = q ? searchAll(q, base).map((h) => h.item) : base;
  if (activeTag) list = list.filter((i) => (i.tags || []).includes(activeTag));
  if (activeAccess !== 'all') {
    list = list.filter((i) => (activeAccess === 'gated' ? isResourceGated(i) : !isResourceGated(i)));
  }

  return (
    <div className="lg:grid lg:grid-cols-[236px_1fr] lg:gap-8">
      {/* 左侧筛选栏：按资料类型 */}
      <aside className="lg:sticky lg:top-24 self-start space-y-6 mb-8 lg:mb-0">
        <div>
          <SectionLabel className="mb-3">资料类型</SectionLabel>
          <div className="space-y-1">
            {['全部', ...categories.map((c) => c.name)].map((name) => {
              const count = name === '全部' ? all.length : categories.find((c) => c.name === name)?.count ?? 0;
              const active = activeCategory === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActiveCategory(name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <span>{name}</span>
                  <span className="text-xs opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 主区 */}
      <div>
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索资料名称、说明或标签…"
            className="pl-9 rounded-full"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => { setActiveTag(null); setSearchParams({}, { replace: true }); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTag === t.tag
                  ? 'bg-primary text-white'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              #{t.tag} <span className="ml-1 text-xs opacity-70">{t.count}</span>
            </button>
          ))}
        </div>

        {/* 访问方式筛选：直接下载 / 需验证码 */}
        <div className="flex flex-wrap gap-2 mb-5">
          {([['all', '全部'], ['open', '直接下载'], ['gated', '需验证码']] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveAccess(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeAccess === key
                  ? 'bg-primary text-white'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mb-5">
          <p className="text-sm text-muted-foreground">
            共 <span className="font-semibold text-foreground">{list.length}</span> 份资料
            {activeCategory !== '全部' && ` · ${activeCategory}`}
            {activeAccess === 'open' && ' · 直接下载'}
            {activeAccess === 'gated' && ' · 需验证码'}
            {q && ` · 含“${q}”`}
          </p>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 shrink-0">
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

        {list.length === 0 ? (
          <p className="text-muted-foreground">没有匹配的资料，换个筛选条件试试。</p>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((r, i) => (
              <CardAnim key={r.slug} delay={i * 0.05}>
                <Link
                  to={`/downloads/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl bg-background border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 h-full"
                >
                  <ResourceCover item={r} className="aspect-[3/4]" />
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badges item={r} />
                    </div>
                    <h3 className="font-serif text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <div className="mt-2 h-px w-8 bg-primary/40 group-hover:w-14 transition-all" />
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{r.summary}</p>
                    <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-muted-foreground">
                      {r.date && <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{r.date}</span>}
                      {r.size && <span>· {r.size}</span>}
                    </div>
                  </div>
                </Link>
              </CardAnim>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((r, i) => (
              <CardAnim key={r.slug} delay={i * 0.04}>
                <Link
                  to={`/downloads/${r.slug}`}
                  className="group flex gap-4 p-3 rounded-xl bg-background border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300 h-full"
                >
                  <ResourceCover item={r} className="w-28 sm:w-36 aspect-[3/4] rounded-lg shrink-0" />
                  <div className="flex flex-col flex-1 min-w-0 py-0.5">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badges item={r} />
                    </div>
                    <h3 className="font-serif text-base font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{r.summary}</p>
                    <div className="mt-auto pt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      {r.date && <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{r.date}</span>}
                      {r.size && <span>· {r.size}</span>}
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
            <p className="kicker mb-3">{type === 'learn' ? '自助知识库' : type === 'work' ? '可视化作品' : type === 'tool' ? '在线工具' : type === 'resource' ? '资料合集' : '站点导航'}</p>
            <div className="flex items-end gap-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{m.title}</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2" />
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
            <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">{m.subtitle}</p>
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
