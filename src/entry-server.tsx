import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import {
  resetSsrHead,
  getSsrHead,
  getSsrJsonLd,
  getSsrAlternates,
} from './lib/seo';
import { TooltipProvider } from './components/ui/tooltip';
import AppShell from './AppShell';
import { LocaleProvider } from './i18n/LocaleContext';
import { langFromPath, OG_LOCALE } from './i18n/config';
import { zh as dictZh } from './i18n/dict.zh';
import { en as dictEn } from './i18n/dict.en';

// 正文按篇懒加载（见 lib/content.ts）：预渲染脚本需在 renderToString 之前先预载
// 当前路由的正文，否则渲染出的是空正文（check-seo 会以「正文过短」拦下）。
// 这里把 preloadRoute 透出给 prerender.mjs。
export { preloadRoute } from './lib/content';

// 供 scripts/prerender.mjs 调用：把任意路由渲染成完整 HTML 字符串。
// head 标签（标题 / 描述 / OG / JSON-LD）由各页面的 <PageMeta> 在渲染期间
// 写入模块级单例（见 src/lib/seo.tsx），这里渲染后读取并注入静态 HTML。
export function render(url: string): { html: string; head: string; lang: string } {
  resetSsrHead();

  // 语言与 Router basename 必须与客户端 App.tsx 完全一致：
  // 英文站整体挂在 /en basename 下，StaticRouter 剥掉 basename 后
  // 组件内 useLocation().pathname 与 CSR 端一致（都是 /learn 而非 /en/learn）。
  const lang = langFromPath(url);
  const basename = lang === 'en' ? '/en' : '';
  const brand = lang === 'en' ? dictEn['brand.name'] : dictZh['brand.name'];

  // 渲染树必须与客户端 App.tsx 完全一致（同为 LocaleProvider + TooltipProvider + AppShell），
  // 否则 hydrateRoot 会判定 mismatch 而丢弃这里产出的静态 DOM。
  const html = renderToString(
    <StaticRouter location={url} basename={basename}>
      <LocaleProvider lang={lang}>
        <TooltipProvider>
          <AppShell />
        </TooltipProvider>
      </LocaleProvider>
    </StaticRouter>
  );

  const h = getSsrHead();
  const jsonLd = getSsrJsonLd();
  const alternates = getSsrAlternates();

  const hreflangTags = alternates
    .map(
      (a) =>
        `<link rel="alternate" hreflang="${a.hreflang}" href="${escapeAttr(a.href)}" />`,
    )
    .join('\n    ');

  // ⚠️ 属性值一律用 escapeAttr，不要用 escapeHtml。
  // description / title 里常见 ASCII 双引号（如 summary 写成 教育部"面向21世纪课程教材"），
  // escapeHtml 不转义 `"`，会导致 content="..." 在引号处提前闭合，属性值被截断成
  // 「教育部」这样几个字——搜索引擎读到的就是残缺描述，是 meta description 偏短的根因。
  const metaTags = [
    h.title ? `<title>${escapeHtml(h.title)}</title>` : '',
    h.description
      ? `<meta name="description" content="${escapeAttr(h.description)}" />`
      : '',
    h.canonical
      ? `<link rel="canonical" href="${escapeAttr(h.canonical)}" />`
      : '',
    h.title ? `<meta property="og:title" content="${escapeAttr(h.title)}" />` : '',
    h.description
      ? `<meta property="og:description" content="${escapeAttr(h.description)}" />`
      : '',
    h.canonical
      ? `<meta property="og:url" content="${escapeAttr(h.canonical)}" />`
      : '',
    h.image ? `<meta property="og:image" content="${escapeAttr(h.image)}" />` : '',
    h.type ? `<meta property="og:type" content="${escapeAttr(h.type)}" />` : '',
    `<meta property="og:site_name" content="${escapeAttr(brand)}" />`,
    `<meta property="og:locale" content="${escapeAttr(OG_LOCALE[lang] || OG_LOCALE.zh)}" />`,
    // ⚠️ twitter:card 是必填项：没有它，twitter:title/description/image 全部无效。
    // 之前 SSG 输出漏了这一行（客户端 seo.tsx 有，但搜索引擎抓的是 SSG HTML），
    // 导致全站 100% 缺 twitter:card。
    '<meta name="twitter:card" content="summary_large_image" />',
    h.title ? `<meta name="twitter:title" content="${escapeAttr(h.title)}" />` : '',
    h.description
      ? `<meta name="twitter:description" content="${escapeAttr(h.description)}" />`
      : '',
    h.image ? `<meta name="twitter:image" content="${escapeAttr(h.image)}" />` : '',
    hreflangTags,
  ]
    .filter(Boolean)
    .join('\n    ');

  const jsonLdTags = jsonLd
    .map(
      (obj) =>
        `<script type="application/ld+json">${JSON.stringify(obj)}</script>`
    )
    .join('\n    ');

  const head = [metaTags, jsonLdTags].filter(Boolean).join('\n    ');
  // 供 prerender.mjs 替换模板上的 <html lang>：英文页必须是 lang="en"，
  // 否则屏幕阅读器与翻译工具会用中文规则朗读英文正文。
  return { html, head, lang };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, '&quot;');
}
