import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import ShareButton from '@/components/common/ShareButton';

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

// 给搜索引擎 / 读屏器看的扩展说明：游戏壳页主体是一个整屏 iframe，
// 画面内没有可抓取文字，这里补充一段真实描述，不破坏游戏 UI。
const GAME_INTRO: Record<GameKey, string> = {
  geoquiz:
    '「卫星之眼」是一款以真实卫星影像为素材的地理辨认游戏。每一题会展示一张高空俯拍的卫星图，玩家需要从中分辨地表纹理、河流走向、海岸线与城市路网，判断它对应哪座城市。游戏旨在训练观察力与空间直觉，适合地理爱好者、旅行者与gis初学者在碎片时间里练习读图。所有影像均来自公开卫星底图，免费在线游玩，无需下载。',
  geoshape:
    '「GeoShape」是一款世界地理空间记忆游戏。系统给出某个国家的国界轮廓，玩家需仅凭形状判断它属于哪个国家。这能帮助你建立对世界版图的空间印象，区分轮廓相近的国家。游戏覆盖全球主要国家与地区，界面简洁、节奏轻快，是记忆世界地图轮廓的高效方式，支持免费在线游玩。',
  geotype:
    '「地理人格测试」是一份以地理视角切入的人格趣味测评。它会结合你喜欢的地理环境（海洋、山岳、星空、城市或原野）与个人偏好，把你归类为某一种「地球人格」，并解释这种人格背后的地理与心理含义。测试纯属趣味性质，用于科普地理与人的关系，结果仅供娱乐与自我探索，免费在线完成。',
  chinapuzzle:
    '「中国地图拼图挑战」是一款帮助记忆中国省级行政区划的拼图游戏。玩家需要在限时内把 34 个省级行政区（省、自治区、直辖市、特别行政区）拖动到正确位置，拼出完整的中国版图。游戏在趣味挑战中强化对中国政区位置、轮廓与相邻关系的认知，适合学生、地理爱好者与备考人群反复练习，免费在线游玩。',
};

/**
 * 游戏内嵌壳页：以 iframe 渲染 public/games/<game>/index.html。
 *
 * - 用 iframe 隔离各游戏自带的全局 CSS / JS，避免污染主站。
 * - src 用「/games/<game>/index.html」显式命中 public 复制的游戏文件，
 *   避开 Cloudflare 对目录 /games/<game>/ 的 308 重定向歧义。
 *   游戏源码统一收在 public/games/ 下，与 public/maps/ 对称：
 *   对外 URL 仍是 /<game>（本页路由），静态资源路径变了、网页地址不变。
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
        src={`/games/${game}/index.html`}
        title={meta.title}
        loading="lazy"
        className="w-full h-full border-0 block"
      />
      {/* 对爬虫 / 读屏器可见、但不在游戏画面上显示的说明文字 */}
      <section className="sr-only" aria-label={meta.title}>
        <h1>{meta.title}</h1>
        <p>{GAME_INTRO[game]}</p>
      </section>
      <Link
        to="/games"
        aria-label="全部游戏"
        className="hidden sm:inline-flex fixed bottom-4 right-4 z-50 items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/75"
      >
        <LayoutGrid className="h-4 w-4" />
        <span>全部游戏</span>
      </Link>
      <ShareButton
        title={meta.title}
        path={`/${game}`}
        contentType="game"
        contentSlug={game}
        className="hidden sm:flex fixed bottom-4 left-4 z-50 rounded-full bg-black/55 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm hover:bg-black/75"
      />
    </div>
  );
};

export default GameEmbed;
