/* 行政区划代码地图 · cn-adcode
   全国地级单元（地级市 / 直辖市的区 / 省直辖县级市）点击 → 县级代码；
   搜索按 6 位代码或地名直达任意层级。

   数据（scripts/maps/build_cn_adcode.py 生成）：
     data/prefectures.geojson  地级 + 直辖/省直管县级单元边界（属性: adcode,name,level,prov,countyN,direct,center,noGeo）
     data/provinces.geojson   省级边界（属性: adcode,name,level）
     data/counties/<pref>.json 各地级单元的县级边界
     data/index.json          [code,name,level,parent] 全量搜索索引
*/
(function () {
  'use strict';

  var fmt = Thematic.fmt, esc = Thematic.esc;
  var shutPanel = null;  // bindPanel 里赋值；手机端卡片弹出时用它收掉设置卡

  var el = {};
  ['fProv', 'fPref', 'fCounty', 'searchInput', 'searchResults', 'unitList', 'listHint',
   'detail', 'dtLevel', 'dtName', 'dtSub', 'dtCode', 'dtCopy', 'dtChildrenLabel',
   'countyList', 'dtFooter', 'introBarText'].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  var S = {
    pref: [],            // 地级 + 直辖/省直管县级单元（主层）
    prov: [],            // 省级
    idx: [],             // 搜索索引
    prefByCode: {},
    provByCode: {},
    countyCache: {},     // prefCode -> FeatureCollection
    countyByCode: {},    // 当前下钻单元的县
    view: 'pref',        // 'pref' | 'county'
    drillPref: null,     // 当前下钻的地级 feature
    sel: null,           // 当前选中的 feature
    selSrc: null,        // 它来自哪个数据源（provs / main / cty），取消选中时按它清 feature-state
    labelsOn: true
  };

  /* ── 颜色：地级按下辖县级数分级；省直管/直辖市区紫；港澳琥珀 ── */
  function fillFor(p) {
    if (p.level === 'county') return '#8b7cf6';            // 直辖市的区/县、省直辖县级
    if (p.note === '特别行政区') return '#f0b429';
    var n = p.countyN || 0;
    if (n >= 15) return '#38bdf8';
    if (n >= 10) return '#2c9cd8';
    if (n >= 5)  return '#1d6fa5';
    if (n >= 1)  return '#1a4e78';
    return '#7c8eb0';
  }
  var LEVEL_ZH = { prov: '省级', pref: '地级', county: '县级' };
  /* 省级面只在「没有地级边界」的地方露出来（台湾省）：用分级里「无下辖县级」那一档的灰色，
     免得它在成片蓝色中间露出一块没上色的裸底图。 */
  var PROV_FILL = '#7c8eb0';

  /* queryRenderedFeatures 返回的是 MapLibre 内部的矢量瓦片要素包装对象（类 nf）。
     把它直接塞进 setData 会走 worker 的结构化克隆，报
     "can't serialize object of unregistered class nf"，整次 setData 失败、选中描边画不出来。
     所以写回数据源前一律拷成普通 GeoJSON Feature。 */
  function plainFeature(f) {
    var props = {};
    for (var k in f.properties) if (Object.prototype.hasOwnProperty.call(f.properties, k)) props[k] = f.properties[k];
    return { type: 'Feature', properties: props, geometry: f.geometry };
  }

  /* ── 启动 ── */
  var app = Thematic.create({
    slug: 'cn-adcode',
    view: { center: [104.5, 35.8], zoom: 3.9, minZoom: 3, maxZoom: 11 },
    bounds: [73.0, 17.0, 136.0, 54.5],
    boundsMobile: [82, 19, 127, 50],
    extent: [72, 16, 138, 56],
    graticuleStep: 2,
    imgPaint: {
      'raster-brightness-max': 0.62,
      'raster-brightness-min': 0.05,
      'raster-saturation': -0.35,
      'raster-contrast': 0.06
    },
    /* 省界自己画（sources/layers 里的 provs）：引擎默认还会建一套 prov-fill/prov-line，
       与本图的 prov-line 同 id，MapLibre 会以「duplicate layer id」拒掉整个样式、地图不出图。 */
    province: false,
    sources: {
      provs: { data: 'data/provinces.geojson', promoteId: 'adcode' },
      main: { data: 'data/prefectures.geojson', promoteId: 'adcode' },
      /* 下钻的县级边界单独一层：叠在地级层上而不是替换它，
         否则进入县级视图后全国其余部分会变成空白，看着像图挂了。 */
      cty: { data: Thematic.EMPTY, promoteId: 'adcode' },
      sel: { data: Thematic.EMPTY, promoteId: 'adcode' }
    },
    layers: [
      { id: 'prov-fill', type: 'fill', source: 'provs',
        paint: { 'fill-color': ['coalesce', ['get', 'fill'], '#16324f'],
                 /* 没有地级边界的省（台湾）就是这一层在当主题色块，按地级层同样的不透明度铺满；
                    其余省只是地级面下面的暗底，保持原来的 0.42。 */
                 'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.12,
                                  ['case', ['==', ['get', 'bare'], true], 0.62, 0.42]] } },
      { id: 'prov-line', type: 'line', source: 'provs',
        paint: { 'line-color': '#4a6f95', 'line-width': 1.2, 'line-opacity': 0.55 } },
      { id: 'main-fill', type: 'fill', source: 'main',
        paint: { 'fill-color': ['coalesce', ['get', 'fill'], '#1a4e78'],
                 'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.10, 0.62] } },
      { id: 'main-line', type: 'line', source: 'main',
        paint: { 'line-color': '#ffffff', 'line-width': 0.8, 'line-opacity': 0.4 } },
      { id: 'cty-fill', type: 'fill', source: 'cty',
        paint: { 'fill-color': ['coalesce', ['get', 'fill'], '#8b7cf6'], 'fill-opacity': 0.66 } },
      { id: 'cty-line', type: 'line', source: 'cty',
        paint: { 'line-color': '#e2e8f5', 'line-width': 1, 'line-opacity': 0.55 } },
      { id: 'sel-halo', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#7dd3fc', 'line-width': 6, 'line-opacity': 0.0, 'line-blur': 2 } },
      { id: 'sel-line', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2.2, 'line-opacity': 0.95 } }
    ],
    onReady: boot,
    onOverview: function () { backToPref(); setSel(null); app.fitAll({ animate: true }); },
    onClose: stepUp
  });

  function boot() {
    Promise.all([
      fetch('data/prefectures.geojson').then(function (r) { return r.json(); }),
      fetch('data/provinces.geojson').then(function (r) { return r.json(); }),
      fetch('data/index.json').then(function (r) { return r.json(); })
    ]).then(function (rs) {
      S.pref = rs[0].features;
      S.prov = rs[1].features;
      S.idx = rs[2].rows;

      S.pref.forEach(function (f) {
        f.properties.fill = fillFor(f.properties);
        S.prefByCode[String(f.properties.adcode)] = f;
      });
      /* 台湾省没有地级边界文件，prov-fill 是它唯一的面：给它补一个 fill，
         否则地图上是一块没上色的裸底图，和「色块按县级数量着色」的说法对不上。 */
      S.prov.forEach(function (f) {
        var p = f.properties;
        var kids = S.pref.some(function (x) { return String(x.properties.adcode).slice(0, 2) === String(p.adcode).slice(0, 2); });
        if (!kids) { p.fill = PROV_FILL; p.bare = true; }
        S.provByCode[String(p.adcode)] = f;
      });
      app.map.getSource('main').setData(rs[0]);
      /* provs 原本由 MapLibre 直接按 URL 载入，补的 fill/bare 得回写进去才生效 */
      app.map.getSource('provs').setData({ type: 'FeatureCollection', features: S.prov });

      var nCounty = S.idx.filter(function (r) { return r[2] === 'county'; }).length;
      el.fProv.textContent = fmt(S.prov.length, 0);
      el.fPref.textContent = fmt(S.pref.length, 0);
      el.fCounty.textContent = fmt(nCounty, 0);

      renderUnitList();
      bind();
      bindPanel();
      bindSearch();
      app.fitAll({ animate: false });
      updateLabels();
      window.__cnAdcodeReady = true;

      var m = location.hash.match(/^#u\/(\d{6})$/);
      if (m) goToCode(m[1]);

      /* 地址栏改 hash / 从外部带 hash 打开：跟着跳；hash 被清空则回地级总览。
         setSel / openMissing 用 replaceState 写 hash，不会触发这里，不会自激。 */
      window.addEventListener('hashchange', function () {
        var h = location.hash.match(/^#u\/(\d{6})$/);
        if (h) {
          if (String(S.sel ? S.sel.properties.adcode : '') !== h[1]) goToCode(h[1]);
          return;
        }
        if (S.sel || !el.detail.hidden) { backToPref(); setSel(null); app.fitAll({ animate: true }); }
      });
    }).catch(function (err) {
      console.error('[cn-adcode] 数据加载失败', err);
      el.unitList.innerHTML = '<div class="sr-more">数据加载失败，请刷新重试。</div>';
    });
  }

  /* ── 目录：按省级分组平铺全部地级单元（省名可点，台湾这类没有下级要素的省也列出来） ── */
  function renderUnitList() {
    var html = '';
    S.prov.forEach(function (pf) {
      var pc = String(pf.properties.adcode), pn = pf.properties.name;
      var kids = S.pref.filter(function (f) { return String(f.properties.adcode).slice(0, 2) === pc.slice(0, 2); });
      html += '<button type="button" class="unit-prov" data-code="' + pc + '">' +
        esc(pn) + '<i>' + (kids.length ? kids.length + ' 个单元 ›' : '省级 ›') + '</i></button>';
      kids.forEach(function (f) {
        var p = f.properties, code = String(p.adcode);
        html += '<button type="button" class="unit-row' + (p.level === 'county' ? ' direct' : '') +
          '" data-code="' + code + '">' +
          '<span class="code">' + code + '</span>' +
          '<span class="nm">' + esc(p.name) + '</span>' +
          '<span class="cnt">' + (p.level === 'county' ? '县级' : (p.countyN ? p.countyN + ' 县' : '—')) + '</span>' +
          '</button>';
      });
    });
    el.unitList.innerHTML = html;
  }

  function provCodeOf(name) {
    for (var k in S.provByCode) {
      if (S.provByCode[k].properties.name === name) return k;
    }
    return '';
  }

  /* ── 搜索 ── */
  function bindSearch() {
    var box = el.searchInput, out = el.searchResults, timer = 0;
    function run() {
      var q = box.value.trim();
      if (!q) { out.innerHTML = ''; return; }
      var isNum = /^\d+$/.test(q), hits = [];
      for (var i = 0; i < S.idx.length && hits.length < 12; i++) {
        var r = S.idx[i];
        if (isNum ? r[0].indexOf(q) === 0 : r[1].indexOf(q) !== -1) hits.push(r);
      }
      /* 完全相同的代码排最前（输 440300 时不让 440300 落在后面） */
      hits.sort(function (a, b) {
        return (a[0] === q ? 0 : 1) - (b[0] === q ? 0 : 1) || (a[1] === q ? 0 : 1) - (b[1] === q ? 0 : 1);
      });
      var html = hits.map(function (r) {
        return '<button type="button" class="sr-row" data-code="' + r[0] + '">' +
          '<span class="code">' + r[0] + '</span>' +
          '<span class="nm">' + esc(r[1]) + '</span>' +
          '<span class="lv">' + LEVEL_ZH[r[2]] + '</span></button>';
      }).join('');
      if (!hits.length) html = '<div class="sr-more">没有匹配 “' + esc(q) + '” 的代码或地名</div>';
      out.innerHTML = html;
    }
    box.addEventListener('input', function () {
      clearTimeout(timer); timer = setTimeout(run, 120);
    });
    out.addEventListener('click', function (e) {
      var b = e.target.closest('.sr-row'); if (!b) return;
      box.value = ''; out.innerHTML = '';
      goToCode(b.dataset.code);
    });
  }

  /* 按代码跳转（搜索 / hash / 目录 / 卡片行统一入口） */
  function goToCode(code) {
    var row = null;
    for (var i = 0; i < S.idx.length; i++) if (S.idx[i][0] === code) { row = S.idx[i]; break; }
    if (!row) return;

    if (row[2] === 'prov') {
      var pf = S.provByCode[code];
      if (pf) selectProv(pf); else openMissing(code, row);
      return;
    }
    if (row[2] === 'pref') {
      var f = S.prefByCode[code];
      if (f) selectPref(f); else openMissing(code, row);
      return;
    }
    /* 县级 */
    var parent = row[3] || '';
    if (parent && parent.slice(2) !== '0000') {          // 普通县：父级是地级
      var p = S.prefByCode[parent];
      if (!p) { openMissing(code, row); return; }
      drillInto(parent, function () {
        var cf = S.countyByCode[code];
        if (cf) selectCounty(cf);
        else openMissing(code, row);                     // 代码表有、边界数据还没有
      });
    } else {                                             // 省直管 / 直辖市的区：在主层
      backToPref();
      var df = S.prefByCode[code];
      if (df) selectPref(df); else openMissing(code, row);
    }
  }

  /* ── 下钻：把某个地级单元的县级边界叠到 cty 层 ── */
  function drillInto(prefCode, then) {
    var apply = function (fc) {
      S.countyByCode = {};
      fc.features.forEach(function (f) {
        S.countyByCode[String(f.properties.adcode)] = f;
      });
      S.drillPref = S.prefByCode[prefCode] || null;
      S.view = 'county';
      app.map.getSource('cty').setData(fc);
      updateLabels();
      if (then) then();
    };
    if (S.countyCache[prefCode]) { apply(S.countyCache[prefCode]); return; }
    fetch('data/counties/' + prefCode + '.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (fc) {
        fc.features.forEach(function (f) { f.properties.fill = '#8b7cf6'; });
        S.countyCache[prefCode] = fc;
        apply(fc);
      })
      .catch(function (e) {
        /* 这个地级单元没有县级边界文件（不设区的地级市、代码表未列下级）：停在原地提示 */
        console.error('[cn-adcode] 县级边界加载失败', prefCode, e);
        if (then) { then(); return; }
        note(el.countyList, '该单元暂无县级边界数据，可继续按代码查询。');
      });
  }

  function backToPref() {
    if (S.view === 'pref') return;
    S.view = 'pref';
    S.drillPref = null;
    S.countyByCode = {};
    app.map.getSource('cty').setData(Thematic.EMPTY);
    updateLabels();
  }

  /* 取景框：只用「主体面」。
     海南的省界一直画到三沙的岛礁（南到 3.8°N），按整个 bbox 取景会得到一大片空海、
     海南岛缩成一个小点；三沙市同理。所以按面积丢掉占比不足 5% 的碎面再算 bbox。 */
  function coreBbox(geom) {
    var polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
    var best = 0, boxes = polys.map(function (poly) {
      var bb = Thematic.bboxOf({ type: 'Polygon', coordinates: poly });
      if (!bb) return null;
      var a = (bb[2] - bb[0]) * (bb[3] - bb[1]);
      if (a > best) best = a;
      return { bb: bb, a: a };
    }).filter(Boolean);
    if (!boxes.length) return null;
    var out = [Infinity, Infinity, -Infinity, -Infinity];
    boxes.forEach(function (x) {
      if (x.a < best * 0.05) return;
      out[0] = Math.min(out[0], x.bb[0]); out[1] = Math.min(out[1], x.bb[1]);
      out[2] = Math.max(out[2], x.bb[2]); out[3] = Math.max(out[3], x.bb[3]);
    });
    return out[0] === Infinity ? boxes[0].bb : out;
  }

  /* 选中一个地级/直管单元：卡片 + 飞到该单元；有县级边界就顺手画出来 */
  function selectPref(f) {
    backToPref();
    setSel(f, 'main');
    var b = coreBbox(f.geometry);
    if (b) app.fitBounds(Thematic.padBbox(b, 0.15), { withDetail: true, animate: true });
    if ((f.properties.countyN || 0) > 0) drillInto(String(f.properties.adcode));
    app.collapseDrawer();
  }

  function selectProv(f) {
    backToPref();
    setSel(f, 'provs');
    var b = coreBbox(f.geometry);
    if (b) app.fitBounds(Thematic.padBbox(b, 0.08), { withDetail: true, animate: true });
    app.collapseDrawer();
  }

  function selectCounty(f) {
    setSel(f, 'cty');
    var b = Thematic.bboxOf(f.geometry);
    if (b) app.fitBounds(Thematic.padBbox(b, 0.3), { withDetail: true, animate: true, maxZoom: 9 });
    app.collapseDrawer();
  }

  /* 目录里高亮当前选中的单元（省分组标题或地级行），并把它滚进可视区 */
  function markUnit(code) {
    var list = el.unitList;
    if (!list) return;
    var old = list.querySelectorAll('.unit-row.active, .unit-prov.active');
    for (var i = 0; i < old.length; i++) old[i].classList.remove('active');
    if (!code) return;
    var hit = null;
    var rows = list.querySelectorAll('[data-code]');
    for (var j = 0; j < rows.length; j++) {
      if (rows[j].dataset.code === String(code)) { hit = rows[j]; break; }
    }
    if (!hit) return;
    hit.classList.add('active');
    if (hit.scrollIntoView) hit.scrollIntoView({ block: 'nearest' });
  }

  /* ── 选中 ── */
  function setSel(f, srcId) {
    var map = app.map;
    if (S.sel) {
      try { map.setFeatureState({ source: S.selSrc, id: S.sel.properties.adcode }, { selected: false }); } catch (_) {}
    }
    S.sel = f || null;
    S.selSrc = srcId || null;
    if (!f) {
      map.getSource('sel').setData(Thematic.EMPTY);
      app.setVisible('sel-halo', false); app.setVisible('sel-line', false);
      el.detail.hidden = true;
      app.setDetailOpen(false);
      markUnit('');
      updateLabels();
      try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
      return;
    }
    try { map.setFeatureState({ source: srcId, id: f.properties.adcode }, { selected: true }); } catch (_) {}
    /* 关键：不能把 queryRenderedFeatures 的包装要素直接塞进数据源（见 plainFeature 注释） */
    map.getSource('sel').setData({ type: 'FeatureCollection', features: [plainFeature(f)] });
    app.setVisible('sel-line', true);
    app.pulse({ glowId: 'sel-halo', baseWidth: 7, maxExtra: 7, restOpacity: 0.3 });
    openCard(f);
    /* 下钻出来的县不在目录里：高亮它所属的地级行，目录跟着走 */
    var selCode = String(f.properties.adcode);
    if (srcId === 'cty') selCode = selCode.slice(0, 4) + '00';
    markUnit(selCode);
    updateLabels();
    try { history.replaceState(null, '', '#u/' + f.properties.adcode); } catch (_) {}
  }

  /* 点空白 / 关闭卡片 / Esc：先退出县级视图（回到所属地级，镜头留在原地），再清空选择 */
  function stepUp() {
    if (S.view === 'county' && S.drillPref) {
      var p = S.drillPref;
      backToPref();
      setSel(p, 'main');
      var b = coreBbox(p.geometry);
      if (b) app.fitBounds(Thematic.padBbox(b, 0.15), { withDetail: true, animate: true });
      else app.fitAll({ animate: true });
      return;
    }
    if (!S.sel) { app.fitAll({ animate: true }); return; }
    setSel(null);
    app.fitAll({ animate: true });
  }

  /* ── 详情卡 ── */
  function openCard(f) {
    if (shutPanel && window.innerWidth <= 900) shutPanel();
    var p = f.properties, code = String(p.adcode);
    el.dtCode.textContent = code;
    el.dtName.textContent = p.name;
    el.dtFooter.textContent = '民政部现行代码 · 边界 DataV.GeoAtlas';

    if (p.level === 'prov') {
      el.dtLevel.textContent = '省级行政区';
      el.dtSub.textContent = 'GB/T 2260 · 前两位 ' + code.slice(0, 2);
      el.dtChildrenLabel.textContent = '下辖地级 / 直管单位（点击定位）';
      var subs = S.pref.filter(function (x) { return String(x.properties.adcode).slice(0, 2) === code.slice(0, 2); });
      renderRows(el.countyList, subs.map(function (x) {
        return { code: String(x.properties.adcode), name: x.properties.name };
      }));
    } else if (p.level === 'pref') {
      el.dtLevel.textContent = '地级行政区';
      /* 下辖县级名单直接取搜索索引（民政部代码表口径），不依赖边界文件是否齐全：
         新设县级市边界还没发布时，名单照样完整，点进去会说明「边界暂缺」 */
      var rows = S.idx.filter(function (r) { return r[3] === code; }).map(function (r) {
        return { code: r[0], name: r[1] };
      });
      el.dtSub.innerHTML = (p.prov
        ? '<button type="button" class="prov-link" data-code="' + provCodeOf(p.prov) + '">' + esc(p.prov) + '</button>'
        : '—') + ' · 下辖 ' + rows.length + ' 个县级单位';
      el.dtChildrenLabel.textContent = '下辖县级行政区（点击定位）';
      renderRows(el.countyList, rows);
      if (p.noGeo && p.noGeo.length) {
        note(el.countyList, '其中 ' + p.noGeo.length + ' 个新设单位（' +
          p.noGeo.map(function (c) { return countyName(c) + ' ' + c; }).join('、') +
          '）民政部已收录，边界数据尚未发布。');
      }
    } else {
      el.dtLevel.textContent = '县级行政区';
      var parentName = S.drillPref ? S.drillPref.properties.name
        : (p.direct ? (p.prov || '') + '（省直辖 / 直辖市）' : '—');
      el.dtSub.textContent = parentName;
      el.dtChildrenLabel.textContent = '说明';
      el.countyList.innerHTML = '<div class="sr-more">点击地图上其他县级单元继续查询，或按代码搜索。</div>';
    }
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  /* 代码在表里、边界没发布：照样给卡片和可复制的代码，只是不落点 */
  function openMissing(code, row) {
    if (shutPanel && window.innerWidth <= 900) shutPanel();
    setSel(null);
    el.dtLevel.textContent = LEVEL_ZH[row[2]] + '行政区';
    el.dtName.textContent = row[1];
    el.dtCode.textContent = code;
    el.dtFooter.textContent = '民政部现行代码 · 边界 DataV.GeoAtlas';
    var parent = row[3] || '';
    var pn = (S.provByCode[parent] || S.prefByCode[parent] || {}).properties;
    el.dtSub.textContent = (pn ? pn.name + ' · ' : '') + '边界数据暂缺';
    el.dtChildrenLabel.textContent = '说明';
    el.countyList.innerHTML = '<div class="sr-more">民政部代码表已收录该单位，但 DataV.GeoAtlas ' +
      '尚未发布它的边界轮廓，地图上暂时无法定位；代码可照常复制使用。</div>';
    el.detail.hidden = false;
    app.setDetailOpen(true);
    /* 手机端是从抽屉里搜到这条的：抽屉还开着会盖住卡片，和点图选中的行为保持一致 */
    app.collapseDrawer();
    try { history.replaceState(null, '', '#u/' + code); } catch (_) {}
  }

  function countyName(code) {
    for (var i = 0; i < S.idx.length; i++) if (S.idx[i][0] === code) return S.idx[i][1];
    return '';
  }

  function note(box, text) {
    var d = document.createElement('div');
    d.className = 'sr-more';
    d.textContent = text;
    box.appendChild(d);
  }

  function renderRows(box, rows) {
    box.innerHTML = rows.length ? rows.map(function (r) {
      return '<button type="button" class="county-row" data-code="' + r.code + '">' +
        '<span class="code">' + r.code + '</span><span class="nm">' + esc(r.name) + '</span></button>';
    }).join('') : '<div class="sr-more">民政部代码表未列下级单位</div>';
    box.onclick = function (e) {
      var b = e.target.closest('.county-row'); if (!b) return;
      goToCode(b.dataset.code);
    };
  }

  /* ── 标注：缩放 >4.6 时显示当前视图单元名称（可叠 6 位代码） ── */
  function updateLabels() {
    var z = app.map.getZoom();
    if (z < 4.6) { app.setLabels([]); return; }
    /* 代码开关由本图自己的面板控制（ckCode）；共享引擎只认 ckLabel 管名称 */
    var ckCode = document.getElementById('ckCode');
    var withCode = !ckCode || ckCode.checked;
    var selCode = S.sel ? String(S.sel.properties.adcode) : '';
    var feats = S.view === 'pref' ? S.pref : Object.keys(S.countyByCode).map(function (k) { return S.countyByCode[k]; });
    var items = [];
    feats.forEach(function (f) {
      var c = (f.properties.center) || (function () {
        var b = Thematic.bboxOf(f.geometry); return b ? [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] : null;
      })();
      if (!c) return;
      var code = String(f.properties.adcode);
      items.push({ id: code, text: f.properties.name,
                   sub: withCode ? code : '',
                   active: code === selCode,
                   lng: c[0], lat: c[1], color: '#cfe3f5' });
    });
    app.setLabels(items.slice(0, 400));
  }

  /* ── 交互 ── */
  /* 命中顺序＝图层叠放顺序的逆序（queryRenderedFeatures 返回最上面的先）：
     下钻出来的县 > 地级单元 > 省。prov-fill 在最底下，只有台湾这类没有地级要素的面才会命中省；
     其余省份走目录里的省名、卡片里的省名链接，或搜索省级代码。 */
  var HIT_LAYERS = ['cty-fill', 'main-fill', 'prov-fill'];
  function bind() {
    var map = app.map;
    map.on('mousemove', function (e) {
      var f = app.pick(e.point, HIT_LAYERS);
      if (!f) { map.getCanvas().style.cursor = ''; app.tooltip(null); return; }
      map.getCanvas().style.cursor = 'pointer';
      var p = f.properties;
      var hint = p.level === 'prov' ? '点开看下辖地级'
        : p.level === 'pref' ? '点开看县级代码' : '点开看代码';
      app.tooltip('<b>' + esc(p.name) + '</b><br>' +
        '<span style="color:#9fb4cd"><code>' + String(p.adcode) + '</code> · ' +
        esc(LEVEL_ZH[p.level] || '') + '</span><br>' +
        '<span style="color:#64748b">' + hint + '</span>', e.point.x, e.point.y);
    });
    map.on('mouseleave', function () { app.tooltip(null); });

    map.on('click', function (e) {
      var f = app.pick(e.point, HIT_LAYERS);
      if (!f) { stepUp(); return; }
      if (f.layer.id === 'cty-fill') { selectCounty(f); return; }
      if (f.layer.id === 'prov-fill') { selectProv(f); return; }
      selectPref(f);
    });

    map.on('idle', updateLabels);

    /* 桌面侧栏在窄屏下会变成底部抽屉，而引擎的抽屉在桌面是常开状态。
       窗口缩到手机宽度（或旋转屏幕）时抽屉会带着 is-collapsed=false 展开，
       thematic.css 的 `.intro:not(.is-collapsed) ~ .detail` 随即把卡片藏掉——
       用户明明选着某个单元，卡片却凭空消失。跨过 900px 这条线且有卡片时把抽屉收起。 */
    var wasMobile = window.innerWidth <= 900;
    window.addEventListener('resize', function () {
      var nowMobile = window.innerWidth <= 900;
      if (nowMobile && !wasMobile && !el.detail.hidden) app.collapseDrawer();
      wasMobile = nowMobile;
    });

    el.unitList.addEventListener('click', function (e) {
      var b = e.target.closest('.unit-row, .unit-prov'); if (!b || !b.dataset.code) return;
      goToCode(b.dataset.code);
    });

    /* 卡片里的省名可点：直接切到省级（地图上省界被地级面盖住，这是最顺手的入口） */
    el.dtSub.addEventListener('click', function (e) {
      var b = e.target.closest('[data-code]'); if (!b || !b.dataset.code) return;
      goToCode(b.dataset.code);
    });

    /* 复制：clipboard API 被拒（无权限 / 非安全上下文 / 旧浏览器）时退回 execCommand，
       两者都失败就直说，别假装复制成功——用户会以为剪贴板里已经有了。 */
    el.dtCopy.addEventListener('click', function () {
      var code = el.dtCode.textContent;
      var flash = function (text) {
        el.dtCopy.textContent = text;
        setTimeout(function () { el.dtCopy.textContent = '复制'; }, 1400);
      };
      var legacy = function () {
        var ta = document.createElement('textarea');
        ta.value = code; ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
        flash(ok ? '已复制' : '请手动复制');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function () { flash('已复制'); }, legacy);
      } else {
        legacy();
      }
    });
  }

  /* ── 图层与底图面板 ──
     齿轮开、✕ / 点面板外 / Esc 关。共享引擎的 Esc 绑定的是 opts.onClose（= stepUp），
     所以面板开着时先截住 Esc 只收面板，不让它顺手把地图也退一级。 */
  function bindPanel() {
    var gear = document.getElementById('panelGear');
    var panel = document.getElementById('panel');
    var close = document.getElementById('panelClose');
    var ckCode = document.getElementById('ckCode');
    var ckLabel = document.getElementById('ckLabel');
    if (!gear || !panel) return;

    var isOpen = function () { return !panel.classList.contains('closed'); };
    var open = function () {
      panel.classList.remove('closed');
      gear.hidden = true;
      gear.setAttribute('aria-expanded', 'true');
    };
    var shut = function () {
      panel.classList.add('closed');
      gear.hidden = false;
      gear.setAttribute('aria-expanded', 'false');
    };

    shutPanel = shut;  // 手机端卡片弹出时由 openCard / openMissing 调用
    gear.setAttribute('aria-expanded', 'false');
    gear.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isOpen()) shut(); else open();
    });
    if (close) close.addEventListener('click', function (e) { e.stopPropagation(); shut(); });

    /* 点面板内部不该关：mousedown 在面板里、mouseup 在外面（拖选文字）也会触发 click */
    document.addEventListener('mousedown', function (e) {
      if (!isOpen() || panel.contains(e.target) || gear.contains(e.target)) return;
      shut();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isOpen()) return;
      shut();
      /* 只吃掉这一次：地图的 Esc（逐级退回）在这一下里不该跟着触发 */
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      gear.focus();
    }, true);

    /* 代码开关：名称关着时代码也没意义，跟着灰掉 */
    if (ckCode) {
      ckCode.addEventListener('change', updateLabels);
      var syncCode = function () {
        var on = !ckLabel || ckLabel.checked;
        ckCode.disabled = !on;
        if (ckCode.parentNode) ckCode.parentNode.classList.toggle('is-disabled', !on);
        updateLabels();
      };
      if (ckLabel) ckLabel.addEventListener('change', syncCode);
      syncCode();
    }
  }
})();
