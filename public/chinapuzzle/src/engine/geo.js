// 通用几何与坐标工具。与具体关卡数据解耦，可被任意 GeoJSON 关卡复用。

// 屏幕坐标(clientX/Y) -> 指定 SVG group 内的用户坐标(viewBox 坐标系)
export function clientToSvg(svg, group, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = group.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = pt.matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

// 为第 i 个区域生成区分度高的颜色（HSL 均匀色相）
export function provinceColor(index, total) {
  const hue = Math.round((index * 360) / Math.max(total, 1) + 12) % 360;
  return `hsl(${hue} 70% 62%)`;
}

// Fisher–Yates 洗牌
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}
