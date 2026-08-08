import React, { useState } from 'react';
import { Compass } from 'lucide-react';

/**
 * 站点默认封面图：文章未显式设置 cover 时使用。
 * 取自 blogphoto.planetgis.cn 图床；若加载失败回退到品牌渐变占位图。
 */
const DEFAULT_COVER =
  'https://blogphoto.planetgis.cn/PicGo/2026-07-16-0cde5cfe8163254a8526fb8014a4d7cc-sz_424354.jpeg';

interface CoverImageProps {
  cover?: string;
  title: string;
  /** 自定义类名，控制尺寸/裁剪；默认填满父容器 */
  className?: string;
  /** 是否使用懒加载（列表卡片建议开启） */
  lazy?: boolean;
}

/**
 * 封面图组件。
 * - 有 cover：渲染真实图片（object-cover 填满父级容器）。
 * - 无 cover：渲染默认封面图（DEFAULT_COVER）；图床异常时回退品牌渐变占位图，
 *   避免「空框 / 破图」，保证列表永远有视觉焦点。
 *
 * 父级需提供尺寸容器（如 aspect-[16/9] overflow-hidden）。
 */
const CoverImage: React.FC<CoverImageProps> = ({ cover, title, className = '', lazy = false }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (cover) {
    return (
      <img
        src={cover}
        alt={`${title} - 封面图`}
        loading={lazy ? 'lazy' : undefined}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  // 无 cover：优先用默认封面图，加载失败则回退到渐变占位图
  if (!imgFailed) {
    return (
      <img
        src={DEFAULT_COVER}
        alt={`${title} - 默认封面`}
        loading={lazy ? 'lazy' : undefined}
        onError={() => setImgFailed(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/85 via-primary/60 to-cyan-500/70 relative overflow-hidden ${className}`}
      aria-label={`${title} - 封面占位图`}
    >
      {/* 背景纹理：大号半透明图标，增强品牌感 */}
      <Compass className="w-20 h-20 text-white/25" />
      <span className="absolute bottom-3 right-3 text-xs font-medium text-white/70 tracking-wide">
        星球小捕手
      </span>
    </div>
  );
};

export default CoverImage;
