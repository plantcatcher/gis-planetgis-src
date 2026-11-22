/**
 * Markdown 内联图表块：`:::chart <type>` … `:::`
 *
 * 设计约束：
 * 1) 输出纯 SVG 字符串，随正文一起被 SSG 预渲染（百度能抓到图表文字与数值）。
 * 2) 零运行时依赖、零 JS 交互；颜色全部走 CSS 变量，明暗主题自动适配。
 * 3) 数据写在 md 里，构建期解析；不读取浏览器尺寸，不打 hydration 差异。
 *
 * 支持的 type：bar / line / stack / duo / progress / timeline
 */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function kv(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function items(src = ''): { label: string; value: number; raw: string }[] {
  return src
    .split(/[;；]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const idx = s.search(/[=＝]/);
      if (idx < 0) return null;
      const label = s.slice(0, idx).trim();
      const raw = s.slice(idx + 1).trim();
      const value = Number(raw.replace(/,/g, ''));
      return Number.isFinite(value) ? { label, value, raw } : null;
    })
    .filter((x): x is { label: string; value: number; raw: string } => x !== null);
}

function wrap(title: string, note: string, body: string, h: number, label: string): string {
  return [
    `<figure class="md-chart" role="img" aria-label="${esc(label || title)}">`,
    title ? `<figcaption>${esc(title)}</figcaption>` : '',
    `<svg viewBox="0 0 720 ${h}" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`,
    body,
    '</svg>',
    note ? `<figcaption class="md-chart-note">${esc(note)}</figcaption>` : '',
    '</figure>',
  ].join('\n');
}

