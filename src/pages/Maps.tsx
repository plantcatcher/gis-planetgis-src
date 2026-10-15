import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map as MapIcon, ArrowRight, Layers, Database, Square, LayoutGrid, List, Flame, Search, X } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import FilterChips from '@/components/common/FilterChips';
import Pagination from '@/components/common/Pagination';
import { Input } from '@/components/ui/input';
import { useSearchTracking } from '@/hooks/use-search-tracking';
import { getMaps, getWorkTopics, getWorkScopes, type ContentItem } from '@/lib/content';
import { getVizMap, type VizMap } from '@/lib/vizmaps';

// 卡片入场动画：initial 保持 opacity:1，确保 SSG 静态 HTML 中文本天生可见（利于 SEO / AdSense）。
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

// 浏览量格式化：1200 -> 1.2k（与资料下载页一致）
const fmtHeat = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

// 卡片上的热度标记（仅在有真实浏览量时显示）
const HeatTag: React.FC<{ heat?: number }> = ({ heat }) =>
  (heat || 0) > 0 ? (
    <span className="inline-flex items-center gap-1 text-xs text-orange-500">
      <Flame className="w-3.5 h-3.5" />
      {fmtHeat(heat ?? 0)}
    </span>
  ) : null;

type ViewMode = 'simple' | 'detail' | 'list';
const MODES: { id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'simple', label: '简单卡片', icon: Square },
  { id: 'detail', label: '详细卡片', icon: LayoutGrid },
  { id: 'list', label: '列表模式', icon: List },
];

/**
 * 可视化互动地图 · 系列汇总页（/maps）
 *
 * 「有哪些地图、叫什么、封面是什么」由 content/maps/<slug>.md 决定；
 * 「用了哪些数据、什么坐标系、多少要素」由 src/data/vizmaps.json 资产登记册补充。
 * 两者按 slug 关联，新增地图改这两处即可，本页不用动。
 */
