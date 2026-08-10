/**
 * 跨站成绩读取（Cookie 桥）
 *
 * 背景：小游戏「卫星之眼」部署在子域 geoquiz.planetgis.cn，其成绩存在该子域
 * 的 LocalStorage，主站 planetgis.cn 因同源策略无法直接读取。游戏在每局结束时
 * 把近 N 局成绩写入父域 cookie（planetgis_geoquiz; domain=.planetgis.cn），
 * 本模块在主站客户端读取并解析为统一成绩记录，渲染进「我的成绩」。
 *
 * 这是「传输层」解耦：未来若接入 Supabase，只需把本模块的读取源从 cookie 换成
 * 云端查询，MyLearning 的渲染逻辑不动。UI → Service → Store →（外部）Storage。
 *
 * SSR 安全：服务端无 document，返回空数组，避免 hydration mismatch。
 */

export interface ExternalGameRecord {
  id: string;
  title: string;
  score: number;
  takenAt: string;
  source: 'geoquiz';
}

const COOKIE_NAME = 'planetgis_geoquiz';

interface RawPayload {
  v?: number;
  best?: number;
  totalGames?: number;
  games?: Array<{
    score: number;
    correct?: number;
    total?: number;
    maxStreak?: number;
    takenAt: number;
  }>;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = name + '=';
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

export function getGeoQuizRecords(): ExternalGameRecord[] {
  const raw = readCookie(COOKIE_NAME);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as RawPayload;
    const games = Array.isArray(data.games) ? data.games : [];
    return games
      .filter((g) => typeof g.score === 'number' && typeof g.takenAt === 'number')
      .map((g, i) => ({
        id: `geoquiz-${g.takenAt}-${i}`,
        title: '卫星图猜城市',
        score: g.score,
        takenAt: new Date(g.takenAt).toISOString(),
        source: 'geoquiz' as const,
      }));
  } catch {
    return [];
  }
}
