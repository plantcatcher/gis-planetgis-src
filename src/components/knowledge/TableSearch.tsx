// 参考/速查页的表内搜索：对 .md-body 里所有 tbody tr 做大小写不敏感的子串筛选。
// frontmatter `tableSearch: true` 的页面（如行政区划代码全表）由 ContentDetail 渲染。
//
// 行为：
//   · 150ms 防抖后筛选每个 tbody tr 的 textContent；
//   · 一张表 0 命中时整张表（.admin-table-wrapper 或 table 本身）连同紧邻的前置 h2/h3 一起隐藏；
//   · 有筛选词时，表格以外的正文块（导语、说明段落、FAQ、系列互链）一并收起，
//     结果紧贴搜索框出现，不必先划过「一、二、三」几节才看到命中的表；
//   · 正文按 h2 大节 / h3 小节切分，只保留含命中表的小节，其标题保留，0 命中小节整节隐藏；
//   · 清空输入即全部还原；正文按篇懒加载，body 变化会重新绑定。
// SSR 安全：渲染期不碰 DOM，全部 DOM 操作都在 useEffect 里。

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/LocaleContext';

interface Props {
  /** 包裹 .md-body 的容器（ContentDetail 传入），筛选只在其中进行 */
  bodyRef: React.RefObject<HTMLElement | null>;
  /** 正文文本：仅作重新绑定的依赖（正文懒加载完成后触发一次重扫） */
  body: string;
  /** 每页定制的提示语（frontmatter `tableSearchPlaceholder`），缺省用词典里的通用文案 */
  placeholder?: string;
}

const HIDDEN_ATTR = 'data-table-search-hidden';

function hide(el: Element | null | undefined) {
  if (!(el instanceof HTMLElement)) return;
  el.style.display = 'none';
  el.setAttribute(HIDDEN_ATTR, '1');
}

/** 正文顶层块：系列页正文会被 CTA 卡拆成两段 .md-body，故先找 .md-body 再取其子元素 */
function topBlocks(container: HTMLElement): HTMLElement[] {
  const bodies = Array.from(container.querySelectorAll<HTMLElement>('.md-body'));
  const scopes = bodies.length ? bodies : [container];
  return scopes.flatMap((s) => Array.from(s.children) as HTMLElement[]);
}

/** 块内的表格（querySelectorAll 不含自身，块本身是 table 时要单独算） */
function tablesIn(block: HTMLElement): HTMLTableElement[] {
  if (block.tagName === 'TABLE') return [block as HTMLTableElement];
  return Array.from(block.querySelectorAll('table'));
}

/** 大节（h2）→ 小节（h3）；无 h2 的开头部分自成一节 */
interface SubSection {
  heading?: HTMLElement;
  blocks: HTMLElement[];
}
interface Section {
  heading?: HTMLElement;
  lead: HTMLElement[];
  subs: SubSection[];
}

function splitSections(blocks: HTMLElement[]): Section[] {
  const secs: Section[] = [{ lead: [], subs: [] }];
  for (const b of blocks) {
    const cur = secs[secs.length - 1];
    if (b.tagName === 'H2') {
      secs.push({ heading: b, lead: [], subs: [] });
    } else if (b.tagName === 'H3') {
      cur.subs.push({ heading: b, blocks: [] });
    } else if (cur.subs.length) {
      cur.subs[cur.subs.length - 1].blocks.push(b);
    } else {
      cur.lead.push(b);
    }
  }
  return secs;
}

export default function TableSearch({ bodyRef, body, placeholder }: Props) {
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
    container.querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}]`).forEach((el) => {
      el.style.display = '';
      el.removeAttribute(HIDDEN_ATTR);
    });

    const q = debounced.trim().toLowerCase();
    if (!q) {
      setMatched(null);
      return;
    }

    // 1) 逐行筛选，记下命中的表
    const hitTables = new Set<Element>();
    let total = 0;
    for (const table of Array.from(container.querySelectorAll('table'))) {
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      let hits = 0;
      for (const row of rows) {
        if ((row.textContent || '').toLowerCase().includes(q)) hits++;
        else hide(row);
      }
      total += hits;
      if (hits > 0) hitTables.add(table);
    }
    setMatched(total);

    // 2) 按标题切节，只留含命中表的小节；非表格块（导语 / 段落 / FAQ / 互链）一律收起
    const hitBlock = (b: HTMLElement) => tablesIn(b).some((tb) => hitTables.has(tb));
    const hitAny = (bs: HTMLElement[]) => bs.some(hitBlock);

    for (const sec of splitSections(topBlocks(container))) {
      if (!hitAny(sec.lead) && !sec.subs.some((s) => hitAny(s.blocks))) {
        hide(sec.heading);
        sec.lead.forEach(hide);
        for (const s of sec.subs) {
          hide(s.heading);
          s.blocks.forEach(hide);
        }
        continue;
      }
      for (const b of sec.lead) if (!hitBlock(b)) hide(b);
      for (const s of sec.subs) {
        if (!hitAny(s.blocks)) {
          hide(s.heading);
          s.blocks.forEach(hide);
          continue;
        }
        for (const b of s.blocks) if (!hitBlock(b)) hide(b);
      }
    }
  }, [debounced, body, bodyRef]);

  const label = placeholder || t('detail.tableSearch.placeholder');

  return (
    <div className="sticky top-16 z-30 -mx-1 mb-6 px-1 pb-3 pt-3">
      <div className="rounded-xl border-2 border-primary/25 bg-card/55 p-2.5 shadow-sm backdrop-blur-md transition-all focus-within:border-primary/60 focus-within:bg-card/75 focus-within:shadow-md">
        <p className="mb-1 flex items-center gap-1.5 px-1 text-xs font-semibold tracking-wide text-primary">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          {t('detail.tableSearch.label')}
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={label}
              aria-label={label}
              className="h-10 border-0 bg-transparent px-1 pr-8 text-base shadow-none focus-visible:ring-0 md:text-base"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('detail.tableSearch.clear')}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {matched !== null && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                matched === 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
              }`}
            >
              {matched === 0
                ? t('detail.tableSearch.noMatch')
                : t('detail.tableSearch.matched', { n: matched })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
