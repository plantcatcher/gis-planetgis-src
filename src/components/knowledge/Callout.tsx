import React from 'react';
import { Lightbulb, Info, BookOpen } from 'lucide-react';

type Variant = 'key' | 'note' | 'tip';

const map: Record<Variant, { icon: typeof Lightbulb; cls: string }> = {
  key: { icon: Lightbulb, cls: 'border-primary/30 bg-primary/5 text-primary' },
  note: { icon: Info, cls: 'border-accent/30 bg-accent/5 text-accent' },
  tip: { icon: BookOpen, cls: 'border-secondary/30 bg-secondary/5 text-secondary' },
};

/** 提示框：用于详情页"核心要点"等强调信息，增加正文层次 */
const Callout = ({
  variant = 'key',
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) => {
  const { icon: Icon, cls } = map[variant];
  return (
    <div className={`flex gap-3 rounded-xl border p-4 my-4 ${cls}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};

export default Callout;
