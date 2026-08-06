import React from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import type { InfoboxRow } from '@/lib/knowledge';

/** Wikipedia 式信息盒：详情页右侧的事实面板，把条目结构化元信息一屏呈现 */
const FactBox = ({ rows }: { title?: string; rows: InfoboxRow[] }) => (
  <aside className="rounded-xl border border-border bg-background p-5">
    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
      <Info className="w-4 h-4 text-primary" />
      <h4 className="font-serif font-bold text-base">词条信息</h4>
    </div>
    <dl className="space-y-2.5 text-sm">
      {rows.map((r, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground tracking-wide">{r.label}</dt>
          <dd className="font-medium">
            {r.href ? (
              <Link to={r.href} className="text-primary hover:underline">
                {r.value}
              </Link>
            ) : (
              r.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  </aside>
);

export default FactBox;
