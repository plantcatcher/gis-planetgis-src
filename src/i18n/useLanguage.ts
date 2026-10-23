// 语言切换的目标地址计算。
//
// ⚠️ 切换语言必须整页跳转（<a href> 而非 navigate）：Router 的 basename 是
//    初始化参数，英文站整体挂在 /en 下，站内 SPA 跳转不会重建 Router，
//    继续用 navigate 会让所有 <Link> 仍指向旧语言前缀。

import type { Lang } from './config';
import { stripLang, withLang } from './config';

/** 详情页路径：/<板块>/<slug> —— 目前这类页面还没有英文版 */
const DETAIL_PATH = /^\/(works|maps|games|tools|articles|learn|downloads)\/[^/]+\/?$/;

/**
 * 计算切到 target 语言后该去哪个地址。
 *
 * 详情页（如 /learn/xxx）在英文站尚无对应内容，直接加前缀会落到 404，
 * 因此回退到该板块的英文列表页（/en/learn）——总比把人扔到死链好。
 * 等 content/en/ 建好，把这里的判断换成「查英文内容清单是否存在该 slug」。
 */
export function switchTarget(currentPath: string, target: Lang): string {
  const base = stripLang(currentPath || '/');
  if (DETAIL_PATH.test(base)) {
    const board = base.split('/')[1];
    return withLang(`/${board}`, target);
  }
  return withLang(base, target);
}