const FG = 'hsl(var(--foreground))';
const MUTED = 'hsl(var(--muted-foreground))';
const BORDER = 'hsl(var(--border))';
const C = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];
const txt = (x: number, y: number, s: string, size = 13, color = MUTED, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-size="${size}" style="fill:${color}" text-anchor="${anchor}">${esc(s)}</text>`;

/** 横向排行条：items: 上海=1148; 北京=582 */
function bar(cfg: Record<string, string>): string {
  const rows = items(cfg.items).sort((a, b) => b.value - a.value);
  if (!rows.length) return '';
  const max = Math.max(...rows.map((r) => r.value));
  const unit = cfg.unit || '';
  const top = 34;
  const rowH = rows.length > 12 ? 26 : 32;
  const h = top + rows.length * rowH + 14;
  const x0 = 132;
  const w = 470;
  const out: string[] = [];
  out.push(txt(x0, 18, cfg.xlabel || `规模（${unit}）`, 11));
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    const bw = Math.max(2, (r.value / max) * w);
    out.push(txt(x0 - 8, y + 16, r.label, 12.5, FG, 'end'));
    out.push(
      `<rect x="${x0}" y="${y + 3}" width="${w}" height="${rowH - 11}" rx="3" style="fill:${BORDER};opacity:.35" />`
    );
    out.push(
      `<rect x="${x0}" y="${y + 3}" width="${bw.toFixed(1)}" height="${rowH - 11}" rx="3" style="fill:${i === 0 ? C[0] : C[2]};opacity:${i === 0 ? 1 : 0.82}" />`
    );
    out.push(txt(x0 + bw + 8, y + 16, r.raw, 12, FG));
  });
  return wrap(cfg.title || '', cfg.note || '', out.join('\n'), h, cfg.title || '排行条形图');
}

/** 结构堆叠条：items: 运行中=363; 在建=43 */
function stack(cfg: Record<string, string>): string {
  const rows = items(cfg.items);
  if (!rows.length) return '';
  const total = rows.reduce((a, r) => a + r.value, 0) || 1;
  const x0 = 16;
  const w = 688;
  const out: string[] = [];
  let x = x0;
  rows.forEach((r, i) => {
    const bw = (r.value / total) * w;
    out.push(
      `<rect x="${x.toFixed(1)}" y="16" width="${Math.max(1, bw - 1).toFixed(1)}" height="34" rx="2" style="fill:${C[i % C.length]}" />`
    );
    if (bw > 44) {
      out.push(
        txt(x + bw / 2, 38, `${Math.round((r.value / total) * 100)}%`, 12, 'hsl(var(--primary-foreground))', 'middle')
      );
    }
    x += bw;
  });
  // 图例：按项数自适应列数，列宽均分画布宽度（固定 350px 列距会让 4—6 项溢出画布）
  const cols = rows.length > 6 ? 2 : rows.length > 3 ? 3 : rows.length;
  const perCol = Math.ceil(rows.length / cols);
  const colW = 688 / cols;
  rows.forEach((r, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const lx = x0 + col * colW;
    const ly = 76 + row * 22;
    out.push(`<rect x="${lx}" y="${ly - 10}" width="10" height="10" rx="2" style="fill:${C[i % C.length]}" />`);
    out.push(txt(lx + 16, ly, `${r.label}  ${r.raw}`, 12, FG));
  });
  const h = 76 + perCol * 22 + 8;
  return wrap(cfg.title || '', cfg.note || '', out.join('\n'), h, cfg.title || '结构堆叠图');
}

/** 双指标对比：items: 美国=1223|10.2万（每侧独立归一化，看排序与结构反转） */
function duo(cfg: Record<string, string>): string {
  const raw = (cfg.items || '')
    .split(/[;；]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const idx = s.search(/[=＝]/);
      if (idx < 0) return null;
      const label = s.slice(0, idx).trim();
      const parts = s.slice(idx + 1).split('|').map((p) => p.trim());
      if (parts.length < 2) return null;
      return { label, a: parts[0], b: parts[1], av: Number(parts[0].replace(/[^\d.]/g, '')), bv: Number(parts[1].replace(/[^\d.]/g, '')) };
    })
    .filter((x): x is { label: string; a: string; b: string; av: number; bv: number } => x !== null)
    .sort((a, b) => b.av - a.av);
  if (!raw.length) return '';
  const maxA = Math.max(...raw.map((r) => r.av)) || 1;
  const maxB = Math.max(...raw.map((r) => r.bv)) || 1;
  const rowH = 32;
  const top = 38;
  const h = top + raw.length * rowH + 12;
  const xa = 356;
  const xb = 546;
  const out: string[] = [];
  out.push(txt(xa, 16, cfg.labelA || '指标 A', 11, C[0], 'end'));
  out.push(txt(xb, 16, cfg.labelB || '指标 B', 11, C[3], 'end'));
  raw.forEach((r, i) => {
    const y = top + i * rowH + 10;
    const ax = xa - (r.av / maxA) * 200;
    const bx = xb - (r.bv / maxB) * 200;
    out.push(txt(128, y + 4, r.label, 12.5, FG, 'end'));
    out.push(`<line x1="${ax.toFixed(1)}" y1="${y}" x2="${bx.toFixed(1)}" y2="${y}" stroke="${BORDER}" stroke-width="2" />`);
    out.push(`<circle cx="${ax.toFixed(1)}" cy="${y}" r="5" style="fill:${C[0]}" />`);
    out.push(`<circle cx="${bx.toFixed(1)}" cy="${y}" r="5" style="fill:${C[3]}" />`);
    out.push(txt(xa + 12, y + 4, r.a, 11.5, C[0]));
    out.push(txt(xb + 12, y + 4, r.b, 11.5, C[3]));
  });
  return wrap(cfg.title || '', cfg.note || '', out.join('\n'), h, cfg.title || '双指标对比图');
}

/** 覆盖率进度条：items: 蜜雪=98.1; 瑞幸=90.5（自动按百分制） */
function progress(cfg: Record<string, string>): string {
  const rows = items(cfg.items);
  if (!rows.length) return '';
  const rowH = 36;
  const top = 30;
  const h = top + rows.length * rowH + 8;
  const x0 = 116;
  const w = 480;
  const out: string[] = [];
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    const pct = Math.max(0, Math.min(100, r.value));
    out.push(txt(x0 - 8, y + 17, r.label, 12.5, FG, 'end'));
    out.push(`<rect x="${x0}" y="${y + 4}" width="${w}" height="18" rx="9" style="fill:${BORDER};opacity:.4" />`);
    out.push(`<rect x="${x0}" y="${y + 4}" width="${((pct / 100) * w).toFixed(1)}" height="18" rx="9" style="fill:${C[i % 3 === 0 ? 2 : i % 3 === 1 ? 0 : 1]}" />`);
    out.push(txt(x0 + w + 10, y + 18, `${r.raw}%`, 12, FG));
  });
  return wrap(cfg.title || '', cfg.note || '', out.join('\n'), h, cfg.title || '覆盖率对比图');
}

/** 折线：x: 2005,2010; series: 门店数=150,1900; 海外=0,20 */
function line(cfg: Record<string, string>): string {
  const xs = (cfg.x || '').split(',').map((s) => s.trim()).filter(Boolean);
  const series = (cfg.series || '')
    .split(/[;；]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const idx = s.search(/[=＝]/);
      if (idx < 0) return null;
      return { label: s.slice(0, idx).trim(), vals: s.slice(idx + 1).split(',').map((v) => (v.trim() === 'null' ? null : Number(v.trim()))) };
    })
    .filter((x): x is { label: string; vals: (number | null)[] } => x !== null);
  if (!xs.length || !series.length) return '';
  const all = series.flatMap((s) => s.vals.filter((v): v is number => v !== null && Number.isFinite(v)));
  const maxY = cfg.max ? Number(cfg.max) : Math.max(...all, 1);
  const minY = cfg.min ? Number(cfg.min) : 0;
  const spanY = maxY - minY || 1;
  const x0 = 62;
  const x1 = 690;
  const y0 = 24;
  const y1 = 214;
  const h = 258;
  const out: string[] = [];
  // 网格 + y 轴刻度
  for (let g = 0; g <= 4; g++) {
    const y = y1 - (g / 4) * (y1 - y0);
    out.push(`<line x1="${x0}" y1="${y.toFixed(1)}" x2="${x1}" y2="${y.toFixed(1)}" stroke="${BORDER}" stroke-width="1" opacity=".6" />`);
    const val = minY + (spanY / 4) * g;
    out.push(txt(x0 - 8, y + 4, cfg.unit ? `${Math.round(val)}${cfg.unit}` : String(Math.round(val)), 11, MUTED, 'end'));
  }
  // x 轴刻度（最多 9 个）：末尾标签与前一个太近时丢掉前一个，避免年份叠字
  const step = Math.max(1, Math.ceil(xs.length / 9));
  const pxAt = (i: number) => x0 + (xs.length === 1 ? 0 : (i / (xs.length - 1)) * (x1 - x0));
  const shown: number[] = [];
  xs.forEach((_, i) => {
    if (i % step === 0 || i === xs.length - 1) shown.push(i);
  });
  while (shown.length > 1 && pxAt(shown[shown.length - 1]) - pxAt(shown[shown.length - 2]) < 36) {
    shown.splice(shown.length - 2, 1);
  }
  shown.forEach((i) => out.push(txt(pxAt(i), y1 + 20, xs[i], 11, MUTED, 'middle')));
  // 折线
  series.forEach((s, si) => {
    let seg: string[] = [];
    const flush = () => {
      if (seg.length > 1) {
        out.push(`<polyline points="${seg.join(' ')}" fill="none" stroke="${C[si % C.length]}" stroke-width="2.5" stroke-linejoin="round" />`);
      }
      seg = [];
    };
    s.vals.forEach((v, i) => {
      if (v === null) { flush(); return; }
      const px = x0 + (xs.length === 1 ? 0 : (i / (xs.length - 1)) * (x1 - x0));
      const py = y1 - ((v - minY) / spanY) * (y1 - y0);
      seg.push(`${px.toFixed(1)},${py.toFixed(1)}`);
      out.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.2" style="fill:${C[si % C.length]}" />`);
    });
    flush();
    const lx = x0 + si * 170;
    out.push(`<rect x="${lx}" y="${h - 18}" width="10" height="10" rx="2" style="fill:${C[si % C.length]}" />`);
    out.push(txt(lx + 15, h - 9, s.label, 11, FG));
  });
  return wrap(cfg.title || '', cfg.note || '', out.join('\n'), h, cfg.title || '趋势折线图');
}

