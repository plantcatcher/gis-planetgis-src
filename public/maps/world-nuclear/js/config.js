/* 全球核电站分布地图 · 表现层配置
   数据由 scripts/build_world_nuclear.py 生成：
     - units.json    1387 台核电机组点位（属性见 build 脚本）
     - sites.json    485 个核电设施地点（项目级，多机组合并）
     - countries.json 59 国聚合（n 机组数/w 总装机/cxy 装机加权重心/g 状态构成/rt 型式构成）
     - stats.json    分档阈值 / 状态标签 / 总量

   底图：Esri World Imagery（server.arcgisonline.com）+ World_Shaded_Relief + 深色无底图。
   全球尺度，不用高德（境外空白）；server 节点 8/8 全通，不用 services 节点（本机超时）。
   坐标系 WGS84，不叠加 GCJ-02 底图，故无偏移。 */
window.NUC_CONFIG = {
  view: { center: [12, 34], zoom: 1.7, minZoom: 0.5, maxZoom: 11 },
  bounds: [-180, -58, 180, 76],
  /* 手机竖屏物理装不下全球（MapLibre renderWorldCopies:false 硬约束），收窄到内容重心：
     欧洲 + 非洲 + 亚洲 + 中东——全球 9 成以上的机组与几乎所有核国家都在这带。美洲留给用户自己拖。 */
  boundsMobile: [-15, -45, 145, 60],
  extent: [-180, -60, 180, 78],
  graticuleStep: 20,

  basemaps: {
    img: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    vec: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}' }
  },
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  /* 卫星影像下压暗点位，否则红/绿点在影像上看不见 */
  imgPaint: {
    'raster-brightness-max': 0.62,
    'raster-brightness-min': 0.04,
    'raster-saturation': -0.42,
    'raster-contrast': 0.08
  },

  /* 单台机组装机容量 → 基础半径（zoom=3 时的像素半径），与 build 脚本 CAP_RADIUS 同步 */
  capRadius: [[0, 2], [50, 2.8], [200, 3.8], [500, 5], [1000, 6.5], [1500, 8], [1830, 9]],
  zoomK: [[1, 0.62], [3, 1.0], [5, 1.5], [8, 2.3], [11, 3.4]],

  /* 国家总装机气泡：半径按 log10(总装机) 分级（与前端 BUBBLE_R 同断点） */
  cntStops:   [[1.2, 4], [2, 7], [3, 12], [4, 19], [5, 28], [6, 40]],
  cntStopsFar:[[1.2, 2.6], [2, 4.6], [3, 8], [4, 12.5], [5, 18], [6, 24]],

  /* 点位大小（装机容量）分档——仅用于图例文案 */
  capTiers: [
    { min: 1500, label: '1500 MW 以上' },
    { min: 1000, label: '1000 – 1499 MW' },
    { min: 500,  label: '500 – 999 MW' },
    { min: 200,  label: '200 – 499 MW' },
    { min: 50,   label: '50 – 199 MW' },
    { min: 1,    label: '1 – 49 MW' },
    { min: 0,    label: '容量未标注' }
  ],

  /* 国家总装机分档（气泡着色） */
  cntTiers: [
    { min: 100000, color: '#ff4d6d', label: '10 万 MW 以上' },
    { min: 50000,  color: '#ff8c42', label: '5 万 – 10 万 MW' },
    { min: 20000,  color: '#ffd23f', label: '2 万 – 5 万 MW' },
    { min: 5000,   color: '#3ddc97', label: '5000 – 2 万 MW' },
    { min: 1000,   color: '#38bdf8', label: '1000 – 5000 MW' },
    { min: 0,      color: '#94a3b8', label: '1000 MW 以下' }
  ],

  /* 反应堆状态分组（颜色 = 地图点色，也是筛选维度） */
  statusGroups: [
    { code: 'OP',  label: '运行中',   color: '#22c55e' },
    { code: 'CON', label: '在建',     color: '#38bdf8' },
    { code: 'PLN', label: '规划中',   color: '#fbbf24' },
    { code: 'SUS', label: '搁置/封存', color: '#fb923c' },
    { code: 'RET', label: '退役',     color: '#94a3b8' },
    { code: 'CAN', label: '取消',     color: '#ef4444' }
  ],

  hint: '点机组看容量 / 状态 / 反应堆类型 / 业主；点国家气泡看该国核电装机与状态构成。右下角可切换底图与图层。'
};
