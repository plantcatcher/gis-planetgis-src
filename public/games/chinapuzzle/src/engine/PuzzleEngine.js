// 拼图状态模型（与 DOM 解耦，纯逻辑）。
import { shuffle } from './geo.js';

export class PuzzleEngine {
  constructor(level) {
    this.level = level;
    this.total = level.regions.length;
    this.placed = new Set();
    this.order = shuffle(level.regions.map((r) => r.id));
  }

  regionById(id) {
    return this.level.regions.find((r) => r.id === id);
  }

  isPlaced(id) {
    return this.placed.has(id);
  }

  markPlaced(id) {
    this.placed.add(id);
  }

  setLevel(level) {
    this.level = level;
    this.total = level.regions.length;
    this.reset();
  }

  reset() {
    this.placed.clear();
    this.order = shuffle(this.level.regions.map((r) => r.id));
  }

  progress() {
    return this.placed.size;
  }

  isComplete() {
    return this.placed.size === this.total;
  }
}
