/* 共享省级行政区边界加载器
 *
 * 单一数据源：/maps/_shared/china-provinces.json（DataV.GeoAtlas，35 个要素：
 * 34 个省级行政区 + 十段线要素 adcode=100000_JD）。各地图禁止各存一份。
 *
 * GeoJSON 走网络请求，不能在脚本加载时同步拿到，因此统一用回调注册：
 *   window.onProvinceGeo(function (geojson) { ... 建地图 ... });
 * 已经加载完成时回调会立即执行，未完成时排队等待。
 */
(function () {
  "use strict";

  var GEO_URL = "/maps/_shared/china-provinces.json";
  var geo = null;
  var queue = [];

  function flush(err) {
    var q = queue.slice();
    queue.length = 0;
    for (var i = 0; i < q.length; i++) {
      try {
        q[i](geo);
      } catch (e) {
        console.error("[province-geo] 回调执行失败", e);
      }
    }
    if (err && !geo) showError();
  }

  function showError() {
    var box = document.getElementById("map") || document.getElementById("pmap");
    if (!box) return;
    var tip = document.createElement("div");
    tip.style.cssText =
      "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
      "color:#94a3b8;font-size:14px;text-align:center;padding:24px;line-height:1.8";
    tip.textContent = "省级行政区边界加载失败，请检查网络后刷新页面。";
    box.appendChild(tip);
  }

  window.onProvinceGeo = function (cb) {
    if (geo) {
      cb(geo);
      return;
    }
    queue.push(cb);
  };

  fetch(GEO_URL)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (j) {
      geo = j;
      window.PROVINCE_GEOJSON = j;   // 兼容既有同步读法
      flush(null);
    })
    .catch(function (e) {
      console.error("[province-geo] 加载失败", e);
      flush(e);
    });
})();
