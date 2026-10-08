import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  FileText,
  Star,
  Trophy,
  Gamepad2,
  Satellite,
  Globe2,
  Compass,
  Map,
  ArrowRight,
  Clock,
  CheckCircle2,
  Puzzle,
  Download,
  PieChart,
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Search,
  RotateCcw,
} from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import ShareButton from '@/components/common/ShareButton';
import { trackEvent } from '@/lib/analytics';
import SectionLabel from '@/components/knowledge/SectionLabel';
import { Progress } from '@/components/ui/progress';
import { useLearningData } from '@/hooks/useLearning';
import {
  getDashboard,
  getActivityFeed,
  getContinueEntry,
  getRecommendations,
  getWeeklyActivity,
  buildInsights,
  getWeeklyGoal,
  setWeeklyGoal,
  getWeekProgress,
  getStreakMilestones,
  getGameStats,
  formatDuration,
  searchPath,
  WEEKLY_GOAL_DEFAULT,
  WEEKLY_GOAL_OPTIONS,
  keyToPath,
  type DashboardEntry,
  type DownloadRecord,
  type ActivityFeedEntry,
  type InsightItem,
  type StreakMilestone,
  type MapViewRecord,
  type SearchRecord,
  type PlayStat,
} from '@/services/learningService';
import { getItem, type ContentItem } from '@/lib/content';
import { DonutChart, BarChart, LineChart, ChartLegend, type DonutDatum } from '@/components/learning/LearningCharts';

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

