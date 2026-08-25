import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Lock, CheckCircle2, Calendar, ArrowRight, Tag, QrCode } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import { getItem, getRelated, isResourceGated, type ContentItem } from '@/lib/content';
import { renderMarkdown } from '@/lib/markdown';
import { useJsonLd } from '@/lib/seo';
import NotFound from './NotFound';

// ── 公众号信息（板牙按需修改） ─────────────────────────────────────────────
// 公众号名称：下载页引导文案会引用它。
const WECHAT_OFFICIAL = '那山那海那座城';
// 公众号二维码图片地址：填了你自己的二维码 URL 后，下载页会展示二维码，方便用户扫码关注。
// 留空则只显示文字引导。建议把二维码图传到 R2/PicGo，再把地址填到这里。
// 当前引用 public/wechat-official-qr.jpg —— Vite 会把 public/ 根目录原样拷到 dist 根，
// 线上地址即 https://planetgis.cn/wechat-official-qr.jpg（站点根相对绝对路径，任意路由层级均可加载）。
const WECHAT_QR = '/wechat-official-qr.jpg';

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

  const item = slug ? getItem('resource', slug) : undefined;

  // 进入页面时：若本会话已解锁过，直接放行（避免返回时重复输入）。
  useEffect(() => {
    if (!slug) return;
    try {
      if (sessionStorage.getItem(unlockKey(slug)) === '1') setUnlocked(true);
    } catch {
      /* sessionStorage 不可用时忽略 */
    }
  }, [slug]);

  if (!item) return <NotFound />;

  const gated = isResourceGated(item);
  const correct = (item.code || '').trim().toLowerCase();
  const related = getRelated('resource', item.slug, 3);

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
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
      <ResourceJsonLd item={item} />
      <PageMeta
        title={`${item.title} - 资料下载 - 星球小捕手`}
        description={item.summary || item.title}
        canonical={`https://planetgis.cn/downloads/${item.slug}`}
      />

      <nav className="text-sm text-muted-foreground mb-6">
        <a href="/" className="hover:text-primary">首页</a>
        <span className="mx-2">/</span>
        <Link to="/downloads" className="hover:text-primary">资料下载</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{item.title}</span>
      </nav>

      <div className="md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-8 md:items-start">
        {/* ── 左栏：资料基本信息侧栏（桌面端 sticky 跟随滚动） ── */}
        <aside className="md:sticky md:top-24 mb-8 md:mb-0">
          {/* 封面 */}
          {item.cover ? (
            <img
              src={item.cover}
              alt={item.title}
              className="w-full aspect-[3/4] object-cover rounded-2xl border border-border/60 mb-5"
            />
          ) : (
            <div className="w-full aspect-[3/4] rounded-2xl bg-muted/50 border border-border/60 mb-5 flex items-center justify-center text-sm text-muted-foreground">
              暂无封面
            </div>
          )}

          {/* 资料信息卡 */}
          <div className="rounded-2xl border border-border/60 p-4 mb-5">
            <p className="text-sm font-semibold mb-3">资料信息</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground shrink-0">分类</dt>
                <dd className="text-right">{item.category || '资料下载'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground shrink-0">来源</dt>
                <dd className="text-right">星球小捕手</dd>
              </div>
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
                  to={`/tag/${encodeURIComponent(t)}`}
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">{item.title}</h1>
          </header>

          {/* 资料说明正文（预渲染，保证 SEO 正文完整） */}
          <div
            className="md-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body) }}
          />

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
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary" />
            相关资料
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/downloads/${r.slug}`}
                className="group block p-4 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 transition-all"
              >
                <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {r.title}
                </span>
                {r.date && (
                  <span className="block mt-1 text-xs text-muted-foreground">{r.date}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResourceDetail;
