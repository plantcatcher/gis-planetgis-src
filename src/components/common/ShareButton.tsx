import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { trackShare, withRef } from '@/lib/analytics';

interface Props {
  /** 分享标题（用于系统分享面板） */
  title: string;
  /** 站内路径，如 /works/cn-rivers */
  path: string;
  /** 内容类型：work / learn / article / resource / game / map / achievement */
  contentType: string;
  /** 内容 slug，便于 GA4 下钻 */
  contentSlug?: string;
  /** 分享正文（移动端系统分享面板展示；复制降级时仅复制链接） */
  text?: string;
  /** 自定义样式（如游戏壳页的浮动样式） */
  className?: string;
}

/**
 * 通用分享按钮（增长黑客·分享闭环）。
 * - 优先调起系统分享（移动端 navigator.share），失败/不支持则复制带 ?ref= 的链接；
 * - 无论哪种方式，都发一次 share 事件，链接已带固化来源，形成可归因闭环。
 * 仅在点击时访问 window/navigator，SSR/SSG 预渲染安全。
 */
const ShareButton: React.FC<Props> = ({ title, path, contentType, contentSlug, text, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = withRef(`${window.location.origin}${path}`);
    trackShare({ contentType, contentSlug, platform: 'web', url });
    // 优先系统分享面板
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* 用户取消分享，降级为复制链接 */
      }
    }
    // 降级：复制链接到剪贴板
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 剪贴板不可用：分享事件已记录，链接即 share_url，无需额外提示 */
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="分享"
      className={`inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 ${className}`}
    >
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
      {copied ? '链接已复制' : '分享'}
    </button>
  );
};

export default ShareButton;
