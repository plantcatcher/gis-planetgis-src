import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import CoverImage from '@/components/common/CoverImage';
import { getItemsByTag, type ContentType } from '@/lib/content';

const basePath: Record<ContentType, string> = {
  work: 'works',
  tool: 'tools',
  article: 'articles',
  learn: 'learn',
};

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

const TagPage: React.FC = () => {
  const { tag } = useParams();
  const decoded = tag ? decodeURIComponent(tag) : '';
  const items = decoded ? getItemsByTag(decoded) : [];

  return (
    <>
      <PageMeta
        title={`${decoded} - 星球小捕手`}
        description={`星球小捕手关于「${decoded}」的地理科普内容合集，涵盖文章、学习与可视化作品，用系统化的方式把知识点讲透、讲活。`}
        canonical={`https://planetgis.cn/tag/${encodeURIComponent(decoded)}/`}
      />
      <Breadcrumb items={[{ label: '首页', path: '/' }, { label: `标签：${decoded}` }]} />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">标签</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3"># {decoded}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              与「{decoded}」相关的地理科普内容合集，共 {items.length} 篇。把分散的知识点聚到一起，方便系统学习。
            </p>
          </header>

          {items.length === 0 ? (
            <p className="text-muted-foreground">暂无相关内容。</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((a, i) => (
                <CardAnim key={`${a.type}-${a.slug}`} delay={i * 0.06}>
                  <Link
                    to={`/${basePath[a.type]}/${a.slug}/`}
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
                      {a.summary && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{a.summary}</p>
                      )}
                      <span className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        查看内容 <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </CardAnim>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TagPage;
