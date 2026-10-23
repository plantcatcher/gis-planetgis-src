import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import CoverImage from '@/components/common/CoverImage';
import { getItem, getRelated, getByType, BASE_PATH, type ContentType, type ContentItem } from '@/lib/content';
import { renderMarkdown, extractHeadings, extractFaq, extractSteps, type FaqEntry } from '@/lib/markdown';
import { buildContentKey } from '@/services/learningService';
import LearningTracker from '@/components/learning/LearningTracker';
import FavoriteButton from '@/components/learning/FavoriteButton';
import ShareButton from '@/components/common/ShareButton';
import RewardCallout from '@/components/common/RewardCallout';
import { useJsonLd, localizeCanonical } from '@/lib/seo';
import { useI18n, type LocaleValue } from '@/i18n/LocaleContext';
import { HTML_LANG } from '@/i18n/config';
import { useImageLightbox, ImageLightbox } from '@/components/common/ImageLightbox';
import { useContentBody } from '@/hooks/useContentBody';
import NotFound from './NotFound';
import { ArrowLeft, ArrowRight, ExternalLink, BookOpen, Layers, Wrench, Gamepad2, FileText, Map } from 'lucide-react';
import { PageViewCount } from '@/lib/busuanzi';
import FactBox from '@/components/knowledge/FactBox';
import SeeAlso from '@/components/knowledge/SeeAlso';
import { buildInfobox, getSeeAlso, getReadingTime, getWordCount, getRelatedInBoard } from '@/lib/knowledge';

interface Props {
  type: ContentType;
}

// 相关推荐卡片的分类图标，与【互动地图】【地理小游戏】卡片风格一致
const REL_ICON: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  work: Layers,
  map: Map,
  game: Gamepad2,
  tool: Wrench,
  article: FileText,
  learn: BookOpen,
  resource: FileText,
};

const basePath: Record<ContentType, string> = { ...BASE_PATH };

/** 有「板块 footer」的 type：这些板块既有同板块互链，也有「打开本体 / 全部」入口 */
type BoardType = 'map' | 'game' | 'work' | 'tool';
const BOARD_TYPES = new Set<ContentType>(['map', 'game', 'work', 'tool']);

const LOGO = 'https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png';

// 详情页底部「板块 footer」模块的文案配置：互动地图 / 地理小游戏 /
// 模拟实验（type:work）/ 地理小工具（type:tool）各一份，
// 板块名、按钮文案、入口路径按板块自适应。key 直接用 type，与文件夹一一对应。
// 文案走词典（中英各一套），allPath 是语言无关的站内路径。
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

const SERIES_FOOTER: Record<'map' | 'game' | 'work' | 'tool', Omit<SeriesFooterConfig, 'listTitle' | 'ctaBadge' | 'ctaDesc' | 'primaryLabel' | 'allLabel' | 'prevLabel' | 'nextLabel'>> = {
  map: { allPath: '/maps' },
  game: { allPath: '/games' },
  work: { allPath: '/works' },
  tool: { allPath: '/tools' },
};

