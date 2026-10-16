import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useJsonLd } from '@/lib/seo';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const pageNameMap: Record<string, string> = {
  about: '关于我们',
  contact: '联系我们',
  'privacy-policy': '隐私政策',
  terms: '服务条款',
  works: '精选作品',
  games: '地理小游戏',
  maps: '互动地图',
  tools: '地理小工具',
  learn: '地理知识库',
  my: '我的学习',
  subdomains: '子站导航',
  wiki: 'GIS 资源导航',
  downloads: '资料下载',
  changelog: '更新日志',
};

// BreadcrumbList 结构化数据注入器：单独拆成叶子组件，保证 useJsonLd 无条件调用。
// ⚠️ 绝不能在调用 useJsonLd 之前 early return：路由切换时 items 条数会变
//    （列表页 1 条 → 详情页 3 条），而同一位置的组件实例会被 React 复用，
//    于是「上次渲染 0 个 Hook、这次 1 个 Hook」→ React #310 抛错 → 整棵树卸载 → 页面全白。
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

  const items: BreadcrumbItem[] = propItems || [
    { label: '首页', path: '/' },
    ...(location.pathname !== '/'
      ? [{ label: pageNameMap[location.pathname.slice(1)] || '页面' }]
      : []),
  ];

  if (items.length <= 1) return null;

  return (
    <>
      <BreadcrumbSchema items={items} />
      {/* 容器宽度与全站列表页 / 详情页统一：max-w-7xl + px-4 md:px-8。
          改这里会同时影响所有页面，如需局部不同宽度请另建变体，不要直接改。 */}
      <nav aria-label="面包屑导航" className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-2">
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
