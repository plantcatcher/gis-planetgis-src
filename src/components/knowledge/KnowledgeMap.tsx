import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SubjectIcon } from '@/lib/subjectIcons';
import type { SubjectStat } from '@/lib/knowledge';

/** 知识地图：首页学科网格，4 大方向 + 计数 + 子主题预览，点击进入专题 */
const KnowledgeMap = ({ stats }: { stats: SubjectStat[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {stats.map((s) => (
      <Link
        key={s.name}
        to={`/learn?subject=${encodeURIComponent(s.name)}`}
        className="group relative flex flex-col rounded-2xl border border-border bg-background p-5 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
      >
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
        <div className="relative flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <SubjectIcon name={s.icon} className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight">{s.name}</h3>
            <span className="text-xs text-muted-foreground">{s.count} 篇</span>
          </div>
        </div>
        <p className="relative text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
          {s.desc}
        </p>
        {s.subtopics.length > 0 && (
          <div className="relative flex flex-wrap gap-1.5 mb-3">
            {s.subtopics.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <span className="relative text-sm text-primary font-medium inline-flex items-center gap-1 mt-auto">
          进入专题
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    ))}
  </div>
);

export default KnowledgeMap;
