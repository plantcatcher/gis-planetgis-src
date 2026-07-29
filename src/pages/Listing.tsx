import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ExternalLink, Compass, Globe } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import CoverImage from '@/components/common/CoverImage';
import { getWorks, getTools, getArticles, type ContentType } from '@/lib/content';
import subdomainsData from '@/data/subdomains.json';

type ListingType = 'work' | 'tool' | 'article' | 'subdomain';

const meta: Record<ListingType, { title: string; subtitle: string; base: string }> = {
  work: {
    title: '精选作品',
    subtitle: '从海平面模拟到城市路网，用交互可视化把复杂的地理数据变成可感知的体验。',
    base: 'works',
  },
  tool: {
    title: '地理小工具',
    subtitle: '自研在线地理小工具，让经纬度查询、格式转换、地形分析不再有门槛。',
    base: 'tools',
  },
  article: {
    title: '最新文章',
    subtitle: '地理科普与 AI 结合的深度图文，覆盖自然地理、气候环境、人文 GIS 等方向。',
    base: 'articles',
  },
  subdomain: {
    title: '子站导航',
    subtitle: '星球小捕手旗下站点与专题，按需跳转。',
    base: 'subdomains',
  },
};

// 卡片入场动画：initial 保持 opacity:1，确保 SSG 静态 HTML 中文本天生可见。
const CardAnim: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 1, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    viewport={{ once: true }}
  >
    {children}
  </motion.div>
);

const WorkGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {getWorks().map((w, i) => (
      <CardAnim key={w.slug} delay={i * 0.08}>
        <Link
          to={`/works/${w.slug}`}
          className="group block overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300"
        >
          <div className="aspect-video overflow-hidden relative">
            <img
              src={w.cover}
              alt={`${w.title} - 星球小捕手地理可视化作品`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="w-full text-center text-sm font-medium text-white/90">查看详情与解读 →</span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{w.title}</h3>
            <p className="text-muted-foreground line-clamp-2">{w.summary}</p>
          </div>
        </Link>
      </CardAnim>
    ))}
  </div>
);

const ToolGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {getTools().map((t, i) => (
      <CardAnim key={t.slug} delay={i * 0.08}>
        <Link
          to={`/tools/${t.slug}`}
          className="group flex gap-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300"
        >
          <div className="shrink-0 w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              {t.title} <ExternalLink className="w-4 h-4" />
            </h3>
            <p className="text-muted-foreground">{t.summary}</p>
          </div>
        </Link>
      </CardAnim>
    ))}
  </div>
);

const ArticleGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {getArticles().map((a, i) => (
      <CardAnim key={a.slug} delay={i * 0.06}>
        <Link
          to={`/articles/${a.slug}`}
          className="group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full"
        >
          <div className="aspect-[16/9] overflow-hidden bg-muted relative">
            <CoverImage
              cover={a.cover}
              title={a.title}
              lazy
              className="group-hover:scale-110 transition-transform duration-700"
            />
            {a.category && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-zinc-800/90 text-primary backdrop-blur-sm">
                {a.category}
              </span>
            )}
          </div>
          <div className="flex flex-col flex-1 p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              {a.date && (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{a.date}</span>
                </>
              )}
            </div>
            <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {a.title}
            </span>
            <span className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              阅读全文 <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </CardAnim>
    ))}
  </div>
);

const SubdomainGrid = () => {
  const subs = subdomainsData as { title: string; description: string; link: string }[];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {subs.map((s, i) => (
        <CardAnim key={s.link} delay={i * 0.08}>
          <a
            href={s.link}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col gap-2 items-start h-full p-4 rounded-2xl border border-primary/20 hover:border-primary transition-all hover:shadow-lg"
          >
            <Globe className="w-8 h-8 text-primary" />
            <span className="font-bold text-lg">{s.title}</span>
            <span className="text-xs text-muted-foreground w-full text-left">{s.description}</span>
            <span className="mt-auto text-xs text-primary flex items-center gap-1">
              前往 <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        </CardAnim>
      ))}
    </div>
  );
};

const Listing: React.FC<{ type: ListingType }> = ({ type }) => {
  const m = meta[type];
  return (
    <>
      <PageMeta
        title={`${m.title} - 星球小捕手`}
        description={m.subtitle}
        canonical={`https://planetgis.cn/${m.base}`}
      />
      <Breadcrumb />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{m.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{m.subtitle}</p>
          </header>

          {type === 'work' && <WorkGrid />}
          {type === 'tool' && <ToolGrid />}
          {type === 'article' && <ArticleGrid />}
          {type === 'subdomain' && <SubdomainGrid />}
        </div>
      </div>
    </>
  );
};

export default Listing;
