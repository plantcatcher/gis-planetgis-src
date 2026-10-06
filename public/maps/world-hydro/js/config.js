/* 全球水电站分布地图 · 表现层配置
   数据由 scripts/build_world_hydro.py 生成：
     - plants.json     7774 座电站点位（属性短键：id/n 名称/c 国家/w 装机 MW/y 投产年/p 型式/d 坝名/h 坝高/r 河流/hd 水头/av 库容/ar 库区面积）
     - countries.json  126 个国家/地区聚合（n 站数/w 总装机/t 类型构成/cxy 装机加权重心）
     - stats.json      分档阈值 / 型式标签 / 年代分箱 / 说明文案

   底图：Esri World Imagery（server.arcgisonline.com）+ World_Shaded_Relief 晕渲地形 + 深色无底图。
   为什么不用高德：高德瓦片只覆盖中国，全球尺度下境外全是空白。
   为什么不用 services.arcgisonline.com：本机实测该节点超时，server 节点 8/8 全通。 */
window.HYDRO_CONFIG = {
  /* minZoom 0.5（引擎 fitBounds 还有一道 z ≥ 0.2 的兜底）。
     ⚠️ 手机竖屏看不全全球是MapLibre 硬约束，缩 bounds / 降 minZoom 都无效：
     `renderWorldCopies:false` 时它强制「世界尺寸 ≥ 容器最长边」，390×844 会把 zoom
     顶死在 log2(844/512)=0.72 —— 实测 jumpTo(-0.47)/setMinZoom(-2) 全部被夹回 0.72。
     该级世界宽 843px > 屏宽 390px，物理上装不下 344° 经度。解法是 boundsMobile 收窄取景。 */
  view: { center: [12, 26], zoom: 1.7, minZoom: 0.5, maxZoom: 11 },
  /* 视野上界压到北纬 72°：南极洲只有 4 座电站、却要吃掉四分之一画面。
     下界放到 -58° 以保住南美南端与新西兰。下界不设 -85 是因为 fitAll 会被
     高德式「让中心落在可用区中心」的偏移算法推到地图外的边缘，出现半张空白。 */
  bounds: [-168, -56, 176, 72],
  /* 移动端专用取景框（手机竖屏物理上装不下全球，只能收窄到内容重心）：
     框住「东亚 + 南亚 + 欧洲 + 中东 + 非洲北部」——全球 60% 以上的装机、
     以及坝高之最（锦屏/小湾/白鹤滩）都在这一带。美洲留给用户自己拖出去看。 */
  boundsMobile: [8, -45, 168, 66],
  extent: [-180, -58, 180, 76],
  graticuleStep: 20,

  /* Esri 瓦片 URL：{s} 会被引擎替换成 0~3 四个子域做负载均衡 */
  basemaps: {
    img: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    vec: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}' }
  },
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  /* 卫星影像下要把点位压暗，否则红黄点在影像上完全看不见 */
  imgPaint: {
    'raster-brightness-max': 0.62,
    'raster-brightness-min': 0.04,
    'raster-saturation': -0.42,
    'raster-contrast': 0.08
  },

  /* 单站装机容量 → 基础半径（zoom=3 时的像素半径）。
     为什么半径要「容量 × 缩放」两维：跨度 2.5MW ~ 22500MW，线性半径会让 99% 的站缩成一个点；
     但只按容量给固定半径，缩到全球视野时又全都糊成一片。
     ⚠️ MapLibre 不允许在 ['*'] 里用 ['zoom']（zoom 只能作为顶层 step/interpolate 的输入），
     所以基础半径先落成要素属性 r，图层里写 ['interpolate',['linear'],['zoom'], z, ['*',k,['get','r']]]。
     zoomK 是缩放系数档：1→0.62（全球，压淡避免上万点叠成白噪）/ 3→1.0 / 5→1.5 / 8→2.3 / 11→3.4。 */
  capRadius: [[1, 1.15], [50, 1.7], [300, 2.3], [1000, 3.1], [5000, 4.2], [22500, 6.2]],
  zoomK: [[1, 0.62], [3, 1.0], [5, 1.5], [8, 2.3], [11, 3.4]],

  /* 单站装机容量分档（与 capRadius 同步，用于图例与配色） */
  capTiers: [
    { min: 5000, color: '#ff4d6d', label: '5000 MW 以上' },
    { min: 1000, color: '#ff8c42', label: '1000 – 4999 MW' },
    { min: 300,  color: '#ffd23f', label: '300 – 999 MW' },
    { min: 50,   color: '#3ddc97', label: '50 – 299 MW' },
    { min: 1,    color: '#38bdf8', label: '1 – 49 MW' },
    { min: 0,    color: '#94a3b8', label: '装机未标注' }
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

  /* 型式：源自数据 plant_type 原始编码 */
  types: [
    { key: 'STO',   src: ['STO'],   label: '蓄水式',   color: '#4ea3f0', desc: '有坝体调蓄，枯水期也能稳定发电' },
    { key: 'ROR',   src: ['ROR'],   label: '径流式',   color: '#37d6a8', desc: '径流过机即发电，基本不调蓄' },
    { key: 'PS',    src: ['PS'],    label: '抽水蓄能', color: '#f2b23c', desc: '低谷抽水、高峰放水，净发电为负' },
    { key: 'CANAL', src: ['Canal'], label: '渠道引水', color: '#c58cf0', desc: '无坝，靠渠道落差或短引水径流发电' },
    { key: 'UNK',   src: [],        label: '未标注',   color: '#8a97ab', desc: '源数据未记录电站型式' }
  ],

  /* 坝高阈值（m）：详情卡分档提示用 */
  damH: [
    { min: 200, label: '200 m 以上 · 超高坝' },
    { min: 150, label: '150 – 199 m · 高坝' },
    { min: 100, label: '100 – 149 m · 高坝' },
    { min: 60,  label: '60 – 99 m · 中坝' },
    { min: 0,   label: '60 m 以下 · 低坝' }
  ],

  hint: '点电站点位看装机 / 坝高 / 库容 / 投产年；点国家气泡看该国总装机与型式构成。右下角可切换底图与图层。'
};
