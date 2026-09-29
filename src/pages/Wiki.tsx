import React, { useMemo, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import { wikiCategories, wikiResources } from '@/data/wiki';

// 轻量化移植自 D:/MyWebs/wiki（GIS 资源导航聚合站）：只搬「数据 + 列表 UI」，
// 不搬原站的 React 框架 / lucide 图标 / simple-icons CDN，复用主站现有组件与样式。
const Wiki: React.FC = () => {
  const [activeCat, setActiveCat] = useState('全部');
  const [query, setQuery] = useState('');

  const catList = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of wikiResources) counts.set(r.categoryId, (counts.get(r.categoryId) || 0) + 1);
    return [
      { id: '全部', nameZh: '全部', count: wikiResources.length },
      ...wikiCategories.map((c) => ({ id: c.id, nameZh: c.nameZh, count: counts.get(c.id) || 0 })),
    ];
  }, []);

  const list = useMemo(() => {
    let base =
      activeCat === '全部' ? wikiResources : wikiResources.filter((r) => r.categoryId === activeCat);
    const q = query.trim().toLowerCase();
    if (q) base = base.filter((r) => (r.nameZh + r.descriptionZh).toLowerCase().includes(q));
    return base;
  }, [activeCat, query]);

  const activeName = catList.find((c) => c.id === activeCat)?.nameZh ?? '';

  return (
    <>
      <PageMeta
        title="GIS 资源导航 - 星球小捕手"
        description={`精选 ${wikiResources.length} 个地理空间相关网站与工具，覆盖开源书籍、GIS 软件、遥感、三维、前端框架、空间数据库、国内平台等 ${wikiCategories.length} 个分类，为 GIS 开发者与爱好者提供一站式资源入口。`}
        canonical="https://planetgis.cn/wiki"
      />
      <Breadcrumb />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <header className="mb-10">
            <p className="kicker mb-3">地理资源导航</p>
            <div className="flex items-end gap-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">GIS 资源导航</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2" />
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">
              精选 {wikiResources.length} 个地理空间相关网站与工具，覆盖 {wikiCategories.length}{' '}
              个分类——从开源书籍、GIS 软件、遥感、三维、前端框架到空间数据库、国内平台与学习资源，为
              GIS 开发者与爱好者提供一站式入口。
            </p>
          </header>

          {/* 搜索 */}
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索资源名称或简介…"
              className="w-full pl-9 pr-3 py-2 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {catList.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCat(c.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCat === c.id
                    ? 'bg-primary text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {c.nameZh} <span className="ml-1 text-xs opacity-70">{c.count}</span>
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-5">
            共 <span className="font-semibold text-foreground">{list.length}</span> 个资源
            {activeCat !== '全部' && ` · ${activeName}`}
            {query.trim() && ` · 含“${query.trim()}”`}
          </p>

          {list.length === 0 ? (
            <p className="text-muted-foreground">没有匹配的资源，换个关键词试试。</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((r) => {
                const cat = wikiCategories.find((c) => c.id === r.categoryId);
                return (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col gap-2 p-4 rounded-2xl border border-border hover:border-primary/40 hover:shadow-lg transition-all h-full bg-background"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
                        {r.nameZh}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary" />
                    </div>
                    {cat && (
                      <span className="text-xs text-primary/80">
                        {cat.nameZh}
                        {r.subcategory ? ` · ${r.subcategory}` : ''}
                      </span>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.descriptionZh}</p>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wiki;
