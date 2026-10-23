import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { getItem } from '@/lib/content';
import { getVizMap } from '@/lib/vizmaps';
import { recordMapView } from '@/services/learningService';
import { useI18n } from '@/i18n/LocaleContext';
import NotFound from './NotFound';

/**
 * 可视化互动地图 · 全屏壳页（/maps/:slug/full）
 *
 * 详情页占用了 /maps/:slug，全屏壳页后退到 /full 后缀：
 * 这里是纯交互视图（无正文），不参与收录，全部 SEO 权重给详情页。
 *
 * 与游戏壳页（GameEmbed）同一套路：用 iframe 承载 public/maps/<slug>/index.html，
 * 隔离各地图自带的全局 CSS / JS（MapLibre 有自己的 canvas 与样式约定），
 * 避免污染主站。地图与主站同源，后续可直接读 localStorage / postMessage 做打通。
 *
 * src 指向「/<slug>/index.html」显式命中静态文件，避开 Cloudflare 对目录
 * /maps/<slug>/ 的 308 斜杠归一化。
 *
 * 内容（标题 / 摘要 / 介绍页）取自 content/maps/<slug>.md，
 * 入口与数据资产取自 src/data/vizmaps.json，两者按 slug 关联。
 */
const MapEmbed: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useI18n();
  const work = getItem('map', slug || '');
  const asset = getVizMap(slug);
  // 兜底：登记册漏配时仍可用 link 推出入口，不至于整页 404
  const entry = asset?.entry || (work?.link ? `${work.link}/index.html` : '');
  // 英文 locale：给独立地图应用追加 ?lang=en，触发共享运行时英译层
  // （public/shared/map-i18n.js）。中文站不加任何参数，零副作用。
  const iframeSrc =
    lang === 'en' && entry
      ? entry + (entry.includes('?') ? '&lang=en' : '?lang=en')
      : entry;

  // 打开互动地图即记入「我的学习」：地图探索足迹（与主站同源，可直读本地学习数据）。
  // 纯客户端副作用，SSR/预渲染不执行；同 slug 在 Service 层去重只留最新一条。
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (slug && work) recordMapView({ slug, title: work.title });
  }, [slug, work?.slug]);

  if (!work || !entry) return <NotFound />;

  return (
    <div className="w-full bg-[#060912]" style={{ height: '100dvh' }}>
      {/* canonical 指向详情页（/maps/<slug>）：全屏壳页没有正文，不参与收录，
          权重全部集中到详情页。 */}
      <PageMeta
        title={`${work.title} · 互动地图`}
        description={work.summary || work.title}
        canonical={`https://planetgis.cn/maps/${work.slug}`}
      />
      {/*「作品介绍 / 全部地图」入口已移进地图自己的「图层与显示」面板底部
          （public/maps/<slug>/index.html），这里不再叠浮层按钮，避免遮挡地图。 */}
      <iframe
        src={iframeSrc}
        title={work.title}
        loading="lazy"
        className="w-full h-full border-0 block"
      />
    </div>
  );
};

export default MapEmbed;
