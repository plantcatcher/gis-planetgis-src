/* 全球洋流运动地图 · 表现层配置
   数据由 scripts/build_world_currents.py 生成：
     - currents.json    32 条主要洋流路径（属性短键：id/n 名称/en 英文/type 暖寒
                        /ocean 大洋/flow 输送量/speed 流速/frm 起点/to 终点
                        /desc 描述/season 季节/lenKm 流程 km）
     - upwelling.json   6 处沿岸上升流区（name/fishery/desc/lng/lat）
     - stats.json       暖寒计数 / 大洋分布 / 长度排名 / 来源与合规说明

   底图：Esri World Imagery 卫星影像 + World_Shaded_Relief 晕渲地形 + 深色无底图。
   不用高德/百度/腾讯：其瓦片只覆盖中国，全球尺度下境外全空白（同 world-hydro）。 */
window.CURRENTS_CONFIG = {
  /* minZoom 0.5。手机竖屏看不全全球是 MapLibre 硬约束（renderWorldCopies:false 时
     强制「世界尺寸 ≥ 容器最长边」，390×844 把 zoom 顶死在 0.72），用 boundsMobile 收窄。 */
  view: { center: [12, 22], zoom: 1.6, minZoom: 0.5, maxZoom: 10 },
  /* 上界 86°N 保住穿极流北端，下界 -70°S 覆盖南极辐散带与极地东风漂流 */
  bounds: [-180, -70, 180, 86],
  /* 移动端收窄到内容重心：太平洋—印度洋季风区 + 大西洋暖流系统（全球约 70% 洋流条数） */
  boundsMobile: [-70, -48, 150, 70],
  extent: [-180, -70, 180, 86],
  graticuleStep: 20,

  basemaps: {
    img: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    vec: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}' }
  },
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  /* 卫星影像压暗：洋流是细线 + 红蓝色，不压暗会被影像噪声吃掉 */
  imgPaint: {
    'raster-brightness-max': 0.6,
    'raster-brightness-min': 0.03,
    'raster-saturation': -0.45,
    'raster-contrast': 0.06
  },

  /* 类型配色（暖红 / 寒蓝）——地理教科书惯例，与股票红绿无关。
     线色低饱和（做"流轴"），粒子色提亮（做"水"），分层不打架 */
  typeColors: { warm: '#ff6a4d', cold: '#48b6ff' },
  dotColors: { warm: '#ffb08e', cold: '#a8dcff' },
  /* 上升流渔场金点 */
  uwColor: '#ffd23f',

  oceanLabels: {
    all: '全部',
    pacific: '太平洋',
    atlantic: '大西洋',
    indian: '印度洋',
    arctic: '北冰洋',
    southern: '南大洋'
  },

  /* 洋流线宽（zoom 插值）：线只做"流轴"，压细压淡，主角是粒子 */
  lineWidth: [[1, 1.3], [3, 2.4], [5, 3.6], [8, 5]],
  glowWidth: [[1, 6], [3, 10], [5, 16], [8, 24]],

  /* 流动粒子（“流场”方案，移植自 leaflet-velocity / earth.nullschool，而非“线上珠子”）：
     把 32 条洋流折线栅格化成「流向场」——每段存切向 + 按距离衰减的速度；
     粒子随机撒在洋流走廊里，沿当地流向自由平流、拖尾、老化后重生。
     粒子不绑死在一条线上，而是沿洋流成「带」流动，表达流向 / 趋势。
     ⚠️ 粒子走 #fx overlay canvas 自绘，不进 MapLibre 图层——否则每帧 setData
     触发全场景 repaint，软件渲染下只有 20fps。canvas 路线下 MapLibre 只画静态层，
     本方案每帧 560 粒子 ≈ 两次 fillRect + ~1100 段 stroke，GPU 上零压力。 */
  flowParticles: 560,        /* 粒子池总数（始终重生在洋流上，无浪费） */
  flowWidth: 1.5,            /* 粒子线段宽度（CSS px，内部乘 dpr） */
  flowSpeed: 58,             /* 基础流速（CSS px / 秒，再乘全局 speed 与 animBase） */
  flowMaxAge: 220,           /* 粒子寿命（帧）：老化即重生，制造生灭与流动感 */
  flowBandPx: 9,             /* 洋流走廊半宽（CSS px）：粒子在走廊内随机散布成“带” */
  flowRadiusDeg: 2.6,        /* 流向场采样半径（度）：走廊外查不到流向 → 粒子重生 */
  /* 箭头：每洋流 1 个，低透明做方向指示，仅 zoom ≥ 2.5 显示（避免总览时抢戏） */
  arrowShowZoom: 2.5,
  arrowSize: [[3, 0.7], [6, 0.95]],
  /* 动画基础步进（各类型流速倍率）：暖流快、寒流慢 */
  animBase: { warm: 1.0, cold: 0.6 },

  speedLabels: { '0': '暂停', '0.5': '慢', '1': '常速', '2': '快' },

  /* 上升流 → 关联洋流（详情卡脚注用） */
  uwLink: {
    'uw-peru': 'humboldt',
    'uw-california': 'california',
    'uw-benguela': 'benguela',
    'uw-canary': 'canary',
    'uw-somali': 'somali',
    'uw-antarctic': 'acc'
  },

  hint: '点洋流看流程 / 流速 / 输送量；点金点看上升流渔场。左下角可切换图层、季节与底图。'
};
