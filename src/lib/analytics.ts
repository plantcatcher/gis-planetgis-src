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

// -----------------------------------------------------------------------------
// 业务埋点：站内搜索 / 资料下载
//
// 两者都发 GA4 的「标准事件」（search / file_download），好处是既能在 GA4 自带的
// 「事件 → 搜索」「事件 → 文件下载」报表里直接看到，又能挂上我们自己的自定义参数
// （search_context / resource_slug 等）做细分。
//
// 注意：GA4 增强衡量只在「同域」链接上自动记文件下载，而本站下载直链落在
// downloads.planetgis.cn、百度网盘链接落在 pan.baidu.com —— 跨域，自动记不到，
// 所以必须在这里手动发。
// -----------------------------------------------------------------------------

/** 从 URL 路径里取扩展名（只看最后一段，避免把 .com 之类当成扩展名）。 */
function extFrom(url?: string): string {
  if (!url) return '';
  const path = url.split(/[?#]/)[0].replace(/^[a-z]+:\/\/[^/]+/i, '');
  const m = /\.([a-z0-9]{2,6})$/i.exec(path);
  return m ? m[1].toLowerCase() : '';
}

function hostFrom(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * 资料下载埋点。在「下载按钮被点击」时调用。
 * 发标准 file_download 事件（带自定义参数），GA4 的「文件下载」报表即可直接用。
 */
export function trackResourceDownload(item: {
  slug: string;
  title: string;
  url?: string;
  format?: string;
  size?: string;
  category?: string;
  downloadType?: string;
  /** 'gated' = 公众号验证码解锁后下载；'open' = 开放直下 */
  access?: string;
}) {
  const isPan =
    item.downloadType === 'baidu' || /(pan\.baidu\.com|yun\.baidu\.com)/.test(item.url || '');
  const ext = extFrom(item.url);
  trackEvent('file_download', {
    // GA4 标准参数
    file_name: item.title,
    file_extension: ext || (isPan ? 'pan' : ''),
    link_url: item.url || '',
    link_domain: hostFrom(item.url),
    // 本站自定义参数（便于按资料、类别、格式、门禁类型下钻）
    resource_slug: item.slug,
    resource_title: item.title,
    resource_category: item.category || '未分类',
    resource_format: item.format || '',
    resource_size: item.size || '',
    download_method: isPan ? 'baidu_pan' : 'direct',
    download_access: item.access || '',
  });
}

/**
 * 站内搜索埋点。发 GA4 标准 search 事件的 search_term。
 *
 * 去重：同一 context + 关键词在一个页面会话里只上报一次。
 * 搜索框是「边输边过滤」的，加了防抖仍可能因停顿产生中间态关键词
 * （如「长」→「长江」），去重 + 防抖一起控制噪声。
 */
const firedSearches = new Set<string>();

export function trackSearch(term: string, context: string) {
  const t = (term || '').trim();
  if (!t) return;
  const key = `${context}:${t.toLowerCase()}`;
  if (firedSearches.has(key)) return;
  firedSearches.add(key);
  // 会话内去重集合上限，避免长会话无限增长
  if (firedSearches.size > 200) firedSearches.clear();
  trackEvent('search', { search_term: t, search_context: context });
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
