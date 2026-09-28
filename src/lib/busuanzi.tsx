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
// 注意：busuanzi_value_page_pv 的内容由脚本直接写 innerHTML，
// 这里用常量占位符 “—”，React 不会因 vdom 不变而覆盖脚本写入的值。
export const PageViewCount: React.FC<{ className?: string }> = ({ className }) => {
  usePageView();
  return (
    <span className={className ?? 'inline-flex items-center gap-1'}>
      <Eye className="w-3.5 h-3.5" />
      <span id="busuanzi_value_page_pv">—</span>
      <span>次浏览</span>
    </span>
  );
};
