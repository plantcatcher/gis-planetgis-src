import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Lock, CheckCircle2, Calendar, ArrowRight, Tag, QrCode } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageMeta from '@/components/common/PageMeta';
import { getItem, getRelated, isResourceGated, type ContentItem } from '@/lib/content';
import { recordDownload } from '@/services/learningService';
import { renderMarkdown } from '@/lib/markdown';
import { useJsonLd } from '@/lib/seo';
import { useImageLightbox, ImageLightbox } from '@/components/common/ImageLightbox';
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
    ...(item.download ? { contentUrl: item.download } : {}),
    ...(item.format ? { encodingFormat: item.format } : {}),
    ...(item.size ? { contentSize: item.size } : {}),
    inLanguage: 'zh-CN',
    publisher: { '@type': 'Organization', name: '星球小捕手' },
  });
  return null;
};

const DownloadPanel: React.FC<{ item: ContentItem }> = ({ item }) => (
  <a
    href={item.download}
    target="_blank"
    rel="noreferrer"
    download
    onClick={() =>
      recordDownload({
        slug: item.slug,
        title: item.title,
        format: item.format,
        size: item.size,
        category: item.category,
      })
    }
    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
  >
    <Download className="w-5 h-5" />
    下载资料{item.format ? `（${item.format}）` : ''}
  </a>
);

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
                  <dd className="text-right">星球小捕手</dd>
                </div>
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
                {item.size && (
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
            </header>

            {/* 资料说明正文（预渲染，保证 SEO 正文完整；点击图片放大） */}
            <div
              className="md-body"
              onClick={onImageClick}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body) }}
            />
            <ImageLightbox state={lightbox} onClose={closeLightbox} onNav={navLightbox} />

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
                        <li>向公众号后台发送以下任一关键词即可领取验证码（发送 <span className="font-semibold text-foreground">{item.trigger || item.title}</span>
                          {(item.keywordAliases || []).length > 0 && (
                            <>
                              {' '}或<span className="font-semibold text-foreground">{(item.keywordAliases || []).join('、')}</span>
                            </>
                          )}
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
                        className="flex-1 h-11 rounded-xl border border-input bg-transparent px-4 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        aria-label="验证码"
                      />
                      <button
                        type="submit"
                        className="h-11 px-5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity shrink-0"
                      >
                        验证并解锁
                      </button>
                    </form>
                    {error && (
                      <p className="mt-3 text-sm text-red-500">验证码不正确，请确认已向公众号发送本资料专属代码并复制正确的验证码。</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">已解锁，点击下方按钮下载</span>
                    </div>
                    <DownloadPanel item={item} />
                    <button
                      type="button"
                      onClick={() => { setUnlocked(false); try { sessionStorage.removeItem(unlockKey(item.slug)); } catch {} }}
                      className="ml-4 text-xs text-muted-foreground underline hover:text-foreground align-middle"
                    >
                      重新上锁
                    </button>
                  </div>
                )
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Download className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold">下载资料</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    本资料可直接下载，无需验证码。
                  </p>
                  <DownloadPanel item={item} />
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
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}
                    >
                      {isResourceGated(r) ? '需验证码' : '直接下载'}
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
