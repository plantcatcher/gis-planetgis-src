import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowRight } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import FilterChips from '@/components/common/FilterChips';
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

  const hitTopic = (g: ContentItem, t: string) => t === '全部' || (g.topics || []).includes(t);
  const hitScope = (g: ContentItem, s: string) => s === '全部' || g.scope === s;
  const filtered = games.filter((g) => hitTopic(g, topic) && hitScope(g, scope));

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
            <p className="kicker mb-3">边玩边学</p>
            <div className="flex items-end gap-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">地理小游戏</h1>
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

          <p className="text-sm text-muted-foreground mb-6">
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

          {games.length === 0 ? (
            <p className="text-muted-foreground">游戏正在路上，敬请期待。</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">这个组合下暂时没有游戏，换个玩法或地域看看。</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((game, i) => {
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
                        <Link
                          to={`/works/${game.slug}`}
                          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
                        >
                          查看介绍 <ArrowRight className="w-3.5 h-3.5 group-hover:gap-2 transition-all" />
                        </Link>
                      </div>
                    </div>
                  </CardAnim>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Games;
