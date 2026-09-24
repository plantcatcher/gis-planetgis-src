import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map as MapIcon, ArrowRight, FileText, Layers, Database } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import { getWorksBySeries, type ContentItem } from '@/lib/content';
import { getVizMap, type VizMap } from '@/lib/vizmaps';

// 卡片入场动画：initial 保持 opacity:1，确保 SSG 静态 HTML 中文本天生可见（利于 SEO / AdSense）。
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

/**
 * 可视化互动地图 · 系列汇总页（/maps）
 *
 * 「有哪些地图、叫什么、封面是什么」由 content/works/<slug>.md 的 series: map 决定；
 * 「用了哪些数据、什么坐标系、多少要素」由 src/data/vizmaps.json 资产登记册补充。
 * 两者按 slug 关联，新增地图改这两处即可，本页不用动。
 */
const Maps: React.FC = () => {
  const maps = getWorksBySeries('map').map((w: ContentItem) => ({
    work: w,
    asset: getVizMap(w.slug) as VizMap | undefined,
  }));

  return (
    <>
      <PageMeta
        title="可视化互动地图 - 星球小捕手"
        description="可以点、可以搜、可以查的地理互动地图系列：我国主要河流分布图等，按国标分级着色，悬停即出河流名称、等级、国标码与估算河长，支持中文与拼音搜索。"
        canonical="https://planetgis.cn/maps"
      />
      <Breadcrumb />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <header className="mb-10">
            <p className="kicker mb-3">可点 · 可搜 · 可查</p>
            <div className="flex items-end gap-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">可视化互动地图</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2" />
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
            <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
              把真实的地理数据做成可以提问的地图——不只是看图，而是点一下就知道这条河叫什么、它是几级、有多长。每张地图都标注了数据源与坐标系，原始数据也可下载后自己动手分析。
            </p>
          </header>

          {maps.length === 0 ? (
            <p className="text-muted-foreground">地图正在路上，敬请期待。</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {maps.map(({ work: w, asset: m }, i) => {
                const totalFeatures = m?.data.reduce((s, d) => s + d.features, 0) ?? 0;
                return (
                  <CardAnim key={w.slug} delay={i * 0.08}>
                    <div className="group flex flex-col h-full overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                      <Link to={`/maps/${w.slug}`} className="block">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={w.cover}
                            alt={`${w.title} - 星球小捕手可视化互动地图`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="w-full text-center text-sm font-medium text-white/90">打开地图 →</span>
                          </div>
                        </div>
                      </Link>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                          <MapIcon className="w-4 h-4" />
                          <span className="text-xs font-medium tracking-wide uppercase">{w.category || '互动地图'}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">
                          <Link to={`/maps/${w.slug}`} className="group-hover:text-primary transition-colors">
                            {w.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">{w.summary}</p>

                        {m && (
                          <dl className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-start gap-1.5">
                              <Layers className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <dd>
                                共 {totalFeatures.toLocaleString()} 个要素（{m.data.map((d) => d.features.toLocaleString()).join(' + ')}）
                              </dd>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <Database className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <dd>{m.source}</dd>
                            </div>
                          </dl>
                        )}

                        <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-4">
                          <Link
                            to={`/maps/${w.slug}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                          >
                            打开地图 <ArrowRight className="w-3.5 h-3.5 group-hover:gap-2 transition-all" />
                          </Link>
                          <Link
                            to={`/works/${w.slug}`}
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>介绍与解读</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardAnim>
                );
              })}
            </div>
          )}

          <section className="mt-14 rounded-2xl border border-border bg-card/40 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-3">关于数据</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              每张地图使用的数据源、坐标系与要素数量都登记在
              <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-xs">src/data/vizmaps.json</code>
              里，页面上的数字直接来自这份登记册——数据一改，页面跟着变；而标题、封面与介绍统一来自
              <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-xs">content/works/&lt;slug&gt;.md</code>
              ，一份内容只维护一处。地图以静态文件形式托管，
              不需要后端数据库：地理数据在发布前统一做坐标降精度与抽稀，产物放在
              <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-xs">public/maps/&lt;slug&gt;/data/</code>，
              跨地图复用的底图数据（如省级行政区边界）放在
              <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-xs">public/maps/_shared/</code>，
              避免每张地图各存一份。
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              需要原始数据自己做分析？可前往
              <Link to="/downloads" className="ml-1 text-primary hover:underline">资料下载</Link>
              获取对应的矢量数据包。
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Maps;
