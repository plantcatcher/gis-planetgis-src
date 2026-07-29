import React from 'react';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import ContentDetail from './pages/ContentDetail';
import Changelog from './pages/Changelog';
import Listing from './pages/Listing';
import type { ReactNode } from 'react';

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
    name: '工具详情',
    path: '/tools/:slug',
    element: <ContentDetail type="tool" />
  },
  {
    name: '文章详情',
    path: '/articles/:slug',
    element: <ContentDetail type="article" />
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
    name: '最新文章',
    path: '/articles',
    element: <Listing type="article" />
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
  }
];

export default routes;
