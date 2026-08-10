import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppRoutes from './AppRoutes';

// 游戏内嵌页（/geoquiz /geoshape /geotype /chinapuzzle）占满视口、隐藏站点
// Navbar/Footer，由 iframe 全屏承载游戏本身，避免游戏自带全局样式污染主站。
const GAME_PATHS = ['/geoquiz', '/geoshape', '/geotype', '/chinapuzzle'];

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
  const isGame = GAME_PATHS.includes(pathname);
  return (
    <div className="flex flex-col min-h-screen">
      {!isGame && <Navbar />}
      <main className="flex-grow">
        <AppRoutes />
      </main>
      {!isGame && <Footer />}
    </div>
  );
};

export default AppShell;
