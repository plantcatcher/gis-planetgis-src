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
  tools: '地理小工具',
  articles: '最新文章',
  learn: '地理学习',
  subdomains: '子站导航',
  changelog: '更新日志',
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

  // JSON-LD structured data for breadcrumbs
  const schemaItems = items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.label,
    ...(item.path ? { item: `https://planetgis.cn${item.path}` } : {}),
  }));

  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems,
  });

  return (
    <>
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
