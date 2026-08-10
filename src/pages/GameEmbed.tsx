import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

type GameKey = 'geoquiz' | 'geoshape' | 'geotype' | 'chinapuzzle';

const META: Record<GameKey, { title: string }> = {
  geoquiz: { title: '卫星之眼 · 看卫星图猜城市' },
  geoshape: { title: 'GeoShape · 看国家轮廓猜国家' },
  geotype: { title: '地理人格测试 · 你属于哪一种地球人格' },
  chinapuzzle: { title: '中国地图拼图挑战 · 拼出你心中的中国' },
};

/**
 * 游戏内嵌壳页：以 iframe 渲染 public/<game>/index.html。
 *
 * - 用 iframe 隔离各游戏自带的全局 CSS / JS，避免污染主站。
 * - src 用「/<game>/index.html」显式命中 public 复制的游戏文件，
 *   避开 Cloudflare 对目录 /<game>/ 的 308 重定向歧义。
 * - 游戏文件与主站同源（planetgis.cn），后续可直接读游戏 localStorage 做成绩打通。
 */
const GameEmbed: React.FC<{ game: GameKey }> = ({ game }) => {
  const meta = META[game];
  return (
    <div className="w-full bg-[#060912]" style={{ height: '100dvh' }}>
      <iframe
        src={`/${game}/index.html`}
        title={meta.title}
        loading="lazy"
        className="w-full h-full border-0 block"
      />
      <Link
        to="/games"
        aria-label="全部游戏"
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/75"
      >
        <LayoutGrid className="h-4 w-4" />
        <span>全部游戏</span>
      </Link>
    </div>
  );
};

export default GameEmbed;
