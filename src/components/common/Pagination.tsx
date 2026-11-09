import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHref, useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n/LocaleContext';

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
 * 之前全是 <button onClick>，`?page=2` 及之后的条目在静态 HTML 里**没有任何链接指向**：
 * 百度 / Google 不执行点击，也就永远发现不了 /downloads 第 2 页起的 470 多篇资料。
 * 这是「大量详情页长期零收录」的直接原因之一。
 *
 * href 用 useHref 生成而不是手拼字符串：它会自动带上 Router 的 basename，
 * 所以英文站（/en）下的分页链接是 /en/downloads?page=2，不会掉回中文站。
 * 点击仍走 onChange（SPA 无刷新），只是把浏览器默认跳转拦下来；
 * 带修饰键（Ctrl/Cmd/Shift）或中键点击时不拦截，保留「新标签页打开」的原生行为。
 */
const Pagination: React.FC<PaginationProps> = ({ page, pageCount, onChange, className = '' }) => {
  // ⚠️ 所有 Hook 必须在下面的 early return 之前调用：
  //    否则「单页时不调 Hook、多页时调 Hook」，同一实例在筛选变化后 Hook 数不一致 → React #310。
  const { t } = useI18n();
  const { pathname, search } = useLocation();
  // 只取「当前路径」的 href（不含 query），query 由下面按页重建，保证每次只改 page 一项。
  const baseHref = useHref(pathname);

  if (pageCount <= 1) return null;

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams(search);
    // 第 1 页回到干净地址，避免 /downloads?page=1 与 /downloads 变成两个可收录的重复 URL
    if (p <= 1) sp.delete('page');
    else sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `${baseHref}?${qs}` : baseHref;
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