/** 事件时间线：events: 2004=上海首店; 2007=广州、苏州 */
function timeline(cfg: Record<string, string>): string {
  const evts = (cfg.events || '')
    .split(/[;；]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const idx = s.search(/[=＝]/);
      return idx < 0 ? null : { year: s.slice(0, idx).trim(), text: s.slice(idx + 1).trim() };
    })
    .filter((x): x is { year: string; text: string } => x !== null);
  if (!evts.length) return '';
  const top = 46;
  const gap = 600 / Math.max(1, evts.length - 1);
  const h = 152;
  const out: string[] = [];
  const y = 62;
  out.push(`<line x1="60" y1="${y}" x2="660" y2="${y}" stroke="${BORDER}" stroke-width="2" />`);
  evts.forEach((e, i) => {
    const x = evts.length === 1 ? 360 : 60 + i * gap;
    const up = i % 2 === 0;
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y}" r="5" style="fill:${C[i % C.length]}" />`);
    out.push(`<line x1="${x.toFixed(1)}" y1="${up ? y - 8 : y + 8}" x2="${x.toFixed(1)}" y2="${up ? 32 : 86}" stroke="${BORDER}" />`);
    const label = e.text.length > 16 ? e.text.slice(0, 15) + '…' : e.text;
    out.push(txt(x, up ? 24 : 104, e.year, 12, C[i % C.length], 'middle'));
    out.push(txt(x, up ? 38 : 118, label, 11, FG, 'middle'));
  });
  return wrap(cfg.title || '', cfg.note || '', out.join('\n'), h, cfg.title || '事件时间线');
}

/** 渲染一个 :::chart 块（type + 参数行） */
export function renderChart(type: string, block: string): string {
  const cfg = kv(block);
  switch (type.trim().toLowerCase()) {
    case 'bar': return bar(cfg);
    case 'line': return line(cfg);
    case 'stack': return stack(cfg);
    case 'duo': return duo(cfg);
    case 'progress': return progress(cfg);
    case 'timeline': return timeline(cfg);
    default: return '';
  }
}
