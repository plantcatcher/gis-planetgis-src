// 参考/速查页的表内搜索：对 .md-body 里所有 tbody tr 做大小写不敏感的子串筛选。
// frontmatter `tableSearch: true` 的页面（如行政区划代码全表）由 ContentDetail 渲染。
//
// 行为：
//   · 150ms 防抖后筛选每个 tbody tr 的 textContent；
//   · 一张表 0 命中时整张表（.admin-table-wrapper 或 table 本身）连同紧邻的前置 h2/h3 一起隐藏；
//   · 清空输入即全部还原；正文按篇懒加载，body 变化会重新绑定。
// SSR 安全：渲染期不碰 DOM，全部 DOM 操作都在 useEffect 里。

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/LocaleContext';

interface Props {
  /** 包裹 .md-body 的容器（ContentDetail 传入），筛选只在其中进行 */
  bodyRef: React.RefObject<HTMLElement | null>;
  /** 正文文本：仅作重新绑定的依赖（正文懒加载完成后触发一次重扫） */
  body: string;
}

const HIDDEN_ATTR = 'data-table-search-hidden';

export default function TableSearch({ bodyRef, body }: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [matched, setMatched] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    timer.current = setTimeout(() => setDebounced(query), 150);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  useEffect(() => {
    const container = bodyRef.current;
    if (!container) return;

    // 先全部还原（上一次筛选的隐藏标记），再按当前词重筛
    container
      .querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}]`)
      .forEach((el) => {
        el.style.display = '';
        el.removeAttribute(HIDDEN_ATTR);
      });

    const q = debounced.trim().toLowerCase();
    if (!q) {
      setMatched(null);
      return;
    }

    let total = 0;
    const hide = (el: Element | null) => {
      if (!el || !(el instanceof HTMLElement)) return;
      el.style.display = 'none';
      el.setAttribute(HIDDEN_ATTR, '1');
    };

    for (const table of Array.from(container.querySelectorAll('table'))) {
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      let hits = 0;
      for (const row of rows) {
        const ok = (row.textContent || '').toLowerCase().includes(q);
        if (ok) {
          hits++;
        } else {
          hide(row);
        }
      }
      total += hits;
      if (rows.length && hits === 0) {
        const wrapper = table.closest('.admin-table-wrapper') || table;
        hide(wrapper);
        // 整张表被滤掉时，紧邻其前的章节标题也一并隐藏，避免留下空标题
        const prev = wrapper.previousElementSibling;
        if (prev && /^H[23]$/.test(prev.tagName)) hide(prev);
      }
    }
    setMatched(total);
  }, [debounced, body, bodyRef]);

  return (
    <div className="sticky top-16 z-30 -mx-1 mb-6 bg-background/95 backdrop-blur-sm px-1 py-3 border-b border-border/60">
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('detail.tableSearch.placeholder')}
            className="pr-8"
            aria-label={t('detail.tableSearch.placeholder')}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('detail.tableSearch.clear')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {matched !== null && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {t('detail.tableSearch.matched', { n: matched })}
          </span>
        )}
      </div>
    </div>
  );
}
