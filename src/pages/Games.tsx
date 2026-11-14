import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PAGE_SIZE, usePageNav, usePageParam } from '@/lib/pagination';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowRight, Flame, Play, Trophy, ChevronDown, Sparkles } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import FilterChips from '@/components/common/FilterChips';
import Pagination from '@/components/common/Pagination';
import SectionLabel from '@/components/knowledge/SectionLabel';
import { getGames, getWorkTopics, getWorkScopes, type ContentItem } from '@/lib/content';
import { useI18n } from '@/i18n/LocaleContext';
import { localizeLabel } from '@/i18n/labels';

// 卡片入场动画：initial 保持 opacity:1，确保 SSG 静态 HTML 中文本天生可见（利于 SEO / AdSense）。
const CardAnim: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className,
}) => (
  <motion.div
    className={className}
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

// 四张卡各用一种强调色，避免整页单色。这里必须是完整的 Tailwind 类字符串，
// 不能靠模板拼接生成类名，否则生产构建时会被 tree-shake 掉。
const ACCENTS = [
  {
    line: 'from-blue-500 via-blue-400 to-transparent',
    chip: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
  },
  {
    line: 'from-emerald-500 via-emerald-400 to-transparent',
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  },
  {
    line: 'from-cyan-500 via-cyan-400 to-transparent',
    chip: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300',
  },
  {
    line: 'from-amber-500 via-amber-400 to-transparent',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  },
] as const;

// 地理小游戏汇总页：与「互动地图 /maps」「精选作品 /works」「地理小工具 /tools」结构对称。
// 数据源就是 content/games 下的 md（文件夹即归属，不再需要 series 字段），
// 每个 link 指向对应的游戏 iframe 页，SEO 正文在其 /games/<slug> 介绍页。
//
// UI 结构（2026-11-06 改版）：顶部深色「游戏大厅」Hero + 人气推荐封面；
// 下方筛选卡 + 双列横向游戏卡；底部成绩同步提示。筛选/排序/分页逻辑不变。
const Games: React.FC = () => {
  const { lang, t } = useI18n();
  const games = getGames();

  // 细分筛选：玩法主题（topics）+ 地域题材（scope），与 /maps 同一套组件与数据口径，
  // 均来自 content/games/<slug>.md 的 frontmatter，新增游戏改 md 即生效。
  const topics = getWorkTopics('game');
  const scopes = getWorkScopes('game');
  const [topic, setTopic] = useState('全部');
  const [scope, setScope] = useState('全部');
  const [searchParams] = useSearchParams();
  // 默认按热度（近 30 天 GA4 浏览量）降序，与资料下载页一致；可切回最新。
  const [sortMode, setSortMode] = useState<'latest' | 'heat'>('heat');

  // 形参不能叫 t —— 会遮蔽上面的翻译函数
  const hitTopic = (g: ContentItem, topicValue: string) =>
    topicValue === '全部' || (g.topics || []).includes(topicValue);
  const hitScope = (g: ContentItem, scopeValue: string) => scopeValue === '全部' || g.scope === scopeValue;
  const filtered = games.filter((g) => hitTopic(g, topic) && hitScope(g, scope));

  // 排序：最新=上线日期倒序（date 写在 content/games/<slug>.md 的 frontmatter）；
  // 热度=近 30 天 GA4 浏览量降序。两者都以日期做并列回退，无日期的条目沉底。
  const sorted = [...filtered].sort((a, b) =>
    sortMode === 'heat'
      ? (b.heat || 0) - (a.heat || 0) ||
        (b.date || '').localeCompare(a.date || '') ||
        a.order - b.order
      : (b.date || '').localeCompare(a.date || '') || a.order - b.order,
  );

  // Hero 的「人气推荐」固定取全站热度第一，不随下方筛选变化，避免筛选后首屏跳变。
  const featured = [...games].sort(
    (a, b) =>
      (b.heat || 0) - (a.heat || 0) ||
      (b.date || '').localeCompare(a.date || '') ||
      a.order - b.order,
  )[0];
  const featuredUrl = featured ? featured.link || `/${featured.slug}` : '/games';

  // 分页：每页 12 款，页码走**路径**（/games/page/2），与 /maps、/downloads 同一套口径。
  // SSG 下 query 不参与文件映射，?page=N 拿到的永远是同一份 dist/games.html。
  const size = PAGE_SIZE.games;
  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  const { currentPage, goPage, setFilters } = usePageNav(totalPages);
  const pageItems = sorted.slice((currentPage - 1) * size, currentPage * size);
  // 主题/地域/排序变化 → 退回第 1 页（ref 跳过首次挂载，直接访问 /games/page/2 时保留页码）
  const filterSig = `${topic}|${scope}|${sortMode}`;
  const prevFilterSig = useRef(filterSig);
  useEffect(() => {
    if (prevFilterSig.current === filterSig) return;
    prevFilterSig.current = filterSig;
    setFilters(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSig]);

  // 分面计数：主题的条数按当前地域算，地域的条数按当前主题算
  const topicChips = topics.map(({ name }) => ({
    name,
    count: games.filter((g) => hitScope(g, scope) && hitTopic(g, name)).length,
  }));
  const scopeChips = scopes.map(({ name }) => ({
    name,
    count: games.filter((g) => hitTopic(g, topic) && hitScope(g, name)).length,
  }));
  const narrowed = topic !== '全部' || scope !== '全部';

  // 分页页标题/canonical 各自独立（目前只有 4 款游戏、1 页，但口径与其它列表页保持一致）
  const page = usePageParam();
  const pageTag = page > 1 ? t('pager.pageSuffix', { n: page }) : '';

  return (
    <>
      <PageMeta
        title={pageTag ? `${t('games.title')}（${pageTag}） - ${t('brand.name')}` : `${t('games.title')} - ${t('brand.name')}`}
        description={t('games.metaDescription')}
      />
      <Breadcrumb />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
          {/* ── 游戏大厅 Hero ───────────────────────────────────────
              固定深色，作为整页唯一的视觉焦点；浅色/深色主题下都保持同一套白字，
              避免出现「深色主题里深色卡看不出边界」的情况。 */}
          <section className="relative overflow-hidden rounded-3xl bg-[#0a1728] text-white border border-white/10">
            {/* 经纬网格底纹 */}
            <div
              className="absolute inset-0 opacity-[0.16] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.22) 1px, transparent 1px)',
                backgroundSize: '34px 34px',
                maskImage: 'linear-gradient(to right, transparent, black 35%, black 70%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 35%, black 70%, transparent)',
              }}
            />
            {/* 光晕 */}
            <div className="absolute -top-28 -right-20 w-[420px] h-[420px] rounded-full bg-primary/30 blur-[110px] pointer-events-none" />
            <div className="absolute -bottom-40 left-1/4 w-[360px] h-[360px] rounded-full bg-secondary/20 blur-[110px] pointer-events-none" />
            {/* 缓慢旋转的地球线框，与首页 profile 区同一套视觉语言 */}
            <svg
              viewBox="0 0 320 320"
              className="absolute -right-24 -top-24 w-[380px] h-[380px] max-w-none text-white/[0.07] animate-spin-slow pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden="true"
            >
              <circle cx="160" cy="160" r="150" />
              <ellipse cx="160" cy="160" rx="150" ry="48" />
              <ellipse cx="160" cy="160" rx="150" ry="100" />
              <ellipse cx="160" cy="160" rx="48" ry="150" />
              <ellipse cx="160" cy="160" rx="100" ry="150" />
              <line x1="10" y1="160" x2="310" y2="160" />
              <line x1="160" y1="10" x2="160" y2="310" />
            </svg>

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-center p-7 md:p-10 lg:p-12">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60">
                  <span className="w-6 h-px bg-primary" />
                  GEO GAMES
                  <span className="text-white/25">/</span>
                  {t('games.kicker')}
                </div>
                <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
                  {t('games.title')}
                  {pageTag && <span className="ml-3 text-xl font-medium text-white/50">{pageTag}</span>}
                </h1>
                <p className="mt-4 max-w-lg text-sm md:text-base leading-relaxed text-white/70">
                  {t('games.subtitle')}
                </p>

                <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-white/75">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {t('games.heroStats', { n: games.length, m: topics.length })}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  {featured && (
                    <Link
                      to={featuredUrl}
                      className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-5 py-2.5 text-sm font-bold hover:bg-white/90 transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {t('games.playNow')}
                    </Link>
                  )}
                  <a
                    href="#all-games"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10 transition-colors"
                  >
                    {t('games.browse')}
                    <ChevronDown className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* 人气推荐：直接用游戏自身的封面，点击整块进入游戏 */}
              {featured && (
                <Link
                  to={featuredUrl}
                  className="group relative block overflow-hidden rounded-2xl border border-white/15 shadow-2xl shadow-black/40 aspect-[4/3] lg:aspect-[4/3] lg:min-h-[290px]"
                >
                  <img
                    src={featured.cover}
                    decoding="async"
                    alt={t('games.alt', { title: featured.title })}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08121f]/95 via-[#08121f]/20 to-transparent" />
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 backdrop-blur px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
                    <Flame className="w-3 h-3 text-amber-300" />
                    {t('games.featured')}
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-white/65 mb-1">
                        {localizeLabel(featured.category || t('games.categoryDefault'), lang)}
                      </p>
                      <h2 className="text-lg md:text-xl font-bold text-white truncate">
                        {featured.title}
                      </h2>
                    </div>
                    <span className="shrink-0 w-11 h-11 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </section>

          {/* ── 全部游戏 ─────────────────────────────────────────── */}
          <section id="all-games" className="mt-12 scroll-mt-24">
            <div className="flex items-end gap-4">
              <div>
                <SectionLabel>{t('games.sectionKicker')}</SectionLabel>
                <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
                  {t('games.sectionTitle')}
                </h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent mb-2" />
            </div>

            {/* 细分筛选：玩法 / 地域 */}
            <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4 md:p-5 space-y-3">
              <FilterChips label={t('games.topic')} items={topicChips} active={topic} onChange={setTopic} allCount={games.filter((g) => hitScope(g, scope)).length} />
              <FilterChips label={t('maps.scope')} items={scopeChips} active={scope} onChange={setScope} allCount={games.filter((g) => hitTopic(g, topic)).length} />
            </div>

            <div className="flex items-center justify-between gap-4 mt-6 mb-5">
              <p className="text-sm text-muted-foreground">
                {t('games.count', { n: filtered.length })}
                {narrowed && (
                  <>
                    <span className="mx-1.5 text-border">|</span>
                    <span>
                      {t('maps.filtered')}
                      {scope !== '全部' && ` · ${localizeLabel(scope, lang)}`}
                      {topic !== '全部' && ` · ${localizeLabel(topic, lang)}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
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
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 shrink-0">
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
            </div>

            {games.length === 0 ? (
              <p className="text-muted-foreground">{t('games.empty.all')}</p>
            ) : sorted.length === 0 ? (
              <p className="text-muted-foreground">{t('games.empty.filter')}</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {pageItems.map((game, i) => {
                  const playUrl = game.link || `/${game.slug}`;
                  const accent = ACCENTS[i % ACCENTS.length];
                  const number = String((currentPage - 1) * size + i + 1).padStart(2, '0');
                  return (
                    <CardAnim key={game.slug} delay={i * 0.08} className="h-full">
                      {/* 卡片分工：封面、标题、开始游戏 → 游戏本体；底部「查看详情与解读」→ /games/<slug> 介绍页 */}
                      <article className="group relative h-full flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent.line} opacity-0 group-hover:opacity-100 transition-opacity z-10`} />
                        <Link
                          to={playUrl}
                          className="relative block aspect-video sm:aspect-auto sm:w-[42%] sm:shrink-0 overflow-hidden bg-muted"
                        >
                          <img
                            src={game.cover}
                            loading="lazy"
                            decoding="async"
                            alt={t('games.alt', { title: game.title })}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                          <span className="absolute top-3 left-3 font-mono text-xs font-bold tracking-widest text-white/90">
                            {number}
                          </span>
                          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-slate-900 shadow-sm group-hover:bg-white transition-colors">
                            <Play className="w-3 h-3 fill-current" />
                            {t('games.playNow')}
                          </span>
                        </Link>
                        <div className="flex flex-1 flex-col min-w-0 p-5">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                            <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{localizeLabel(game.category || t('games.categoryDefault'), lang)}</span>
                            {game.scope && (
                              <>
                                <span className="text-border">/</span>
                                <span>{localizeLabel(game.scope, lang)}</span>
                              </>
                            )}
                            <span className="ml-auto">
                              <HeatTag heat={game.heat} />
                            </span>
                          </div>
                          <h3 className="mt-2 text-lg font-bold leading-snug">
                            <Link to={playUrl} className="hover:text-primary transition-colors">
                              {game.title}
                            </Link>
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {game.summary}
                          </p>
                          <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1.5">
                              {(game.topics || []).slice(0, 2).map((tp) => (
                                <span
                                  key={tp}
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${accent.chip}`}
                                >
                                  {localizeLabel(tp, lang)}
                                </span>
                              ))}
                            </div>
                            <Link
                              to={`/games/${game.slug}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                              {t('list.work.detail')}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    </CardAnim>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination page={currentPage} pageCount={totalPages} onChange={goPage} />
            )}
          </section>

          {/* ── 成绩同步提示：给页面一个收尾，也顺带把「我的学习」入口带出来 ── */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 w-9 h-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('games.progressHint')}
              </p>
            </div>
            <Link
              to="/my"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {t('games.myScores')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Games;
