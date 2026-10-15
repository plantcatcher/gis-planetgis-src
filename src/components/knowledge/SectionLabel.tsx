import React from 'react';

/** 小标题 kicker：用于各板块上方，统一"知识板块"视觉语言。左侧竖条作为标题前缀。 */
const SectionLabel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center gap-2 text-xs font-semibold tracking-widest text-primary/80 uppercase ${className}`}>
    <span className="inline-block w-px h-3.5 bg-primary/60" />
    {children}
  </div>
);

export default SectionLabel;
