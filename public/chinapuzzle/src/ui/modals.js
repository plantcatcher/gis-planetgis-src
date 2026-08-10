// UI 层：弹窗与提示。负责填充内容并回传按钮事件给上层(main)。
import { formatTime } from '../engine/scoreStore.js';

export class Modals {
  constructor(handlers) {
    this.h = handlers || {};
    this.cardModal = document.getElementById('cardModal');
    this.resultModal = document.getElementById('resultModal');
    this.settingsModal = document.getElementById('settingsModal');
    this.toastEl = document.getElementById('toast');
    this._toastTimer = null;
    this.wire();
  }

  wire() {
    document.getElementById('cardClose').addEventListener('click', () => {
      this.h.onClick && this.h.onClick();
      const suppress = document.getElementById('cardSuppress').checked;
      this.hide(this.cardModal);
      this.h.onCloseCard && this.h.onCloseCard(suppress);
    });
    document.getElementById('resultClose').addEventListener('click', () => {
      this.h.onClick && this.h.onClick();
      this.hide(this.resultModal);
      this.h.onCloseResult && this.h.onCloseResult();
    });
    document.getElementById('resultReplay').addEventListener('click', () => {
      this.h.onClick && this.h.onClick();
      this.hide(this.resultModal);
      this.h.onReplay && this.h.onReplay();
    });
    // 设置弹窗
    document.getElementById('settingsClose').addEventListener('click', () => {
      this.h.onClick && this.h.onClick();
      this.hide(this.settingsModal);
    });
    // 开关：音效 / 知识卡 / 省名
    const bindToggle = (id, cb) => {
      document.getElementById(id).addEventListener('click', (e) => {
        const t = e.currentTarget.querySelector('.set-toggle');
        const on = !t.classList.contains('on');
        t.classList.toggle('on', on);
        cb(on);
        this.h.onClick && this.h.onClick(); // 放 cb 之后：取消静音能听到反馈，静音则随 master 静音
      });
    };
    bindToggle('setAudio', (on) => this.h.onToggleAudio && this.h.onToggleAudio(on));
    bindToggle('setBGM', (on) => this.h.onToggleBGM && this.h.onToggleBGM(on));
    bindToggle('setCards', (on) => this.h.onToggleCards && this.h.onToggleCards(on));
    bindToggle('setNames', (on) => this.h.onToggleNames && this.h.onToggleNames(on));
    // 重新打乱
    document.getElementById('setReshuffle').addEventListener('click', () => {
      this.h.onClick && this.h.onClick();
      this.h.onReshuffle && this.h.onReshuffle();
    });
  }

  show(m) { m.classList.remove('hidden'); }
  hide(m) { m.classList.add('hidden'); }

  showSettings(opts = {}) {
    const o = opts || {};
    // 开关初始态（作用于内部 .set-toggle，CSS 以 .set-toggle.on 渲染）
    document.querySelector('#setAudio .set-toggle').classList.toggle('on', o.muted === false);
    document.querySelector('#setBGM .set-toggle').classList.toggle('on', o.bgm === false);
    document.querySelector('#setCards .set-toggle').classList.toggle('on', o.suppress === false);
    document.querySelector('#setNames .set-toggle').classList.toggle('on', o.names !== false);
    // "重新打乱"仅游戏中有效：首页打开设置时隐藏
    document.getElementById('setReshuffle').classList.toggle('hidden', o.inGame !== true);
    this.show(this.settingsModal);
  }

  showCard(region, suppress) {
    document.getElementById('cardTitle').textContent = `${region.name} 完成！`;
    const m = region.meta;
    const items = [
      { k: '简称', v: m.abbr },
      { k: '省会', v: m.capital },
      { k: '面积', v: m.area },
      { k: '人口', v: m.population },
      { k: '特色', v: m.feature, full: true },
    ];
    document.getElementById('cardGrid').innerHTML = items
      .map(
        (it) =>
          `<div class="card-item${it.full ? ' full' : ''}"><div class="k">${it.k}</div><div class="v">${it.v}</div></div>`
      )
      .join('');
    document.getElementById('cardSuppress').checked = !!suppress;
    this.show(this.cardModal);
  }

  showResult({ mode, time, errors, score, recent, total }) {
    // 评级：以失误次数为主，兼顾挑战用时
    let stars, gLabel, gCls;
    if (errors === 0) { stars = 5; gLabel = '完美零失误'; gCls = 's'; }
    else if (errors <= 2) { stars = 4; gLabel = '非常熟练'; gCls = 'a'; }
    else if (errors <= 5) { stars = 3; gLabel = '表现良好'; gCls = 'b'; }
    else if (errors <= 10) { stars = 2; gLabel = '仍需练习'; gCls = 'c'; }
    else { stars = 1; gLabel = '继续加油'; gCls = 'd'; }
    const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);

    const stats = [
      { num: formatTime(time), lab: '完成用时' },
      { num: errors, lab: '失误次数' },
      { num: total, lab: '拼图区块' },
    ];
    document.getElementById('resultStats').innerHTML = stats
      .map((s) => `<div class="stat"><div class="num">${s.num}</div><div class="lab">${s.lab}</div></div>`)
      .join('');

    const gradeEl = document.getElementById('resultGrade');
    if (gradeEl) gradeEl.innerHTML = `<span class="grade-badge g-${gCls}">${starStr} ${gLabel}</span>`;

    let best = '';
    if (score) {
      if (mode === 'challenge') {
        if (score.bestTime != null) best += `最佳用时 <b>${formatTime(score.bestTime)}</b> · `;
        if (score.minErrors != null) best += `最少失误 <b>${score.minErrors}</b> · `;
        const ch = (score.history || []).filter((h) => h.mode === 'challenge');
        if (ch.length) {
          const avg = Math.round(ch.reduce((a, h) => a + h.time, 0) / ch.length);
          best += `平均用时 <b>${formatTime(avg)}</b> · `;
        }
      } else {
        const minErr = (score.history || []).length
          ? Math.min(...score.history.map((h) => h.errors)) : null;
        if (minErr != null) best += `历史最少失误 <b>${minErr}</b> · `;
      }
      best += `累计完成 <b>${score.plays}</b> 次`;
    }
    document.getElementById('resultBest').innerHTML = best || '成绩已保存';

    const hist = (recent || []).map((r, i) => {
      const tag = r.mode === 'challenge' ? '挑战' : '练习';
      const dt = new Date(r.at);
      const d = `${dt.getMonth() + 1}/${dt.getDate()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      return `<div class="hist-row"><span class="h-i">#${i + 1}</span><span>${formatTime(r.time)}</span><span>误${r.errors}</span><span>${tag}</span><span class="h-t">${d}</span></div>`;
    }).join('');
    const he = document.getElementById('resultHistory');
    if (he) he.innerHTML = hist || '<div class="hist-empty">暂无历史记录</div>';

    this.show(this.resultModal);
  }

  toast(msg, ms = 900) {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('show');
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toastEl.classList.remove('show'), ms);
  }
}
