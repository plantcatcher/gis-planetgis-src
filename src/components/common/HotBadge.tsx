import React from 'react';

/**
 * 热门标记小徽章，用于首页顶部导航与左侧目录中需高亮的入口。
 * 红→橙渐变 + 白字「HOT」，与品牌主色协调。
 */
const HotBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center rounded-[4px] px-1 py-[1px] text-[10px] font-bold leading-none tracking-wide text-white bg-gradient-to-r from-red-500 to-orange-500 align-middle ${className}`}
  >
    HOT
  </span>
);

export default HotBadge;
