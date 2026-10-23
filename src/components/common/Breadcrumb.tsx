import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useJsonLd } from '@/lib/seo';
import { useI18n } from '@/i18n/LocaleContext';
import type { DictKey } from '@/i18n/LocaleContext';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

// 一级路径 → 词典 key。用 key 而不是中文常量，是为了让英文站自动跟着语言走。
const pageNameMap: Record<string, DictKey> = {
  about: 'nav.about',
  contact: 'footer.contact',
  'privacy-policy': 'footer.privacy',
  terms: 'footer.terms',
  works: 'nav.works',
  games: 'nav.games',
  maps: 'nav.maps',
  tools: 'nav.tools',
  learn: 'nav.learn',
  my: 'nav.myLearning',
  subdomains: 'nav.subdomains',
  wiki: 'nav.wiki',
  downloads: 'nav.downloads',
  changelog: 'footer.changelog',
};

// BreadcrumbList 结构化数据注入器：单独拆成叶子组件，保证 useJsonLd 无条件调用。
// ⚠️ 绝不能在调用 useJsonLd 之前 early return：路由切换时 items 条数会变
//    （列表页 1 条 → 详情页 3 条），而同一位置的组件实例会被 React 复用，
//    于是「上次渲染 0 个 Hook、这次 1 个 Hook」→ React #310 抛错 → 整棵树卸载 → 页面全白。
//    因此 useI18n() 必须写在最前面，无条件调用。
const BreadcrumbSchema: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.path ? { item: `https://planetgis.cn${item.path}` } : {}),
    })),
  });
  return null;
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items: propItems }) => {
  const location = useLocation();
  const { t } = useI18n();

  const items: BreadcrumbItem[] = propItems || [
    { label: t('nav.breadcrumbHome'), path: '/' },
    ...(location.pathname !== '/'
      ? [
          {
            label: pageNameMap[location.pathname.slice(1)]
              ? t(pageNameMap[location.pathname.slice(1)])
              : t('nav.page'),
          },
        ]
      : []),
  ];

  if (items.length <= 1) return null;

  return (
    <>
      <BreadcrumbSchema items={items} />
      {/* 容器宽度与全站列表页 / 详情页统一：max-w-7xl + px-4 md:px-8。
          改这里会同时影响所有页面，如需局部不同宽度请另建变体，不要直接改。 */}
      <nav aria-label={t('nav.breadcrumb')} className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-2">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {items.map((item, index) => (
            <li key={item.label} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              {item.path ? (
                <Link
                  to={item.path}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5" />}
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;
