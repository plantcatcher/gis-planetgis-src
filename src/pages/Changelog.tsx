import { Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { getChangelog } from '@/lib/content';
import { renderMarkdown } from '@/lib/markdown';
import NotFound from './NotFound';

export default function Changelog() {
  const changelog = getChangelog();

  if (!changelog) return <NotFound />;

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <PageMeta
        title="更新日志"
        description={changelog.summary || '星球小捕手网站的功能更新、内容上新与产品规划记录。'}
        canonical="https://planetgis.cn/changelog"
      />

      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">首页</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">更新日志</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">更新日志</h1>
        {changelog.summary && (
          <p className="text-lg text-muted-foreground leading-relaxed">{changelog.summary}</p>
        )}
      </header>

      <div
        className="md-body"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(changelog.body) }}
      />
    </article>
  );
}
