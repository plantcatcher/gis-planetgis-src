import { useParams, Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import CoverImage from '@/components/common/CoverImage';
import { getItem, getRelated, type ContentType } from '@/lib/content';
import { renderMarkdown } from '@/lib/markdown';
import NotFound from './NotFound';
import { ArrowRight } from 'lucide-react';

interface Props {
  type: ContentType;
}

const typeLabel: Record<ContentType, string> = {
  work: '精选作品',
  tool: '地理小工具',
  article: '文章',
};

export default function ContentDetail({ type }: Props) {
  const { slug } = useParams();
  const item = slug ? getItem(type, slug) : undefined;

  if (!item) return <NotFound />;

  const label = typeLabel[type];
  const related = getRelated(type, item.slug, 3);

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <PageMeta
        title={item.title}
        description={item.summary || item.title}
        canonical={`https://planetgis.cn/${type === 'work' ? 'works' : type === 'tool' ? 'tools' : 'articles'}/${item.slug}`}
        image={item.cover}
      />

      <nav className="text-sm text-muted-foreground mb-6">
        <a href="/" className="hover:text-primary">首页</a>
        <span className="mx-2">/</span>
        <span>{label}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">{item.title}</span>
      </nav>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {label}
          </span>
          {item.category && <span>{item.category}</span>}
          {item.date && <span>{item.date}</span>}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">{item.title}</h1>
        {item.summary && (
          <p className="text-lg text-muted-foreground leading-relaxed">{item.summary}</p>
        )}
      </header>

      {item.cover && (
        <img
          src={item.cover}
          alt={item.title}
          className="w-full rounded-xl mb-8 object-cover max-h-[420px]"
        />
      )}

      <div
        className="md-body"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body) }}
      />

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
            {type === 'work' ? '相关作品' : type === 'tool' ? '相关工具' : '相关文章'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/${type === 'work' ? 'works' : type === 'tool' ? 'tools' : 'articles'}/${r.slug}`}
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
  );
}
