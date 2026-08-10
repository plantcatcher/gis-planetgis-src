import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useLearningData } from '@/hooks/useLearning';
import { toggleFavorite, isFavorite } from '@/services/learningService';

interface Props {
  /** 内容唯一键 */
  contentKey: string;
  /** 变体：详情页用 'detail'（带文字标签），列表卡片用 'icon'（仅图标） */
  variant?: 'detail' | 'icon';
}

/**
 * 收藏按钮。仅通过 learningService 写数据，自身不直接碰 localStorage。
 * 订阅 useLearningData 以在「收藏/取消」后立刻反映状态。
 */
const FavoriteButton: React.FC<Props> = ({ contentKey, variant = 'detail' }) => {
  // 首屏必须与 SSG 预渲染一致：未登录、无本地数据时一律显示「未收藏」，
  // 真实状态在客户端挂载后由 useEffect 校正，避免 hydration mismatch。
  const [mounted, setMounted] = useState(false);
  const data = useLearningData();
  const fav = mounted ? isFavorite(contentKey) : false;

  React.useEffect(() => setMounted(true), []);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(contentKey);
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={fav ? '取消收藏' : '收藏'}
        aria-pressed={fav}
        className={`inline-flex items-center justify-center rounded-full p-2 transition-colors ${
          fav
            ? 'text-amber-500 bg-amber-500/10'
            : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10'
        }`}
      >
        <Star className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={fav}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        fav
          ? 'border-amber-500/40 text-amber-600 bg-amber-500/10'
          : 'border-border text-muted-foreground hover:text-amber-600 hover:border-amber-500/40'
      }`}
    >
      <Star className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} />
      {fav ? '已收藏' : '收藏'}
    </button>
  );
};

export default FavoriteButton;
