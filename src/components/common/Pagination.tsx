import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const Pagination: React.FC<PaginationProps> = ({ page, pageCount, onChange, className = '' }) => {
  if (pageCount <= 1) return null;
  const items = buildWindow(page, pageCount);
  const btn =
    'inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-md text-sm font-medium transition-colors';
  return (
    <nav className={`flex items-center justify-center gap-1.5 mt-10 ${className}`} aria-label="分页导航">
      <button
        type="button"
        className={`${btn} border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed`}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="上一页"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {items.map((it, idx) =>
        it === 'ellipsis' ? (
          <span key={`e${idx}`} className="px-1 text-muted-foreground select-none" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            aria-current={it === page ? 'page' : undefined}
            className={`${btn} ${
              it === page
                ? 'bg-primary text-white'
                : 'border border-border text-muted-foreground hover:bg-muted'
            }`}
            onClick={() => onChange(it)}
          >
            {it}
          </button>
        ),
      )}
      <button
        type="button"
        className={`${btn} border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed`}
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="下一页"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
