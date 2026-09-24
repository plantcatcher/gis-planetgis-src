import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import { getChangelog } from '@/lib/content';
import { renderMarkdown } from '@/lib/markdown';
import NotFound from './NotFound';

export default function Changelog() {
  const changelog = getChangelog();

  if (!changelog) return <NotFound />;

  return (
    <>
      <PageMeta
        title="星球小捕手 · 站点动态与更新日志"
        description={changelog.summary || '星球小捕手网站的功能更新、内容上新与产品规划记录。'}
        canonical="https://planetgis.cn/changelog"
      />
      {/* 面包屑用通用组件（与列表页/详情页同一位置），原先手写 nav 会与其它页面错位 */}
      <Breadcrumb items={[{ label: '首页', path: '/' }, { label: '更新日志' }]} />
      <article className="changelog-page max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-12 md:pb-16">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">更新日志</h1>
          {changelog.summary && (
            <p className="text-base text-muted-foreground leading-relaxed">{changelog.summary}</p>
          )}
        </header>

      {/* 正文保留 3xl 阅读栏：页面容器已统一到 7xl（与其它页面左边缘对齐），
          但日志是长文本，一行铺满 1280px 会很难读 */}
      <div
        className="md-body max-w-3xl"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(changelog.body) }}
      />
      </article>
    </>
  );
}
