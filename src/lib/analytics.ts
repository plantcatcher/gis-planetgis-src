/**
 * GA4 统计接入层
 *
 * 本站是 SPA + SSG：index.html 里 gtag('config') 已关闭自动 page_view
 * （send_page_view: false），页面浏览由 AnalyticsTracker 在路由变化时统一发送，
 * 这样标题/路径准确，也不会与 GA4「增强型衡量」双计。
 *
 * 另一件事：游戏 / 地图本体跑在 iframe 里（public/<game>/index.html、
 * public/maps/<slug>/index.html）。iframe 内部拿不到父页的 gtag，
 * 且直接在 iframe 里再装一份 gtag 会造成 page_view 重复计数、会话错乱。
 * 因此约定：iframe 内通过 public/shared/ga-bridge.js 把事件用 postMessage
 * 转发给父页，由父页统一上报（见 useIframeAnalyticsBridge）。
 */

export const GA_MEASUREMENT_ID = 'G-SDBDPNLN25';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** 发送一个 page_view。path 用当前 pathname，标题取实时的 document.title。 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}${window.location.search}`,
    page_title: title || document.title,
  });
}

/** 发送自定义事件。业务代码统一走这个入口，便于以后换统计方案。 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params || {});
}

/**
 * iframe 事件桥接（父页侧）：接收子页 ga-bridge.js 转发的事件并上报。
 * 只接受同源消息和约定好的信封格式 { __ga: 'planetgis', kind, name, params }，
 * 避免把任意第三方 postMessage 当成埋点。
 */
const BRIDGE_TAG = 'planetgis';

export function useIframeAnalyticsBridge() {
  if (typeof window === 'undefined') return () => {};

  const onMessage = (e: MessageEvent) => {
    // 同源校验：本地开发（127.0.0.1 / localhost）与线上 planetgis.cn
    if (e.origin !== window.location.origin) return;
    const data = e.data as
      | { __ga?: string; kind?: string; name?: string; params?: Record<string, unknown> }
      | null;
    if (!data || data.__ga !== BRIDGE_TAG || data.kind !== 'event' || !data.name) return;
    trackEvent(data.name, data.params);
  };

  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}
