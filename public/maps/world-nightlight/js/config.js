/* 全球夜间灯光互动地图 · 表现层配置
   数据：NASA Black Marble / VIIRS Day-Night Band（DNB）年度合成，经 NASA GIBS（EOSDIS）WMTS 公开提供。
   瓦片源 NASA GIBS：地球观测系统公开服务，无需密钥。
   注：GIBS 年度「城市灯光」图层目前稳定可用的是 VIIRS_CityLights_2012（瓦片端点 HTTP 200）。
       GIBS 2020+ 年度图层在该 WMTS 端点返回 400，故默认 2012。
       如需更新年份：改 GIBS_YEAR / GIBS_LAYER / GIBS_TILE 三处即可（年份需与图层名、Time 段一致）。
   坐标系 WGS84，底图为 Web 墨卡托瓦片，与国界矢量对齐，无偏移；不叠加 GCJ-02。 */
window.NL_CONFIG = {
  gibsYear: '2012',
  gibsLayer: 'VIIRS_CityLights_2012',
  /* GoogleMapsCompatible_Level8：z 0–8，z8 地面分辨率约 750 m/像素 */
  gibsTile: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/2012-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
  gibsAttr: 'NASA Black Marble / VIIRS City Lights (GIBS, NASA EOSDIS) · CC BY 4.0',

  view: { center: [12, 18], zoom: 1.5, minZoom: 0.4, maxZoom: 8 },
  graticuleStep: 20,
  nightOpacity: 1,
  gratOn: true,

  presets: [
    { name: '全球',     center: [12, 18],    zoom: 1.5 },
    { name: '东亚',     center: [122, 33],   zoom: 3.0 },
    { name: '中国',     center: [104, 35],   zoom: 3.2 },
    { name: '南亚',     center: [80, 24],    zoom: 3.0 },
    { name: '欧洲',     center: [9, 50],     zoom: 3.2 },
    { name: '北美',     center: [-96, 40],   zoom: 2.6 },
    { name: '中东',     center: [46, 28],    zoom: 3.0 },
    { name: '非洲',     center: [20, 4],     zoom: 2.6 },
    { name: '南美',     center: [-58, -12],  zoom: 2.7 },
    { name: '澳洲',     center: [134, -25],  zoom: 3.0 }
  ],

  /* 灯光热点：点选/悬停看解读。center = [lon, lat] */
  spotlights: [
    { name_zh: '东京都市圈',  en: 'Tokyo Megalopolis',  type: '东亚第一灯光团', center: [139.7, 35.7],  note: '全球最亮的单一都会区之一，关东平原从东京湾到筑波连成一片白热光带，亮度在 DNB 影像里常年居首。' },
    { name_zh: '首尔-仁川',   en: 'Seoul-Incheon',      type: '半岛都会带',     center: [126.9, 37.5], note: '朝鲜半岛上最亮的一团，汉江沿岸高密度建成区在夜间几乎连成实心光块。' },
    { name_zh: '长三角',      en: 'Yangtze Delta',      type: '中国东部引擎',   center: [121.4, 31.2], note: '上海-苏州-无锡-南京沿长江与海岸线铺开，是中国夜间辐射最强的城市群之一。' },
    { name_zh: '珠三角',      en: 'Pearl River Delta',  type: '中国南部引擎',   center: [113.3, 23.1], note: '广州-深圳-香港-东莞在狭小三角洲内高度连绵，灯光密度与东京、首尔同量级。' },
    { name_zh: '京津冀',      en: 'Jing-Jin-Ji',        type: '中国北方引擎',   center: [116.4, 39.9], note: '北京-天津双核驱动，环渤海岸线被港口与工业照明点亮，向西迅速没入华北平原的暗区。' },
    { name_zh: '恒河平原',    en: 'Indo-Gangetic Plain',type: '南亚人口核心',   center: [80, 26],      note: '德里-加尔各答-勒克瑙一线沿河密集，是地球上人口最密、夜间却仍偏暗的典型——灯光强度并不随人口线性增长。' },
    { name_zh: '波斯湾',      en: 'Persian Gulf',       type: '油气火焰',       center: [50, 26],      note: '沿岸油田与天然气处理厂的持续燃火在 DNB 里极为醒目，沙特、阿联酋、伊朗岸线呈串珠状亮点。' },
    { name_zh: '尼罗河三角洲',en: 'Nile Delta',         type: '沙漠中的绿廊',   center: [31.2, 30.0], note: '开罗及周边在撒哈拉的漆黑中劈出一条明亮的绿色光廊，埃及绝大部分夜间活动都挤在这条河谷里。' },
    { name_zh: '欧洲之夜',    en: 'European Megalight', type: '连片都会带',     center: [5, 50],       note: '伦敦-巴黎-布鲁塞尔-鲁尔-兰斯塔特在西欧连成一条不间断的光带，是全球少有的「跨多国」连续亮区。' },
    { name_zh: '美国东北走廊',en: 'US Northeast Corridor',type: '北美最亮带',   center: [-74, 40],    note: '波士顿-纽约-华盛顿沿大西洋岸线密集排布，是北美夜间辐射最强的走廊，与五大湖、加州共同构成美国光网。' },
    { name_zh: '墨西哥城',    en: 'Mexico City',        type: '拉美最大光团',   center: [-99.1, 19.4],note: '坐落在高原盆地里，四周山体在夜间几乎全黑，唯独盆地被一圈高密度建成区照亮。' },
    { name_zh: '圣保罗-里约', en: 'São Paulo–Rio',      type: '南美引擎',       center: [-46.6, -23.5],note: '巴西东南沿海是南美最亮的区域，圣保罗单一都市区的灯光规模堪比北美主要城市。' }
  ],

  facts: { year: '2012', res: '~750 m', src: 'NASA Black Marble' }
};
