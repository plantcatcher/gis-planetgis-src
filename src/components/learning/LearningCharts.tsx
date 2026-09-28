import React from 'react';

// =============================================================================
// LearningCharts —— 学习数据可视化（纯 SVG，零依赖，SSG 预渲染安全）
// -----------------------------------------------------------------------------
// 所有组件只接收数值型 props，渲染期不访问 window/navigator，可安全用于
// 预渲染。颜色由调用方以 hex 传入，文字用 Tailwind 的 fill-* 类适配明暗主题。
// =============================================================================

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

/** 环形图：用于类型分布 / 下载分类占比；中心显示总数 */
export const DonutChart: React.FC<{
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
}> = ({ data, size = 176, thickness = 20, centerLabel = '总计' }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`环形图，共 ${total} 项`}
    >
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={r} fill="none" className="stroke-muted" strokeWidth={thickness} />
        {total > 0 &&
          data.map((d, i) => {
            const frac = d.value / total;
            const len = frac * circ;
            const seg = (
              <circle
                key={i}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-acc}
                transform="rotate(-90)"
              />
            );
            acc += len;
            return seg;
          })}
        <text
          x={0}
          y={-2}
          textAnchor="middle"
          className="fill-foreground font-bold"
          fontSize={size * 0.16}
        >
          {total}
        </text>
        <text
          x={0}
          y={size * 0.11}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={size * 0.075}
        >
          {centerLabel}
        </text>
      </g>
    </svg>
  );
};

/** 竖向柱状图：用于「每周活跃天数」 */
export const BarChart: React.FC<{
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  max?: number;
}> = ({ data, height = 140, color = '#0891b2', max }) => {
  const W = 320;
  const H = height;
  const padY = 18;
  const padX = 10;
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  const bw = data.length > 0 ? (W - padX * 2) / data.length : 0;
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="柱状图"
      className="overflow-visible"
    >
      {data.map((d, i) => {
        const h = (d.value / top) * (H - padY * 2);
        const x = padX + i * bw + bw * 0.18;
        const w = bw * 0.64;
        const y = H - padY - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={Math.max(0, h)} rx={3} fill={color} opacity={0.85} />
            <text
              x={x + w / 2}
              y={y - 4}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={9}
              fontWeight={600}
            >
              {d.value || ''}
            </text>
            <text
              x={x + w / 2}
              y={H - 4}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={8.5}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** 折线图：用于「成绩趋势」（值 0~100） */
export const LineChart: React.FC<{
  points: { label: string; value: number }[];
  height?: number;
  color?: string;
}> = ({ points, height = 150, color = '#0891b2' }) => {
  const W = 320;
  const H = height;
  const padY = 16;
  const padX = 12;
  if (points.length === 0) return null;
  const maxV = 100;
  const stepX = points.length > 1 ? (W - padX * 2) / (points.length - 1) : 0;
  const xy = points.map((p, i) => ({
    x: padX + i * stepX,
    y: H - padY - (p.value / maxV) * (H - padY * 2),
    ...p,
  }));
  const path = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="折线图" className="overflow-visible">
      <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} className="stroke-muted" strokeWidth={1} />
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {xy.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={2.6} fill={color} />
          <text x={p.x} y={H - 4} textAnchor="middle" className="fill-muted-foreground" fontSize={8}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

/** 图例（环形图配套） */
export const ChartLegend: React.FC<{ data: DonutDatum[] }> = ({ data }) => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
    {data.map((d, i) => (
      <li key={i} className="inline-flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
        {d.label}
        <span className="tabular-nums text-foreground/80 font-medium">{d.value}</span>
      </li>
    ))}
  </ul>
);
