import React from 'react';

/** 小标题 kicker：用于各板块上方，统一"知识板块"视觉语言 */
const SectionLabel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center gap-2 text-xs font-semibold tracking-widest text-primary/80 uppercase ${className}`}>
    <span className="inline-block w-6 h-px bg-primary/50" />
    {children}
  </div>
);

export default SectionLabel;