function DownloadRow({ rec }: { rec: DownloadRecord }) {
  const path = `/downloads/${rec.slug}`;
  const item = getItem('resource', rec.slug);
  const inner = (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted border border-transparent hover:border-primary/30 transition-all">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Download className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{rec.title}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {rec.format && <span>{rec.format}</span>}
          {rec.size && <span>· {rec.size}</span>}
          {rec.category && <span className="text-primary/70">· {rec.category}</span>}
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(rec.downloadedAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>
      {item?.cover && (
        <img
          src={item.cover}
          alt={rec.title}
          className="hidden sm:block shrink-0 w-9 h-12 object-cover rounded-md border border-border/50"
          loading="lazy"
        />
      )}
      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );

  return (
    <Link to={path} className="group block" aria-label={`查看 ${rec.title} 下载页`}>
      {inner}
    </Link>
  );
}

function MapRow({ rec }: { rec: MapViewRecord }) {
  const path = `/maps/${rec.slug}`;
  const item = getItem('work', rec.slug);
  const inner = (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted border border-transparent hover:border-primary/30 transition-all">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Map className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{rec.title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-primary/70">互动地图</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(rec.viewedAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>
      {item?.cover && (
        <img
          src={item.cover}
          alt={rec.title}
          className="hidden sm:block shrink-0 w-9 h-12 object-cover rounded-md border border-border/50"
          loading="lazy"
        />
      )}
      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );

  return (
    <Link to={path} className="group block" aria-label={`打开 ${rec.title}`}>
      {inner}
    </Link>
  );
}

function SearchRow({ rec }: { rec: SearchRecord }) {
  const path = searchPath(rec.term, rec.context);
  const inner = (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted border border-transparent hover:border-primary/30 transition-all">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Search className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{rec.term}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-primary/70">
            {rec.context === 'resources' ? '资料搜索' : '知识库搜索'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(rec.searchedAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>
      {rec.count > 1 && (
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary tabular-nums">
          <RotateCcw className="w-3 h-3" />
          {rec.count} 次
        </span>
      )}
      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );

  return (
    <Link to={path} className="group block" aria-label={`重新搜索 ${rec.term}`}>
      {inner}
    </Link>
  );
}

/** 重玩概览胶囊：按游戏归并出「已玩 N 次 · 累计用时」 */
function PlayStatChips({ stats, tone }: { stats: PlayStat[]; tone: 'secondary' | 'primary' }) {
  if (stats.length === 0) return null;
  const toneCls = tone === 'secondary' ? 'text-secondary' : 'text-primary';
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {stats.map((s) => (
        <span
          key={s.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs"
        >
          <RotateCcw className={`w-3 h-3 ${toneCls}`} />
          <span className="font-medium truncate max-w-[160px]">{s.title}</span>
          <span className={`font-semibold tabular-nums ${toneCls}`}>×{s.plays}</span>
          {s.totalDurationSec > 0 && (
            <span className="text-muted-foreground">· {formatDuration(s.totalDurationSec)}</span>
          )}
        </span>
      ))}
    </div>
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
        读一篇教程、玩一局地理小游戏，你的足迹会自动出现在这里。无需登录，进度保存在本地。
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <BookOpen className="w-4 h-4" /> 浏览知识库
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

const KIND_LABEL: Record<ActivityFeedEntry['kind'], string> = {
  read: '阅读',
  game: '游戏',
  download: '下载',
  map: '地图',
  search: '搜索',
};

function ActivityRow({ entry }: { entry: ActivityFeedEntry }) {
  const Icon =
    entry.kind === 'read'
      ? BookOpen
      : entry.kind === 'game'
        ? Gamepad2
        : entry.kind === 'map'
          ? Map
          : entry.kind === 'search'
            ? Search
            : Download;
  const inner = (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted border border-transparent hover:border-primary/30 transition-all">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{entry.title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-primary/70">{KIND_LABEL[entry.kind]}</span>
          <span className="opacity-40">·</span>
          <span className="truncate">{entry.subtitle}</span>
        </div>
      </div>
      {entry.path && (
        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </div>
  );
  return entry.path ? (
    <Link to={entry.path} className="group block">
      {inner}
    </Link>
  ) : (
    <div className="group block">{inner}</div>
  );
}

function ContinueCard({ entry }: { entry: DashboardEntry }) {
  const path = keyToPath(entry.key);
  const pct = Math.round((entry.progress?.progress ?? 0) * 100);
  const inner = (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[10px] font-semibold tracking-widest text-primary/80 uppercase mb-0.5">继续学习</div>
        <div className="text-sm font-bold leading-snug truncate">{entry.item.title}</div>
        <div className="mt-1.5 flex items-center gap-2">
          <Progress value={pct} className="flex-1 max-w-[150px] h-1" />
          <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
        </div>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-[1.03]">
        继续 <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </div>
  );
  return path ? (
    <Link
      to={path}
      className="group block rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-3.5 transition-colors"
    >
      {inner}
    </Link>
  ) : (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-3.5">
      {inner}
    </div>
  );
}

function RecommendationCard({ item }: { item: ContentItem }) {
  return (
    <Link
      to={`/learn/${item.slug}`}
      className="group block rounded-2xl border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-primary/30 p-4 transition-all"
    >
      <div className="text-sm font-medium leading-snug line-clamp-2">{item.title}</div>
      {item.category && <div className="text-xs text-primary/70 mt-1.5">{item.category}</div>}
    </Link>
  );
}

const MyLearning: React.FC = () => {
  // 订阅本地学习数据；首屏 SSG 渲染为默认空态，客户端挂载后填充真实数据。
  const data = useLearningData();
  const dash = useMemo(() => getDashboard(), [data]);

  const { summary, recent, favorites, completed, games, downloads, maps, searches } = dash;

  // 留存信号（增长黑客：Retention 环节）：进入学习中心且有数据时，
  // 本会话首次记一次 learning_return（带连续天数/学习量），配合 GA4 匿名用户级
  // 留存，可看「带学习档案的用户」回访与参与度。
  useEffect(() => {
    if (summary.learnedCount + summary.favoriteCount + summary.downloadCount > 0) {
      try {
        if (!window.sessionStorage.getItem('planetgis:learning_return')) {
          window.sessionStorage.setItem('planetgis:learning_return', '1');
          trackEvent('learning_return', {
            streak_days: summary.streak,
            learned_count: summary.learnedCount,
            favorite_count: summary.favoriteCount,
            download_count: summary.downloadCount,
          });
        }
      } catch {
        /* sessionStorage 不可用则跳过 */
      }
    }
  }, [dash]);

  // 首访（全空）时显示统一引导卡，取代零散空态；SSG 与 CSR 首帧都基于默认空态渲染，hydration 一致。
  const isFresh =
    recent.length +
      favorites.length +
      completed.length +
      games.length +
      downloads.length +
      maps.length +
      searches.length ===
    0;

  // 周目标（本地持久化，用户可调整档位）。首帧用默认值，挂载后再读真实值，
  // 与现有「首帧空态、客户端填充」策略一致，避免 hydration mismatch。
  const [weeklyGoal, setWeeklyGoalState] = useState<number>(WEEKLY_GOAL_DEFAULT);
  useEffect(() => {
    setWeeklyGoalState(getWeeklyGoal());
  }, []);
  const changeGoal = (n: number) => {
    setWeeklyGoal(n);
    setWeeklyGoalState(n);
  };

  // —— 增长/可视化派生数据 ——
  const activity = useMemo(() => getActivityFeed(6), [dash]);
  // 同一游戏玩多次会留下多条成绩，这里归并出「已玩 N 次 · 累计用时」
  const gameStats = useMemo(() => getGameStats(), [dash]);
  const continueEntry = useMemo(() => getContinueEntry(), [dash]);
  const recommendations = useMemo(() => getRecommendations(3), [dash]);
  const insights = useMemo(() => buildInsights(dash), [dash]);
  const weekProgress = useMemo(() => getWeekProgress(weeklyGoal), [dash, weeklyGoal]);
  const milestones = useMemo<StreakMilestone[]>(() => getStreakMilestones(summary.streak), [dash]);

  // 学习类型分布（环形图）
  const typeDist = useMemo<DonutDatum[]>(() => {
    const counts: Record<string, number> = {};
    for (const e of [...recent, ...favorites, ...completed]) {
      const t = e.key.split(':')[0];
      counts[t] = (counts[t] || 0) + 1;
    }
    const map: Record<string, { label: string; color: string }> = {
      learn: { label: '知识库', color: '#0891b2' },
      article: { label: '文章', color: '#6366f1' },
      work: { label: '作品', color: '#f59e0b' },
      tool: { label: '工具', color: '#10b981' },
    };
    return Object.entries(counts)
      .map(([k, v]) => ({ label: map[k]?.label || k, value: v, color: map[k]?.color || '#94a3b8' }))
      .sort((a, b) => b.value - a.value);
  }, [recent, favorites, completed]);

  // 下载分类分布（环形图）
  const downloadDist = useMemo<DonutDatum[]>(() => {
    const counts: Record<string, number> = {};
    for (const d of downloads) {
      const c = d.category || '未分类';
      counts[c] = (counts[c] || 0) + 1;
    }
    const palette = ['#0891b2', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#ec4899', '#14b8a6', '#a855f7'];
    return Object.entries(counts).map(([k, v], i) => ({ label: k, value: v, color: palette[i % palette.length] }));
  }, [downloads]);

  // 每周活跃天数（柱状图）
  const weekly = useMemo(() => getWeeklyActivity(8), [dash]);

  // 成绩趋势（折线图）+ 明细表
  const scoreRows = useMemo(() => {
    type Row = { id: string; title: string; score: number; total: number; pct: number; at: string };
    const rows: Row[] = [];
    for (const g of games)
      if (g.score != null && g.total)
        rows.push({ id: 'g:' + g.id, title: g.title, score: g.score, total: g.total, pct: Math.round((g.score / g.total) * 100), at: g.takenAt });
    rows.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    return rows;
  }, [games]);

  const scorePoints = scoreRows.map((r) => ({
    label: new Date(r.at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
    value: r.pct,
  }));

  // 成就分享文案（接通 Referral 闭环）
  const shareText = useMemo(() => {
    const bits: string[] = [];
    if (summary.streak > 0) bits.push(`连续学习 ${summary.streak} 天`);
    if (games.length > 0) bits.push(`玩了 ${games.length} 局地理小游戏`);
    const head = bits.length > 0 ? `我在星球小捕手${bits.join('、')}！` : '我在星球小捕手学地理';
    return `${head} 一起来玩玩吧`;
  }, [summary.streak, games]);

  return (
    <>
      <PageMeta
        title="我的学习 - 星球小捕手"
        description="查看你在星球小捕手的学习记录：最近学习、收藏的教程、完成的课程与小游戏战绩。无需登录，学习进度自动保存在本地。"
        canonical="https://planetgis.cn/my"
      />
      <Breadcrumb items={[{ label: '首页', path: '/' }, { label: '我的学习' }]} />

      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
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
                  你的地理学习仪表盘——读过的、收藏的、完成的，以及每一局地理小游戏的战绩，都自动记在这里。
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

          {isFresh ? (
            <OnboardingCard />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* 左栏：主内容 */}
              <div className="lg:col-span-8 space-y-8">
              {/* 继续学习：续读主卡（取未完成且进度最高项） */}
              {continueEntry && <ContinueCard entry={continueEntry} />}

              {/* 数据统计：周目标 / 分布 / 活跃度（主栏主体） */}
              <section id="section-stats" className="scroll-mt-24 space-y-4">
                <SectionLabel>数据统计</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 周目标徽章 + 连学里程碑（增长激励） */}
                  <div className="md:col-span-2 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 p-5">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        <DonutChart
                          data={[{ label: '本周已学', value: weekProgress.done, color: '#0891b2' }]}
                          size={82}
                          thickness={10}
                          centerLabel="本周"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Target className="w-4 h-4 text-primary" /> 本周目标
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          已完成 {weekProgress.done}/{weekProgress.goal} 天
                          {weekProgress.onTrack
                            ? '，节奏不错，继续保持'
                            : `，还差 ${Math.max(0, weekProgress.goal - weekProgress.done)} 天，本周剩 ${weekProgress.daysLeft} 天`}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          {WEEKLY_GOAL_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => changeGoal(opt)}
                              className={`text-xs rounded-full px-2 py-0.5 border transition-colors ${
                                opt === weeklyGoal
                                  ? 'bg-primary text-white border-primary'
                                  : 'border-border/60 text-muted-foreground hover:border-primary/40'
                              }`}
                            >
                              {opt}天
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm font-semibold mb-2.5">
                        <Award className="w-4 h-4 text-amber-500" /> 连学里程碑
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        {milestones.map((m) => (
                          <div key={m.days} className="flex-1 text-center">
                            <div
                              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                m.reached
                                  ? 'bg-primary text-white'
                                  : m.isNext
                                    ? 'bg-amber-500/15 text-amber-600 ring-2 ring-amber-500/40'
                                    : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {m.reached ? <CheckCircle2 className="w-4 h-4" /> : m.days}
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground leading-tight">{m.label}</div>
                          </div>
                        ))}
                      </div>
                      {summary.streak > 0 && (
                        <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                          {(() => {
                            const next = milestones.find((m) => m.isNext);
                            return next
                              ? `已连续 ${summary.streak} 天，再学 ${next.days - summary.streak} 天点亮「${next.label}」`
                              : `已连续 ${summary.streak} 天，已点亮全部里程碑，太强了！`;
                          })()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 学习类型分布 */}
                  <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-primary" /> 学习类型分布
                    </h3>
                    {typeDist.length > 0 ? (
                      <div className="flex items-center gap-4">
                        <DonutChart data={typeDist} size={120} />
                        <div className="min-w-0 flex-1">
                          <ChartLegend data={typeDist} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">还没有学习记录</p>
                    )}
                  </div>

                  {/* 下载资料分类 */}
                  <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-primary" /> 下载资料分类
                    </h3>
                    {downloadDist.length > 0 ? (
                      <div className="flex items-center gap-4">
                        <DonutChart data={downloadDist} size={120} />
                        <div className="min-w-0 flex-1">
                          <ChartLegend data={downloadDist} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">还没有下载记录</p>
                    )}
                  </div>

                  {/* 近 8 周活跃 */}
                  <div className="md:col-span-2 rounded-2xl border border-border/50 bg-muted/30 p-5">
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" /> 近 8 周活跃天数
                    </h3>
                    <BarChart data={weekly} />
                  </div>
                </div>
              </section>

              {/* 数据分析与建议：放在统计之后，先看数据、再看结论 */}
              {insights.length > 0 && (
                <section
                  id="section-insights"
                  className="scroll-mt-24 rounded-3xl border border-primary/15 bg-primary/5 p-5 md:p-7"
                >
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-primary">
                    <Trophy className="w-4 h-4" /> 数据分析与建议
                  </h3>
                  <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                    {insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className={
                            ins.tone === 'positive'
                              ? 'text-emerald-500'
                              : ins.tone === 'warn'
                                ? 'text-amber-500'
                                : 'text-primary'
                          }
                        >
                          ●
                        </span>
                        <span>{ins.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 成就面板：我的成绩（仅在确有游戏记录时展示，不虚构数据） */}
              {games.length > 0 && (
                <section
                  id="section-scores"
                  className="rounded-3xl bg-muted/30 border border-border/50 p-5 md:p-7 scroll-mt-24"
                >
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <SectionLabel>我的成绩</SectionLabel>
                    <ShareButton
                      title="星球小捕手 · 我的学习"
                      path="/my"
                      contentType="achievement"
                      text={shareText}
                    />
                  </div>

                  {games.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 mb-3 text-sm font-medium text-secondary">
                        <Gamepad2 className="w-4 h-4" />
                        地理小游戏
                      </h3>
                      <PlayStatChips stats={gameStats} tone="secondary" />
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
                                    {g.durationSec ? (
                                      <span>· 用时 {formatDuration(g.durationSec)}</span>
                                    ) : null}
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

                  {/* 成绩趋势（正确率 %）：与游戏卡配对 */}
                  {scoreRows.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" /> 成绩趋势（正确率 %）
                      </h3>
                      <LineChart points={scorePoints} />
                      <div className="mt-4 space-y-2.5">
                        {scoreRows
                          .slice()
                          .reverse()
                          .map((r) => (
                            <div key={r.id} className="flex items-center gap-3 text-sm">
                              <span className="flex-1 min-w-0 truncate">{r.title}</span>
                              <span className="text-xs text-muted-foreground tabular-nums w-16 text-right shrink-0">
                                {new Date(r.at).toLocaleDateString('zh-CN')}
                              </span>
                              <div className="w-24 shrink-0">
                                <Progress value={r.pct} className="h-1.5" />
                              </div>
                              <span className="tabular-nums w-12 text-right font-medium shrink-0">{r.pct}%</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* 暂无成绩的引导（诚实占位，不编造分数） */}
              {games.length === 0 && (
                <section>
                  <SectionLabel className="mb-4">我的成绩</SectionLabel>
                  <EmptyHint
                    text="还没有成绩记录。玩一局三个地理小游戏，成绩都会显示在这里。"
                    to="/games"
                    cta="去玩小游戏"
                  />
                </section>
              )}

              {/* 为你推荐 */}
              {recommendations.length > 0 && (
                <section className="scroll-mt-24">
                  <SectionLabel className="mb-4">为你推荐</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((item, i) => (
                      <CardAnim key={item.slug} delay={i * 0.04}>
                        <RecommendationCard item={item} />
                      </CardAnim>
                    ))}
                  </div>
                </section>
              )}
              </div>{/* 左栏结束 */}

              {/* 右栏：学习足迹（浏览 / 游玩记录，紧凑副栏，只露最近几条） */}
              <aside className="lg:col-span-4 space-y-6">
                <SectionLabel>学习足迹</SectionLabel>

                {/* 最近动态：读 / 玩 / 下 / 地图 / 搜索合并流 */}
                <section id="section-activity" className="scroll-mt-24">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> 最近动态
                  </h3>
                  {activity.length > 0 ? (
                    <div className="space-y-2">
                      {activity.slice(0, 8).map((entry, i) => (
                        <CardAnim key={entry.id} delay={i * 0.03}>
                          <ActivityRow entry={entry} />
                        </CardAnim>
                      ))}
                    </div>
                  ) : (
                    <EmptyHint text="还没有学习记录，去读一篇或玩一局试试？" to="/learn" cta="浏览知识库" />
                  )}
                  {activity.length > 8 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      仅显示最近 8 条，累计 {activity.length} 条记录
                    </p>
                  )}
                </section>

                {/* 我的收藏 */}
                <section id="section-favorites" className="scroll-mt-24">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" /> 我的收藏
                  </h3>
                  {favorites.length > 0 ? (
                    <div className="space-y-2">
                      {favorites.slice(0, 8).map((entry, i) => (
                        <CardAnim key={entry.key} delay={i * 0.03}>
                          <ContentRow entry={entry} />
                        </CardAnim>
                      ))}
                    </div>
                  ) : (
                    <EmptyHint text="还没有收藏任何教程，在内容页点右上角的星标即可收藏。" />
                  )}
                </section>

                {/* 已学完的课程 */}
                {completed.length > 0 && (
                  <section id="section-completed" className="scroll-mt-24">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 已学完的课程
                    </h3>
                    <div className="space-y-2">
                      {completed.slice(0, 6).map((entry, i) => (
                        <CardAnim key={entry.key} delay={i * 0.03}>
                          <ContentRow entry={entry} />
                        </CardAnim>
                      ))}
                    </div>
                  </section>
                )}

                {/* 下载记录 */}
                {downloads.length > 0 && (
                  <section id="section-downloads" className="scroll-mt-24">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Download className="w-4 h-4 text-primary" /> 下载记录
                    </h3>
                    <div className="space-y-2">
                      {downloads.slice(0, 5).map((rec, i) => (
                        <CardAnim key={rec.slug} delay={i * 0.03}>
                          <DownloadRow rec={rec} />
                        </CardAnim>
                      ))}
                    </div>
                  </section>
                )}

                {/* 互动地图探索 */}
                {maps.length > 0 && (
                  <section id="section-maps" className="scroll-mt-24">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Map className="w-4 h-4 text-primary" /> 互动地图探索
                    </h3>
                    <div className="space-y-2">
                      {maps.slice(0, 5).map((rec, i) => (
                        <CardAnim key={rec.slug} delay={i * 0.03}>
                          <MapRow rec={rec} />
                        </CardAnim>
                      ))}
                    </div>
                  </section>
                )}

                {/* 搜索历史（只列最近 8 个词，点回去可重跑该次检索） */}
                {searches.length > 0 && (
                  <section id="section-searches" className="scroll-mt-24">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" /> 搜索历史
                    </h3>
                    <div className="space-y-2">
                      {searches.slice(0, 8).map((rec, i) => (
                        <CardAnim key={`${rec.context}:${rec.term}`} delay={i * 0.03}>
                          <SearchRow rec={rec} />
                        </CardAnim>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      仅显示最近 8 个关键词，共搜过 {searches.length} 个词 · 累计 {summary.searchCount} 次
                    </p>
                  </section>
                )}
              </aside>
            </div>
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
