/*!
 * 独立地图/游戏应用 · 共享运行时英译层（由 scripts/gen-map-i18n.mjs 生成，请勿手改）
 *
 * 触发：URL 带 ?lang=en。主站英文 locale 下 MapEmbed/GameEmbed 会自动追加该参数；
 *       中文站访问时脚本首行即返回，零副作用。
 *
 * 机制：
 *   ① 元素级精确匹配——自顶向下遍历，textContent 归一化（去空白、去首尾图标字符）
 *      后命中词典，即整段替换 innerHTML（译文可含 <b> 等标记）。
 *      含 id 后裔的元素只下沉不整换，避免破坏应用 JS 的 DOM 钩子。
 *   ② 属性翻译——title / placeholder / aria-label。
 *   ③ 子串模式——应用 JS 运行时拼接的片段（如「首府：」「原名：」「属 」），
 *      按 key 长度降序在文本节点内替换。
 *   ④ MutationObserver——首扫之后后写的文本/节点同样被翻译（图例、详情卡、
 *      提示、错误信息），characterData 与 childList 都监听。
 *   ⑤ 站内链接——a[href^='/'] 补 /en 前缀，英文用户留在英文站；
 *      静态资源与 _shared 路径不碰。
 *   ⑥ <html lang> 与 document.title 同步切换（title 命中词典才换）。
 *   ⑦ 应用作用域词典——按当前路径（/maps/<slug>/ 或 /games/<slug>/）载入该应用
 *      专属词典，优先级高于全局词典。用于游戏数据层（国名 / 省名 / 题库）：
 *      这些词只在对应游戏里译成英文，绝不污染 82 个地图应用的中文地名。
 *
 * 词典源：scripts/i18n-maps-src/*.json（chrome / regions / apps / games 全局）
 *       + scripts/i18n-maps-src/apps/<slug>.json（应用作用域）。
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var qs = new URLSearchParams(window.location.search);
  if (qs.get('lang') !== 'en') return;
  // 供共享应用脚本（regions-app.js 等）做数字格式 / 图例文案的英文分支
  window.__mapI18nOn = true;

  var DICT = /*__DICT__*/null;

  // ── 归一化 ─────────────────────────────────────────────
  // 图标字符只从首尾剥离子串（中间的「·」是有意义的分隔符，保留）。
  var EDGE_ICON = /^[\u2039\u203a\u00ab\u00bb\u25c9\u2715\u2716\uff0d\u2013\u2014\u00d7\u00f7\u25cb\u25cf\u25a0\u25a1\u25b3\u25b2\u25c7\u25c6\u2605\u2606\u2606\u203b\u00a7\u00b6\u2022\u{1F50A}\u{1F3B5}\u{1F4E4}\u{1F4DA}\u{1F4CD}\u{1F50D}\u{1F4A1}\u21bb\u2b07\u{1F9EA}\u{1F3F7}]+|[\u2039\u203a\u00ab\u00bb\u25c9\u2715\u2716\uff0d\u2013\u2014\u00d7\u00f7\u25cb\u25cf\u25a0\u25a1\u25b3\u25b2\u25c7\u25c6\u2605\u2606\u2606\u203b\u00a7\u00b6\u2022\u{1F50A}\u{1F3B5}\u{1F4E4}\u{1F4DA}\u{1F4CD}\u{1F50D}\u{1F4A1}\u21bb\u2b07\u{1F9EA}\u{1F3F7}]+$/gu;
  function norm(s) {
    if (s == null) return '';
    return String(s).replace(/[\s\u3000]+/g, '').replace(EDGE_ICON, '');
  }

  var exact = Object.create(null);   // 归一化 key -> 译文（可含标记）
  var subMap = Object.create(null);  // 原文 key -> 译文
  var subs = [];                     // [[原文 key, 译文], ...] 长度降序
  var stats = { exact: 0, sub: 0, links: 0 };

  function indexDict(dict, override) {
    var i, k, nk;
    for (k in (dict.exact || {})) {
      nk = norm(k);
      if (!nk) continue;
      if (override) exact[nk] = dict.exact[k];        // 应用作用域覆盖全局
      else if (!(nk in exact)) exact[nk] = dict.exact[k];
    }
    // 子串键用原文（不归一化）：'属 ' 依赖空格与「属于」区分，
    // 而归一化会把 '首府：' 之类无空白键原样保留，两边都安全。
    for (k in (dict.sub || {})) {
      if (!k) continue;
      if (override) subMap[k] = dict.sub[k];
      else if (!(k in subMap)) subMap[k] = dict.sub[k];
    }
  }

  // 应用作用域词典：按当前路径解析 slug，只在该应用内生效。
  // 例：/maps/cn-plains/index.html -> 'cn-plains'；/games/geoshape/index.html -> 'geoshape'
  function currentApp() {
    var m = /\/(?:maps|games)\/([A-Za-z0-9_-]+)\//.exec(window.location.pathname);
    return m ? m[1] : '';
  }

  var appSub = [];                   // 应用专属 sub（优先于全局）

  function indexAppDict(slug) {
    var apps = DICT.apps || {};
    var d = apps[slug];
    if (!d) return;
    indexDict(d, true);
    // 应用 sub 单独收集，替换时先于全局 sub 生效
    for (var k in (d.sub || {})) {
      if (k) appSub.push([k, d.sub[k]]);
    }
    appSub.sort(function (a, b) { return b[0].length - a[0].length; });
  }

  // ── 文本节点子串替换 ───────────────────────────────────
  // 含 CJK 统一表意文字才尝试（纯英文/数字串直接跳过，省开销）
  var HAS_CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
  function subText(s) {
    if (!s || !HAS_CJK.test(s)) return s;
    for (var i = 0; i < appSub.length; i++) {
      if (s.indexOf(appSub[i][0]) !== -1) s = s.split(appSub[i][0]).join(appSub[i][1]);
    }
    for (var j = 0; j < subs.length; j++) {
      if (s.indexOf(subs[j][0]) !== -1) s = s.split(subs[j][0]).join(subs[j][1]);
    }
    return s;
  }

  // ── 元素级精确替换（自顶向下，命中即停）────────────────
  // 含 id 后裔的元素不整段替换：应用 JS 靠 id 取 DOM，innerHTML 会摘掉钩子。
  function translateNode(node) {
    if (node.nodeType === 3) {                       // 文本节点
      var tv = node.nodeValue || '';
      var nt = norm(tv);
      if (nt && exact[nt] != null) { node.nodeValue = exact[nt]; stats.exact++; return; }
      var t = subText(tv);
      if (t !== tv) { node.nodeValue = t; stats.sub++; }
      return;
    }
    if (node.nodeType !== 1) return;                 // 仅元素节点
    var tag = node.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return;
    if (node.hasAttribute && node.hasAttribute('data-i18n-skip')) return;

    // 属性
    var attrs = ['title', 'placeholder', 'aria-label'];
    for (var i = 0; i < attrs.length; i++) {
      var av = node.getAttribute(attrs[i]);
      if (!av) continue;
      var nav = norm(av);
      if (nav && exact[nav] != null) {
        node.setAttribute(attrs[i], exact[nav]);
        stats.exact++;
      } else {
        var sv = subText(av);
        if (sv !== av) { node.setAttribute(attrs[i], sv); stats.sub++; }
      }
    }

    // 站内链接补 /en 前缀
    if (tag === 'A') {
      var href = node.getAttribute('href');
      if (href && href.charAt(0) === '/' && !/^\/(shared|maps\/_shared|games\/_shared)\//.test(href)
          && !/\.(js|css|json|png|jpe?g|svg|webp|avif|ico|woff2?|html?)(\?|#|$)/i.test(href)) {
        node.setAttribute('href', '/en' + href);
        stats.links++;
      }
    }

    // title 元素
    if (tag === 'TITLE') {
      var nt = norm(node.textContent);
      if (nt && exact[nt] != null) node.textContent = exact[nt];
      return;
    }

    // 整段精确匹配
    var full = node.textContent || '';
    var nf = norm(full);
    if (nf && exact[nf] != null) {
      // 仅当存在「带 id 的子元素」时才不下沉到整段替换：元素自身带 id 但无 id 子元素时，
      // innerHTML 替换会保留自身 id（id 在元素本身），不会摘掉应用的 DOM 钩子。
      var hasIdChild = false;
      for (var c = node.firstElementChild; c; c = c.nextElementSibling) {
        if (c.id || c.querySelector('[id]')) { hasIdChild = true; break; }
      }
      if (node.childElementCount === 0 || !hasIdChild) {
        node.innerHTML = exact[nf];
        stats.exact++;
        return;                                     // 子树已是译文，不再下沉
      }
    }
    // 下沉
    var kids = node.childNodes;
    for (var j = 0; j < kids.length; j++) translateNode(kids[j]);
  }

  // ── MutationObserver ───────────────────────────────────
  var busy = false;
  function onMutations(muts) {
    if (busy) return;
    busy = true;
    try {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'attributes') {
          translateNode(m.target);
        } else if (m.type === 'characterData') {
          var p = m.target.parentElement;
          if (p) translateNode(p);
        } else {
          for (var j = 0; j < m.addedNodes.length; j++) translateNode(m.addedNodes[j]);
        }
      }
    } finally {
      busy = false;
    }
  }

  // ── 启动 ───────────────────────────────────────────────
  indexDict(DICT, false);
  // 全局 sub 排序（长度降序）
  for (var _k in subMap) if (_k) subs.push([_k, subMap[_k]]);
  subs.sort(function (a, b) { return b[0].length - a[0].length; });
  // 应用作用域词典（覆盖全局）
  indexAppDict(currentApp());
  document.documentElement.setAttribute('lang', 'en');

  function boot() {
    translateNode(document.documentElement);
    var t = norm(document.title);
    if (t && exact[t] != null) document.title = exact[t];
    var obs = new MutationObserver(onMutations);
    obs.observe(document.documentElement, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['title', 'placeholder', 'aria-label'],
    });
    window.__mapI18nStats = stats;
    document.dispatchEvent(new CustomEvent('map-i18n:ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
