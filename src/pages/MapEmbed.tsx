import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { getItem } from '@/lib/content';
import { getVizMap } from '@/lib/vizmaps';
import { recordMapView } from '@/services/learningService';
import NotFound from './NotFound';

/**
 * 可视化互动地图 · 全屏壳页（/maps/:slug）
 *
 * 与游戏壳页（GameEmbed）同一套路：用 iframe 承载 public/maps/<slug>/index.html，
 * 隔离各地图自带的全局 CSS / JS（MapLibre 有自己的 canvas 与样式约定），
 * 避免污染主站。地图与主站同源，后续可直接读 localStorage / postMessage 做打通。
 *
 * src 指向「/<slug>/index.html」显式命中静态文件，避开 Cloudflare 对目录
 * /maps/<slug>/ 的 308 斜杠归一化。
 *
 * 内容（标题 / 摘要 / 介绍页）取自 content/works/<slug>.md，
 * 入口与数据资产取自 src/data/vizmaps.json，两者按 slug 关联。
 */
const MapEmbed: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const work = getItem('work', slug || '');
  const asset = getVizMap(slug);
  // 兜底：登记册漏配时仍可用 works 的 link 推出入口，不至于整页 404
  const entry = asset?.entry || (work?.link ? `${work.link}/index.html` : '');

  // 打开互动地图即记入「我的学习」：地图探索足迹（与主站同源，可直读本地学习数据）。
  // 纯客户端副作用，SSR/预渲染不执行；同 slug 在 Service 层去重只留最新一条。
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (slug && work) recordMapView({ slug, title: work.title });
  }, [slug, work?.slug]);

  if (!work || !entry) return <NotFound />;

  return (
    <div className="w-full bg-[#060912]" style={{ height: '100dvh' }}>
      <PageMeta
        title={`${work.title} · 互动地图`}
        description={work.summary || work.title}
        canonical={`https://planetgis.cn/maps/${work.slug}`}
      />
      {/*「作品介绍 / 全部地图」入口已移进地图自己的「图层与显示」面板底部
          （public/maps/<slug>/index.html），这里不再叠浮层按钮，避免遮挡地图。 */}
      <iframe
        src={entry}
        title={work.title}
        loading="lazy"
        className="w-full h-full border-0 block"
      />
    </div>
  );
};

export default MapEmbed;
