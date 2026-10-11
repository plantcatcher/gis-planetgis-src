import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Lock, CheckCircle2, Calendar, ArrowRight, Tag, QrCode, FileText, BookOpen, ExternalLink } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageMeta from '@/components/common/PageMeta';
import { getItem, getRelated, isResourceGated, isResourceViewOnly, type ContentItem } from '@/lib/content';
import { recordDownload } from '@/services/learningService';
import { trackResourceDownload } from '@/lib/analytics';
import { renderMarkdown, extractFaq } from '@/lib/markdown';
import { useJsonLd } from '@/lib/seo';
import { useImageLightbox, ImageLightbox } from '@/components/common/ImageLightbox';
import { PageViewCount } from '@/lib/busuanzi';
import StandardTimeline from '@/components/common/StandardTimeline';
import ShareButton from '@/components/common/ShareButton';
import NotFound from './NotFound';

// ── 公众号信息（板牙按需修改） ─────────────────────────────────────────────
// 公众号名称：下载页引导文案会引用它。
const WECHAT_OFFICIAL = '那山那海那座城';
// 公众号二维码图片地址：填了你自己的二维码 URL 后，下载页会展示二维码，方便用户扫码关注。
// 留空则只显示文字引导。建议把二维码图传到 R2/PicGo，再把地址填到这里。
// 当前引用 public/wechat-official-qr.jpg —— Vite 会把 public/ 根目录原样拷到 dist 根，
// 线上地址即 https://planetgis.cn/wechat-official-qr.jpg（站点根相对绝对路径，任意路由层级均可加载）。
const WECHAT_QR = '/wechat-official-qr.jpg';

// ── 版权声明：每个资料详情页底部统一展示（改这一处即可全局生效） ──────────────
const COPYRIGHT_NOTICE =
  '声明：本站收集的教材来源于网络，所有版权都归出版社所有。本站尊重并保护知识产权，根据《信息网络传播权保护条例》，如我们转载或引用的作品侵犯了您的权利,请在一个月内通知我们，我们会及时删除!';

const unlockKey = (slug: string) => `planetgis:unlock:${slug}`;

// 资料的结构化数据：DataDownload，携带标题/描述/格式/大小/下载地址，利于搜索引擎理解。
const ResourceJsonLd: React.FC<{ item: ContentItem }> = ({ item }) => {
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'DataDownload',
    name: item.title,
    ...(item.summary ? { description: item.summary } : {}),
    ...(item.date ? { datePublished: item.date, dateModified: item.date } : {}),
    // ⚠️ 走验证码门禁的资料不得输出 contentUrl：结构化数据写在 <script> 里是明文，
    //    一旦带上直链，任何人「查看网页源代码」就能绕过公众号验证码直接下载。
    //    无需验证码的资料不受影响，仍照常输出利于收录。
    ...(item.download && !isResourceGated(item) ? { contentUrl: item.download } : {}),
    ...(item.format ? { encodingFormat: item.format } : {}),
    ...(item.size ? { contentSize: item.size } : {}),
    inLanguage: 'zh-CN',
    publisher: { '@type': 'Organization', name: '星球小捕手' },
  });
  return null;
};

// FAQ 结构化数据（GEO）：资料页的「常见问题」章节（原生 <details><summary>Q: …）
// 解析为 FAQPage，供 AI 搜索引擎直接引用问答片段。
const ResourceFaqJsonLd: React.FC<{ item: ContentItem }> = ({ item }) => {
  const faqs = React.useMemo(() => extractFaq(item.body || ''), [item.body]);
  if (!faqs.length) return null;
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  });
  return null;
};

