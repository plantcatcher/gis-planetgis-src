import React from 'react';

export interface FilterChipItem {
  name: string;
  count: number;
}

interface FilterChipsProps {
  /** 分组名（如「主题」「地域」）；留空则不显示前缀 */
  label?: string;
  items: FilterChipItem[];
  /** 当前选中项；等于 allLabel 时表示不筛选 */
  active: string;
  onChange: (name: string) => void;
  /** 「全部」这颗胶囊上的计数 */
  allCount: number;
  /** 「全部」胶囊的文案，默认「全部」 */
  allLabel?: string;
}

/**
 * 筛选胶囊组，用于 /maps、/games 的细分分类筛选。
 *
 * 视觉与 /works 页的分类筛选保持一致（圆角胶囊 + 计数），抽成组件是为了让
 * 「主题」「地域」两个维度复用同一套样式，避免各页各写一份。
 * 计数由调用方按「另一维度的当前选择」算好再传进来（分面计数）。
 */
const FilterChips: React.FC<FilterChipsProps> = ({
  label,
  items,
  active,
  onChange,
  allCount,
  allLabel = '全部',
}) => (
  <div className="flex flex-wrap items-center gap-2">
    {label && (
      <span className="text-xs font-medium text-muted-foreground shrink-0 mr-1">{label}</span>
    )}
    {[{ name: allLabel, count: allCount }, ...items].map(({ name, count }) => {
      const isActive = active === name;
      return (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          aria-pressed={isActive}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            isActive
              ? 'bg-primary text-white'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {name}
          <span className="ml-1 text-xs opacity-70">{count}</span>
        </button>
      );
    })}
  </div>
);

export default FilterChips;
