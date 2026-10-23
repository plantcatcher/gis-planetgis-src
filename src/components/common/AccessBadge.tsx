import React from 'react';
import { Lock, Download, BookOpen } from 'lucide-react';
import { isResourceGated, isResourceViewOnly, type ContentItem } from '@/lib/content';
import { useI18n } from '@/i18n/LocaleContext';

/**
 * 资料访问方式徽标（三态）：
 *   需验证码（gated） / 在线观看（仅有官方在线阅读链接、无整本下载） / 直接下载（其余）
 *
 * 供 /downloads 列表卡片、首页资料区，以及详情页的按钮态判断统一复用，
 * 避免三处各写一遍 ternary 后互相漂移。
 */
const AccessBadge: React.FC<{ item: ContentItem }> = ({ item }) => {
  const { t } = useI18n();
  if (isResourceGated(item)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <Lock className="w-3 h-3" /> {t('facet.access.gated')}
      </span>
    );
  }
  if (isResourceViewOnly(item)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/15 text-sky-600 dark:text-sky-400">
        <BookOpen className="w-3 h-3" /> {t('facet.access.view')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
      <Download className="w-3 h-3" /> {t('facet.access.download')}
    </span>
  );
};

export default AccessBadge;