// Dataset 结构化数据（GEO）：地理数据类资料额外输出一份 Dataset。
//
// 与 DataDownload 的分工：DataDownload 描述「这里有一个文件可下载」，
// Dataset 描述「这是一份数据集」——后者才是 AI 引擎回答
// 「全球行政区划数据在哪下载」「有没有 WGS84 的 SHP 数据」这类提问时匹配的类型，
// 可携带 spatialCoverage / 变量说明 / 许可等语义字段。两者并存，互补不冲突。
//
// 仅对「地理数据」类资料输出（group=地理数据 或带 dataFormat），
// 标准规范 / 教材书籍等不属于数据集，不输出，避免语义污染。
const ResourceDatasetJsonLd: React.FC<{ item: ContentItem }> = ({ item }) => {
  const isDataset = item.group === '地理数据' || !!item.dataFormat;
  if (!isDataset) return null;

  // 覆盖范围：region（国内/国外）+ 标题里的国家/区域名，拼成人类可读的地域描述
  const coverage = [item.region, item.title].filter(Boolean).join(' · ');

  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: item.title,
    ...(item.summary ? { description: item.summary } : {}),
    ...(coverage ? { spatialCoverage: { '@type': 'Place', name: coverage } } : {}),
    ...(item.dataFormat ? { encodingFormat: item.dataFormat } : {}),
    ...(item.date ? { datePublished: item.date, dateModified: item.date } : {}),
    creator: { '@type': 'Organization', name: '星球小捕手' },
    publisher: { '@type': 'Organization', name: '星球小捕手' },
    inLanguage: 'zh-CN',
    // 门禁资料同样不输出 distribution / 直链，与 DataDownload 的规则保持一致
    ...(item.download && !isResourceGated(item)
      ? {
          distribution: {
            '@type': 'DataDownload',
            contentUrl: item.download,
            ...(item.format ? { encodingFormat: item.format } : {}),
          },
        }
      : {}),
  });
  return null;
};

// 备用下载渠道：主链接不可用时的兜底（如 R2 直链之外再挂一个百度网盘）。
// 刻意弱化——小号次要链接 + 灰色，不与主下载按钮争视觉重心；有 frontmatter downloadAlt 才出现。
const AltDownload: React.FC<{
  item: ContentItem;
  log: (url?: string, type?: string) => void;
}> = ({ item, log }) => {
  if (!item.downloadAlt) return null;
  const isPan =
    item.downloadAltType === 'baidu' ||
    /(pan\.baidu\.com|yun\.baidu\.com)/.test(item.downloadAlt);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <a
        href={item.downloadAlt}
        target="_blank"
        rel="noreferrer"
        {...(isPan ? {} : { download: true })}
        onClick={() => log(item.downloadAlt, item.downloadAltType)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        <Download className="w-3.5 h-3.5" />
        {isPan ? '备用：百度网盘下载' : '备用下载'}
      </a>
      {item.downloadAltCode && (
        <span className="text-xs text-muted-foreground">
          提取码{' '}
          <span className="font-mono font-semibold text-foreground select-all">{item.downloadAltCode}</span>
        </span>
      )}
    </div>
  );
};

// 下载说明：一句话讲清「怎么下 + 下的是什么」。按钮只保留「下载资料」四个字，
// 文件的格式与体积从按钮文案搬到这里的说明文字里（原来拼进按钮会出现
// 「下载资料（SHP（ZIP 压缩包））」这种嵌套括号）。
// mode：pan=百度网盘 / direct=本站直链 / external=第三方外链（gov 直链等）/ view=仅在线观看
const DownloadHint: React.FC<{
  item: ContentItem;
  mode: 'pan' | 'direct' | 'external' | 'view';
}> = ({ item, mode }) => {
  const what =
    mode === 'view'
      ? [item.format, item.pages].filter(Boolean).join('，')
      : [item.format, item.size ? `约 ${item.size}` : null].filter(Boolean).join('，');
  const how =
    mode === 'view'
      ? '点击「在线观看全文」将跳转官方公开页面在线查看，内容由官方平台提供'
      : mode === 'external'
        ? '点击「下载」按钮将跳转发布机构 / 主管部门的公开链接，文件由对方服务器提供'
        : mode === 'pan'
          ? item.panCode
            ? '点击「下载资料」将跳转百度网盘，粘贴提取码后即可保存'
            : '点击「下载资料」将跳转百度网盘，按页面提示保存'
          : '点击「下载资料」即可直接下载到本机';
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {how}
      {what ? `：${what}。` : '。'}
    </p>
  );
};

