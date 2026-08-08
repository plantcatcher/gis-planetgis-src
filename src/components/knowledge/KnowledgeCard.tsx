import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Type } from 'lucide-react';
import CoverImage from '@/components/common/CoverImage';
import { SubjectIcon } from '@/lib/subjectIcons';
import { SUBJECT_META } from '@/lib/content';
import { getReadingTime, getWordCount, TYPE_BASE } from '@/lib/knowledge';
import type { ContentItem } from '@/lib/content';

/** 从正文提取导语：优先摘要，否则取正文去 markdown 符号后的前若干字 */
function leadOf(item: ContentItem): string {
  if (item.summary) return item.summary;
  const text = item.body
    .replace(/^---[\s\S]*?---/, '')
    .replace(/[#>*`_>\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, 72);
}

/**
 * 密集知识卡：在封面+标题之外，补充学科/学段徽章、导语、阅读时长、字数、标签，
 * 让列表与首页一眼可判断"这篇值不值得读"，提升知识密度。
 */
const KnowledgeCard = ({ item, showSubject = true }: { item: ContentItem; showSubject?: boolean }) => {
  const base = TYPE_BASE[item.type];
  const lead = leadOf(item);
  return (
    <Link
      to={`/${base}/${item.slug}/`}
      className="group flex flex-col overflow-hidden rounded-xl bg-background border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 h-full"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <CoverImage
          cover={item.cover}
          title={item.title}
          lazy
          className="group-hover:scale-105 transition-transform duration-700"
        />
        {showSubject && item.subject && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 dark:bg-zinc-800/90 text-primary backdrop-blur-sm">
            <SubjectIcon name={SUBJECT_META[item.subject]?.icon || 'Globe'} className="w-3 h-3" />
            {item.subject}
          </span>
        )}
        {item.category && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-medium bg-foreground/80 text-background backdrop-blur-sm">
            {item.category}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-serif text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <div className="mt-2 h-px w-8 bg-primary/40 group-hover:w-14 transition-all" />
        <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{lead}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {item.date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {item.date}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getReadingTime(item)}′
          </span>
          <span className="inline-flex items-center gap-1">
            <Type className="w-3 h-3" />
            {getWordCount(item)}字
          </span>
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default KnowledgeCard;
