/**
 * 当前页面标题的登记表 —— GA4 page_view 的唯一标题来源。
 *
 * 为什么不能直接读 document.title：
 *
 * 1. document.title 在真实浏览器里**不只由我们写**。Tawk.to 客服挂件
 *    （embed.tawk.to/_s/v4/app/<hash>/js/twk-main.js）里有一段 1 秒定时器：
 *
 *      setInterval(() => {
 *        document.title = qe.value === document.title
 *          ? a('chat', 'new_message', { count })   // ← 本地化后的「N 条新消息」
 *          : qe.value;
 *      }, 1e3);
 *
 *    有未读消息时它会把标题改成「N 条新消息」，于是 GA4 里出现了 3 行
 *    「1/2/3 条新消息」的伪页面（241 次浏览）。被污染的不止这几行：任何一次
 *    恰好落在定时器改写之后的路由切换，标题都是错的，只是大多时候被改回了原值。
 *
 * 2. 即便没有第三方脚本，读 document.title 的时机也不对。AnalyticsTracker 与
 *    AppShell 是兄弟节点，React 的 passive effect 按声明顺序执行 ——
 *    AnalyticsTracker 排在前面，路由切换时它先跑，PageMeta 的 effect 还没跑，
 *    读到的其实是**上一页**的标题。
 *
 * 所以：PageMeta 在**渲染期**登记标题（渲染先于同一提交里的所有 effect），
 * 埋点按 pathname 取。标题与页面永远来自同一个来源。
 *
 * 登记在渲染期写模块级变量，属于刻意的副作用：它只被 AnalyticsTracker 消费，
 * 且按 pathname 精确匹配 —— 渲染被丢弃时最多留下一条同路径的旧标题，不会串页。
 */

interface PageTitleEntry {
  path: string;
  title: string;
}

let current: PageTitleEntry | null = null;

/** 由 PageMeta 在渲染期调用。path 用 useLocation().pathname（不含 Router basename）。 */
export function registerPageTitle(path: string, title: string): void {
  current = { path, title };
}

/** 取指定路径登记的标题；路径对不上（例如页面没渲染 PageMeta）返回 undefined。 */
export function getRegisteredPageTitle(path: string): string | undefined {
  return current && current.path === path ? current.title : undefined;
}
