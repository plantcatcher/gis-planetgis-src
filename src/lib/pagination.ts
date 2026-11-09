// 列表页分页的公共口径。
//
// 为什么页码必须进**路径**而不是 query string：
// 本站是 SSG + Cloudflare Pages 扁平 `.html` 产物，`/learn?page=2` 与 `/learn`
// 指向的是同一个文件 dist/learn.html —— query 不参与文件映射，预渲染永远只能产出第 1 页。
// 结果就是分页器里的 <a href="/learn?page=2"> 打开后仍是第 1 页的内容，
// 第 2 页起的 134 篇知识库文章、470 多篇资料在静态 HTML 里没有任何**有效**入口。
// 改成 /learn/page/2 -> dist/learn/page/2.html 后，每一页都是独立可抓取的 200 页面。
//
// ⚠️ 每页条数必须与 scripts/site-routes.mjs 的 PAGE_SIZES 保持一致：
//    那边按同样的每页条数算出「要预渲染到第几页」，两边漂移会出现
//    「分页器链到 /learn/page/10，dist 里却没有这个文件」的死链。

import { useLocation, useNavigate, useParams } from 'react-router-dom';

/** 各列表页每页条数（与 scripts/site-routes.mjs 的 PAGE_SIZES 一一对应） */
export const PAGE_SIZE = {
  works: 12,
  learn: 18,
  downloads: 24,
  maps: 12,
  games: 12,
} as const;

/**
 * 第 1 页回到干净地址（`/learn`），其余为 `/learn/page/<n>`。
 *
 * 第 1 页不留 `/page/1` 别名：两个 URL 同内容会被判重复页，
 * 且 canonical 只能选一个，多出来的那个纯属浪费抓取配额。
 */
export function pagePath(base: string, page: number): string {
  return page <= 1 ? base : `${base}/page/${page}`;
}

/**
 * 去掉路径末尾的 `/page/<n>`，得到分页基路径。
 * 分页器据此生成链接、列表页据此在筛选变化时退回第 1 页。
 */
export function stripPageSegment(pathname: string): string {
  const stripped = (pathname || '/').replace(/\/page\/\d+\/?$/, '');
  return stripped === '' ? '/' : stripped;
}

/**
 * 路由参数里的页码（不按总页数夹取）。
 *
 * 给「只看 URL、不关心列表」的场景用：<title>、canonical、面包屑。
 * 那些地方拿不到（也不需要）筛选后的总页数。
 */
export function readPageParam(param: string | undefined): number {
  const n = Number(param);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

/**
 * 取当前页码（1 起，夹在 [1, totalPages] 内）。
 *
 * 只认路由参数，**不再兼容旧的 `?page=N`**：预渲染时 query 一律为空，
 * 若客户端又按 `?page=N` 渲染，hydrate 时 DOM 与静态 HTML 不一致，
 * React 会丢掉整棵服务端树重建（爬虫执行 JS 时看到整页被替换）。
 * 旧链接（`/learn?page=3`）落到第 1 页即可 —— 它们的 canonical 本来就是 `/learn`。
 */
export function readPage(param: string | undefined, totalPages: number): number {
  return Math.min(readPageParam(param), Math.max(1, totalPages));
}

/**
 * 只读当前页码（不夹取总页数）。
 * 给 <title> / canonical 这类「按 URL 说话」的地方用：
 * 越界页（/learn/page/99）的规范地址应该就是它自己，而不是悄悄改成末页。
 */
export function usePageParam(): number {
  const params = useParams<{ page?: string }>();
  return readPageParam(params.page);
}

/**
 * 列表页分页导航：把「当前页读自路由参数」「翻页写回路径」「筛选变化退回第 1 页」收成一处。
 *
 * 各列表页（/learn、/downloads、/maps、/games、/works）原先各自维护一份
 * `searchParams.get('page')` + `setSearchParams({page})`，改成分页走路径后
 * 每处都要同步改三件事（读、写、重置），漏一处就会出现「点第 2 页仍停在第 1 页」
 * 或「筛完筛选器还停在第 5 页显示空列表」。集中在这里只改一次。
 *
 * @param totalPages 当前筛选条件下的总页数（页码超出时自动夹到末页）
 */
export function usePageNav(totalPages: number) {
  const params = useParams<{ page?: string }>();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const currentPage = readPage(params.page, totalPages);
  const basePath = stripPageSegment(pathname);

  /** 跳到第 p 页；筛选/搜索 query 原样保留 */
  const goPage = (p: number) => {
    const target = pagePath(basePath, p);
    if (target !== pathname) navigate({ pathname: target, search }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * 写筛选/搜索条件，并**同时回到第 1 页**。
   *
   * 路径里的 /page/N 不会被 query 覆盖掉——只调 setSearchParams 的话，
   * 在 /downloads/page/5 点一个筛选，会停在「第 5 页 + 新筛选」，
   * 而新筛选往往只剩一两页，于是看到一片空白。
   */
  const setFilters = (next: URLSearchParams | Record<string, string> | [string, string][]) => {
    const qs = new URLSearchParams(next);
    // 旧链接可能还带着 ?page=N（分页改路径之前的形态），一并清掉，
    // 免得出现「路径第 1 页 + query 第 3 页」两套页码打架。
    qs.delete('page');
    const s = qs.toString();
    navigate({ pathname: basePath, search: s ? `?${s}` : '' }, { replace: true });
  };

  return { currentPage, basePath, goPage, setFilters };
}
