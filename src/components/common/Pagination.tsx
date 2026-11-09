import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHref, useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n/LocaleContext';
import { pagePath, stripPageSegment } from '@/lib/pagination';

interface PaginationProps {
  /** 当前页，从 1 开始 */
  page: number;
  /** 总页数 */
  pageCount: number;
  /** 切页回调 */
  onChange: (page: number) => void;
  className?: string;
}

// 窗口化页码：始终显示首页/末页，当前页前后各 1 页，中间用省略号
function buildWindow(current: number, count: number): (number | 'ellipsis')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: (number | 'ellipsis')[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(count - 1, current + 1);
  if (left > 2) out.push('ellipsis');
  for (let i = left; i <= right; i++) out.push(i);
  if (right < count - 1) out.push('ellipsis');
  out.push(count);
  return out;
}

/**
 * 分页器。
 *
 * ⚠️ 页码必须是真正的 <a href>，不能只是 <button>。
 * 之前全是 <button onClick>，第 2 页及之后的条目在静态 HTML 里**没有任何链接指向**：
 * 百度 / Google 不执行点击，也就永远发现不了 /downloads 第 2 页起的 470 多篇资料。
 * 这是「大量详情页长期零收录」的直接原因之一。
 *
 * ⚠️ 页码必须走**路径**（`/downloads/page/2`）而不是 query（`/downloads?page=2`）。
 * 本站是 SSG，dist 里每个 URL 对应一个扁平 .html 文件，query string 不参与文件映射——
 * 所以 `/downloads?page=2` 打到的还是 dist/downloads.html，内容永远是第 1 页。
 * 之前「分页可爬」的修复只解决了「链接存在」，没解决「链接指向的是同一份 HTML」，
 * 爬虫顺着点进去看到的是重复页，第 2 页起照样零收录。
 * 现在 /downloads/page/2 -> dist/downloads/page/2.html，每一页都是独立可抓取的 200 页面。
 *
 * href 用 useHref 生成而不是手拼字符串：它会自动带上 Router 的 basename，
 * 所以英文站（/en）下的分页链接是 /en/downloads/page/2，不会掉回中文站。
 * 非 page 的 query（筛选、搜索词）原样保留，翻页不会丢筛选条件。
 * 点击仍走 onChange（SPA 无刷新），只是把浏览器默认跳转拦下来；
 * 带修饰键（Ctrl/Cmd/Shift）或中键点击时不拦截，保留「新标签页打开」的原生行为。
 */
const Pagination: React.FC<PaginationProps> = ({ page, pageCount, onChange, className = '' }) => {
  // ⚠️ 所有 Hook 必须在下面的 early return 之前调用：
  //    否则「单页时不调 Hook、多页时调 Hook」，同一实例在筛选变化后 Hook 数不一致 → React #310。
  const { t } = useI18n();
  const { pathname, search } = useLocation();
  // 当前路径可能已经是 /downloads/page/3，先剥掉页码段再拼目标页，否则会叠成 /page/3/page/2。
  const baseHref = useHref(stripPageSegment(pathname));

  if (pageCount <= 1) return null;

  const hrefFor = (p: number) => {
    // 只改页码，筛选/搜索参数原样带过去（筛选条件不属于页码，翻页不该丢）。
    // 旧链接残留的 ?page=N 一并丢掉，否则会出现「路径第 2 页 + query 第 3 页」两套页码。
    const sp = new URLSearchParams(search);
    sp.delete('page');
    const qs = sp.toString();
    const target = pagePath(baseHref, p);
    return qs ? `${target}?${qs}` : target;
  };

  const handleClick = (p: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onChange(p);
  };

  const items = buildWindow(page, pageCount);
  const btn =
    'inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-md text-sm font-medium transition-colors';
  const idle = 'border border-border text-muted-foreground hover:bg-muted';
  const disabled = `${btn} border border-border text-muted-foreground opacity-40 cursor-not-allowed`;

  return (
    <nav className={`flex items-center justify-center gap-1.5 mt-10 ${className}`} aria-label={t('pager.nav')}>
      {page <= 1 ? (
        <span className={disabled} aria-disabled="true" aria-label={t('pager.prev')}>
          <ChevronLeft className="w-4 h-4" />
        </span>
      ) : (
        <a
          href={hrefFor(page - 1)}
          onClick={handleClick(page - 1)}
          className={`${btn} ${idle}`}
          aria-label={t('pager.prev')}
          rel="prev"
        >
          <ChevronLeft className="w-4 h-4" />
        </a>
      )}
      {items.map((it, idx) =>
        it === 'ellipsis' ? (
          <span key={`e${idx}`} className="px-1 text-muted-foreground select-none" aria-hidden>
            …
          </span>
        ) : (
          <a
            key={it}
            href={hrefFor(it)}
            onClick={handleClick(it)}
            aria-current={it === page ? 'page' : undefined}
            className={`${btn} ${it === page ? 'bg-primary text-white' : idle}`}
          >
            {it}
          </a>
        ),
      )}
      {page >= pageCount ? (
        <span className={disabled} aria-disabled="true" aria-label={t('pager.next')}>
          <ChevronRight className="w-4 h-4" />
        </span>
      ) : (
        <a
          href={hrefFor(page + 1)}
          onClick={handleClick(page + 1)}
          className={`${btn} ${idle}`}
          aria-label={t('pager.next')}
          rel="next"
        >
          <ChevronRight className="w-4 h-4" />
        </a>
      )}
    </nav>
  );
};

export default Pagination;
