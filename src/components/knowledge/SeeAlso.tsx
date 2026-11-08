import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Link2 } from 'lucide-react';
import { SubjectIcon } from '@/lib/subjectIcons';
import { SUBJECT_META } from '@/lib/content';
import { TYPE_BASE } from '@/lib/knowledge';
import { useI18n } from '@/i18n/LocaleContext';
import { localizeLabel } from '@/i18n/labels';
import type { ContentItem } from '@/lib/content';

/** 参见：按标签跨类型推荐相关条目，促进知识互链 */
const SeeAlso = ({ items }: { items: ContentItem[] }) => {
  const { t, lang } = useI18n();
  if (!items.length) return null;
  return (
    <aside>
      <h4 className="font-serif font-bold text-base mb-3 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-primary" />
        {t('detail.seeAlso')}
      </h4>
      <ul className="space-y-2">
        {items.map((i) => {
          const typeLabel = t(`detail.type.${i.type}` as const);
          const categoryLabel = i.category ? localizeLabel(i.category, lang) : '';
          return (
            <li key={`${i.type}-${i.slug}`}>
              <Link
                to={`/${TYPE_BASE[i.type]}/${i.slug}`}
                className="group flex items-start gap-2 rounded-lg border border-border/60 bg-card/60 p-3 hover:border-primary/40 hover:bg-primary/5 transition"
              >
                {i.subject && (
                  <SubjectIcon
                    name={SUBJECT_META[i.subject]?.icon || 'Globe'}
                    className="w-4 h-4 mt-0.5 text-primary shrink-0"
                  />
                )}
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium group-hover:text-primary transition-colors leading-snug">
                    {i.title}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {/* 地图 / 工具 / 游戏的 category 恒等于其类型名（互动地图、地理小工具…），
                        照抄会出现「Interactive Maps · Interactive Maps」，故重复时只显示一次 */}
                    {typeLabel}
                    {categoryLabel && categoryLabel !== typeLabel ? ` · ${categoryLabel}` : ''}
                  </span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default SeeAlso;
