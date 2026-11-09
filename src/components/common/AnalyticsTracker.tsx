import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, useIframeAnalyticsBridge, captureRef } from '@/lib/analytics';

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
    // 标题不读 document.title —— 两个原因：
    // 1. 本组件是 AppShell 的兄弟节点且声明在前，effect 先于 PageMeta 的 effect 执行，
    //    此刻 document.title 还是上一页的。
    // 2. Tawk.to 客服挂件有 1 秒定时器会改写 document.title（「N 条新消息」）。
    // 标题由 PageMeta 在渲染期登记（lib/page-title.ts），trackPageView 按 pathname 取。
    trackPageView(pathname);
  }, [pathname]);

  // 应用启动即固化 ?ref= 来源（分享闭环归因），只跑一次
  useEffect(() => {
    captureRef();
  }, []);

  useEffect(() => useIframeAnalyticsBridge(), []);

  return null;
};

export default AnalyticsTracker;