/** 按当前语言拼出板块 footer 配置（文案全部来自词典，纯函数便于测试） */
function buildSeriesCfg(t: LocaleValue['t'], board: BoardType): SeriesFooterConfig {
  const p = `detail.board.${board}` as 'detail.board.map';
  return {
    listTitle: t(`${p}.list` as 'detail.board.map.list'),
    ctaBadge: t(`${p}.badge` as 'detail.board.map.badge'),
    ctaDesc: t(`${p}.desc` as 'detail.board.map.desc'),
    primaryLabel: t(`${p}.open` as 'detail.board.map.open'),
    allLabel: t(`${p}.all` as 'detail.board.map.all'),
    allPath: SERIES_FOOTER[board].allPath,
    prevLabel: t(`${p}.prev` as 'detail.board.map.prev'),
    nextLabel: t(`${p}.next` as 'detail.board.map.next'),
  };
}

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
// 相关推荐链接到同类型内容的介绍页（前缀取自 BASE_PATH），入口卡主按钮跳内容本体（frontmatter link）。
const SeriesFooterBlock: React.FC<{
  cfg: SeriesFooterConfig;
  item: ContentItem;
  siblings: ContentItem[];
  prev?: ContentItem;
  next?: ContentItem;
  /** 详情页所在路由前缀，取自 BASE_PATH：map→maps、game→games、tool→tools、work→works */
  base: string;
}> = ({ cfg, item, siblings, prev, next, base }) => {
  // 相关推荐按「主题 → 地域范围 → 标签 → 标题词面」的相关度打分排序，
  // 不再取同系列前 N 个（那样每页推荐几乎一样）。
  const others = getRelatedInBoard(item, siblings, 4);
  return (
    <>
      {others.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border/50">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-sm bg-primary" />
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
                  {r.topics && r.topics[0] && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground align-middle">
                      {r.topics[0]}
                    </span>
                  )}
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
  const { t, lang } = useI18n();
  const brand = t('brand.name');
  const canonical = localizeCanonical(`https://planetgis.cn/${basePath[type]}/${item.slug}`, lang);
  const schema = {
    '@context': 'https://schema.org',
    '@type': type === 'learn' ? 'Course' : 'BlogPosting',
    headline: item.title,
    ...(item.summary ? { description: item.summary } : {}),
    ...(item.cover ? { image: [item.cover] } : {}),
    ...(item.date ? { datePublished: item.date, dateModified: item.date } : {}),
    author: { '@type': 'Organization', name: brand },
    publisher: {
      '@type': 'Organization',
      name: brand,
      logo: { '@type': 'ImageObject', url: LOGO },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    keywords: [item.category, lang === 'zh' ? '地理' : 'geography', lang === 'zh' ? '地理科普' : 'geography science'].filter(Boolean).join(', '),
    inLanguage: HTML_LANG[lang] || HTML_LANG.zh,
  };
  useJsonLd(schema);
  return null;
};

// FAQ 结构化数据（GEO）：把「常见问题」章节里的问答对输出为 FAQPage。
// 生成式引擎本质在回答「问题」，问答对被引用的概率远高于普通段落——
// 这是面向 AI 搜索引擎收益最高的结构化数据类型之一。
// 站内 works / tools 页普遍带有 FAQ 章节（原生 <details><summary>Q: …），
// 这里统一解析并注入，无需逐篇手写 schema。
// ⚠️ 注入器必须单独成组件、无条件调用 useJsonLd：正文是按篇懒加载的，站内跳转时
//    首渲染 body 为空（faqs=[] → 只调了 useMemo），正文到位后再渲染 faqs 非空又调
//    useJsonLd → 前后 Hooks 数量不一致 → React #310 抛错 → 整棵树卸载 → 页面全白。
//    早期把 `if (!faqs.length) return null` 写在 useJsonLd 之前，就是这个白屏的根因。
const FaqSchema: React.FC<{ faqs: FaqEntry[] }> = ({ faqs }) => {
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

const FaqJsonLd: React.FC<{ item: ContentItem }> = ({ item }) => {
  const faqs = useMemo(() => extractFaq(item.body || ''), [item.body]);
  if (!faqs.length) return null;
  return <FaqSchema faqs={faqs} />;
};

// HowTo 结构化数据（GEO）：工具页的「使用教程」有序列表 → HowTo.step。
// 生成式引擎回答「怎么用 X 工具做 Y」时会优先引用带 Step 的页面。
const HowToSchema: React.FC<{ item: ContentItem; steps: string[] }> = ({ item, steps }) => {
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: item.title,
    ...(item.summary ? { description: item.summary } : {}),
    ...(item.cover ? { image: [item.cover] } : {}),
    totalTime: 'PT2M',
    step: steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: text.length > 40 ? text.slice(0, 39) + '…' : text,
      text,
    })),
  });
  return null;
};

const HowToJsonLd: React.FC<{ item: ContentItem; type: ContentType }> = ({ item, type }) => {
  // 仅工具页产出 HowTo：其正文有规范的「## 使用教程 + 有序列表」结构。
  const steps = useMemo(
    () => (type === 'tool' ? extractSteps(item.body || '') : []),
    [item.body, type],
  );
  if (!steps.length) return null;
  return <HowToSchema item={item} steps={steps} />;
};

