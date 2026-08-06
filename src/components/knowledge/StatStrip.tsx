import React from 'react';

/** 紧凑统计条：词条数/主题数等，强化"知识库"体量感 */
const StatStrip = ({ stats }: { stats: { value: string; label: string }[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {stats.map((s, i) => (
      <div
        key={i}
        className="rounded-xl border border-border bg-background p-4 text-center"
      >
        <div className="font-serif text-2xl font-extrabold text-primary">{s.value}</div>
        <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
      </div>
    ))}
  </div>
);

export default StatStrip;