const Maps: React.FC = () => {
  const maps = getMaps().map((w: ContentItem) => ({
    work: w,
    asset: getVizMap(w.slug) as VizMap | undefined,
  }));
  const [mode, setMode] = useState<ViewMode>('simple');
  // 默认按热度（近 30 天 GA4 浏览量）降序，与资料下载页一致；可切回最新。
  const [sortMode, setSortMode] = useState<'latest' | 'heat'>('heat');
  // 关键词搜索：叠加在主题/地域筛选之上（两者正交组合）
  const [search, setSearch] = useState('');
  useSearchTracking(search, 'maps');

  // 细分筛选：主题（topic）+ 地域（scope），两维正交，均由 content/maps/<slug>.md
  // 的 frontmatter（topics / scope）驱动——写什么就筛什么，新增地图不用改本页。
  const topics = getWorkTopics('map');
  const scopes = getWorkScopes('map');
  const [topic, setTopic] = useState('全部');
  const [scope, setScope] = useState('全部');

  const hitTopic = (w: ContentItem, t: string) => t === '全部' || (w.topics || []).includes(t);
  const hitScope = (w: ContentItem, s: string) => s === '全部' || w.scope === s;
  // 关键词命中：标题 / 简介 / 分类 / 地域 / 主题 / 标签 / 数据源，任一包含即命中（不区分大小写）。
  const hitSearch = (w: ContentItem, m: VizMap | undefined, q: string) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    const haystack = [
      w.title,
      w.summary,
      w.category,
      w.scope,
      (w.topics || []).join(' '),
      (w.tags || []).join(' '),
      m?.source,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  };
  const filtered = maps.filter(
    ({ work, asset }) => hitSearch(work, asset, search) && hitTopic(work, topic) && hitScope(work, scope),
  );

  // 排序：最新=上线日期倒序（date 写在 content/maps/<slug>.md 的 frontmatter）；
  // 热度=近 30 天 GA4 浏览量降序。两者都以日期做并列回退，无日期的条目沉底。
  const sorted = [...filtered].sort((a, b) =>
    sortMode === 'heat'
      ? (b.work.heat || 0) - (a.work.heat || 0) ||
        (b.work.date || '').localeCompare(a.work.date || '') ||
        a.work.order - b.work.order
      : (b.work.date || '').localeCompare(a.work.date || '') || a.work.order - b.work.order,
  );

  // 分页：每页 12 张；主题/地域/排序变化自动归 1
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  useEffect(() => {
    setPage(1);
  }, [topic, scope, sortMode, search]);

  // 分面计数：某个主题的条数按「当前地域」算，某个地域的条数按「当前主题」算
  const topicChips = topics.map(({ name }) => ({
    name,
    count: maps.filter(({ work }) => hitScope(work, scope) && hitTopic(work, name)).length,
  }));
  const scopeChips = scopes.map(({ name }) => ({
    name,
    count: maps.filter(({ work }) => hitTopic(work, topic) && hitScope(work, name)).length,
  }));
  const narrowed = topic !== '全部' || scope !== '全部' || search.trim() !== '';

  const compact = mode === 'simple';

  return (
    <>
      <PageMeta
        title="互动地图 - 星球小捕手"
        description="可以点、可以搜、可以查的地理互动地图系列：把河流、卫星影像、省情、地势等真实地理数据做成可提问的地图，每张都公开数据源与坐标系。"
        canonical="https://planetgis.cn/maps"
      />
      <Breadcrumb />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <header className="mb-8">
            <div className="flex items-end gap-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">互动地图</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2" />
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
            <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
              把真实的地理数据做成可以提问的地图——可点、可搜、可查，而不只是看图。每张地图都标注了数据源与坐标系，以静态文件托管，无需后端数据库。
            </p>
          </header>

          {/* ── 搜索框：按名称 / 简介 / 主题 / 地域 / 标签 / 数据源检索 ── */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索地图名称、主题或数据源…"
              aria-label="搜索互动地图"
              className="pl-9 pr-9 rounded-full text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="清空搜索"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ── 细分筛选：主题 / 地域 ──────────────────────────────── */}
          <div className="space-y-3 mb-6">
            <FilterChips label="主题" items={topicChips} active={topic} onChange={setTopic} allCount={maps.filter(({ work }) => hitScope(work, scope)).length} />
            <FilterChips label="地域" items={scopeChips} active={scope} onChange={setScope} allCount={maps.filter(({ work }) => hitTopic(work, topic)).length} />
          </div>

          {/* 视图切换：仅图标，文字信息移到 title/aria-label（悬停即有提示，不占横向空间） */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <p className="text-sm text-muted-foreground">
              共 {filtered.length} 张地图
              {narrowed && (
                <>
                  <span className="mx-1.5 text-border">|</span>
                  <span>
                    已筛选{search.trim() && ` · “${search.trim()}”`}
                    {scope !== '全部' && ` · ${scope}`}
                    {topic !== '全部' && ` · ${topic}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setTopic('全部');
                      setScope('全部');
                    }}
                    className="ml-3 text-primary hover:underline"
                  >
                    清空筛选
                  </button>
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
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
              <div
                role="group"
                aria-label="切换展示方式"
                className="inline-flex rounded-lg border border-border bg-muted/40 p-1"
              >
                {MODES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    aria-pressed={mode === id}
                    title={label}
                    aria-label={label}
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors ${
                      mode === id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {maps.length === 0 ? (
            <p className="text-muted-foreground">地图正在路上，敬请期待。</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">
              {search.trim()
                ? `没有匹配“${search.trim()}”的地图，换个关键词或清空筛选试试。`
                : '这个组合下暂时没有地图，换个主题或地域看看。'}
            </p>
          ) : mode === 'list' ? (
            /* 列表模式 */
            <div className="space-y-3">
              {pageItems.map(({ work: w, asset: m }, i) => {
                const totalFeatures = m?.data.reduce((s, d) => s + d.features, 0) ?? 0;
                const unit = m?.data[0]?.unit ?? '个要素';
                return (
                  <CardAnim key={w.slug} delay={i * 0.04}>
                    <div className="group flex gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 transition-all duration-300">
                      {/* 封面进地图本体（全屏壳页），下方「查看详情与解读」进 /maps/<slug> 介绍页 */}
                      <Link
                        to={`/maps/${w.slug}/full`}
                        className="shrink-0 w-44 sm:w-56 aspect-video rounded-lg overflow-hidden"
                      >
                        <img
                          src={w.cover}
                          alt={`${w.title} - 星球小捕手可视化互动地图`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-center gap-2 mb-1 text-primary">
                          <MapIcon className="w-4 h-4" />
                          <span className="text-xs font-medium tracking-wide uppercase">
                            {w.category || '互动地图'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold">
                          <Link to={`/maps/${w.slug}/full`} className="group-hover:text-primary transition-colors">
                            {w.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{w.summary}</p>
                        <div className="mt-auto pt-3 flex items-center gap-4">
                          <Link
                            to={`/maps/${w.slug}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                          >
                            查看详情与解读 <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <HeatTag heat={w.heat} />
                          {m && (
                            <span className="ml-auto text-xs text-muted-foreground hidden sm:inline">
                              {totalFeatures.toLocaleString()} {unit} · {m.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardAnim>
                );
              })}
            </div>
          ) : (
            /* 卡片模式（simple / detail） */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pageItems.map(({ work: w, asset: m }, i) => {
                const totalFeatures = m?.data.reduce((s, d) => s + d.features, 0) ?? 0;
                const unit = m?.data[0]?.unit ?? '个要素';
                return (
                  <CardAnim key={w.slug} delay={i * 0.08}>
                    <div className="group flex flex-col h-full overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                      {/* 同上：封面与标题 → 地图本体（全屏），底部链接 → /maps/<slug> 介绍页 */}
                      <Link to={`/maps/${w.slug}/full`} className="block">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={w.cover}
                            alt={`${w.title} - 星球小捕手可视化互动地图`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="w-full text-center text-sm font-medium text-white/90">打开地图 →</span>
                          </div>
                        </div>
                      </Link>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                          <MapIcon className="w-4 h-4" />
                          <span className="text-xs font-medium tracking-wide uppercase">{w.category || '互动地图'}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">
                          <Link to={`/maps/${w.slug}/full`} className="group-hover:text-primary transition-colors">
                            {w.title}
                          </Link>
                        </h3>
                        <p className={`text-sm text-muted-foreground ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
                          {w.summary}
                        </p>

                        {/* 详细卡片才展示数据源明细 */}
                        {!compact && m && (
                          <dl className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-start gap-1.5">
                              <Layers className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <dd>
                                共 {totalFeatures.toLocaleString()} {unit}
                                {m.data.length > 1 &&
                                  `（${m.data.map((d) => d.features.toLocaleString()).join(' + ')}）`}
                              </dd>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <Database className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <dd>{m.source}</dd>
                            </div>
                          </dl>
                        )}

                        <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-4">
                          <Link
                            to={`/maps/${w.slug}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                          >
                            查看详情与解读 <ArrowRight className="w-3.5 h-3.5 group-hover:gap-2 transition-all" />
                          </Link>
                          <HeatTag heat={w.heat} />
                        </div>
                      </div>
                    </div>
                  </CardAnim>
                );
              })}
            </div>
          )}

          <Pagination
            page={currentPage}
            pageCount={totalPages}
            onChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          <section className="mt-14 rounded-2xl border border-border bg-card/40 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-3">关于数据</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              需要原始数据自己做分析？可前往
              <Link to="/downloads" className="ml-1 text-primary hover:underline">资料下载</Link>
              获取对应的矢量数据包。
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Maps;
