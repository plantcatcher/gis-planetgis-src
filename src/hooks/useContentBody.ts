import { useEffect, useState } from 'react';
import { getItem, loadBody, type ContentType } from '@/lib/content';

/**
 * 取某篇内容的正文（懒加载）。
 *
 * 正文不再常驻 bundle（原因见 content.ts 的 loadBody 注释）：
 * - 首屏：main.tsx 已在 hydrateRoot() 之前 preloadRoute()，所以首次渲染时 item.body 已就绪，
 *   渲染结果与预渲染 HTML 完全一致，不会 hydration mismatch；
 * - 站内客户端跳转：目标篇尚未加载，先返回 ''，loadBody() 完成后触发重渲染填入正文。
 *
 * `loading` 仅在「客户端挂载之后、且当前篇正文尚未就绪」时为 true——
 * 首屏（SSR / hydration）阶段恒为 false，因此不会在 hydration 时引入与静态 HTML 不一致的骨架。
 */
export function useContentBody(
  type: ContentType,
  slug: string | undefined,
): { body: string; loading: boolean } {
  const item = slug ? getItem(type, slug) : undefined;
  const [, force] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!item || item.body) return;
    let alive = true;
    loadBody(item.type, item.slug).then(() => {
      if (alive) force((n) => n + 1);
    });
    return () => {
      alive = false;
    };
    // item 以 type/slug 标识：切篇时重新触发加载
  }, [item?.type, item?.slug]);

  const body = item?.body ?? '';
  return { body, loading: mounted && !!item && !body };
}
