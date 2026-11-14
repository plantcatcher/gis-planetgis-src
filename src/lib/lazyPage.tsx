import type { ComponentType } from 'react';

/**
 * 页面级代码分割，兼容 SSG + hydrateRoot。
 *
 * 为什么不直接用 React.lazy：
 *   · 预渲染用 renderToString，它遇到「挂起」的 lazy 组件只会输出 Suspense fallback，
 *     产出空页面；
 *   · 客户端 hydrate 时若当前页面组件还没下载完，首屏会先挂起，和预渲染 DOM 对不上。
 *
 * 做法：每个页面一个 loader + 模块级缓存。
 *   · 首屏 / 预渲染：preloadPage(pathname)（见 routes.tsx）在 render / hydrate 之前
 *     先把当前路由的页面模块取回，渲染时同步可得，与原来的静态 import 行为一致；
 *   · 站内跳转到尚未加载的页面：抛出 Promise 交给外层 <Suspense>（见 AppRoutes），
 *     react-router v7 的导航走 startTransition，加载期间保留旧页面，不会白屏。
 */
export type LazyPage<P> = ComponentType<P> & {
  preload: () => Promise<void>;
  /** 源文件路径（相对仓库根，如 src/pages/Home.tsx），预渲染据此在 manifest 里查 chunk 写 modulepreload */
  src: string;
};

// 新版本上线后旧 hash 的 chunk 会 404：此时整页刷新一次拿新版本（用 sessionStorage 防循环刷新）
const RELOAD_FLAG = 'pgis:chunk-reload';

export function lazyPage<P extends object>(
  load: () => Promise<{ default: ComponentType<P> }>,
  src: string,
): LazyPage<P> {
  let Comp: ComponentType<P> | null = null;
  let pending: Promise<void> | null = null;
  let failure: unknown = null;

  const preload = (): Promise<void> => {
    if (Comp) return Promise.resolve();
    if (!pending) {
      pending = load().then(
        (m) => {
          Comp = m.default;
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.removeItem(RELOAD_FLAG);
            } catch {
              /* ignore */
            }
          }
        },
        (err) => {
          pending = null;
          failure = err;
          if (typeof window !== 'undefined') {
            try {
              if (!sessionStorage.getItem(RELOAD_FLAG)) {
                sessionStorage.setItem(RELOAD_FLAG, '1');
                window.location.reload();
                return;
              }
            } catch {
              /* sessionStorage 不可用时直接抛给上层 */
            }
          }
          throw err;
        },
      );
    }
    return pending;
  };

  const Page = (props: P) => {
    if (Comp) return <Comp {...props} />;
    if (failure) {
      const err = failure;
      failure = null;
      throw err;
    }
    // Suspense 协议：抛出 Promise，加载完成后 React 自动重试渲染
    throw preload().catch(() => {});
  };

  return Object.assign(Page, { preload, src });
}
