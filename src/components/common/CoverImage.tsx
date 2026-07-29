import React from 'react';
import { Compass } from 'lucide-react';

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
 * - 无 cover：渲染品牌渐变占位图，避免「空框 / 破图」，保证列表永远有视觉焦点。
 *
 * 父级需提供尺寸容器（如 aspect-[16/9] overflow-hidden）。
 */
const CoverImage: React.FC<CoverImageProps> = ({ cover, title, className = '', lazy = false }) => {
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
