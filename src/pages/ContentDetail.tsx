import { useParams, Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import CoverImage from '@/components/common/CoverImage';
import { getItem, getRelated, getWorksBySeries, getTools, type ContentType, type ContentItem } from '@/lib/content';
import { renderMarkdown, extractHeadings } from '@/lib/markdown';
import { buildContentKey } from '@/services/learningService';
import LearningTracker from '@/components/learning/LearningTracker';
import FavoriteButton from '@/components/learning/FavoriteButton';
import ShareButton from '@/components/common/ShareButton';
import { useJsonLd } from '@/lib/seo';
import { useImageLightbox, ImageLightbox } from '@/components/common/ImageLightbox';
import NotFound from './NotFound';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PageViewCount } from '@/lib/busuanzi';
import FactBox from '@/components/knowledge/FactBox';
import SeeAlso from '@/components/knowledge/SeeAlso';
import { buildInfobox, getSeeAlso, getReadingTime, getWordCount } from '@/lib/knowledge';

interface Props {
  type: ContentType;
}

const typeLabel: Record<ContentType, string> = {
  work: '精选作品',
  tool: '地理小工具',
  article: '文章',
  learn: '地理知识库',
  resource: '资料下载',
};

const basePath: Record<ContentType, string> = {
  work: 'works',
  tool: 'tools',
  article: 'articles',
  learn: 'learn',
  resource: 'downloads',
};

const LOGO = 'https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png';

// 板块详情页底部「系列 footer」模块的文案配置：互动地图 / 地理小游戏 /
// 海平面模拟实验室（series:lab）/ 地理小工具（type:tool）各一份，
// 板块名、按钮文案、入口路径按板块自适应。
interface SeriesFooterConfig {
  listTitle: string;
  ctaBadge: string;
  ctaDesc: string;
  primaryLabel: string;
  allLabel: string;
  allPath: string;
  prevLabel: string;
  nextLabel: string;
}

const SERIES_FOOTER: Record<'map' | 'game' | 'lab' | 'tool', SeriesFooterConfig> = {
  map: {
    listTitle: '相关地图',
    ctaBadge: '在线互动',
    ctaDesc: '浏览器打开即可探索，支持缩放、点选与图例切换，无需安装、无需登录。',
    primaryLabel: '打开地图',
    allLabel: '全部地图',
    allPath: '/maps',
    prevLabel: '上一幅',
    nextLabel: '下一幅',
  },
  game: {
    listTitle: '相关游戏',
    ctaBadge: '打开即玩',
    ctaDesc: '浏览器打开即玩，无需安装、无需登录，成绩数据留在本机。',
    primaryLabel: '开始游戏',
    allLabel: '全部游戏',
    allPath: '/games',
    prevLabel: '上一款',
    nextLabel: '下一款',
  },
  lab: {
    listTitle: '相关实验室',
    ctaBadge: '在线体验',
    ctaDesc: '浏览器打开即可模拟，支持交互调节与实时可视化，无需安装、无需登录。',
    primaryLabel: '打开实验室',
    allLabel: '全部实验',
    allPath: '/works',
    prevLabel: '上一个',
    nextLabel: '下一个',
  },
  tool: {
    listTitle: '相关工具',
    ctaBadge: '在线使用',
    ctaDesc: '浏览器打开即可使用，无需安装、无需登录，数据留在本机。',
    primaryLabel: '打开工具',
    allLabel: '全部工具',
    allPath: '/tools',
    prevLabel: '上一个',
    nextLabel: '下一个',
  },
};

// 打开入口卡：标题 + 口号 + 主按钮（跳作品本体 link）/ 副按钮（跳系列汇总页）。
// 详情页开头与底部复用同一份，确保「打开/全部」入口在首屏和文末都出现。
const SeriesCtaCard: React.FC<{ cfg: SeriesFooterConfig; item: ContentItem }> = ({
  cfg,
  item,
}) => {
  if (!item.link) return null;
  const primaryButtonClass =
    'inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors';
  return (
    <div className="mt-6 p-4 md:p-5 rounded-2xl bg-primary/[0.06] border-2 border-primary/40 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-base leading-snug">
          {item.title}
          <span className="text-primary/70 font-normal"> · {cfg.ctaBadge}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{cfg.ctaDesc}</p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        {item.link.startsWith('/') ? (
          <Link to={item.link} className={primaryButtonClass}>
            {cfg.primaryLabel}
          </Link>
        ) : (
          <a href={item.link} target="_blank" rel="noreferrer" className={primaryButtonClass}>
            {cfg.primaryLabel}
          </a>
        )}
        <Link
          to={cfg.allPath}
          className="inline-flex items-center px-4 py-2 rounded-lg border border-border bg-background font-medium text-sm hover:bg-muted transition-colors"
        >
          {cfg.allLabel}
        </Link>
      </div>
    </div>
  );
};

