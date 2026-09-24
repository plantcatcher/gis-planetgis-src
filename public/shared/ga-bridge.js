/* GA4 事件桥（iframe 侧）
 *
 * 游戏 / 地图本体跑在主站的 iframe 里，iframe 内部拿不到父页的 gtag。
 * 若在 iframe 里再装一份 gtag，会导致 page_view 重复计数、会话与来源错乱。
 * 因此这里按场景分流：
 *
 *   - 在 iframe 中：把 gtag('event', ...) 用 postMessage 转发给父页，
 *     由父页的 AnalyticsTracker 代发（不重复发 page_view）。
 *   - 被直接访问（搜索引擎落地页、独立打开）：自行加载 gtag 上报主站属性。
 *
 * 用法：在任何调用 gtag 的脚本之前引入 <script src="/shared/ga-bridge.js"></script>
 */
(function () {
  var GA_ID = 'G-SDBDPNLN25';
  var TAG = 'planetgis';

  var inIframe = false;
  try {
    inIframe = window.self !== window.top;
  } catch (e) {
    inIframe = true; // 跨域取 top 会抛错，说明一定在 iframe 里
  }

  window.dataLayer = window.dataLayer || [];

  if (inIframe) {
    window.gtag = function () {
      var a = arguments;
      if (a[0] !== 'event' || !a[1]) return;
      try {
        window.parent.postMessage(
          { __ga: TAG, kind: 'event', name: a[1], params: a[2] || {} },
          window.location.origin
        );
      } catch (e) {}
    };
  } else {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
})();
