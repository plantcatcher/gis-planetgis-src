// 语言切换的目标地址计算。
//
// ⚠️ 切换语言必须整页跳转（<a href> 而非 navigate）：Router 的 basename 是
//    初始化参数，英文站整体挂在 /en 下，站内 SPA 跳转不会重建 Router，
//    继续用 navigate 会让所有 <Link> 仍指向旧语言前缀。

import type { Lang } from './config';
import { hasEnglishVersion, stripLang, withLang } from './config';

/**
 * 计算切到 target 语言后该去哪个地址。
 *
 * 英文站目前只有静态页与列表页（见 config.ts 的 hasEnglishVersion）。
 * 对没有英文版的路径（详情页 /learn/xxx、标签页 /tag/xxx、地图壳页 /maps/x/full），
 * 直接加前缀会落到 404，因此回退到该板块的英文列表页（/en/learn）——
 * 总比把人扔进死链好。等 content/en/ 建好，只需改 hasEnglishVersion 一处。
 */
export function switchTarget(currentPath: string, target: Lang): string {
  const base = stripLang(currentPath || '/');
  if (target === 'en' && !hasEnglishVersion(base)) {
    // 逐级向上退到「确有英文版」的最近一级：
    //   /learn/xxx      -> /learn      （板块列表页）
    //   /maps/x/full    -> /maps
    //   /tag/地理       -> /           （/en/tag 也不存在，不能再退到它）
    const segs = base.split('/').filter(Boolean);
    while (segs.length > 0) {
      segs.pop();
      const up = `/${segs.join('/')}`.replace(/\/+$/, '') || '/';
      if (hasEnglishVersion(up)) return withLang(up, target);
    }
    return withLang('/', target);
  }
  return withLang(base, target);
}