// 互动地图 / 地理小游戏详情页底部组合：相关推荐（列表式）+ 打开入口卡 + 上一个/下一个。
// 相关推荐链接到同系列作品的介绍页（/works/<slug>），入口卡主按钮跳作品本体（frontmatter link）。
const SeriesFooterBlock: React.FC<{
  cfg: SeriesFooterConfig;
  item: ContentItem;
  siblings: ContentItem[];
  prev?: ContentItem;
  next?: ContentItem;
  /** 详情页所在路由前缀：tool→tools，map/game/lab→works（不能写死 /works，否则工具页互链 404） */
  base: string;
}> = ({ cfg, item, siblings, prev, next, base }) => {
  const others = siblings.filter((s) => s.slug !== item.slug).slice(0, 4);
  return (
    <>
      {others.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border/50">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <span className="w-1 h-5 rounded-sm bg-primary" />
            {cfg.listTitle}
          </h2>
          <ul className="space-y-3">
            {others.map((r) => (
              <li key={r.slug} className="flex gap-2 text-[15px] leading-relaxed">
                <span className="text-muted-foreground select-none">•</span>
                <span className="min-w-0 block line-clamp-1">
                  <Link
                    to={`/${base}/${r.slug}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {r.title}
                  </Link>
                  {r.summary && (
                    <span className="text-muted-foreground">：{r.summary}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SeriesCtaCard cfg={cfg} item={item} />

      {(prev || next) && (
        <nav className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prev ? (
            <Link
              to={`/${base}/${prev.slug}`}
              className="group p-4 rounded-xl bg-muted/50 border border-border/60 hover:border-primary/30 transition-all"
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft className="w-3.5 h-3.5" />
                {cfg.prevLabel}
              </span>
              <span className="block mt-2 font-medium group-hover:text-primary transition-colors line-clamp-2">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next ? (
            <Link
              to={`/${base}/${next.slug}`}
              className="group p-4 rounded-xl bg-muted/50 border border-border/60 hover:border-primary/30 transition-all sm:text-right"
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
                {cfg.nextLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="block mt-2 font-medium group-hover:text-primary transition-colors line-clamp-2">
                {next.title}
              </span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
        </nav>
      )}
    </>
  );
};

// 文章 / 学习页的结构化数据：BlogPosting（文章）或 Course（学习），
// 携带 headline / author / datePublished / image / keywords，并嵌入"地理"关键词，
// 帮助百度 / Google 理解页面主题，争取富媒体展示。独立组件以遵守 hooks 调用规则。
const ArticleJsonLd: React.FC<{ item: ContentItem; type: ContentType }> = ({ item, type }) => {
  const canonical = `https://planetgis.cn/${basePath[type]}/${item.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': type === 'learn' ? 'Course' : 'BlogPosting',
    headline: item.title,
    ...(item.summary ? { description: item.summary } : {}),
    ...(item.cover ? { image: [item.cover] } : {}),
    ...(item.date ? { datePublished: item.date, dateModified: item.date } : {}),
    author: { '@type': 'Organization', name: '星球小捕手' },
    publisher: {
      '@type': 'Organization',
      name: '星球小捕手',
      logo: { '@type': 'ImageObject', url: LOGO },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    keywords: [item.category, '地理', '地理科普'].filter(Boolean).join(', '),
    inLanguage: 'zh-CN',
  };
  useJsonLd(schema);
  return null;
};

export default function ContentDetail({ type }: Props) {
  const { slug } = useParams();
  const { lightbox, onImageClick, closeLightbox, navLightbox } = useImageLightbox();
  const item = slug ? getItem(type, slug) : undefined;

  if (!item) return <NotFound />;

  const label = typeLabel[type];
  const contentKey = buildContentKey(type, item.slug);
  const related = getRelated(type, item.slug, 3);
  const toc = type === 'article' || type === 'learn' ? extractHeadings(item.body) : [];
  const infobox = buildInfobox(item);
  const seeAlso = getSeeAlso(item, 5);
  const readingTime = type === 'article' || type === 'learn' ? getReadingTime(item) : 0;
  const wordCount = type === 'article' || type === 'learn' ? getWordCount(item) : 0;

  // 板块 footer 适用范围：互动地图 / 地理小游戏（series）/ 海平面模拟实验室（series:lab）/ 地理小工具（type:tool）。
  // 同板块数据 + 上一个/下一个均按各自 order 排序。
  const boardKey: 'map' | 'game' | 'lab' | 'tool' | null =
    type === 'tool'
      ? 'tool'
      : type === 'work' &&
          (item.series === 'map' || item.series === 'game' || item.series === 'lab')
        ? (item.series as 'map' | 'game' | 'lab')
        : null;
  const boardCfg = boardKey ? SERIES_FOOTER[boardKey] : null;
  const boardSiblings = boardKey
    ? boardKey === 'tool'
      ? getTools()
      : getWorksBySeries(boardKey)
    : [];
  const boardIdx = boardKey ? boardSiblings.findIndex((s) => s.slug === item.slug) : -1;
  const boardPrev = boardIdx > 0 ? boardSiblings[boardIdx - 1] : undefined;
  const boardNext =
    boardIdx >= 0 && boardIdx < boardSiblings.length - 1 ? boardSiblings[boardIdx + 1] : undefined;
  // 工具页的互链前缀是 tools，map/game/lab 作品的互链前缀是 works。
  const boardBase = boardKey === 'tool' ? 'tools' : 'works';
  // 系列作品正文中，把「打开/全部」入口卡插在「介绍」与「功能特点」两个小节之间
  // （所有 map/game 作品正文都含这两个 H2，拆分位置稳定）。
  const splitMark = '\n## 功能特点';
  const splitAt = item.body.indexOf(splitMark);
  const bodyBefore = splitAt >= 0 ? item.body.slice(0, splitAt) : item.body;
  const bodyAfter = splitAt >= 0 ? item.body.slice(splitAt) : '';

  return (
    <>
      {/* 面包屑统一用通用 Breadcrumb 组件，与列表页 / 资料下载详情页放在同一位置
          （页面左侧、pt-20）。原先它写在 article 内，会被 reading-column 的
          42rem 窄栏居中，从列表页点进详情时路径条会明显右移，看着像"跳位"。 */}
      <Breadcrumb
        items={[
          { label: '首页', path: '/' },
          { label, path: `/${basePath[type]}` },
          { label: item.title },
        ]}
      />
      {/* 容器宽度与「资料下载」详情页保持一致：max-w-7xl + px-4 md:px-8 */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-12 md:pb-16">
      <LearningTracker contentKey={contentKey} />
      <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12 lg:items-start">
        <article className="min-w-0 mx-auto reading-column w-full">
      <PageMeta
        title={item.title}
        description={item.summary || item.title}
        canonical={`https://planetgis.cn/${basePath[type]}/${item.slug}`}
        image={item.cover}
      />

      {type === 'article' || type === 'learn' ? (
        <ArticleJsonLd item={item} type={type} />
      ) : null}

      <header className="mb-8">
        <p className="kicker mb-3">
          {item.subject ? item.subject : (item.category || label)}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">{item.title}</h1>
        <div className="byline flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>星球小捕手</span>
          {item.date && (<><span className="opacity-40">·</span><span>{item.date}</span></>)}
          {(type === 'article' || type === 'learn') && (
            <><span className="opacity-40">·</span><span>{readingTime} 分钟阅读</span><span className="opacity-40">·</span><span>{wordCount} 字</span></>
          )}
          <span className="opacity-40">·</span>
          <PageViewCount className="inline-flex items-center gap-1" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <FavoriteButton contentKey={contentKey} variant="detail" />
          <ShareButton
            title={item.title}
            path={`/${basePath[type]}/${item.slug}`}
            contentType={type}
            contentSlug={item.slug}
          />
        </div>
      </header>

      {item.cover && type !== 'learn' && (
        <img
          src={item.cover}
          alt={item.title}
          onClick={onImageClick}
          className="w-full rounded-2xl mb-8 object-cover max-h-[520px] cursor-zoom-in"
        />
      )}

      {(type === 'article' || type === 'learn') && item.summary && (
        <p className="standfirst">{item.summary}</p>
      )}

      {boardKey && boardCfg ? (
        <>
          <div
            className="md-body"
            onClick={onImageClick}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(bodyBefore) }}
          />
          <SeriesCtaCard cfg={boardCfg} item={item} />
          {bodyAfter && (
            <div
              className="md-body"
              onClick={onImageClick}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(bodyAfter) }}
            />
          )}
        </>
      ) : (
        <div
          className="md-body"
          onClick={onImageClick}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body) }}
        />
      )}
      <ImageLightbox state={lightbox} onClose={closeLightbox} onNav={navLightbox} />

      {item.tags && item.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <Link
              key={t}
              to={`/tag/${encodeURIComponent(t)}`}
              className="px-3 py-1 rounded-full text-xs font-medium bg-muted hover:bg-primary/10 text-primary border border-border/50 transition-colors"
            >
              # {t}
            </Link>
          ))}
        </div>
      )}

      {item.link && !(boardKey && boardCfg) && (
        <div className="mt-10 p-5 rounded-2xl bg-primary/5 border border-primary/10">
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
          >
            访问在线版本 / 查看原文 →
          </a>
        </div>
      )}

      {boardKey && boardCfg ? (
        <SeriesFooterBlock
          cfg={boardCfg}
          item={item}
          siblings={boardSiblings}
          prev={boardPrev}
          next={boardNext}
          base={boardBase}
        />
      ) : (
        related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border/50">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" />
              {type === 'work' ? '相关作品' : type === 'tool' ? '相关工具' : type === 'learn' ? '相关学习' : '相关文章'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/${basePath[type]}/${r.slug}`}
                  className="group block p-4 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 transition-all"
                >
                  <CoverImage
                    cover={r.cover}
                    title={r.title}
                    lazy
                    className="h-32 rounded-lg mb-3"
                  />
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
        )
      )}
        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <FactBox rows={infobox} />
            {toc.length > 1 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">本文大纲</p>
                <nav className="space-y-2 text-sm">
                  {toc.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block hover:text-primary transition-colors line-clamp-2 ${h.level === 3 ? 'pl-3 text-muted-foreground/80' : 'font-medium'}`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}
            <SeeAlso items={seeAlso} />
          </div>
        </aside>
      </div>
      </div>
    </>
  );
}
