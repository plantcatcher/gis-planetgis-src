import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';

// 不蒜子（Busuanzi）轻量访问统计。
// 机制参考 D:\MyWebs\Blog（Hexo butterfly 主题）：全局引入 busuanzi.pure.mini.js 后，
// 任意带 id="busuanzi_value_page_pv" 的元素会被脚本自动填入「当前页面浏览量」。
// 本站是 SPA（BrowserRouter），首屏由全局脚本自动统计；客户端路由切换时
// 需手动重新请求一次，才能把新页面计入（并避免与首屏自动统计重复 +1）。

declare global {
  interface Window {
    bszCaller?: {
      fetch: (url: string, cb: (data: Record<string, string>) => void) => void;
    };
    bszTag?: {
      texts: (data: Record<string, string>) => void;
    };
    __BSZ_INITIAL_PATH__?: string;
  }
}

const BSUANZI_URL = '//busuanzi.ibruce.info/busuanzi?jsonpCallback=BusuanziCallback';

// 触发一次统计请求：以当前页面 URL 为 referrer（+1 浏览量），并刷新页面浏览量显示。
// 若脚本尚未加载完成，最多重试若干次（覆盖「首屏脚本还没好就发生 SPA 跳转」的情况）。
export function refreshPageView(retry = 0): void {
  const caller = window.bszCaller;
  if (!caller || typeof caller.fetch !== 'function') {
    if (retry < 10) window.setTimeout(() => refreshPageView(retry + 1), 300);
    return;
  }
  caller.fetch(BSUANZI_URL, (data) => {
    window.bszTag?.texts(data);
  });
}

// 在详情页挂载此 hook：路由切换时重新统计当前页浏览量。
// 首屏（直接以该详情页 URL 进入）已由全局脚本自动统计，这里跳过首屏那一次，避免重复 +1。
export function usePageView(): void {
  const { pathname } = useLocation();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      // 当前页就是初始进入的页面 → 全局脚本已经统计过，跳过。
      if (pathname === window.__BSZ_INITIAL_PATH__) return;
    }
    refreshPageView();
    // 仅需在 pathname 变化时触发；refreshPageView 内部已做加载守卫。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}

// 浏览量展示徽标：眼睛图标 + 数字 + “次浏览”。
//
// 三个 busuanzi_value_* 的占位文本必须用 dangerouslySetInnerHTML 写，不能用 children。
// 背景：不蒜子脚本（index.html 里 async 引入）会用 innerHTML 把 “—” 替换成真实数字；
// 而正文改成懒加载之后，main.tsx 的 hydrateRoot() 要多等一个正文 chunk 的网络往返，
// hydration 因此被推到几百毫秒之后，常常落在不蒜子的 jsonp 回调之后。
// 于是 hydration 那一刻 DOM 里是数字、vdom 里还是 “—”：
//   · 用 children  → React 报 #425（文本不匹配）并整棵树回退重建（连带多个 #418）。
//     DOM 被重建正是百度渲染器判定「有跳转」的同一条根因；
//   · 加 suppressHydrationWarning 只能消掉报错，React 仍会在 hydration 时把 vdom 的 “—”
//     写回 DOM，真实数字照样被抹掉（实测 2.9s 处被覆盖）；
//   · 用 dangerouslySetInnerHTML → React 对该元素既不 diff 子内容、也不在 hydration 时写入，
//     报错为 0，不蒜子的数字原样保留（实测 15 / 8113561 / 10962403）。
// 值是硬编码常量 “—”，无注入风险；__html 恒定，后续 update 也不会产生 DOM 写入。
export const PageViewCount: React.FC<{ className?: string }> = ({ className }) => {
  usePageView();
  return (
    <span className={className ?? 'inline-flex items-center gap-1'}>
      <Eye className="w-3.5 h-3.5" />
      <span id="busuanzi_value_page_pv" dangerouslySetInnerHTML={{ __html: '—' }} />
      <span>次浏览</span>
    </span>
  );
};