export default function ContentDetail({ type }: Props) {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const { lightbox, onImageClick, closeLightbox, navLightbox } = useImageLightbox();
  const item = slug ? getItem(type, slug) : undefined;
  // 正文懒加载：首屏（hydration）前已由 main.tsx 预载，站内跳转时异步补载。
  const { body, loading } = useContentBody(type, slug);

  if (!item) return <NotFound />;

  const label = t(`detail.type.${type}` as const);
  const contentKey = buildContentKey(type, item.slug);
  const related = getRelated(type, item.slug, 6);
  const toc = type === 'article' || type === 'learn' ? extractHeadings(body) : [];
  const infobox = buildInfobox(item);
  const seeAlso = getSeeAlso(item, 5);
  const readingTime = type === 'article' || type === 'learn' ? getReadingTime(item) : 0;
  const wordCount = type === 'article' || type === 'learn' ? getWordCount(item) : 0;

  // 板块 footer 适用范围：互动地图 / 地理小游戏 / 模拟实验 / 地理小工具。
  // 哪些 type 有 footer 由 BOARD_TYPES 决定，同板块数据与上一个/下一个按各自 order 排序。
  const boardKey = BOARD_TYPES.has(type) ? (type as BoardType) : null;
  const boardCfg = boardKey ? buildSeriesCfg(t, boardKey) : null;
  const boardSiblings = boardKey ? getByType(boardKey) : [];
  const boardIdx = boardKey ? boardSiblings.findIndex((s) => s.slug === item.slug) : -1;
  const boardPrev = boardIdx > 0 ? boardSiblings[boardIdx - 1] : undefined;
  const boardNext =
    boardIdx >= 0 && boardIdx < boardSiblings.length - 1 ? boardSiblings[boardIdx + 1] : undefined;
  // 互链前缀与 type 一一对应（map→maps、game→games、tool→tools、work→works），统一取自 BASE_PATH
  const boardBase = BASE_PATH[type];
  // 系列作品正文中，把「打开/全部」入口卡插在「介绍」与「功能特点」两个小节之间
  // （所有 map/game 作品正文都含这两个 H2，拆分位置稳定）。
  const splitMark = '\n## 功能特点';
  const splitAt = body.indexOf(splitMark);
  const bodyBefore = splitAt >= 0 ? body.slice(0, splitAt) : body;
  const bodyAfter = splitAt >= 0 ? body.slice(splitAt) : '';

  return (
    <>
      {/* 面包屑统一用通用 Breadcrumb 组件，与列表页 / 资料下载详情页放在同一位置
          （页面左侧、pt-20）。原先它写在 article 内，会被 reading-column 的
          42rem 窄栏居中，从列表页点进详情时路径条会明显右移，看着像"跳位"。 */}
      <Breadcrumb
        items={[
          { label: t('nav.home'), path: '/' },
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

      {/* 互动地图 / 小工具等带有 FAQ 章节的页面，输出 FAQPage 结构化数据 */}
      <FaqJsonLd item={item} />

      {/* 工具页的「使用教程」输出 HowTo，供 AI 引擎引用操作步骤 */}
      <HowToJsonLd item={item} type={type} />

      <header className="mb-8">
        <p className="kicker mb-3">
          {item.subject ? item.subject : (item.category || label)}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">{item.title}</h1>
        <div className="byline flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{t('brand.name')}</span>
          {item.date && (<><span className="opacity-40">·</span><span>{item.date}</span></>)}
          {(type === 'article' || type === 'learn') && (
            <><span className="opacity-40">·</span><span>{t('detail.minRead', { n: readingTime })}</span><span className="opacity-40">·</span><span>{t('card.chars', { n: wordCount })}</span></>
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

      {/* 英文站提示：正文为中文内容层，翻译未就绪前给出明确预期 */}
      {lang === 'en' && (
        <p className="mb-6 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {t('detail.langNote')}
        </p>
      )}

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

      {loading ? (
        // 站内跳转、目标正文尚未载入时的骨架。首屏（SSR/hydration）阶段 loading 恒为 false，
        // 故不会与预渲染 HTML 产生差异；仅在客户端跳转的空窗期出现。
        <div className="md-body animate-pulse space-y-3" aria-hidden="true">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
      ) : boardKey && boardCfg ? (
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
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
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
        <div className="mt-10">
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
          >
            <ExternalLink className="w-4 h-4" />
            {t('detail.visitOnline')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      )}

      {/* 文末赞赏引导：仅文章/学习长文页，读者读完正文情绪最高点转化最佳 */}
      {(type === 'article' || type === 'learn') && <RewardCallout />}

      {boardKey && boardCfg && (
        <SeriesFooterBlock
          cfg={boardCfg}
          item={item}
          siblings={boardSiblings}
          prev={boardPrev}
          next={boardNext}
          base={boardBase}
        />
      )}

        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <FactBox rows={infobox} />
            {toc.length > 1 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">{t('detail.toc')}</p>
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

            {/* 侧栏仅保留 FactBox / 本文大纲 / SeeAlso；相关学习已移到页面底部、跨两列全宽渲染 */}
          </div>
        </aside>
      </div>

      {/* 相关学习：跨「正文列 + 侧栏列」全宽（容器 ≈1216px），左边界用 lg:pl-32(128px) 对齐正文左边界，向右一直铺到容器右缘，吃掉右侧空白；宽屏单行 6 张、窄屏降级 2-3 列。仅文章/学习长文页 */}
      {(type === 'article' || type === 'learn') && related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border/50 lg:pl-32">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" />
              {/* 本区块仅在 type 为 article / learn 时渲染（见上方条件），故只需区分这两种 */}
              {type === 'learn' ? t('detail.relatedLearn') : t('detail.relatedArticle')}
            </h2>
            <Link
              to="/learn"
              className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t('detail.moreKnowledge')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {related.map((r) => {
              const RelIcon = REL_ICON[type];
              return (
                <Link
                  key={r.slug}
                  to={`/${basePath[type]}/${r.slug}`}
                  className="group block overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <CoverImage
                      cover={r.cover}
                      title={r.title}
                      lazy
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1.5 text-primary">
                      <RelIcon className="w-3 h-3" />
                      <span className="text-[11px] font-medium tracking-wide uppercase">
                        {r.category || label}
                      </span>
                    </div>
                    <h3 className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary">
                      {t('detail.read')}
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      </div>
    </>
  );
}
