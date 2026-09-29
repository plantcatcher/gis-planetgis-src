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

// ---- 过小行政区保护：点状/极小行政区（如澳门、香港）真实轮廓面积极小，
// 在托盘与地图上难以选中拖动。此时围绕 home 中心「各向同性（等比例）放大」真实
// 轮廓，使 maxDim 达到 SCALE_MIN，既保留真实形状、又清晰可见、可拖动。
export const MIN_VIS = 12; // 地图单位：单维阈值，低于此值触发放大
export const SCALE_MIN = 22; // 放大后的目标 maxDim（地图单位）

// 把路径所有点围绕 (cx,cy) 等比放大 s 倍，再平移 (dx,dy)（保持宽高比，仅平移+缩放）
export function scalePathAround(d, cx, cy, s, dx = 0, dy = 0) {
  return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_m, x, y) => {
    const nx = cx + (Number(x) - cx) * s + dx;
    const ny = cy + (Number(y) - cy) * s + dy;
    return `${nx.toFixed(1)},${ny.toFixed(1)}`;
  });
}

export function pathBBox(d) {
  const nums = (d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
  if (!nums.length) return { x: 0, y: 0, width: 0, height: 0 };
  const xs = [], ys = [];
  for (let i = 0; i < nums.length; i += 2) { xs.push(nums[i]); ys.push(nums[i + 1]); }
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// 取某区域「有效渲染路径」：单维过小则围绕几何中心等比放大真实轮廓，
// 再平移使放大后的中心对齐 home（居中显示），否则返回原路径。
export function effectivePath(region) {
  const b = pathBBox(region.path);
  const maxDim = Math.max(b.width, b.height);
  if (maxDim >= MIN_VIS) return region.path;
  const s = SCALE_MIN / maxDim;
  const bcx = b.x + b.width / 2;
  const bcy = b.y + b.height / 2;
  return scalePathAround(region.path, bcx, bcy, s, region.home[0] - bcx, region.home[1] - bcy);
}
