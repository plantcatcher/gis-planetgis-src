/* 世界港口分布地图 · 表现层配置
   数据由 scripts/build_world_ports.py 生成：
     - ports.json     1081 个港口点位（属性见 build 脚本）
     - countries.json 122 国聚合（n 港数 / hubs 枢纽数 / tc 各档计数 / cxy 加权重心）
     - stats.json     分档定义 / 总量 / 缺测与合规说明

   底图：Esri World Imagery（server.arcgisonline.com）+ World_Shaded_Relief 晕渲地形 + 深色无底图。
   全球尺度，不用高德（境外空白）；server 节点 8/8 全通，不用 services 节点（本机超时）。
   坐标系 WGS84，不叠加 GCJ-02 底图，故无偏移。 */
window.PORTS_CONFIG = {
  /* minZoom 0.5（引擎 fitBounds 还有一道 z ≥ 0.2 的兜底）。
     手机竖屏装不下全球（MapLibre renderWorldCopies:false 硬约束），用 boundsMobile 收窄到内容重心。 */
  view: { center: [12, 30], zoom: 1.7, minZoom: 0.5, maxZoom: 11 },
  bounds: [-180, -58, 180, 76],
  /* 移动端专用取景框：港口集中在北半球中纬度海岸，收窄到欧美+亚洲+非洲北部一带。 */
  boundsMobile: [-20, -50, 150, 65],
  extent: [-180, -60, 180, 78],
  graticuleStep: 20,

  basemaps: {
    img: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    vec: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}' }
  },
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  /* 卫星影像下要把点位压暗，否则红点在影像上发飘 */
  imgPaint: {
    'raster-brightness-max': 0.62,
    'raster-brightness-min': 0.04,
    'raster-saturation': -0.42,
    'raster-contrast': 0.08
  },

  /* 重要性六档：scalerank 3（顶级枢纽）最小 → 8（小型）最大。
     rank 是源字段；t 是档位 0–5；baseR 是 zoom=3 时的像素半径（与图层同口径）。 */
  TIERS: [
    { rank: 3, label: '顶级枢纽港', color: '#ff3b6b', baseR: 9.0, desc: '全球顶级枢纽，超大型集装箱与中转港，scalerank=3' },
    { rank: 4, label: '主要枢纽港', color: '#ff8c42', baseR: 7.0, desc: '区域主要枢纽港，scalerank=4' },
    { rank: 5, label: '重要港口',   color: '#ffd23f', baseR: 5.4, desc: '重要的全国性/地区性港口，scalerank=5' },
    { rank: 6, label: '区域性港口', color: '#4ade80', baseR: 4.4, desc: '区域性港口，scalerank=6' },
    { rank: 7, label: '一般港口',   color: '#38bdf8', baseR: 3.8, desc: '一般性港口，scalerank=7' },
    { rank: 8, label: '小型港口',   color: '#94a3b8', baseR: 3.2, desc: '小型港口，scalerank=8' }
  ],

  /* 半径随 zoom 缩放（与图层 circle-radius 同口径）：基础半径先落成要素属性 baseR，
     这里写 ['interpolate',['linear'],['zoom'], z, ['*',k,['get','baseR']]]。 */
  zoomK: [[1, 0.62], [3, 1.0], [5, 1.5], [8, 2.3], [11, 3.0]],

  /* 标注阈值：只标顶级+主要枢纽（rank ≤ 4，共 143 个），避免全球视野文字糊成一片 */
  labelRankMax: 4,

  hint: '点港口看档位 / 国家 / 坐标 / 官网；点国家排行看该国全部港口。右下角可切换底图与图层。'
};
