import React from 'react';
import { matchRoutes } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import { lazyPage } from './lib/lazyPage';

// 页面按路由拆分成独立 chunk（原来全部静态 import，进同一个主包）。
// 首屏 / 预渲染前由 preloadPage() 预载当前页，见 lib/lazyPage.tsx。
const Home = lazyPage(() => import('./pages/Home'), 'src/pages/Home.tsx');
const About = lazyPage(() => import('./pages/About'), 'src/pages/About.tsx');
const Contact = lazyPage(() => import('./pages/Contact'), 'src/pages/Contact.tsx');
const PrivacyPolicy = lazyPage(() => import('./pages/PrivacyPolicy'), 'src/pages/PrivacyPolicy.tsx');
const Terms = lazyPage(() => import('./pages/Terms'), 'src/pages/Terms.tsx');
const ContentDetail = lazyPage(() => import('./pages/ContentDetail'), 'src/pages/ContentDetail.tsx');
const Changelog = lazyPage(() => import('./pages/Changelog'), 'src/pages/Changelog.tsx');
const TagPage = lazyPage(() => import('./pages/TagPage'), 'src/pages/TagPage.tsx');
const Listing = lazyPage(() => import('./pages/Listing'), 'src/pages/Listing.tsx');
const Wiki = lazyPage(() => import('./pages/Wiki'), 'src/pages/Wiki.tsx');
const MyLearning = lazyPage(() => import('./pages/MyLearning'), 'src/pages/MyLearning.tsx');
const GameEmbed = lazyPage(() => import('./pages/GameEmbed'), 'src/pages/GameEmbed.tsx');
const ResourceDetail = lazyPage(() => import('./pages/ResourceDetail'), 'src/pages/ResourceDetail.tsx');
const Games = lazyPage(() => import('./pages/Games'), 'src/pages/Games.tsx');
const Maps = lazyPage(() => import('./pages/Maps'), 'src/pages/Maps.tsx');
const MapEmbed = lazyPage(() => import('./pages/MapEmbed'), 'src/pages/MapEmbed.tsx');



interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '首页',
    path: '/',
    element: <Home />
  },
  {
    name: '关于我们',
    path: '/about',
    element: <About />
  },
  {
    name: '联系我们',
    path: '/contact',
    element: <Contact />
  },
  {
    name: '隐私政策',
    path: '/privacy-policy',
    element: <PrivacyPolicy />
  },
  {
    name: '服务条款',
    path: '/terms',
    element: <Terms />
  },
  {
    name: '作品详情',
    path: '/works/:slug',
    element: <ContentDetail type="work" />
  },
  {
    name: '精选作品分页',
    path: '/works/page/:page',
    element: <Listing type="work" />,
    visible: false,
  },
  {
    name: '地图详情',
    path: '/maps/:slug',
    element: <ContentDetail type="map" />
  },
  {
    name: '互动地图分页',
    path: '/maps/page/:page',
    element: <Maps />,
    visible: false,
  },
  {
    name: '游戏详情',
    path: '/games/:slug',
    element: <ContentDetail type="game" />
  },
  {
    name: '小游戏分页',
    path: '/games/page/:page',
    element: <Games />,
    visible: false,
  },
  {
    name: '工具详情',
    path: '/tools/:slug',
    element: <ContentDetail type="tool" />
  },
  {
    name: '学习详情',
    path: '/learn/:slug',
    element: <ContentDetail type="learn" />
  },
  {
    name: '知识库分页',
    path: '/learn/page/:page',
    element: <Listing type="learn" />,
    visible: false,
  },
  {
    name: '更新日志',
    path: '/changelog',
    element: <Changelog />
  },
  {
    name: '精选作品',
    path: '/works',
    element: <Listing type="work" />
  },
  {
    name: '地理知识库',
    path: '/learn',
    element: <Listing type="learn" />
  },
  {
    name: '我的学习',
    path: '/my',
    element: <MyLearning />
  },
  {
    name: '卫星之眼',
    path: '/geoquiz',
    element: <GameEmbed game="geoquiz" />,
    visible: false,
  },
  {
    name: '看轮廓猜国家',
    path: '/geoshape',
    element: <GameEmbed game="geoshape" />,
    visible: false,
  },
  {
    name: '地理人格测试',
    path: '/geotype',
    element: <GameEmbed game="geotype" />,
    visible: false,
  },
  {
    name: '每日地理挑战',
    path: '/geodaily',
    element: <GameEmbed game="geodaily" />,
    visible: false,
  },
  {
    name: '中国地图拼图',
    path: '/chinapuzzle',
    element: <GameEmbed game="chinapuzzle" />,
    visible: false,
  },
  {
    name: '地理小游戏',
    path: '/games',
    element: <Games />,
  },
  {
    name: '可视化互动地图',
    path: '/maps',
    element: <Maps />,
  },
  {
    name: '互动地图全屏',
    path: '/maps/:slug/full',
    element: <MapEmbed />,
    visible: false,
  },
  {
    name: '地理小工具',
    path: '/tools',
    element: <Listing type="tool" />
  },
  {
    name: '子站导航',
    path: '/subdomains',
    element: <Listing type="subdomain" />
  },
  {
    name: 'GIS 资源导航',
    path: '/wiki',
    element: <Wiki />
  },
  {
    name: '资料下载',
    path: '/downloads',
    element: <Listing type="resource" />
  },
  {
    name: '资料详情',
    path: '/downloads/:slug',
    element: <ResourceDetail />
  },
  {
    name: '资料下载分页',
    path: '/downloads/page/:page',
    element: <Listing type="resource" />,
    visible: false,
  },
  {
    name: '标签专题',
    path: '/tag/:tag',
    element: <TagPage />
  }
];

/**
 * 预载某个 URL 对应的页面模块（render / hydrate 之前调用）。
 * 返回命中页面的源文件路径（无懒加载页面命中时为 undefined）。
 * 英文站整体挂在 /en 下（见 App.tsx 的 basename），匹配前先剥掉前缀。
 */
export async function preloadPage(pathname: string): Promise<string | undefined> {
  const bare = pathname === '/en' ? '/' : pathname.startsWith('/en/') ? pathname.slice(3) : pathname;
  const matched = matchRoutes(routes.map((r) => ({ path: r.path })), bare);
  const hit = matched?.[matched.length - 1]?.route;
  if (!hit) return;
  const route = routes.find((r) => r.path === hit.path);
  const type = (route?.element as ReactElement | undefined)?.type as
    | { preload?: () => Promise<void>; src?: string }
    | undefined;
  await type?.preload?.();
  // 返回页面源文件路径，供预渲染写 modulepreload
  return type?.src;
}

export default routes;
