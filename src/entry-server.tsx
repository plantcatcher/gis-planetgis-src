import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { resetSsrHead, getSsrHead, getSsrJsonLd } from './lib/seo';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './AppRoutes';

// 供 scripts/prerender.mjs 调用：把任意路由渲染成完整 HTML 字符串。
// head 标签（标题 / 描述 / OG / JSON-LD）由各页面的 <PageMeta> 在渲染期间
// 写入模块级单例（见 src/lib/seo.tsx），这里渲染后读取并注入静态 HTML。
export function render(url: string): { html: string; head: string } {
  resetSsrHead();

  const html = renderToString(
    <StaticRouter location={url}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </StaticRouter>
  );

  const h = getSsrHead();
  const jsonLd = getSsrJsonLd();

  const metaTags = [
    h.title ? `<title>${escapeHtml(h.title)}</title>` : '',
    h.description
      ? `<meta name="description" content="${escapeHtml(h.description)}" />`
      : '',
    h.canonical
      ? `<link rel="canonical" href="${escapeAttr(h.canonical)}" />`
      : '',
    h.title ? `<meta property="og:title" content="${escapeHtml(h.title)}" />` : '',
    h.description
      ? `<meta property="og:description" content="${escapeHtml(h.description)}" />`
      : '',
    h.canonical
      ? `<meta property="og:url" content="${escapeAttr(h.canonical)}" />`
      : '',
    h.image ? `<meta property="og:image" content="${escapeAttr(h.image)}" />` : '',
    h.type ? `<meta property="og:type" content="${escapeAttr(h.type)}" />` : '',
    '<meta property="og:site_name" content="星球小捕手" />',
    h.title ? `<meta name="twitter:title" content="${escapeHtml(h.title)}" />` : '',
    h.description
      ? `<meta name="twitter:description" content="${escapeHtml(h.description)}" />`
      : '',
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
  return { html, head };
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
