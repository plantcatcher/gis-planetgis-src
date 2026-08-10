// 渲染层：把关卡数据画成 SVG（目标轮廓 / 碎片 / 九段线插图）
// 以及底部碎片区（同一 Coordinate 体系内的独立 SVG 托盘，支持左右滑动）。
// 所有坐标均使用关卡 viewBox 坐标系。
import { provinceColor, shuffle } from './geo.js';

const SVGNS = 'http://www.w3.org/2000/svg';

// 碎片托盘布局参数（单位 = 托盘 SVG 用户坐标）
const TRAY_VB_W = 1000; // 托盘 SVG viewBox 宽度，与地图一致便于形状比例统一
const TRAY_VB_H = 120;
const SLOT = 66;
const GAP = 10;
const PAD = 16;
const TOP = 10;
const THUMB = 66;

function svgEl(tag, attrs = {}) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export class Renderer {
  constructor({ svg, viewport, bgLayer, ghostLayer, pieceLayer, traySvg, trayContent, level }) {
    this.svg = svg;
    this.viewport = viewport;
    this.bgLayer = bgLayer;
    this.ghostLayer = ghostLayer;
    this.pieceLayer = pieceLayer;
    this.traySvg = traySvg;
    this.trayContent = trayContent;
    this.level = level;
    this.total = level.regions.length;
    this.colorById = new Map();
    this.thresholdById = new Map();
    this.bboxById = new Map();
    this.ghostById = new Map();
    this.labelById = new Map();
    this.placedPathById = new Map();
    this.placedNameById = new Map();
    this.dragPath = null;
    this.trayPan = 0;
    this.trayMinTx = 0;
    this.trayOrder = [];
    this.trayContentWidth = 0;
    this.trayContentHeight = 0;
    this.grid = false; // 桌面端：碎片区改为多列网格（由 main.js 按断点设置）
    this._practiceLabels = true;
    this.showNames = true;
  }

  colorOf(id) {
    return this.colorById.get(id);
  }

  build() {
    const [vx, vy, vw, vh] = this.level.viewBox;
    this.svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    this.traySvg.setAttribute('viewBox', `0 0 ${TRAY_VB_W} ${TRAY_VB_H}`);
    this.traySvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    this.level.regions.forEach((r, i) => this.colorById.set(r.id, provinceColor(i, this.total)));

    this.drawBackground();
    this.drawGhosts();
    this.measureThresholds();
    this.buildTray(true);

    // 复用的拖动碎片元素（位于地图 SVG 内）
    this.dragPath = svgEl('path', { class: 'piece dragging', visibility: 'hidden' });
    this.pieceLayer.appendChild(this.dragPath);
  }

  drawBackground() {
    this.bgLayer.innerHTML = '';
    const bg = this.level.background;
    if (!bg) return;
    const [x, y, w, h] = bg.box;
    this.bgLayer.appendChild(svgEl('rect', { class: 'bg-frame', x, y, width: w, height: h, rx: 8 }));
    this.bgLayer.appendChild(svgEl('path', { class: 'nine-dash', d: bg.path }));
    const label = svgEl('text', { class: 'bg-label', x: x + w / 2, y: y + h - 10 });
    label.textContent = '南海诸岛';
    this.bgLayer.appendChild(label);
  }

  drawGhosts() {
    this.ghostLayer.innerHTML = '';
    this.ghostById.clear();
    this.labelById.clear();
    for (const r of this.level.regions) {
      const p = svgEl('path', { d: r.path });
      p.dataset.id = r.id;
      this.ghostLayer.appendChild(p);
      this.ghostById.set(r.id, p);

      const t = svgEl('text', { class: 'ghost-label', x: r.home[0], y: r.home[1] + 5 });
      t.textContent = r.short;
      t.style.display = 'none';
      this.ghostLayer.appendChild(t);
      this.labelById.set(r.id, t);
    }
  }

  measureThresholds() {
    for (const r of this.level.regions) {
      const ghost = this.ghostById.get(r.id);
      let bbox = { x: r.home[0], y: r.home[1], width: 10, height: 10 };
      try {
        const b = ghost.getBBox();
        if (b.width > 0 && b.height > 0) bbox = b;
      } catch {}
      this.bboxById.set(r.id, bbox);
      const diag = Math.hypot(bbox.width, bbox.height);
      // 阈值：随区域大小自适应，并设上下限，保证小省(港/澳)也好放置
      const threshold = Math.min(70, Math.max(34, diag * 0.45));
      this.thresholdById.set(r.id, threshold);
    }
  }

  // 构建碎片托盘：真实省形缩略图。
  // 桌面端（grid=true）采用多列网格，碎片区变右侧栏、垂直滚动；
  // 移动端为单行横向铺排，可平移滑动。两种布局下拖拽落点都走地图坐标，互不影响。
  // reshuffle=true 时重新洗牌（开始游戏 / 重玩 / 重新打乱）；false 仅用于跨断点重建，保持顺序。
  buildTray(reshuffle = false) {
    this.trayContent.innerHTML = '';
    if (reshuffle || !this.trayOrder.length || this.trayOrder.length !== this.level.regions.length) {
      this.trayOrder = shuffle(this.level.regions);
    }
    if (this.grid) {
      const cols = 3;
      const ROW = 96; // 单格垂直步距（缩略图 66 + 标签 + 间距）
      let i = 0;
      for (const r of this.trayOrder) {
        const c = i % cols;
        const rowN = Math.floor(i / cols);
        const x = PAD + c * (SLOT + GAP);
        const y = TOP + rowN * ROW;
        this._trayPiece(r, x, y);
        i++;
      }
      const rows = Math.ceil(this.trayOrder.length / cols);
      this.trayContentWidth = PAD * 2 + cols * (SLOT + GAP) - GAP;
      this.trayContentHeight = TOP + rows * ROW + 8;
    } else {
      let x = PAD;
      for (const r of this.trayOrder) {
        this._trayPiece(r, x, TOP);
        x += SLOT + GAP;
      }
      this.trayContentWidth = x;
      this.trayContentHeight = TRAY_VB_H;
    }
    this.trayMinTx = this.grid ? 0 : Math.min(0, TRAY_VB_W - this.trayContentWidth);
    this.trayPan = 0;
    this.applyTrayPan();
    this.applyTrayViewBox();
    this.setTrayLabels(this._practiceLabels);
  }

  _trayPiece(r, x, y) {
    const bbox = this.bboxById.get(r.id) || { x: 0, y: 0, width: 10, height: 10 };
    const vb = `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`;
    const g = svgEl('g', { class: 'tray-piece', 'data-id': r.id, transform: `translate(${x} ${y})` });
    const thumb = svgEl('svg', {
      class: 'tray-thumb',
      x: 0,
      y: 0,
      width: THUMB,
      height: THUMB,
      viewBox: vb,
      preserveAspectRatio: 'xMidYMid meet',
    });
    const path = svgEl('path', { d: r.path, fill: this.colorOf(r.id) });
    thumb.appendChild(path);
    const label = svgEl('text', { class: 'tray-label', x: THUMB / 2, y: THUMB + 16 });
    label.textContent = r.short;
    g.appendChild(thumb);
    g.appendChild(label);
    this.trayContent.appendChild(g);
  }

  applyTrayViewBox() {
    const vbW = this.grid ? this.trayContentWidth : TRAY_VB_W;
    const vbH = this.grid ? this.trayContentHeight : TRAY_VB_H;
    this.traySvg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
    this.traySvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }

  // 跨断点切换碎片区布局（桌面网格 / 移动横条），仅当状态变化时才重建
  setGrid(isGrid) {
    if (this.grid === isGrid) return;
    this.grid = isGrid;
    if (this.level) this.buildTray();
  }

  applyTrayPan() {
    this.trayContent.setAttribute('transform', `translate(${this.trayPan} 0)`);
  }

  panTrayBy(dxPixels) {
    if (this.grid) return; // 桌面网格模式用原生垂直滚动，禁用横向平移
    const scale = this.traySvg.clientWidth / TRAY_VB_W || 1;
    this.trayPan = clamp(this.trayPan + dxPixels / scale, this.trayMinTx, 0);
    this.applyTrayPan();
  }

  setTrayLabels(show) {
    this._practiceLabels = show;
    if (this.trayContent) this.trayContent.classList.toggle('hide-labels', !show);
  }

  regionById(id) {
    return this.level.regions.find((r) => r.id === id);
  }

  // 找到离 (x,y) 最近的省级行政区 home（用于吸附判定，避免相邻小省串位）
  nearestHome(x, y) {
    let best = null;
    let bestD = Infinity;
    for (const r of this.level.regions) {
      const d = Math.hypot(x - r.home[0], y - r.home[1]);
      if (d < bestD) {
        bestD = d;
        best = r;
      }
    }
    return { id: best.id, dist: bestD };
  }

  showGhostLabels(show) {
    this.labelById.forEach((t) => {
      t.style.display = show ? 'block' : 'none';
    });
  }

  setGhostFilled(id, filled) {
    const g = this.ghostById.get(id);
    if (g) g.classList.toggle('filled', filled);
  }

  setSnapTarget(id, on) {
    const g = this.ghostById.get(id);
    if (g) g.classList.toggle('snap-target', on);
  }

  hideTrayPiece(id, hide) {
    const el = this.trayContent.querySelector(`.tray-piece[data-id="${id}"]`);
    if (el) el.classList.toggle('hidden', hide);
  }

  markTrayUsed(id) {
    const el = this.trayContent.querySelector(`.tray-piece[data-id="${id}"]`);
    if (el) {
      el.classList.add('used');
      el.classList.remove('hidden');
    }
  }

  // 开始拖动：准备拖动碎片（渲染在地图 SVG 中），并隐藏托盘中被拖出的碎片
  beginDrag(region) {
    this.dragPath.setAttribute('d', region.path);
    this.dragPath.setAttribute('fill', this.colorOf(region.id));
    this.dragPath.setAttribute('visibility', 'visible');
    this.hideTrayPiece(region.id, true);
  }

  // 移动拖动碎片到以 (mx,my) 为几何中心的位置；返回是否「将正确吸附到自身 home」
  moveDrag(region, mx, my) {
    const tx = mx - region.home[0];
    const ty = my - region.home[1];
    this.dragPath.setAttribute('transform', `translate(${tx} ${ty})`);
    const near = this.nearestHome(mx, my);
    const threshold = this.thresholdById.get(region.id) || 60;
    const within = near.id === region.id && near.dist < threshold;
    this.setSnapTarget(region.id, within);
    return within;
  }

  endDrag() {
    this.dragPath.setAttribute('visibility', 'hidden');
    this.dragPath.removeAttribute('transform');
  }

  // 成功放置：生成一个常驻的已放置碎片
  placePiece(region) {
    const p = svgEl('path', {
      class: 'piece placed piece-pop',
      d: region.path,
      fill: this.colorOf(region.id),
    });
    this.pieceLayer.appendChild(p);
    this.placedPathById.set(region.id, p);
    return p;
  }

  // 放置后短暂高亮脉冲（描边发光），强化「放对了」的反馈
  pulsePlaced(id) {
    const p = this.placedPathById.get(id);
    if (!p) return;
    p.classList.add('glow');
    setTimeout(() => p.classList.remove('glow'), 1200);
  }

  // 在地图该省 home 处显示省名：persistent=true 常显，否则 1.5s 后淡出
  showPlacedName(region, persistent) {
    const t = svgEl('text', { class: 'placed-name', x: region.home[0], y: region.home[1] + 5 });
    t.textContent = region.short;
    this.pieceLayer.appendChild(t);
    this.placedNameById.set(region.id, t);
    if (!persistent) {
      setTimeout(() => {
        t.classList.add('fade');
        setTimeout(() => t.remove(), 500);
      }, 1500);
    }
  }

  // 切换「省名显示（辅助）」：控制练习模式轮廓名 + 挑战模式放对后的省名
  setNamesPersistent(on) {
    this._namesPersistent = on;
    this.showNames = on;
    if (this._practiceLabels) this.showGhostLabels(on); // 练习模式即时切换轮廓名
    this.placedNameById.forEach((t) => {
      if (on) {
        t.classList.remove('fade');
        t.style.animation = 'nameIn .25s ease-out forwards';
      } else {
        t.classList.add('fade');
        setTimeout(() => t.remove(), 500);
      }
    });
    if (!on) {
      setTimeout(() => {
        this.placedNameById.forEach((t, k) => {
          if (!t.isConnected) this.placedNameById.delete(k);
        });
      }, 600);
    }
  }

  // 切换关卡：替换数据并整体重建渲染
  setLevel(level) {
    this.level = level;
    this.total = level.regions.length;
    this.build();
  }

  // 重置：清空已放置碎片、按模式重建碎片托盘（重新洗牌）、恢复轮廓与标签
  reset(mode) {
    [...this.pieceLayer.children].forEach((c) => {
      if (c !== this.dragPath) c.remove();
    });
    this.placedPathById.clear();
    this.placedNameById.clear();
    this.ghostById.forEach((g) => g.classList.remove('filled', 'snap-target'));
    this._practiceLabels = mode === 'practice';
    this.buildTray(true);
    this.showGhostLabels(mode === 'practice' && this.showNames);
  }
}
