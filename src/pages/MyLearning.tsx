import React, { useMemo, useState, useEffect } from 'react';
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
  Globe,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import SectionLabel from '@/components/knowledge/SectionLabel';
import { Progress } from '@/components/ui/progress';
import { useLearningData } from '@/hooks/useLearning';
import { getDashboard, keyToPath, type DashboardEntry } from '@/services/learningService';
import { getGeoQuizRecords, type ExternalGameRecord } from '@/lib/externalScores';

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
      className={`flex items-center gap-4 p-5 rounded-2xl bg-muted/50 border border-border/50 ${
        clickable ? 'cursor-pointer hover:border-primary/40 hover:bg-muted/70 transition-colors' : ''
      }`}
    >
      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold leading-none">{value}</div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
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
    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40 hover:bg-muted border border-transparent hover:border-primary/30 transition-all">
      <div className="shrink-0 w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
        {typeIcon(entry.key)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {entry.item.title}
          </span>
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

const MyLearning: React.FC = () => {
  // 订阅本地学习数据；首屏 SSG 渲染为默认空态，客户端挂载后填充真实数据。
  const data = useLearningData();
  const dash = useMemo(() => getDashboard(), [data]);

  const { summary, recent, favorites, completed, quizzes, games } = dash;

  // 跨站成绩：从 .planetgis.cn cookie 读取小游戏「卫星图猜城市」的成绩（客户端）。
  const [geoGames, setGeoGames] = useState<ExternalGameRecord[]>([]);
  useEffect(() => {
    setGeoGames(getGeoQuizRecords());
  }, []);
  const allGames = useMemo(() => [...games, ...geoGames], [games, geoGames]);

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
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
          <header className="mb-10">
            <p className="kicker mb-3">学习中心</p>
            <div className="flex items-end gap-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">我的学习</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2" />
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
              你在星球小捕手上读过的每一篇，网站都帮你记着——无需登录，进度自动保存在本地。
            </p>
          </header>

          {/* 概览卡片 */}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
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

          {/* 我的学习 / 最近学习 */}
          <section id="section-recent" className="mb-12 scroll-mt-24">
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

          {/* 我的收藏 */}
          <section id="section-favorites" className="mb-12 scroll-mt-24">
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

          {/* 已完成的教程 */}
          {completed.length > 0 && (
            <section id="section-completed" className="mb-12 scroll-mt-24">
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

          {/* 我的成绩：仅在确有测试/游戏记录时展示，不虚构数据 */}
          {(quizzes.length > 0 || allGames.length > 0) && (
            <section id="section-scores" className="mb-12 scroll-mt-24">
              <SectionLabel className="mb-4">我的成绩</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizzes.map((q, i) => (
                  <CardAnim key={q.id} delay={i * 0.04}>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
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
                {games.map((g, i) => (
                  <CardAnim key={g.id} delay={i * 0.04 + 0.1}>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{g.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(g.takenAt).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-secondary tabular-nums">{g.score}</div>
                    </div>
                  </CardAnim>
                ))}
                {geoGames.map((g, i) => (
                  <CardAnim key={g.id} delay={i * 0.04 + 0.15}>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{g.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(g.takenAt).toLocaleDateString('zh-CN')}
                          <span className="ml-1 opacity-60">· 卫星之眼</span>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-sky-500 tabular-nums">{g.score}</div>
                    </div>
                  </CardAnim>
                ))}
              </div>
            </section>
          )}

          {/* 暂无成绩的引导（诚实占位，不编造分数） */}
          {quizzes.length === 0 && allGames.length === 0 && (
            <section className="mb-12">
              <SectionLabel className="mb-4">我的成绩</SectionLabel>
              <EmptyHint
                text="还没有测试或游戏记录。完成地理小测验或玩一局「卫星图猜城市」后，成绩会显示在这里。"
                to="/learn"
                cta="去地理学习"
              />
            </section>
          )}

          {/* 页脚提示：本地存储说明 + 未来迁移承诺 */}
          <div className="mt-12 p-5 rounded-2xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground leading-relaxed">
            <Trophy className="w-4 h-4 text-primary inline mr-1.5" />
            学习数据保存在你的浏览器本地（LocalStorage），不登录也能查看。未来支持账号登录后，可一键把这里的进度与收藏同步到云端，不会丢失。
          </div>
        </div>
      </div>
    </>
  );
};

export default MyLearning;
