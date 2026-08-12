import { useParams, Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import CoverImage from '@/components/common/CoverImage';
import { getItem, getRelated, type ContentType, type ContentItem } from '@/lib/content';
import { renderMarkdown, extractHeadings } from '@/lib/markdown';
import { buildContentKey } from '@/services/learningService';
import LearningTracker from '@/components/learning/LearningTracker';
import FavoriteButton from '@/components/learning/FavoriteButton';
import { useJsonLd } from '@/lib/seo';
import NotFound from './NotFound';
import { ArrowRight } from 'lucide-react';
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
  learn: '地理学习',
};

const basePath: Record<ContentType, string> = {
  work: 'works',
  tool: 'tools',
  article: 'articles',
  learn: 'learn',
};

const LOGO = 'https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png';

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
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

      <nav className="text-sm text-muted-foreground mb-6">
        <a href="/" className="hover:text-primary">首页</a>
        <span className="mx-2">/</span>
        <span>{label}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">{item.title}</span>
      </nav>

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
        </div>
        <div className="mt-4">
          <FavoriteButton contentKey={contentKey} variant="detail" />
        </div>
      </header>

      {item.cover && type !== 'learn' && (
        <img
          src={item.cover}
          alt={item.title}
          className="w-full rounded-2xl mb-8 object-cover max-h-[520px]"
        />
      )}

      {(type === 'article' || type === 'learn') && item.summary && (
        <p className="standfirst">{item.summary}</p>
      )}

      <div
        className="md-body"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body) }}
      />

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

      {item.link && (
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

      {related.length > 0 && (
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
  );
}
