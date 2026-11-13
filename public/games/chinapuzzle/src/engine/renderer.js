// 渲染层：把关卡数据画成 SVG（目标轮廓 / 碎片 / 九段线插图）
// 以及底部碎片区（同一 Coordinate 体系内的独立 SVG 托盘，支持左右滑动）。
// 所有坐标均使用关卡 viewBox 坐标系。
import { provinceColor, shuffle, effectivePath } from './geo.js';

const SVGNS = 'http://www.w3.org/2000/svg';

// 碎片托盘布局参数（单位 = 托盘 SVG 用户坐标）
// 移动端 viewBox 宽度不按固定值，而是 = 实际像素宽 / TRAY_SCALE：
// 让碎片在屏幕上接近原生尺寸渲染（旧版固定 1000 宽，在手机上把碎片压到 ~23px）。
const TRAY_SCALE = 0.9; // 渲染比例：1 托盘单位 ≈ 0.9 CSS px → 68px 碎片 ≈ 61px
const TRAY_VB_H = 130;
const SLOT = 80;   // 槽位宽度（缩略图居中放置，留两侧空隙）
const GAP = 10;
const PAD = 16;
const TOP = 12;
const THUMB = 68;

function svgEl(tag, attrs = {}) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export class Renderer {
  constructor({ svg, viewport, bgLayer, ghostLayer, pieceLayer, traySvg, trayContent, dragViewport, level }) {
    this.svg = svg;
    this.viewport = viewport;
    this.dragViewport = dragViewport; // 全屏拖拽覆盖层里承载拖动碎片的分组
    this.bgLayer = bgLayer;
    this.ghostLayer = ghostLayer;
    this.pieceLayer = pieceLayer;
    this.traySvg = traySvg;
    this.trayContent = trayContent;
    this.level = level;
    this.total = level.regions.length;
    this.colorById = new Map();
    this.pathById = new Map(); // 有效渲染路径（过小行政区会被等比放大）
    this.thresholdById = new Map();
    this.bboxById = new Map();
    this.ghostById = new Map();
    this.labelById = new Map();
    this.placedPathById = new Map();
    this.placedNameById = new Map();
    this.dragPath = null;
    this.trayPan = 0;
    this.trayMinTx = 0;
    this.trayMaxTx = 0;
    this.trayVbW = 1000;
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

    this.traySvg.setAttribute('viewBox', `0 0 1000 ${TRAY_VB_H}`); // 初值，buildTray 里按实际宽度重算
    this.traySvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    this.colorById.clear();
    this.placedPathById.clear();
    this.placedNameById.clear();
    this.level.regions.forEach((r, i) => this.colorById.set(r.id, provinceColor(i, this.total)));

    this.drawBackground();
    this.drawGhosts();
    this.measureThresholds();
    this.buildTray(true);

    // 重建时清空已放置碎片层（避免重玩残留）
    this.pieceLayer.innerHTML = '';
    // 拖动碎片放在全屏覆盖层：不受地图容器裁剪、也不会被碎片区盖住（跨浏览器稳妥）
    this.dragViewport.innerHTML = '';
    this.dragPath = svgEl('path', { class: 'piece dragging', visibility: 'hidden' });
    this.dragViewport.appendChild(this.dragPath);
  }

  // 把覆盖层的坐标系对齐地图 viewport：viewport.getScreenCTM() 是「地图坐标 -> 屏幕像素」，
  // 覆盖层没有 viewBox，用户单位就是 CSS 像素，所以直接用这个矩阵即可。
  _syncDragCTM() {
    const m = this.viewport.getScreenCTM();
    if (!m) return;
    this.dragViewport.setAttribute(
      'transform',
      `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`
    );
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
      const p = svgEl('path', { d: this.pathOf(r) });
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
    // 已放置的区域不进托盘：跨断点重建 / 换关卡时不能把拼好的碎片又摆回来
    const remaining = this.level.regions.filter((r) => !this.placedPathById.has(r.id));
    if (reshuffle || this.trayOrder.length !== remaining.length) {
      this.trayOrder = shuffle(remaining);
    }
    // 元素按队列顺序创建，位置统一交给 _reflowTray 排（空位补齐也走它）
    this.trayOrder.forEach((r) => this._trayPiece(r, 0, 0));
    this._reflowTray();
    this.setTrayLabels(this._practiceLabels);
  }

  // 移动端托盘可见窗口宽度（viewBox 用户单位）与平移边界
  _measureTrayWindow() {
    this.trayVbW = Math.max(240, this.traySvg.clientWidth / TRAY_SCALE);
    const over = this.trayVbW - this.trayContentWidth;
    this.trayMinTx = Math.min(0, over);
    this.trayMaxTx = Math.max(0, over);
  }

  _trayPiece(r, x, y) {
    const bbox = this.bboxById.get(r.id) || { x: 0, y: 0, width: 10, height: 10 };
    const vb = `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`;
    const g = svgEl('g', { class: 'tray-piece', 'data-id': r.id, transform: `translate(${x} ${y})` });
    const ox = (SLOT - THUMB) / 2; // 缩略图在槽位内水平居中
    // 透明命中区：覆盖整个槽位（含标签上方空隙），保证小省也能整块点中
    g.appendChild(svgEl('rect', { x: 0, y: 0, width: SLOT, height: THUMB + 28, fill: 'transparent' }));
    const thumb = svgEl('svg', {
      class: 'tray-thumb',
      x: ox,
      y: 0,
      width: THUMB,
      height: THUMB,
      viewBox: vb,
      preserveAspectRatio: 'xMidYMid meet',
    });
    const path = svgEl('path', { d: this.pathOf(r), fill: this.colorOf(r.id) });
    thumb.appendChild(path);
    const label = svgEl('text', { class: 'tray-label', x: SLOT / 2, y: THUMB + 19 });
    label.textContent = r.short;
    g.appendChild(thumb);
    g.appendChild(label);
    this.trayContent.appendChild(g);
    return g;
  }

  applyTrayViewBox() {
    const vbW = this.grid ? this.trayContentWidth : this.trayVbW;
    const vbH = this.grid ? this.trayContentHeight : TRAY_VB_H;
    this.traySvg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
    this.traySvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }

  // 视口尺寸变化时重算移动端托盘窗口（保持渲染比例不变，只改可见宽度）
  updateTrayView() {
    if (this.grid || !this.level || !this.trayContentWidth) return;
    this._measureTrayWindow();
    this.trayPan = clamp(this.trayPan, this.trayMinTx, this.trayMaxTx);
    this.applyTrayPan();
    this.applyTrayViewBox();
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
    if (this.trayContentWidth <= this.trayVbW) return; // 内容不足一屏：居中固定，不做滑动
    const scale = this.traySvg.clientWidth / this.trayVbW || TRAY_SCALE;
    this.trayPan = clamp(this.trayPan + dxPixels / scale, this.trayMinTx, this.trayMaxTx);
    this.applyTrayPan();
  }

  setTrayLabels(show) {
    this._practiceLabels = show;
    if (this.trayContent) this.trayContent.classList.toggle('hide-labels', !show);
  }

  regionById(id) {
    return this.level.regions.find((r) => r.id === id);
  }

  // 取某区域的「有效渲染路径」：单维过小的行政区（澳门/香港）围绕 home 等比放大，
  // 既保留真实轮廓、又清晰可见、可拖动。
  pathOf(r) {
    if (!this.pathById.has(r.id)) {
      this.pathById.set(r.id, effectivePath(r));
    }
    return this.pathById.get(r.id);
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

  // 某碎片在托盘队列中的下标（拖起前记录，放回时用）
  trayIndexOf(id) {
    return this.trayOrder.findIndex((r) => r.id === id);
  }

  // 拖走 / 放对后从托盘移除该碎片，并把后面的碎片整体前移补齐空位。
  // 移动端横排与桌面网格同一套逻辑（都补齐，不留坑位）。
  removeTrayPiece(id) {
    const el = this.trayContent.querySelector(`.tray-piece[data-id="${id}"]`);
    if (!el) return;
    this.trayOrder = this.trayOrder.filter((r) => r.id !== id);
    el.remove();
    this._reflowTray();
  }

  // 拖出但未放对（取消/放错）时把碎片插回原下标位置，其余碎片顺次让位
  restoreTrayPiece(id, index = -1) {
    const region = this.level.regions.find((r) => r.id === id);
    if (!region) return;
    if (this.trayOrder.some((r) => r.id === id)) {
      this.hideTrayPiece(id, false);
      return;
    }
    const at = index < 0 || index > this.trayOrder.length ? this.trayOrder.length : index;
    const nextId = this.trayOrder[at] && this.trayOrder[at].id;
    this.trayOrder.splice(at, 0, region);
    const g = this._trayPiece(region, 0, 0);
    g.classList.remove('hidden', 'used');
    // DOM 顺序与 trayOrder 保持一致，拖出再放回时碎片回到原位
    if (nextId) {
      const ref = this.trayContent.querySelector(`.tray-piece[data-id="${nextId}"]`);
      if (ref && ref.parentNode === this.trayContent) this.trayContent.insertBefore(g, ref);
    }
    this._reflowTray();
  }

  // 按 trayOrder 统一重排：桌面三列网格 / 移动端单行横排。
  // 每次拖走、放回、换布局都走这里，保证「空位自动补齐」与两种布局一致。
  _reflowTray() {
    const COL = 3;
    const ROW = 106; // 网格单格垂直步距（缩略图 68 + 标签 + 间距）
    if (this.grid) {
      this.trayOrder.forEach((r, i) => {
        const el = this.trayContent.querySelector(`.tray-piece[data-id="${r.id}"]`);
        if (!el) return;
        const c = i % COL;
        const rowN = Math.floor(i / COL);
        el.setAttribute('transform', `translate(${PAD + c * (SLOT + GAP)} ${TOP + rowN * ROW})`);
      });
      const rows = Math.ceil(this.trayOrder.length / COL);
      this.trayContentWidth = PAD * 2 + COL * (SLOT + GAP) - GAP;
      this.trayContentHeight = TOP + Math.max(rows, 1) * ROW + 8;
      this.trayVbW = this.trayContentWidth;
      this.trayMinTx = 0;
      this.trayMaxTx = 0;
      this.trayPan = 0;
    } else {
      let x = PAD;
      this.trayOrder.forEach((r) => {
        const el = this.trayContent.querySelector(`.tray-piece[data-id="${r.id}"]`);
        if (!el) return;
        el.setAttribute('transform', `translate(${x} ${TOP})`);
        x += SLOT + GAP;
      });
      this.trayContentWidth = x - GAP + PAD;
      this.trayContentHeight = TRAY_VB_H;
      this._measureTrayWindow();
      // 剩得不足一屏时居中，否则维持当前滑动位置（越界则夹回边界）
      this.trayPan = this.trayContentWidth <= this.trayVbW
        ? this.trayMaxTx / 2
        : clamp(this.trayPan, this.trayMinTx, this.trayMaxTx);
    }
    this.applyTrayPan();
    this.applyTrayViewBox();
  }

  markTrayUsed(id) {
    this.removeTrayPiece(id); // 拖起时通常已移出托盘，这里兜底
  }

  // 开始拖动：准备拖动碎片（渲染在地图 SVG 中），并隐藏托盘中被拖出的碎片。
  // grab = { rx, ry }：手指按在缩略图内的相对位置（0~1），用于「抓哪跟哪」，避免拾起瞬间跳位。
  beginDrag(region, grab) {
    const b = this.bboxById.get(region.id) || { x: region.home[0], y: region.home[1], width: 10, height: 10 };
    this.dragBBox = b;
    this.dragGrab = grab || { rx: 0.5, ry: 0.5 };
    this.dragWithin = false;
    this.dragPath.setAttribute('d', this.pathOf(region));
    this.dragPath.setAttribute('fill', this.colorOf(region.id));
    this._syncDragCTM();
    this.dragPath.setAttribute('visibility', 'visible');
    this.hideTrayPiece(region.id, true);
  }

  // 把碎片摆到「手指对应的那块位置」并返回是否进入吸附阈值。
  // 吸附只看碎片自身平移量（translate 归零即与目标轮廓完全重合），
  // 不再用「离谁最近」，因此不会被相邻省份抢走，判定也和小省形状无关。
  moveDrag(region, mx, my) {
    const b = this.dragBBox || { x: 0, y: 0, width: 1, height: 1 };
    const gx = b.x + this.dragGrab.rx * b.width;
    const gy = b.y + this.dragGrab.ry * b.height;
    const tx = mx - gx;
    const ty = my - gy;
    this._syncDragCTM(); // 拖动中若地图被缩放/平移（第二根手指），覆盖层同步跟随
    this.dragPath.setAttribute('transform', `translate(${tx} ${ty})`);
    const threshold = this.thresholdById.get(region.id) || 60;
    const within = Math.hypot(tx, ty) < threshold;
    this.dragWithin = within;
    this.setSnapTarget(region.id, within);
    return within;
  }

  endDrag() {
    this.dragPath.setAttribute('visibility', 'hidden');
    this.dragPath.removeAttribute('transform');
    this.dragBBox = null;
    this.dragGrab = null;
  }

  // 成功放置：生成一个常驻的已放置碎片
  placePiece(region) {
    const p = svgEl('path', {
      class: 'piece placed piece-pop',
      d: this.pathOf(region),
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
