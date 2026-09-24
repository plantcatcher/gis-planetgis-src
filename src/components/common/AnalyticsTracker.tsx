import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, useIframeAnalyticsBridge } from '@/lib/analytics';

/**
 * GA4 统计副作用组件（返回 null，不产出 DOM，不影响预渲染 hydration 结构）。
 *
 * 1. 路由变化时发 page_view —— 首屏也会发一次，因为 index.html 里的
 *    gtag('config') 已设 send_page_view: false。
 * 2. 监听 iframe（游戏 / 地图）转发来的事件并代其上报。
 *
 * 挂在 App 层、AppShell 之外，与 ScrollToTop / IntersectObserver 同级。
 */
const AnalyticsTracker = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // PageMeta 在页面组件里设置 document.title，子组件的 effect 先于父级执行，
    // 因此这里读到的已经是本次路由的标题。
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => useIframeAnalyticsBridge(), []);

  return null;
};

export default AnalyticsTracker;
