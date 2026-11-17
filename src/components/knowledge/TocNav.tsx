// 详情页右侧「本文大纲」：随页面滚动高亮当前章节，并把高亮项滚进侧栏可见范围。
//
// 目录所在侧栏是 sticky 且限高的（见 ContentDetail 的 aside），章节多时（如邮政编码表
// 30 多个 h3）高亮项会滑出可视区，这里负责把它带回视野。
// SSR 安全：首屏不带高亮（activeId 初值 null），滚动监听只在 useEffect 里绑定。

import { useEffect, useRef, useState } from 'react';

interface Heading {
  level: number;
  text: string;
  id: string;
}

/** 判定「当前章节」的视口阈值：标题越过导航栏下方的这条线即算进入 */
const ACTIVE_LINE = 140;

/** 向上找最近的可滚动祖先（侧栏限高后可滚） */
function scrollParent(el: HTMLElement): HTMLElement | null {
  let p = el.parentElement;
  while (p) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return p;
    p = p.parentElement;
  }
  return null;
}

export default function TocNav({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // 用 setTimeout 节流而不是 requestAnimationFrame：页面失焦 / 后台标签页时 rAF 会被挂起，
    // 高亮就再也不更新了（切回页面才跳一下）。setTimeout 在两种情况下都照常跑。
    let timer: ReturnType<typeof setTimeout> | null = null;
    const update = () => {
      timer = null;
      let current: string | null = null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= ACTIVE_LINE) current = h.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!timer) timer = setTimeout(update, 60);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [headings]);

  // 高亮项滚进侧栏可见范围（只动侧栏自己的 scrollTop，不牵动页面）
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !activeId) return;
    const link = nav.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(activeId)}"]`);
    if (!link) return;
    const box = scrollParent(link);
    if (!box) return;
    const top = link.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    const bottom = top + link.offsetHeight;
    if (top < box.scrollTop + 8) box.scrollTop = Math.max(0, top - 8);
    else if (bottom > box.scrollTop + box.clientHeight - 8) {
      box.scrollTop = bottom - box.clientHeight + 8;
    }
  }, [activeId]);

  return (
    <nav ref={navRef} aria-label="本文目录" className="space-y-1.5 text-sm">
      {headings.map((h) => {
        const active = h.id === activeId;
        return (
          <a
            key={h.id}
            href={`#${h.id}`}
            data-toc-id={h.id}
            aria-current={active ? 'location' : undefined}
            className={`block rounded border-l-2 py-0.5 pl-3 pr-2 leading-snug transition-colors line-clamp-2 ${
              active
                ? 'border-primary bg-primary/5 font-medium text-primary'
                : h.level === 3
                  ? 'border-transparent text-muted-foreground/80 hover:border-border hover:text-primary'
                  : 'border-transparent font-medium hover:border-border hover:text-primary'
            }`}
          >
            {h.text}
          </a>
        );
      })}
    </nav>
  );
}
