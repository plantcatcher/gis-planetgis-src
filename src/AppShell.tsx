import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppRoutes from './AppRoutes';
import SubscribeWidget from '@/components/common/SubscribeWidget';
import LangBanner from '@/components/common/LangBanner';
import { useI18n } from '@/i18n/LocaleContext';

// 游戏内嵌页（/geoquiz /geoshape /geotype /chinapuzzle）占满视口、隐藏站点
// Navbar/Footer，由 iframe 全屏承载游戏本身，避免游戏自带全局样式污染主站。
const GAME_PATHS = ['/geoquiz', '/geoshape', '/geotype', '/chinapuzzle'];

// 可视化互动地图「本体」全屏壳页（/maps/<slug>/full）同理：iframe 承载地图本体，
// 必须隐藏 Navbar/Footer/订阅浮层，否则地图画面顶部会压着一条主站导航栏。
// ⚠️ 只对带 /full 后缀的壳页生效：/maps/<slug> 是地图详情页（正文页，与 /works/<slug> 同款），
//    它必须保留导航栏 —— 早期 /maps/<slug> 曾是全屏壳页，详情页迁入后这里的条件没同步改，
//    导致「详情页丢导航 + 本体页多导航」两边都反了。
const isMapFullscreen = (pathname: string) => /^\/maps\/[^/]+\/full$/.test(pathname);

/**
 * 页面骨架：CSR（App.tsx）与 SSG 预渲染（entry-server.tsx）共用同一棵渲染树。
 *
 * 两端结构必须逐字节一致，否则 hydrateRoot 会因 hydration mismatch 丢弃
 * 预渲染 DOM 并整棵重建 —— 那样爬虫执行 JS 后会看到整页 DOM 被替换。
 * 因此这里只放「会产出 DOM」的部分；仅有副作用、返回 null 的组件
 * （ScrollToTop / IntersectObserver）留在 App.tsx 里，不影响结构。
 */
const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const { lang } = useI18n();
  const isGame = GAME_PATHS.includes(pathname);
  const isFullscreen = isGame || isMapFullscreen(pathname);
  // 关注公众号浮层只对中文站有意义：二维码扫进去是中文公众号，
  // 且它和右下角的英文提示浮层抢同一个位置，英文站直接不渲染。
  return (
    <div className="flex flex-col min-h-screen">
      {!isFullscreen && <Navbar />}
      <main className="flex-grow">
        <AppRoutes />
      </main>
      {!isFullscreen && <Footer />}
      {!isFullscreen && lang !== 'en' && <SubscribeWidget />}
      {!isFullscreen && <LangBanner />}
    </div>
  );
};

export default AppShell;
