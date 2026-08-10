// 拖拽控制器：处理碎片托盘 SVG 的指针事件。
// 1) 在碎片上按下 -> 拖到地图做吸附判定（拖动中的碎片渲染在地图 SVG 内）。
// 2) 在托盘空白处按下 -> 水平平移碎片区。
// 坐标系：地图内坐标经 viewport 的 CTM 换算，天然支持缩放与平移。
import { clientToSvg } from './geo.js';

const MOVE_THRESHOLD = 6; // 屏幕像素：小于此位移视为「点击」而非「拖动」

export class DragController {
  constructor({ traySvg, mapSvg, mapViewport, renderer, engine, onPlace, onError }) {
    this.traySvg = traySvg;
    this.mapSvg = mapSvg;
    this.mapViewport = mapViewport;
    this.renderer = renderer;
    this.engine = engine;
    this.onPlace = onPlace;
    this.onError = onError;
    this.active = null;
    this.pan = null;

    this.traySvg.addEventListener('pointerdown', (e) => this.onDown(e));
  }

  onDown = (e) => {
    if (this.active || this.pan) return;
    const pieceEl = e.target.closest('.tray-piece');
    if (pieceEl) {
      const id = pieceEl.dataset.id;
      if (this.engine.isPlaced(id)) return;
      const region = this.engine.regionById(id);
      e.preventDefault();
      this.active = {
        region,
        pieceEl,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        started: false,
      };
      try {
        this.traySvg.setPointerCapture(e.pointerId);
      } catch {}
      this.traySvg.addEventListener('pointermove', this.onMove);
      this.traySvg.addEventListener('pointerup', this.onUp);
      this.traySvg.addEventListener('pointercancel', this.onUp);
    } else {
      // 托盘空白 -> 平移
      e.preventDefault();
      this.pan = { pointerId: e.pointerId, lastX: e.clientX };
      try {
        this.traySvg.setPointerCapture(e.pointerId);
      } catch {}
      this.traySvg.addEventListener('pointermove', this.onPanMove);
      this.traySvg.addEventListener('pointerup', this.onPanUp);
      this.traySvg.addEventListener('pointercancel', this.onPanUp);
    }
  };

  onMove = (e) => {
    const a = this.active;
    if (!a) return;
    if (!a.started) {
      const moved = Math.hypot(e.clientX - a.startX, e.clientY - a.startY);
      if (moved < MOVE_THRESHOLD) return;
      a.started = true;
      this.renderer.beginDrag(a.region);
    }
    const { x, y } = clientToSvg(this.mapSvg, this.mapViewport, e.clientX, e.clientY);
    this.renderer.moveDrag(a.region, x, y);
  };

  onUp = (e) => {
    const a = this.active;
    if (!a) return;
    this.traySvg.removeEventListener('pointermove', this.onMove);
    this.traySvg.removeEventListener('pointerup', this.onUp);
    this.traySvg.removeEventListener('pointercancel', this.onUp);
    try {
      this.traySvg.releasePointerCapture(a.pointerId);
    } catch {}
    this.active = null;

    if (!a.started) return; // 仅点击，未拖动

    const { x, y } = clientToSvg(this.mapSvg, this.mapViewport, e.clientX, e.clientY);
    const near = this.renderer.nearestHome(x, y);
    const threshold = this.renderer.thresholdById.get(a.region.id) || 60;
    const within = near.id === a.region.id && near.dist < threshold;
    this.renderer.setSnapTarget(a.region.id, false);
    this.renderer.endDrag();

    if (within) {
      this.engine.markPlaced(a.region.id);
      this.renderer.placePiece(a.region);
      this.renderer.setGhostFilled(a.region.id, true);
      this.renderer.markTrayUsed(a.region.id);
      this.onPlace && this.onPlace(a.region);
    } else {
      this.renderer.hideTrayPiece(a.region.id, false); // 放回托盘
      this.onError && this.onError(a.region);
    }
  };

  onPanMove = (e) => {
    if (!this.pan) return;
    const dx = e.clientX - this.pan.lastX;
    this.pan.lastX = e.clientX;
    this.renderer.panTrayBy(dx);
  };

  onPanUp = (e) => {
    if (!this.pan) return;
    this.traySvg.removeEventListener('pointermove', this.onPanMove);
    this.traySvg.removeEventListener('pointerup', this.onPanUp);
    this.traySvg.removeEventListener('pointercancel', this.onPanUp);
    try {
      this.traySvg.releasePointerCapture(this.pan.pointerId);
    } catch {}
    this.pan = null;
  };
}
