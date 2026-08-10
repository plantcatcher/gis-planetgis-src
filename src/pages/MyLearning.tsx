import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  FileText,
  Star,
  Flame,
  ClipboardCheck,
  Trophy,
  Gamepad2,
  Satellite,
  Globe2,
  Compass,
  ArrowRight,
  Clock,
  CheckCircle2,
  Puzzle,
} from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import SectionLabel from '@/components/knowledge/SectionLabel';
import { Progress } from '@/components/ui/progress';
import { useLearningData } from '@/hooks/useLearning';
import { getDashboard, keyToPath, type DashboardEntry } from '@/services/learningService';

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

function StatCard({
  icon,
  value,
  label,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent: string;
  onClick?: () => void;
}) {
  const clickable = !!onClick;
  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`group flex flex-col gap-3 p-5 rounded-2xl bg-muted/40 border border-border/50 ${
        clickable
          ? 'cursor-pointer hover:border-primary/40 hover:bg-muted/70 hover:-translate-y-0.5 transition-all'
          : ''
      }`}
    >
      <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold leading-none tabular-nums">{value}</div>
        <div className="text-sm text-muted-foreground mt-1.5">{label}</div>
      </div>
    </div>
  );
}

function typeIcon(key: string) {
  const t = key.split(':')[0];
  if (t === 'learn') return <GraduationCap className="w-4 h-4" />;
  if (t === 'article') return <BookOpen className="w-4 h-4" />;
  if (t === 'work') return <FileText className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

const GAME_ICONS: Record<string, React.ReactNode> = {
  geoquiz: <Satellite className="w-5 h-5" />,
  geoshape: <Globe2 className="w-5 h-5" />,
  geotype: <Compass className="w-5 h-5" />,
  chinapuzzle: <Puzzle className="w-5 h-5" />,
};

const GAME_NAMES: Record<string, string> = {
  geoquiz: '卫星之眼 · 猜城市',
  geoshape: 'GeoShape · 猜国家',
  geotype: '地理人格测试',
  chinapuzzle: '中国地图拼图挑战',
};

const GAME_PATHS: Record<string, string> = {
  geoquiz: '/geoquiz',
  geoshape: '/geoshape',
  geotype: '/geotype',
  chinapuzzle: '/chinapuzzle',
};

function gamePath(gameId?: string): string {
  return GAME_PATHS[gameId || ''] || '/games';
}

function gameIcon(gameId?: string): React.ReactNode {
  return GAME_ICONS[gameId || ''] || <Gamepad2 className="w-5 h-5" />;
}

function formatReadTime(sec: number): string {
  if (sec <= 0) return '0';
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  return `${(sec / 3600).toFixed(1)}h`;
}

function ContentRow({ entry }: { entry: DashboardEntry }) {
  const path = keyToPath(entry.key);
  const pct = Math.round((entry.progress?.progress ?? 0) * 100);
  const completed = entry.progress?.completed ?? false;

  const inner = (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted border border-transparent hover:border-primary/30 transition-all">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        {typeIcon(entry.key)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{entry.item.title}</span>
          {completed && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-label="已完成" />
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          {completed ? (
            <span className="text-xs font-medium text-emerald-600">已完成</span>
          ) : pct > 0 ? (
            <>
              <Progress value={pct} className="flex-1 max-w-[100px] h-1" />
              <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
            </>
          ) : (
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <Star className="w-3 h-3" />已收藏
            </span>
          )}
        </div>
      </div>
      {path && (
        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </div>
  );

  return path ? (
    <Link to={path} className="group block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function EmptyHint({ text, to, cta }: { text: string; to?: string; cta?: string }) {
  return (
    <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-border/60 bg-muted/30">
      <p className="text-muted-foreground text-sm">{text}</p>
      {to && cta && (
        <Link
          to={to}
          className="inline-flex items-center gap-1 mt-3 text-sm text-primary font-medium hover:underline"
        >
          {cta} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

function OnboardingCard() {
  return (
    <div className="rounded-3xl border border-dashed border-border/60 bg-muted/30 p-8 md:p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <GraduationCap className="w-7 h-7" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">开始你的地理学习之旅</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        读一篇教程、做一次测验、玩一局地理小游戏，你的足迹会自动出现在这里。无需登录，进度保存在本地。
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <BookOpen className="w-4 h-4" /> 浏览地理学习
        </Link>
        <Link
          to="/games"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-4 py-2 text-sm font-medium hover:bg-muted/70 transition-colors"
        >
          <Gamepad2 className="w-4 h-4" /> 去玩小游戏
        </Link>
      </div>
    </div>
  );
}

const MyLearning: React.FC = () => {
  // 订阅本地学习数据；首屏 SSG 渲染为默认空态，客户端挂载后填充真实数据。
  const data = useLearningData();
  const dash = useMemo(() => getDashboard(), [data]);

  const { summary, recent, favorites, completed, quizzes, games } = dash;

  // 首访（全空）时显示统一引导卡，取代零散空态；SSG 与 CSR 首帧都基于默认空态渲染，hydration 一致。
  const isFresh =
    recent.length + favorites.length + completed.length + quizzes.length + games.length === 0;

  const scrollTo = (id: string) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <PageMeta
        title="我的学习 - 星球小捕手"
        description="查看你在星球小捕手的学习记录：最近学习、收藏的教程、完成的课程与测试成绩。无需登录，学习进度自动保存在本地。"
        canonical="https://planetgis.cn/my"
      />
      <Breadcrumb items={[{ label: '首页', path: '/' }, { label: '我的学习' }]} />

      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-12">
          {/* Hero */}
          <header className="mb-8 md:mb-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="kicker mb-3">学习中心</p>
                <div className="flex items-end gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">我的学习</h1>
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2 hidden sm:block" />
                </div>
                <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl">
                  你的地理学习仪表盘——读过的、收藏的、完成的，以及每一次测验与游戏的战绩，都自动记在这里。
                </p>
              </div>
              <span className="inline-flex items-center gap-2 shrink-0 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                进度自动保存在本地 · 无需登录
              </span>
            </div>
          </header>

          {/* 概览卡片 */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-8 md:mb-10">
            <CardAnim>
              <StatCard
                icon={<BookOpen className="w-6 h-6 text-primary" />}
                value={summary.learnedCount}
                label="已学习"
                accent="bg-primary/10 text-primary"
                onClick={() => scrollTo('section-recent')}
              />
            </CardAnim>
            <CardAnim delay={0.05}>
              <StatCard
                icon={<Star className="w-6 h-6 text-amber-500" />}
                value={summary.favoriteCount}
                label="收藏"
                accent="bg-amber-500/10 text-amber-500"
                onClick={() => scrollTo('section-favorites')}
              />
            </CardAnim>
            <CardAnim delay={0.1}>
              <StatCard
                icon={<Flame className="w-6 h-6 text-orange-500" />}
                value={`${summary.streak} 天`}
                label="最近连续学习"
                accent="bg-orange-500/10 text-orange-500"
              />
            </CardAnim>
            <CardAnim delay={0.12}>
              <StatCard
                icon={<Clock className="w-6 h-6 text-sky-500" />}
                value={formatReadTime(summary.totalReadSeconds)}
                label="阅读时长"
                accent="bg-sky-500/10 text-sky-500"
              />
            </CardAnim>
            <CardAnim delay={0.15}>
              <StatCard
                icon={<ClipboardCheck className="w-6 h-6 text-emerald-500" />}
                value={summary.lastQuizScore ?? '—'}
                label="最近一次测试"
                accent="bg-emerald-500/10 text-emerald-500"
                onClick={summary.lastQuizScore != null ? () => scrollTo('section-scores') : undefined}
              />
            </CardAnim>
          </section>

          {isFresh ? (
            <OnboardingCard />
          ) : (
            <>
              {/* 学习足迹：最近学习 */}
              <section id="section-recent" className="mb-8 scroll-mt-24">
                <SectionLabel className="mb-4">最近学习</SectionLabel>
                {recent.length > 0 ? (
                  <div className="space-y-2">
                    {recent.map((entry, i) => (
                      <CardAnim key={entry.key} delay={i * 0.03}>
                        <ContentRow entry={entry} />
                      </CardAnim>
                    ))}
                  </div>
                ) : (
                  <EmptyHint text="还没有学习记录，去读一篇试试？" to="/learn" cta="浏览地理学习" />
                )}
              </section>

              {/* 学习足迹：我的收藏 */}
              <section id="section-favorites" className="mb-8 scroll-mt-24">
                <SectionLabel className="mb-4">我的收藏</SectionLabel>
                {favorites.length > 0 ? (
                  <div className="space-y-2">
                    {favorites.map((entry, i) => (
                      <CardAnim key={entry.key} delay={i * 0.03}>
                        <ContentRow entry={entry} />
                      </CardAnim>
                    ))}
                  </div>
                ) : (
                  <EmptyHint text="还没有收藏任何教程，在内容页点右上角的星标即可收藏。" />
                )}
              </section>

              {/* 学习足迹：已完成的教程 */}
              {completed.length > 0 && (
                <section id="section-completed" className="mb-8 scroll-mt-24">
                  <SectionLabel className="mb-4">已学完的课程</SectionLabel>
                  <div className="space-y-2">
                    {completed.map((entry, i) => (
                      <CardAnim key={entry.key} delay={i * 0.03}>
                        <ContentRow entry={entry} />
                      </CardAnim>
                    ))}
                  </div>
                </section>
              )}

              {/* 成就面板：我的成绩（仅在确有测试/游戏记录时展示，不虚构数据） */}
              {(quizzes.length > 0 || games.length > 0) && (
                <section
                  id="section-scores"
                  className="mb-8 rounded-3xl bg-muted/30 border border-border/50 p-5 md:p-7 scroll-mt-24"
                >
                  <SectionLabel className="mb-5">我的成绩</SectionLabel>

                  {quizzes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="flex items-center gap-2 mb-3 text-sm font-medium text-primary">
                        <ClipboardCheck className="w-4 h-4" />
                        地理测验
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quizzes.map((q, i) => (
                          <CardAnim key={q.id} delay={i * 0.04}>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/60 border border-border/50">
                              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <ClipboardCheck className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{q.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {new Date(q.takenAt).toLocaleDateString('zh-CN')}
                                </div>
                              </div>
                              <div className="text-xl font-bold text-primary tabular-nums">
                                {q.score}
                                <span className="text-sm text-muted-foreground font-normal">/{q.total}</span>
                              </div>
                            </div>
                          </CardAnim>
                        ))}
                      </div>
                    </div>
                  )}

                  {games.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 mb-3 text-sm font-medium text-secondary">
                        <Gamepad2 className="w-4 h-4" />
                        地理小游戏
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {games.map((g, i) => (
                          <CardAnim key={g.id} delay={i * 0.04 + 0.1}>
                            <Link
                              to={gamePath(g.gameId)}
                              aria-label={`去玩 ${g.title || GAME_NAMES[g.gameId || ''] || '地理小游戏'}`}
                              className="group block"
                            >
                              <div className="flex items-center gap-4 p-4 rounded-xl bg-background/60 border border-border/50 transition-all group-hover:border-secondary/40 group-hover:bg-background/80">
                                <div className="shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                  {gameIcon(g.gameId)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">
                                    {g.title || GAME_NAMES[g.gameId || ''] || '地理小游戏'}
                                  </div>
                                  {g.subtitle && (
                                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                      {g.subtitle}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {new Date(g.takenAt).toLocaleDateString('zh-CN')}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  {g.score != null ? (
                                    <div className="text-xl font-bold text-secondary tabular-nums">
                                      {g.score}
                                      {g.total != null && (
                                        <span className="text-sm text-muted-foreground font-normal">
                                          /{g.total}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-sm font-medium text-secondary">已完成</div>
                                  )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </div>
                            </Link>
                          </CardAnim>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* 暂无成绩的引导（诚实占位，不编造分数） */}
              {quizzes.length === 0 && games.length === 0 && (
                <section className="mb-8">
                  <SectionLabel className="mb-4">我的成绩</SectionLabel>
                  <EmptyHint
                    text="还没有成绩记录。完成地理小测验，或玩一局三个地理小游戏，成绩都会显示在这里。"
                    to="/games"
                    cta="去玩小游戏"
                  />
                </section>
              )}
            </>
          )}

          {/* 页脚提示：本地存储说明 + 未来迁移承诺 */}
          <div className="mt-10 p-5 rounded-2xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground leading-relaxed">
            <Trophy className="w-4 h-4 text-primary inline mr-1.5" />
            学习数据保存在你的浏览器本地（LocalStorage），不登录也能查看。未来支持账号登录后，可一键把这里的进度与收藏同步到云端，不会丢失。
          </div>
        </div>
      </div>
    </>
  );
};

export default MyLearning;
