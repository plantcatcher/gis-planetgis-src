import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

type GameKey = 'geoquiz' | 'geoshape' | 'geotype' | 'chinapuzzle';

const META: Record<GameKey, { title: string; description: string }> = {
  geoquiz: {
    title: '卫星之眼 · 看卫星图猜城市',
    description:
      '从高空卫星影像辨认城市，考验你对地表纹理、水系与城市肌理的熟悉程度，在线免费玩。',
  },
  geoshape: {
    title: 'GeoShape · 看国家轮廓猜国家',
    description: '只看国界轮廓猜国家，锻炼你对世界版图的空间记忆，在线免费玩。',
  },
  geotype: {
    title: '地理人格测试 · 你属于哪一种地球人格',
    description:
      '通过地理环境与个人偏好，测出你属于哪一种地球居民——海洋型、山岳型还是星空型。',
  },
  chinapuzzle: {
    title: '中国地图拼图挑战 · 拼出你心中的中国',
    description: '拖动省级行政区拼出完整中国地图，在限时挑战中熟悉中国行政区划。',
  },
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
      {/* 壳页也要有 title / description：浏览器标签页、搜索引擎与 GA4 的
          page_title 都取自这里，缺了会让游戏页在统计里变成空白标题。 */}
      <PageMeta
        title={`${meta.title} · 星球小捕手`}
        description={meta.description}
        canonical={`https://planetgis.cn/${game}`}
      />
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
