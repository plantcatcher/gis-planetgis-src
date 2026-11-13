// 拖拽控制器：处理碎片托盘 SVG 的指针事件（移动端多触点 + 桌面网格滚动）。
// 手势判定（pointerdown 后先不决定，等位移超过阈值，按主导方向一次性锁定）：
//   - 竖向为主（|dy| >= |dx|）-> 拾起碎片，拖到地图做吸附判定
//   - 横向为主               -> 平移碎片区浏览（即便按在碎片上也成立，解决旧版只能拖窄缝）
//   - 未达阈值抬起           -> 视为点击，无动作
// 锁定后本手势不再改变类型：手指来回摆动也不会「拖到一半变成翻页」。
// 桌面端（grid）托盘是竖向网格：横向滑动仍按平移处理（范围为 0），竖向滑动不拦截，
// 让浏览器原生滚动；但拖动碎片一律竖向拾取。
// 坐标系：地图内坐标经 viewport 的 CTM 换算，天然支持缩放与平移。
import { clientToSvg } from './geo.js';

const MOVE_THRESHOLD = 8; // 屏幕像素：位移小于此视为「点击」

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

export class DragController {
  constructor({ traySvg, mapSvg, mapViewport, renderer, engine, onPlace, onError }) {
    this.traySvg = traySvg;
    this.mapSvg = mapSvg;
    this.mapViewport = mapViewport;
    this.renderer = renderer;
    this.engine = engine;
    this.onPlace = onPlace;
    this.onError = onError;
    this.gesture = null; // 当前进行中的托盘手势（拖碎片 或 平移托盘）

    this.traySvg.addEventListener('pointerdown', (e) => this.onDown(e));
  }

  onDown = (e) => {
    if (this.gesture) return; // 已有手势进行中（含第二根手指按下）忽略
    const pieceEl = e.target.closest && e.target.closest('.tray-piece');
    let region = null;
    let grab = null;
    let index = -1;
    if (pieceEl) {
      const id = pieceEl.dataset.id;
      if (this.engine.isPlaced(id)) return;
      region = this.engine.regionById(id);
      // 抓取点相对「缩略图里真实轮廓」的坐标（0~1），拾起后碎片按同一点跟手，不跳位
      const pathEl = pieceEl.querySelector('.tray-thumb path');
      const rect = (pathEl || pieceEl).getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        grab = {
          rx: clamp01((e.clientX - rect.left) / rect.width),
          ry: clamp01((e.clientY - rect.top) / rect.height),
        };
      }
      index = this.renderer.trayIndexOf(id);
    }
    // 既没按在碎片上、也不是托盘底板的指针忽略
    const onTray = e.target === this.traySvg || !!(e.target.closest && e.target.closest('#trayContent'));
    if (!region && !onTray) return;

    e.preventDefault();
    this.gesture = {
      type: null, // 'drag' 拾起碎片 | 'pan' 平移托盘
      region,
      grab,
      index,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
    };
    try {
      this.traySvg.setPointerCapture(e.pointerId);
    } catch {}
    this.traySvg.addEventListener('pointermove', this.onMove);
    this.traySvg.addEventListener('pointerup', this.onUp);
    this.traySvg.addEventListener('pointercancel', this.onUp);
  };

  onMove = (e) => {
    const g = this.gesture;
    if (!g || e.pointerId !== g.pointerId) return;

    if (g.type === null) {
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      if (Math.hypot(dx, dy) < MOVE_THRESHOLD) return;
      // 主导方向锁定：竖向为主拾起碎片（桌面上碎片总是可以拖出），否则平移托盘
      const vertical = Math.abs(dy) >= Math.abs(dx);
      if (g.region && (vertical || this.renderer.grid)) {
        g.type = 'drag';
        this.renderer.beginDrag(g.region, g.grab);
        // 移动端：拖起即移出槽位，后面碎片自动前移补齐；桌面网格保留格位置灰
        this.renderer.removeTrayPiece(g.region.id);
      } else {
        g.type = 'pan';
      }
    }

    if (g.type === 'pan') {
      const dx = e.clientX - g.lastX;
      g.lastX = e.clientX;
      this.renderer.panTrayBy(dx);
      return;
    }

    const { x, y } = clientToSvg(this.mapSvg, this.mapViewport, e.clientX, e.clientY);
    this.renderer.moveDrag(g.region, x, y);
  };

  onUp = (e) => {
    const g = this.gesture;
    if (!g || e.pointerId !== g.pointerId) return;
    this.traySvg.removeEventListener('pointermove', this.onMove);
    this.traySvg.removeEventListener('pointerup', this.onUp);
    this.traySvg.removeEventListener('pointercancel', this.onUp);
    try {
      this.traySvg.releasePointerCapture(g.pointerId);
    } catch {}
    this.gesture = null;

    if (g.type !== 'drag') return; // 点击 / 平移结束，无需放置判定

    const cancelled = e.type === 'pointercancel';
    const within = !cancelled && this.renderer.dragWithin;
    // 只有「落在地图区域内但位置不对」才算失误；拖回碎片区、松手在标题栏等一律视为取消
    const mr = this.mapSvg.getBoundingClientRect();
    const overMap =
      e.clientX >= mr.left && e.clientX <= mr.right && e.clientY >= mr.top && e.clientY <= mr.bottom;
    this.renderer.setSnapTarget(g.region.id, false);
    this.renderer.endDrag();

    if (within) {
      this.engine.markPlaced(g.region.id);
      this.renderer.placePiece(g.region);
      this.renderer.setGhostFilled(g.region.id, true);
      this.renderer.markTrayUsed(g.region.id);
      this.onPlace && this.onPlace(g.region);
    } else {
      this.renderer.restoreTrayPiece(g.region.id, g.index);
      // 拖到地图上但放错位置才记失误；拖回托盘 / 系统取消不算
      if (!cancelled && overMap) this.onError && this.onError(g.region);
    }
  };
}
