import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, History } from 'lucide-react';

/**
 * 标准演进时间线：把同一主题下几份标准的替代 / 并存关系按时间排开。
 * 当前所在的那一份高亮标记，其余节点可点击跳转 —— 实现同主题资料之间的互相导流。
 *
 * 新增一个演进族：往 TIMELINES 里加一条，再在对应 md 的 frontmatter 写 `timeline: <key>`。
 */
type TimelineNode = {
  slug: string;
  code: string;
  title: string;
  date: string;
  org: string;
  status: '现行' | '已废止';
  note: string;
};

const TIMELINES: Record<string, { label: string; nodes: TimelineNode[] }> = {
  // 河流编码：水利行业内部编码 → 跨部门地理实体统一编码
  'river-code': {
    label: '河流编码标准演进',
    nodes: [
      {
        slug: 'sl-249-1999',
        code: 'SL 249—1999',
        title: '中国河流名称代码',
        date: '2000-01-01 施行',
        org: '水利部 · 国家防总办公室主编',
        status: '已废止',
        note: '首部河流编码行业标准，依据 SL 213-98 编制，首次建立全国河流名称代码体系。',
      },
      {
        slug: 'sl-249-2012',
        code: 'SL 249—2012',
        title: '中国河流代码',
        date: '2012-11-01 实施',
        org: '水利部 · 中国水利水电科学研究院主编',
        status: '已废止',
        note: '全部代替 SL 249-1999；扩充 2000 余条河流，确立 ABTFFSSY 代码格式并增加汇流关系列表。2025-11-05 废止。',
      },
      {
        slug: 'gbt-40760-2021',
        code: 'GB/T 40760—2021',
        title: '地理实体编码 河流',
        date: '2021-10-11 实施',
        org: '国家市场监督管理总局 / 国家标准化管理委员会',
        status: '现行',
        note: '跳出水利单一行业，面向地理信息公共基底数据，给出跨部门通用的河流地理实体编码。',
      },
    ],
  },
};

const StandardTimeline: React.FC<{ timeline: string; current: string }> = ({ timeline, current }) => {
  const t = TIMELINES[timeline];
  if (!t) return null;

  return (
    <section className="mt-10 rounded-2xl border border-border bg-muted/40 p-5 md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">{t.label}</h2>
      </div>

      <ol className="relative space-y-3 pl-8">
        {/* 时间轴竖线 */}
        <span className="absolute left-4 top-5 bottom-5 w-px bg-border" aria-hidden="true" />

        {t.nodes.map((n) => {
          const isCurrent = n.slug === current;
          const alive = n.status === '现行';
          return (
            <li key={n.slug} className="relative">
              {/* 节点圆点 */}
              <span
                className={`absolute -left-6 top-[14px] h-4 w-4 rounded-full border-2 ${
                  isCurrent ? 'border-primary bg-primary' : 'border-border bg-background'
                }`}
                aria-hidden="true"
              />

              <div
                className={`rounded-xl border p-4 transition-colors ${
                  isCurrent
                    ? 'border-primary/40 bg-primary/[0.06]'
                    : 'border-border bg-background hover:border-primary/30 hover:bg-primary/[0.03]'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{n.code}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      alive
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {n.status}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      当前页
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {n.date} · {n.org}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{n.note}</p>

                {!isCurrent && (
                  <Link
                    to={`/downloads/${n.slug}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    查看该标准详情页
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default StandardTimeline;
