import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map as MapIcon, ArrowRight, Layers, Database, Square, LayoutGrid, List, Flame, Search, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import Pagination from '@/components/common/Pagination';
import SectionLabel from '@/components/knowledge/SectionLabel';
import { Input } from '@/components/ui/input';
import { useSearchTracking } from '@/hooks/use-search-tracking';
import { getMaps, getWorkTopics, getWorkScopes, type ContentItem } from '@/lib/content';
import { getVizMap, type VizMap } from '@/lib/vizmaps';
import { useI18n } from '@/i18n/LocaleContext';
import { localizeLabel, localizeUnit } from '@/i18n/labels';
import type { DictKey } from '@/i18n/LocaleContext';

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
// 视图名随语言变，这里存词典 key，渲染时才取文案
const MODES: {
  id: ViewMode;
  labelKey: DictKey;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'simple', labelKey: 'maps.mode.simple', icon: Square },
  { id: 'detail', labelKey: 'maps.mode.detail', icon: LayoutGrid },
  { id: 'list', labelKey: 'maps.mode.list', icon: List },
];

/**
 * 可视化互动地图 · 系列汇总页（/maps）
 *
 * 「有哪些地图、叫什么、封面是什么」由 content/maps/<slug>.md 决定；
 * 「用了哪些数据、什么坐标系、多少要素」由 src/data/vizmaps.json 资产登记册补充。
 * 两者按 slug 关联，新增地图改这两处即可，本页不用动。
 */
