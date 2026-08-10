/**
 * games-sync.js —— 地理小游戏 ↔ 主站「我的学习」成绩打通桥
 * ---------------------------------------------------------------------------
 * 三个游戏以 iframe 同源（planetgis.cn）嵌入主站。本脚本由三个游戏的页面
 * 通过 <script src="/games-sync.js"> 引入，负责把每局成绩写入主站本地学习
 * 档案（localStorage['planetgis:learning:v1'] 的 games.records）。
 *
 * 主站 learningStore 监听 storage / message 事件，写入后会即时刷新顶层窗口。
 *
 * 接入方式：
 *   - geoquiz / geotype（源码可改）：在结算处直接调用
 *       window.PlanetLearning.recordGame({ gameId, title, subtitle, score, total })
 *   - geoshape（打包产物，不可改源码）：本脚本包装 localStorage.setItem，
 *       侦测 geoshape:v1 的 completions 自增，用累计 correct/attempts 差值
 *       还原「本局」成绩，无需触碰 bundle。
 */
(function () {
  'use strict';

  var LEARNING_KEY = 'planetgis:learning:v1';
  var GEOSHAPE_KEY = 'geoshape:v1';
  var MAX_RECORDS = 100;

  // ---------------------------------------------------------------------------
  // 写入主站学习档案
  // ---------------------------------------------------------------------------
  function readLearning() {
    try {
      var raw = localStorage.getItem(LEARNING_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function notifyParent() {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ __planetLearningUpdate: true }, '*');
      }
    } catch (e) {}
  }

  function writeLearning(data) {
    try {
      localStorage.setItem(LEARNING_KEY, JSON.stringify(data));
    } catch (e) {}
    notifyParent();
  }

  /**
   * 记录一条游戏成绩。
   * @param {object} opts
   *   gameId   {string}  'geoquiz' | 'geoshape' | 'geotype'
   *   title    {string}  展示标题
   *   subtitle {string=} 副标题（如「答对 12 / 15」、人格类型名）
   *   score    {number|null} 数值成绩；人格类游戏传 null
   *   total    {number=}  满分 / 总题数
   */
  function recordGame(opts) {
    if (!opts || !opts.gameId) return;
    var data = readLearning() || { games: { records: [] } };
    if (!data.games) data.games = { records: [] };
    if (!Array.isArray(data.games.records)) data.games.records = [];

    var nowIso = new Date().toISOString();
    var recs = data.games.records;

    // 轻量去重：同一游戏、同分数、2 秒内不重复落库（防重渲染/重复调用）
    var last = recs[recs.length - 1];
    var sameScore = last && last.score === (opts.score == null ? null : opts.score);
    if (
      last &&
      last.gameId === opts.gameId &&
      sameScore &&
      Math.abs(new Date(last.takenAt).getTime() - new Date(nowIso).getTime()) < 2000
    ) {
      return;
    }

    recs.push({
      id: opts.gameId + ':' + Date.now(),
      gameId: opts.gameId,
      title: opts.title || '',
      subtitle: opts.subtitle || '',
      score: opts.score == null ? null : opts.score,
      total: opts.total == null ? null : opts.total,
      takenAt: nowIso,
    });

    if (recs.length > MAX_RECORDS) {
      data.games.records = recs.slice(recs.length - MAX_RECORDS);
    }
    writeLearning(data);
  }

  // ---------------------------------------------------------------------------
  // geoshape 自动捕获：用累计 stats 差值还原本局成绩（不改 bundle）
  // ---------------------------------------------------------------------------
  function readGeoshapeBaseline() {
    try {
      var raw = localStorage.getItem(GEOSHAPE_KEY);
      if (!raw) return { completions: 0, correct: 0, attempts: 0 };
      var d = JSON.parse(raw);
      var s = d.stats || {};
      return {
        completions: s.completions || 0,
        correct: s.correct || 0,
        attempts: s.attempts || 0,
      };
    } catch (e) {
      return { completions: 0, correct: 0, attempts: 0 };
    }
  }

  var base = readGeoshapeBaseline();

  function onGeoshapeWrite(value) {
    // 仅在「直接打开 geoshape（顶层窗口）」时由本脚本落库；
    // 若以 iframe 嵌入主站，则交给主站 learningStore 的 geoshape:v1
    // storage 监听统一处理，避免同一局被写两次。
    if (window.parent && window.parent !== window) return;
    try {
      var d = JSON.parse(value);
      var s = d.stats || {};
      var comp = s.completions || 0;
      var corr = s.correct || 0;
      var att = s.attempts || 0;
      if (comp > base.completions) {
        var dCorrect = Math.max(0, corr - base.correct);
        var dAttempts = Math.max(0, att - base.attempts);
        recordGame({
          gameId: 'geoshape',
          title: 'GeoShape · 看国家轮廓猜国家',
          subtitle: '',
          score: dCorrect,
          total: dAttempts,
        });
        base = { completions: comp, correct: corr, attempts: att };
      }
    } catch (e) {}
  }

  // 包装 setItem：仅在写入 geoshape:v1 时处理。其余游戏页面加载本脚本时
  // key 不匹配，自动跳过，零副作用。
  try {
    var origSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === GEOSHAPE_KEY) {
        try {
          onGeoshapeWrite(value);
        } catch (e) {}
      }
      return origSetItem.apply(this, arguments);
    };
  } catch (e) {}

  window.PlanetLearning = { recordGame: recordGame };
})();
