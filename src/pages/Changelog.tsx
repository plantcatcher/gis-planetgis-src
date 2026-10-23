import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import { getChangelog } from '@/lib/content';
import { renderMarkdown } from '@/lib/markdown';
import { useI18n } from '@/i18n/LocaleContext';
import NotFound from './NotFound';

export default function Changelog() {
  const { t, lang } = useI18n();
  const changelog = getChangelog();

  if (!changelog) return <NotFound />;

  return (
    <>
      <PageMeta
        title={t('changelog.title')}
        description={changelog.summary || t('changelog.metaDesc')}
        canonical="https://planetgis.cn/changelog"
      />
      {/* 面包屑用通用组件（与列表页/详情页同一位置），原先手写 nav 会与其它页面错位 */}
      <Breadcrumb items={[{ label: t('nav.home'), path: '/' }, { label: t('changelog.breadcrumb') }]} />
      <article className="changelog-page max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-12 md:pb-16">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{t('changelog.h1')}</h1>
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
      {/* 英文站的日志正文仍是中文源文件，加一行说明管理预期 */}
      {lang === 'en' && (
        <p className="max-w-3xl mt-8 text-sm text-muted-foreground italic">{t('changelog.langNote')}</p>
      )}
      </article>
    </>
  );
}