const Maps: React.FC = () => {
  const { lang, t } = useI18n();
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
  // 移动端筛选栏默认收起（桌面端 lg:block 常显，复用 /downloads 的折叠模式）
  const [filtersOpen, setFiltersOpen] = useState(false);

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
        title={`${t('maps.title')} - ${t('brand.name')}`}
        description={t('maps.metaDescription')}
        canonical="https://planetgis.cn/maps"
      />
      <Breadcrumb />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <header className="mb-8">
            <div className="flex items-end gap-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('maps.title')}</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2" />
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
            <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
              {t('maps.subtitle')}
            </p>
          </header>

          {/* ── 双栏：左侧轻量筛选栏 + 右侧地图主区 ── */}
          <div className="lg:grid lg:grid-cols-[236px_1fr] lg:gap-8">
            {/* 左侧筛选栏：搜索 + 主题 + 地域。移动端默认收起、桌面端常显（复用 /downloads 折叠模式） */}
            <aside className="lg:sticky lg:top-24 self-start space-y-6 mb-8 lg:mb-0">
              {/* 移动端：筛选区折叠开关（桌面端隐藏，侧栏常显） */}
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className="lg:hidden w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-muted/30 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                  {t('list.filter')}
                  {narrowed && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px]">
                      {t('maps.filtered')}
                    </span>
                  )}
                </span>
                {filtersOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {/* 移动端可折叠、桌面端常显的筛选主体 */}
              <div className={`space-y-6 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
                {/* 搜索框：按名称 / 简介 / 主题 / 地域 / 标签 / 数据源检索 */}
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('maps.searchPlaceholder')}
                      aria-label={t('maps.searchAria')}
                      className="pl-9 pr-9 rounded-full text-xs"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        aria-label={t('maps.clearSearch')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 主题 */}
                <div>
                  <SectionLabel className="mb-3 !text-[11px]">{t('maps.topic')}</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setTopic('全部')}
                      aria-pressed={topic === '全部'}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        topic === '全部' ? 'bg-primary text-white' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {t('facet.all')}
                      <span className="ml-1 text-xs opacity-70">{maps.filter(({ work }) => hitScope(work, scope)).length}</span>
                    </button>
                    {topicChips.map(({ name, count }) => {
                      const active = topic === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setTopic(name)}
                          aria-pressed={active}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            active ? 'bg-primary text-white' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {localizeLabel(name, lang)}
                          <span className="ml-1 text-[11px] opacity-70">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 地域 */}
                <div>
                  <SectionLabel className="mb-3 !text-[11px]">{t('maps.scope')}</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setScope('全部')}
                      aria-pressed={scope === '全部'}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        scope === '全部' ? 'bg-primary text-white' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {t('facet.all')}
                      <span className="ml-1 text-xs opacity-70">{maps.filter(({ work }) => hitTopic(work, topic)).length}</span>
                    </button>
                    {scopeChips.map(({ name, count }) => {
                      const active = scope === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setScope(name)}
                          aria-pressed={active}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            active ? 'bg-primary text-white' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {localizeLabel(name, lang)}
                          <span className="ml-1 text-[11px] opacity-70">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 一键清空筛选（有筛选生效时才显示） */}
                {narrowed && (
                  <div className="border-t border-border/60 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setTopic('全部');
                        setScope('全部');
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {t('list.clearAll')}
                    </button>
                  </div>
                )}
              </div>
            </aside>

            {/* 右侧主区：结果摘要 + 排序/视图（这两个是「浏览工具」，留在顶部顺手） */}
            <div>
              {/* 视图切换：仅图标，文字信息移到 title/aria-label（悬停即有提示，不占横向空间） */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  {t('maps.count', { n: filtered.length })}
                  {narrowed && (
                    <>
                      <span className="mx-1.5 text-border">|</span>
                      <span>
                        {t('maps.filtered')}
                        {search.trim() && ` · “${search.trim()}”`}
                        {scope !== '全部' && ` · ${localizeLabel(scope, lang)}`}
                        {topic !== '全部' && ` · ${localizeLabel(topic, lang)}`}
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
                        {t('maps.clearFilter')}
                      </button>
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                    {([['latest', t('list.latest')], ['heat', t('list.heat')]] as const).map(([key, label]) => (
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
                    aria-label={t('maps.modeGroup')}
                    className="inline-flex rounded-lg border border-border bg-muted/40 p-1"
                  >
                    {MODES.map(({ id, labelKey, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setMode(id)}
                        aria-pressed={mode === id}
                        title={t(labelKey)}
                        aria-label={t(labelKey)}
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
            <p className="text-muted-foreground">{t('maps.empty.all')}</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">
              {search.trim()
                ? t('maps.empty.search', { q: search.trim() })
                : t('maps.empty.filter')}
            </p>
          ) : mode === 'list' ? (
            /* 列表模式 */
            <div className="space-y-3">
              {pageItems.map(({ work: w, asset: m }, i) => {
                const totalFeatures = m?.data.reduce((s, d) => s + d.features, 0) ?? 0;
                const rawUnit = m?.data[0]?.unit;
                const unit = rawUnit ? localizeUnit(rawUnit, lang) : t('maps.unit.default');
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
                          alt={t('maps.alt', { title: w.title })}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-center gap-2 mb-1 text-primary">
                          <MapIcon className="w-4 h-4" />
                          <span className="text-xs font-medium tracking-wide uppercase">
                            {localizeLabel(w.category || t('maps.title'), lang)}
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
                            {t('list.work.detail')} <ArrowRight className="w-3.5 h-3.5" />
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
                const rawUnit = m?.data[0]?.unit;
                const unit = rawUnit ? localizeUnit(rawUnit, lang) : t('maps.unit.default');
                return (
                  <CardAnim key={w.slug} delay={i * 0.08}>
                    <div className="group flex flex-col h-full overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                      {/* 同上：封面与标题 → 地图本体（全屏），底部链接 → /maps/<slug> 介绍页 */}
                      <Link to={`/maps/${w.slug}/full`} className="block">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={w.cover}
                            alt={t('maps.alt', { title: w.title })}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="w-full text-center text-sm font-medium text-white/90">{t('maps.open')}</span>
                          </div>
                        </div>
                      </Link>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                          <MapIcon className="w-4 h-4" />
                          <span className="text-xs font-medium tracking-wide uppercase">
                            {localizeLabel(w.category || t('maps.title'), lang)}
                          </span>
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
                                {t('maps.features', { n: totalFeatures.toLocaleString(), unit })}
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
                            {t('list.work.detail')} <ArrowRight className="w-3.5 h-3.5 group-hover:gap-2 transition-all" />
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
            <h2 className="text-xl font-bold mb-3">{t('maps.about')}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('maps.aboutLead')}
              <Link to="/downloads" className="ml-1 text-primary hover:underline">{t('maps.aboutLink')}</Link>
              {t('maps.aboutTail')}
            </p>
          </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Maps;
