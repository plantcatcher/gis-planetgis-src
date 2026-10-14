import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowRight, Flame } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import FilterChips from '@/components/common/FilterChips';
import Pagination from '@/components/common/Pagination';
import { getWorksBySeries, getWorkTopics, getWorkScopes, type ContentItem } from '@/lib/content';

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

// 地理小游戏汇总页：与「互动地图 /maps」「精选作品 /works」「地理小工具 /tools」结构对称。
// 数据源是 content/works 中 series: game 的条目（显式声明归属，不靠 tags 猜），
// 每个 link 指向对应的游戏 iframe 页，SEO 正文在其 /works/<slug> 介绍页。
const Games: React.FC = () => {
  const games = getWorksBySeries('game');

  // 细分筛选：玩法主题（topics）+ 地域题材（scope），与 /maps 同一套组件与数据口径，
  // 均来自 content/works/<slug>.md 的 frontmatter，新增游戏改 md 即生效。
  const topics = getWorkTopics('game');
  const scopes = getWorkScopes('game');
  const [topic, setTopic] = useState('全部');
  const [scope, setScope] = useState('全部');
  const [sortMode, setSortMode] = useState<'default' | 'heat'>('default');

  const hitTopic = (g: ContentItem, t: string) => t === '全部' || (g.topics || []).includes(t);
  const hitScope = (g: ContentItem, s: string) => s === '全部' || g.scope === s;
  const filtered = games.filter((g) => hitTopic(g, topic) && hitScope(g, scope));

  // 热度模式：按近 30 天 GA4 浏览量降序（并列回退日期）；默认模式：沿用作品 order
  const sorted =
    sortMode === 'heat'
      ? [...filtered].sort(
          (a, b) => (b.heat || 0) - (a.heat || 0) || (b.date || '').localeCompare(a.date || ''),
        )
      : filtered;

  // 分页：每页 12 款；主题/地域/排序变化自动归 1
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  useEffect(() => {
    setPage(1);
  }, [topic, scope, sortMode]);

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

  return (
    <>
      <PageMeta
        title="地理小游戏 - 星球小捕手"
        description="把地理知识变成可以玩的交互——看卫星图猜城市、看轮廓猜国家、测出你的地球人格。"
        canonical="https://planetgis.cn/games"
      />
      <Breadcrumb />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <header className="mb-10">
            <div className="flex items-end gap-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">地理小游戏</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2" />
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
            <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
              把地理知识变成可以玩的交互——看卫星图猜城市、看轮廓猜国家、测出你的地球人格。点开就能玩，无需下载。
            </p>
          </header>

          {/* ── 细分筛选：玩法 / 地域 ──────────────────────────────── */}
          <div className="space-y-3 mb-6">
            <FilterChips label="玩法" items={topicChips} active={topic} onChange={setTopic} allCount={games.filter((g) => hitScope(g, scope)).length} />
            <FilterChips label="地域" items={scopeChips} active={scope} onChange={setScope} allCount={games.filter((g) => hitTopic(g, topic)).length} />
          </div>

          <div className="flex items-center justify-between gap-4 mb-6">
            <p className="text-sm text-muted-foreground">
              共 {filtered.length} 款游戏
              {narrowed && (
                <>
                  <span className="mx-1.5 text-border">|</span>
                  <span>
                    已筛选{scope !== '全部' && ` · ${scope}`}
                    {topic !== '全部' && ` · ${topic}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
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
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 shrink-0">
              {([['default', '默认'], ['heat', '热度']] as const).map(([key, label]) => (
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
            <p className="text-muted-foreground">游戏正在路上，敬请期待。</p>
          ) : sorted.length === 0 ? (
            <p className="text-muted-foreground">这个组合下暂时没有游戏，换个玩法或地域看看。</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pageItems.map((game, i) => {
                const playUrl = game.link || `/${game.slug}`;
                return (
                  <CardAnim key={game.slug} delay={i * 0.08}>
                    {/* 卡片外壳不再整块是链接：封面与标题 → 游戏本体，底部按钮 → /works/<slug> 的玩法介绍 */}
                    <div className="group overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                      <Link to={playUrl} className="block">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={game.cover}
                            alt={`${game.title} - 星球小捕手地理小游戏`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="w-full text-center text-sm font-medium text-white/90">开始游戏 →</span>
                          </div>
                        </div>
                      </Link>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                          <Gamepad2 className="w-4 h-4" />
                          <span className="text-xs font-medium tracking-wide uppercase">{game.category || '小游戏'}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">
                          <Link to={playUrl} className="group-hover:text-primary transition-colors">
                            {game.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{game.summary}</p>
                        <div className="mt-4 flex items-center gap-3">
                          <Link
                            to={`/works/${game.slug}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                          >
                            查看介绍 <ArrowRight className="w-3.5 h-3.5 group-hover:gap-2 transition-all" />
                          </Link>
                          <HeatTag heat={game.heat} />
                        </div>
                      </div>
                    </div>
                  </CardAnim>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              pageCount={totalPages}
              onChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Games;