const DownloadPanel: React.FC<{ item: ContentItem }> = ({ item }) => {
  const isBaidu =
    item.downloadType === 'baidu' ||
    /(pan\.baidu\.com|yun\.baidu\.com)/.test(item.download || '');
  // 外链下载：下载地址指向第三方（地方自然资源主管部门 gov 直链等），本站不托管文件。
  // 跨域链接加 download 属性无效、还可能被浏览器忽略，故外链态不带 download，交给对方响应头决定。
  const isExternal = item.downloadType === 'external';
  // 仅在线观看：没有下载地址，只有官方在线阅读页（如 nrsis 全文阅读）
  const viewOnly = isResourceViewOnly(item);

  // 点下载按钮时统一做两件事：
  // ① 记本地下载足迹（「我的学习」页展示）
  // ② 上报 GA4 file_download（下载直链在 downloads.planetgis.cn、网盘链接在 pan.baidu.com，
  //    都是跨域，增强衡量自动记不到，只能手动发）
  // 传 url/type 是为了让「备用渠道」「在线观看」也能如实统计。
  const logDownload = (url?: string, type?: string) => {
    recordDownload({
      slug: item.slug,
      title: item.title,
      format: item.format,
      size: item.size,
      category: item.category,
    });
    trackResourceDownload({
      slug: item.slug,
      title: item.title,
      url: url || item.download || item.viewUrl,
      format: item.format,
      size: item.size,
      category: item.category,
      downloadType: type || item.downloadType,
      access: isResourceGated(item) ? 'gated' : 'open',
    });
  };

  const mode: 'pan' | 'direct' | 'external' | 'view' = viewOnly
    ? 'view'
    : isBaidu
      ? 'pan'
      : isExternal
        ? 'external'
        : 'direct';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {viewOnly ? (
          /* 仅在线阅读：没有下载按钮，主按钮就是「在线观看全文」（官方阅读页） */
          <a
            href={item.viewUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => logDownload(item.viewUrl, 'view')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <BookOpen className="w-5 h-5" />
            在线观看全文
          </a>
        ) : (
          <a
            href={item.download}
            target="_blank"
            rel="noreferrer"
            {...(isBaidu || isExternal ? {} : { download: true })}
            onClick={() => logDownload()}
            style={isBaidu ? { backgroundColor: '#4e6ef2' } : undefined}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity ${
              isBaidu ? 'text-white' : 'bg-primary text-white'
            }`}
          >
            <Download className="w-5 h-5" />
            {/* 外链按钮文案按分类区分：标准规范说「下载标准全文」，其他资料（如国土空间规划）用「下载资料」 */}
            {isExternal ? (item.category === '标准规范' ? '下载标准全文' : '下载资料') : '下载资料'}
          </a>
        )}

        {/* 下载 + 在线观看并存时，在线观看作为次级按钮（描边样式，不与主按钮争视觉重心） */}
        {!viewOnly && item.viewUrl && (
          <a
            href={item.viewUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => logDownload(item.viewUrl, 'view')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            在线观看原文
          </a>
        )}

        {isBaidu && item.panCode && (
          <div className="flex items-baseline gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
            <span className="text-sm text-muted-foreground">提取码</span>
            <span className="text-2xl font-bold font-mono tracking-widest text-primary select-all">{item.panCode}</span>
          </div>
        )}
      </div>

      <DownloadHint item={item} mode={mode} />

      {/* 官方入口兜底：外链长期可能失效时，给读者一个权威回源入口 */}
      {item.officialUrl && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          官方入口：{' '}
          <a
            href={item.officialUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
          >
            {item.officialName || item.officialUrl}
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      )}

      <AltDownload item={item} log={logDownload} />
    </div>
  );
};

const ResourceDetail: React.FC = () => {
  const { slug } = useParams();
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const { lightbox, onImageClick, closeLightbox, navLightbox } = useImageLightbox();

  const item = slug ? getItem('resource', slug) : undefined;

  // 进入页面（含切换资料）时：按当前 slug 的专属 key 同步解锁状态。
  // 必须显式归位：否则从已解锁的 A 切到未解锁的 B 时，unlocked 会残留为 true。
  useEffect(() => {
    if (!slug) return;
    let unlockedNow = false;
    try {
      unlockedNow = sessionStorage.getItem(unlockKey(slug)) === '1';
    } catch {
      /* sessionStorage 不可用时视为未解锁 */
    }
    setUnlocked(unlockedNow);
    setCode('');
    setError(false);
  }, [slug]);

  if (!item) return <NotFound />;

  const gated = isResourceGated(item);
  const correct = (item.code || '').trim().toLowerCase();
  const related = getRelated('resource', item.slug, 6);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toLowerCase() === correct) {
      setUnlocked(true);
      setError(false);
      try {
        sessionStorage.setItem(unlockKey(item.slug), '1');
      } catch {
        /* 忽略 */
      }
    } else {
      setError(true);
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: '首页', path: '/' },
          { label: '资料下载', path: '/downloads' },
          { label: item.title },
        ]}
      />

      <div className="resource-detail max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-12 md:pb-16">
        <ResourceJsonLd item={item} />
        <ResourceFaqJsonLd item={item} />
        <ResourceDatasetJsonLd item={item} />
        <PageMeta
          title={`${item.title} - 资料下载 - 星球小捕手`}
          description={item.summary || item.title}
          canonical={`https://planetgis.cn/downloads/${item.slug}`}
          image={item.cover}
        />

        <div className="md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-8 md:items-start">
          {/* ── 左栏：资料基本信息侧栏（桌面端 sticky 跟随滚动） ── */}
          <aside className="md:sticky md:top-24 mb-8 md:mb-0">
            {/* 封面（点击放大） */}
            {item.cover ? (
              <img
                src={item.cover}
                alt={item.title}
                onClick={onImageClick}
                className="w-full aspect-[3/4] object-cover rounded-2xl border border-border/60 mb-5 cursor-zoom-in hover:shadow-md transition-shadow"
              />
            ) : (
              <div className="w-full aspect-[3/4] rounded-2xl bg-muted/50 border border-border/60 mb-5 flex items-center justify-center text-sm text-muted-foreground">
                暂无封面
              </div>
            )}

            {/* 资料信息卡 */}
            <div className="rounded-2xl border border-border/60 p-4 mb-5">
              <p className="text-xs font-semibold mb-2.5">资料信息</p>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground shrink-0">分类</dt>
                  <dd className="text-right">{item.category || '资料下载'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground shrink-0">来源</dt>
                  <dd className="text-right">{item.source || '星球小捕手'}</dd>
                </div>
                {item.standardNo && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">标准号</dt>
                    <dd className="text-right font-mono text-xs">{item.standardNo}</dd>
                  </div>
                )}
                {item.stdStatus && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">状态</dt>
                    <dd className="text-right">{item.stdStatus}</dd>
                  </div>
                )}
                {item.stdDate && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">发布</dt>
                    <dd className="text-right">{item.stdDate}</dd>
                  </div>
                )}
                {item.pages && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">页数</dt>
                    <dd className="text-right">{item.pages}</dd>
                  </div>
                )}
                {item.author && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">作者</dt>
                    <dd className="text-right">{item.author}</dd>
                  </div>
                )}
                {item.publisher && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">出版社</dt>
                    <dd className="text-right">{item.publisher}</dd>
                  </div>
                )}
                {item.pubYear && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">出版年份</dt>
                    <dd className="text-right">{item.pubYear}</dd>
                  </div>
                )}
                {item.isbn && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">ISBN</dt>
                    <dd className="text-right font-mono text-xs">{item.isbn}</dd>
                  </div>
                )}
                {item.date && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">更新</dt>
                    <dd className="text-right inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />{item.date}
                    </dd>
                  </div>
                )}
                {item.format && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">格式</dt>
                    <dd className="text-right">{item.format}</dd>
                  </div>
                )}
                {/* 仅在线阅读类不显示文件大小，避免让人误以为可以下载整本 */}
                {item.size && !isResourceViewOnly(item) && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">大小</dt>
                    <dd className="text-right">{item.size}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* 标签 */}
            {(item.tags && item.tags.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <Link
                    key={t}
                    to={`/downloads?tag=${encodeURIComponent(t)}`}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-muted hover:bg-primary/10 text-primary border border-border/50 transition-colors inline-flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" /> {t}
                  </Link>
                ))}
              </div>
            )}
          </aside>

          {/* ── 右栏：详情介绍 + 下载门禁 ── */}
          <main>
            <header className="mb-6">
              <p className="kicker mb-3">{item.category || '资料下载'}</p>
              <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight tracking-tight">{item.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {item.date && (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    <span className="opacity-40">·</span>
                  </>
                )}
                <PageViewCount className="inline-flex items-center gap-1" />
              </div>
              <div className="mt-4">
                <ShareButton
                  title={item.title}
                  path={`/downloads/${item.slug}`}
                  contentType="resource"
                  contentSlug={item.slug}
                />
              </div>
            </header>

            {/* 资料说明正文（预渲染，保证 SEO 正文完整；点击图片放大） */}
            <div
              className="md-body"
              onClick={onImageClick}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body) }}
            />
            <ImageLightbox state={lightbox} onClose={closeLightbox} onNav={navLightbox} />

            {/* ── 同主题标准演进时间线：当前页高亮，其余可点击跳转（frontmatter 有 timeline 才出现） ── */}
            {item.timeline && <StandardTimeline timeline={item.timeline} current={item.slug} />}

            {/* ── 下载区：地图类直接下载，文件类走公众号验证码门禁 ── */}
            <section className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/15">
              {gated ? (
                !unlocked ? (
                  <div>
                    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border/60">
                      <Lock className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold">关注公众号，获取下载验证码</h2>
                    </div>
                    <div className="mb-5 flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
                      <ol className="text-sm text-muted-foreground leading-relaxed space-y-1 list-decimal list-inside flex-1 min-w-0">
                        <li>微信搜索并关注公众号 <span className="font-semibold text-foreground">【{WECHAT_OFFICIAL}】</span></li>
                        <li>向公众号后台发送以下任一关键词即可领取验证码（发送{' '}
                          {[...new Set([item.trigger || item.title, ...(item.keywordAliases || [])])].map((kw, i) => (
                            <span key={`${i}-${kw}`}>
                              {i > 0 && ' 或 '}
                              <span className="font-semibold text-foreground">{kw}</span>
                            </span>
                          ))}
                          {!item.trigger && <span className="text-muted-foreground">（即资料名）</span>}）</li>
                        <li>你将收到本资料的下载验证码,填到下方即可解锁</li>
                      </ol>

                      {WECHAT_QR && (
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-border shrink-0 self-start">
                          <img src={WECHAT_QR} alt={`${WECHAT_OFFICIAL} 公众号二维码`} className="w-28 h-28 object-contain rounded-lg" />
                          <div className="text-xs text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">扫码关注</p>
                            <p>{WECHAT_OFFICIAL}</p>
                            <p className="mt-1 inline-flex items-center gap-1"><QrCode className="w-3.5 h-3.5" />长按可保存二维码</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                      <input
                        value={code}
                        onChange={(e) => { setCode(e.target.value); if (error) setError(false); }}
                        placeholder="输入验证码，如 NSH-2026-001"
                        className="w-full sm:flex-1 h-12 sm:h-11 rounded-xl border border-input bg-transparent px-4 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        aria-label="验证码"
                      />
                      <button
                        type="submit"
                        className="w-full sm:w-auto h-12 sm:h-11 px-5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity shrink-0"
                      >
                        验证并解锁
                      </button>
                    </form>
                    {error && (
                      <p className="mt-3 text-sm text-red-500">验证码不正确，请确认已向公众号发送本资料专属代码并复制正确的验证码。</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">已解锁，资料下载方式如下</span>
                    </div>
                    {/* 各包一层块级容器：直链态 DownloadPanel 返回 inline-flex 的 <a>，
                        不包则下方「重新上锁」会被排到同一行、贴着下载按钮 */}
                    <div>
                      <DownloadPanel item={item} />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => { setUnlocked(false); try { sessionStorage.removeItem(unlockKey(item.slug)); } catch {} }}
                        className="text-xs text-muted-foreground underline hover:text-foreground"
                      >
                        重新上锁
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div>
                  {/* 标题行：与验证码态同一节奏，右侧徽标一眼看出访问方式 */}
                  {isResourceViewOnly(item) ? (
                    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border/60">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold">在线阅读</h2>
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-400">
                        <ExternalLink className="w-3.5 h-3.5" />
                        官方在线阅读页
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border/60">
                      <Download className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold">下载资料</h2>
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        无需验证码
                      </span>
                    </div>
                  )}

                  {/* 左：文件信息 + 下载按钮；右：公众号引导（右侧分栏后按钮不必占满整行） */}
                  <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
                    <div className="min-w-0 flex-1">
                      {/* 文件信息：先让用户知道下载的是什么 */}
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-snug text-foreground">{item.title}</p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                            {item.format && <span>{item.format}</span>}
                            {item.format && (isResourceViewOnly(item) ? item.pages : item.size) && <span className="opacity-50">·</span>}
                            {/* 仅在线阅读类不展示文件大小（下载不了，展示体积会误导），改展示标准页数 */}
                            {isResourceViewOnly(item)
                              ? item.pages && <span>{item.pages}</span>
                              : item.size && <span>{item.size}</span>}
                            {item.source && (
                              <>
                                <span className="opacity-50">·</span>
                                <span>来源 {item.source}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* 下载按钮：与文件信息拉开间距，保持内容宽度 */}
                      <div className="mt-6">
                        <DownloadPanel item={item} />
                      </div>
                    </div>

                    {/* 公众号引导：桌面端右侧竖栏，移动端降为底部一行 */}
                    <div className="flex shrink-0 items-start gap-3 border-t border-border/60 pt-4 sm:w-56 sm:flex-col sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                      {WECHAT_QR && (
                        <img
                          src={WECHAT_QR}
                          alt={`${WECHAT_OFFICIAL} 公众号二维码`}
                          className="h-14 w-14 shrink-0 rounded-lg border border-border bg-white object-contain sm:h-20 sm:w-20"
                        />
                      )}
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {isResourceViewOnly(item)
                          ? `本页为该资料的官方在线阅读入口，官方平台仅提供在线浏览、不提供整本下载。需要更多地理资料与数据更新，长按或扫码关注【${WECHAT_OFFICIAL}】。`
                          : `这份资料对你有帮助？长按或扫码关注【${WECHAT_OFFICIAL}】，获取更多地理资料与数据更新。`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>

        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border/50">
            <div className="flex items-end justify-between gap-4 mb-2 flex-wrap">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-primary" />
                相关资料
              </h2>
              <Link
                to="/downloads"
                className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                查看全部资料
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              更多地理教材与学习资料，点击卡片即可查看详情并下载。
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/downloads/${r.slug}`}
                  className="group flex flex-col rounded-xl border border-border/60 bg-muted/30 overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted/40">
                    {r.cover ? (
                      <img
                        src={r.cover}
                        alt={r.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-3 text-center">
                        {r.title}
                      </div>
                    )}
                    <span
                      className={`absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        isResourceGated(r)
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          : isResourceViewOnly(r)
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}
                    >
                      {isResourceGated(r) ? '需验证码' : isResourceViewOnly(r) ? '在线观看' : '直接下载'}
                    </span>
                  </div>
                  <div className="p-2 flex flex-col gap-0.5">
                    <span className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </span>
                    {r.author && (
                      <span className="text-xs text-muted-foreground line-clamp-1">{r.author}</span>
                    )}
                    <span className="mt-0.5 text-xs text-primary font-medium inline-flex items-center gap-1">
                      查看下载
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── 版权声明：资料页统一展示，新增资料无需逐个 md 手写 ── */}
        <p className="mt-10 pt-6 border-t border-border/50 text-xs leading-relaxed text-muted-foreground">
          {COPYRIGHT_NOTICE}
        </p>
      </div>
    </>
  );
};

export default ResourceDetail;
