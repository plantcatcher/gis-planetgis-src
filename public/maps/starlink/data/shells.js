/* 星链环绕地球 · 星座数据（确定性生成，便于封面截图与计数稳定）
 *
 * 模型说明（非真实 TLE，纯静态零网络）：
 *  - 按真实壳层参数组织成 Walker 星座网格：53° 主力 / 70° 高纬增强 / 97.6° 极轨。
 *  - 每颗卫星给定轨道根数（半长轴 a、倾角 inc、升交点赤经 raan、平近点角初相 ma0），
 *    运行时按开普勒第三定律相对速度绕地球运行。
 *  - 轨道高度相对地球半径（6371km）做了 2× 放大，仅为可视化便于观察，并非真实比例。
 *  - 发射时间轴：每颗卫星带一个部署进度 u∈[0,1]，滑块揭示 u≤g(t) 的卫星，
 *    g(t) 为 S 形曲线，模拟 2019→2026 的累积增长；显示数量为「模型在轨数」。
 */
(function (global) {
  'use strict';

  var EARTH_KM = 6371;
  var ALT_EXAG = 2.0;          /* 高度放大系数（可视化用） */
  var MU = 398600.414;         /* 地球引力常数 km^3/s^2 */

  /* 确定性随机：mulberry32 */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rng = mulberry32(20261024);

  /* 真实壳层（近似，2024–2025 部署结构） */
  var SHELLS = [
    { key: 'inc53', name: '53° 主力壳层', sub: '低中纬宽带覆盖', inc: 53.0, alt: 550, color: '#7dd3fc', planes: 72, perPlane: 24 },
    { key: 'inc70', name: '70° 增强壳层', sub: '高纬度增强', inc: 70.0, alt: 570, color: '#a78bfa', planes: 36, perPlane: 22 },
    { key: 'polar', name: '97.6° 极轨壳层', sub: '极地太阳同步', inc: 97.6, alt: 560, color: '#f0abfc', planes: 24, perPlane: 22 }
  ];

  var DEG = Math.PI / 180;
  var sats = [];
  SHELLS.forEach(function (sh, si) {
    var aKm = EARTH_KM + sh.alt;
    var aScene = 1 + (sh.alt / EARTH_KM) * ALT_EXAG;       /* 场景半长轴（地球半径=1） */
    var rateSim = Math.sqrt(MU / (aKm * aKm * aKm));        /* rad / 仿真秒（开普勒） */
    var sinInc = Math.sin(sh.inc * DEG), cosInc = Math.cos(sh.inc * DEG);
    var F = 1;                                              /* Walker 相位因子 */
    for (var p = 0; p < sh.planes; p++) {
      var raan = (p * 360 / sh.planes) * DEG;
      var sinRaan = Math.sin(raan), cosRaan = Math.cos(raan);
      for (var s = 0; s < sh.perPlane; s++) {
        /* 平面内角距 360/S，跨平面相位偏移 p*F*360/P → Walker 倾斜网格 */
        var base = (s * 360 / sh.perPlane + p * F * 360 / sh.planes) * DEG;
        var jitter = (rng() - 0.5) * 0.6 * DEG;            /* 轻微抖动，避免摩尔纹、更自然 */
        sats.push({
          sh: si,
          plane: p,
          a: aScene,
          sinInc: sinInc, cosInc: cosInc,
          sinRaan: sinRaan, cosRaan: cosRaan,
          ma0: base + jitter,
          rate: rateSim,
          u: rng()                                         /* 部署进度：均匀采样，由 g(t) 决定揭示曲线 */
        });
      }
    }
  });

  /* S 形累积曲线：t∈[0,1] → 揭示比例 g(t)∈(0,1)，模拟早期慢、中期爆发、后期平台 */
  function revealFraction(t) {
    var x = Math.max(0, Math.min(1, t));
    var g = 1 / (1 + Math.exp(-9 * (x - 0.52)));
    return (g - 0.018) / (0.982 - 0.018);
  }

  /* 滑块 t∈[0,1] → 近似发射年份（与真实部署节奏大致对应，用于时间轴标签） */
  function progressToYear(t) {
    var x = Math.max(0, Math.min(1, t));
    var milestones = [
      [0.00, 2019.36], [0.12, 2020.20], [0.26, 2021.10], [0.42, 2022.20],
      [0.58, 2023.10], [0.74, 2024.10], [0.88, 2025.10], [1.00, 2026.20]
    ];
    for (var i = 1; i < milestones.length; i++) {
      if (x <= milestones[i][0]) {
        var a = milestones[i - 1], b = milestones[i];
        var k = (x - a[0]) / (b[0] - a[0]);
        return a[1] + k * (b[1] - a[1]);
      }
    }
    return 2026.2;
  }

  global.STARLINK_SHELLS = SHELLS;
  global.STARLINK_SATS = sats;          /* 数组，元素见上 */
  global.STARLINK_META = {
    total: sats.length,
    altExag: ALT_EXAG,
    earthKm: EARTH_KM,
    revealFraction: revealFraction,
    progressToYear: progressToYear
  };
})(window);
