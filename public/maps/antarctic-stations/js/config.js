/* 南极科考站分布地图 · 表现层配置
   数据由 scripts/build_antarctic_stations.py 生成：
     points.json     114 处设施点位（COMNAP 南极设施总表 v3.5.0）
     countries.json  31 国聚合 / stats.json 总量与口径

   投影：EPSG:3031（WGS 84 / Antarctic Polar Stereographic，标准纬线 71°S，
   中央经线 0°）。南极点位于投影原点 (0,0)，任何纬度都能画 —— 这是选它而不是
   Web 墨卡托的根本原因：墨卡托在 85.05°S 以南没有定义，画不了南极点站。

   底图：Esri「Polar / Antarctic_Imagery」，本身就是 3031 瓦片服务（不是
   Web 墨卡托瓦片），所以不需要重投影，直接按服务自带的 tileInfo 摆放：
     origin (-33699550.99203, 33699551.01703)，256×256，24 级 LOD。
   Esri 的 World_Imagery（墨卡托）在这里没有对应经纬关系，不能混用。 */
window.ANT_CONFIG = {
  /* ── EPSG:3031 椭球参数（WGS84）── */
  proj: { a: 6378137.0, e: 0.0818191908426215 },
  k0: 0.972769012327801,          // 极点比例因子（由标准纬线 -71° 反推，EPSG 公开值）
  stdLat: -71.0,

  /* ── Esri 南极影像瓦片服务 ── */
  tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Polar/Antarctic_Imagery/MapServer/tile/{z}/{y}/{x}',
  tileOrigin: { x: -33699550.99203, y: 33699551.01703 },
  tileSize: 256,
  lods: [
    { z: 0,  res: 238810.813354 }, { z: 1,  res: 119405.406677 },
    { z: 2,  res: 59702.7033385 }, { z: 3,  res: 29851.3516693 },
    { z: 4,  res: 14925.6758346 }, { z: 5,  res: 7462.83791731 },
    { z: 6,  res: 3731.41895866 }, { z: 7,  res: 1865.70947933 },
    { z: 8,  res: 932.854739664 }, { z: 9,  res: 466.427369832 },
    { z: 10, res: 233.213684916 }, { z: 11, res: 116.606842458 },
    { z: 12, res: 58.3034212289 }, { z: 13, res: 29.1517106146 },
    { z: 14, res: 14.5758553073 }, { z: 15, res: 7.28792765351 },
    { z: 16, res: 3.64396382689 }, { z: 17, res: 1.82198191331 },
    { z: 18, res: 0.910990956788 }
  ],
  lodMin: 3, lodMax: 17,
  imgAttr: 'Esri Polar/Antarctic Imagery',

  /* 视野限制：mpp = 每像素米数。南极条约区（60°S）半径 3333 km，
     麦夸里岛（54.5°S）半径 4060 km。 */
  mppMax: 34000,   // 最远拉（全洲 + 余量）
  mppMin: 3,       // 最近推（单站建筑尺度）

  /* 地名注记：t = sea | shelf | land | point；z = 显示的最小缩放等级（mpp 上限） */
  places: [
    { n: '罗斯冰架',       t: 'shelf', lat: -81.6, lon: -175,  z: 26000 },
    { n: '龙尼-菲尔希纳冰架', t: 'shelf', lat: -78.5, lon: -58,   z: 26000 },
    { n: '埃默里冰架',      t: 'shelf', lat: -70.4, lon: 72,    z: 14000 },
    { n: '拉森冰架',        t: 'shelf', lat: -65.3, lon: -60.8, z: 10000 },
    { n: '沙克尔顿冰架',    t: 'shelf', lat: -66.3, lon: 100.5, z: 14000 },
    { n: '阿蒙森海',        t: 'sea',   lat: -72.5, lon: -112,  z: 26000 },
    { n: '别林斯高晋海',    t: 'sea',   lat: -68.5, lon: -88,   z: 26000 },
    { n: '威德尔海',        t: 'sea',   lat: -73.5, lon: -45,   z: 26000 },
    { n: '罗斯海',          t: 'sea',   lat: -74.5, lon: 176,   z: 20000 },
    { n: '戴维斯海',        t: 'sea',   lat: -65.5, lon: 95,    z: 20000 },
    { n: '莫森海',          t: 'sea',   lat: -66.0, lon: 40,    z: 20000 },
    { n: '拉扎列夫海',      t: 'sea',   lat: -69.5, lon: 5,     z: 20000 },
    { n: '东南极',          t: 'land',  lat: -77.5, lon: 65,    z: 20000 },
    { n: '西南极',          t: 'land',  lat: -80.0, lon: -125,  z: 26000 },
    { n: '南极半岛',        t: 'land',  lat: -70.5, lon: -64.5, z: 12000 },
    { n: '横贯南极山脉',    t: 'land',  lat: -84.0, lon: 175,   z: 14000 },
    { n: '罗斯岛',          t: 'land',  lat: -77.6, lon: 167.0, z: 9000 },
    { n: '乔治王岛',        t: 'land',  lat: -62.05, lon: -58.4, z: 7000 },
    { n: '文森山',          t: 'point', lat: -78.6, lon: -85.5, z: 9000 },
    { n: '冰穹 A',          t: 'point', lat: -80.4, lon: 77.1,  z: 14000 },
    { n: '冰穹 C',          t: 'point', lat: -75.2, lon: 123.3, z: 14000 },
    { n: '冰穹 F',          t: 'point', lat: -77.3, lon: 39.7,  z: 14000 },
    { n: '麦克夸里岛',      t: 'land',  lat: -54.6, lon: 158.9, z: 20000 }
  ],

  hint: '点站点看国家 / 类型 / 海拔 / 距南极点距离；点国家排行飞往该国全部站点。右下角可切换底图与图层。'
};
