import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Compass, Globe, Search } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import CoverImage from '@/components/common/CoverImage';
import { Input } from '@/components/ui/input';
import {
  getWorks,
  getTools,
  getArticles,
  getLearns,
  getLearnCategories,
  getLearnSubjects,
  getTags,
  SUBJECT_META,
  LEARN_SUBJECTS,
  type ContentType,
  type ContentItem,
} from '@/lib/content';
import { searchAll } from '@/lib/knowledge';
import { SubjectIcon } from '@/lib/subjectIcons';
import KnowledgeCard from '@/components/knowledge/KnowledgeCard';
import SectionLabel from '@/components/knowledge/SectionLabel';
import subdomainsData from '@/data/subdomains.json';

type ListingType = 'work' | 'tool' | 'article' | 'subdomain' | 'learn';

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
  article: {
    title: '地理科普文章',
    subtitle: '地理科普深度图文，覆盖自然地理、气候环境、人文地理与 GIS——用通俗语言解读专业地理现象，适合从初中到大学的地理学习者。',
    base: 'articles',
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
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{w.title}</h3>
            <p className="text-muted-foreground line-clamp-2">{w.summary}</p>
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
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              {t.title} <ExternalLink className="w-4 h-4" />
            </h3>
            <p className="text-muted-foreground">{t.summary}</p>
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
            <span className="font-bold text-lg">{s.title}</span>
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

const ArticleGrid = () => {
  const all = getArticles();
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const tags = useMemo(
    () => getTags().filter((t) => all.some((i) => (i.tags || []).includes(t.tag))).slice(0, 14),
    [all],
  );

  const q = query.trim();
  let list: ContentItem[] = q ? searchAll(q, all).map((h) => h.item) : all;
  if (activeTag) list = list.filter((i) => (i.tags || []).includes(activeTag));

  return (
    <div>
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章标题、正文或标签…"
          className="pl-9 rounded-full"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
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
            onClick={() => setActiveTag(t.tag)}
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

      {list.length === 0 ? (
        <p className="text-muted-foreground">没有匹配的文章，换个关键词试试。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((a, i) => (
            <CardAnim key={a.slug} delay={i * 0.05}>
              <KnowledgeCard item={a} />
            </CardAnim>
          ))}
        </div>
      )}
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
                  <h2 className="font-serif text-xl font-bold">{g.name}</h2>
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
            <p className="kicker mb-3">{type === 'learn' ? '自助知识库' : type === 'article' ? '深度图文' : type === 'work' ? '可视化作品' : type === 'tool' ? '在线工具' : '站点导航'}</p>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{m.title}</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2" />
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">{m.subtitle}</p>
          </header>

          {type === 'work' && <WorkGrid />}
          {type === 'tool' && <ToolGrid />}
          {type === 'article' && <ArticleGrid />}
          {type === 'subdomain' && <SubdomainGrid />}
          {type === 'learn' && <LearnGrid />}
        </div>
      </div>
    </>
  );
};

export default Listing;
