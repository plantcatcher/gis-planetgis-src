/* 万里长江 · 一江八脉 — 河流专题配置
 *
 * 与几何数据（data/rivers.json，按 code 对应）解耦：这里只放
 * 「表现层」内容 —— 配色、文案、分组、标签锚点、指标定义。
 * 数据层（河长 / 汇水面积 / 流量 / 起止点）一律从 GeoJSON 读取，不在前端硬编码。
 */
window.YANGTZE_CONFIG = {
  /* 页面主标题下方的一句话 */
  subtitle: '长江不是一条孤立的河，而是一套由高原、盆地、湖区共同汇成的水系网络。',

  /* 默认视野（长江流域中心） */
  view: { center: [106.55, 29.56], zoom: 5.4 },
  minZoom: 4,
  maxZoom: 11,

  /* 三个可切换的对照维度 */
  metrics: [
    { key: 'length_km', label: '长度', unit: '千米' },
    { key: 'upstream_area_sqkm', label: '汇水', unit: '平方千米' },
    { key: 'estimated_discharge_cms', label: '流量', unit: 'm³/s' }
  ],

  metricNote: '河长、汇水面积与估算流量各指不同维度，宜并置观察，而非简单排名。',

  /* 图例分组（仅用于着色归类，不影响数据） */
  groups: [
    { name: '上游与盆地来水', codes: ['yalong-river', 'min-river', 'jialing-river', 'wu-river'] },
    { name: '中游与湖区水网', codes: ['xiang-river', 'yuan-river', 'han-river', 'gan-river'] }
  ],

  /* 绘制顺序：干流先画（在下），支流后画 */
  order: ['yangtze-mainstream', 'yalong-river', 'min-river', 'jialing-river',
    'wu-river', 'xiang-river', 'yuan-river', 'han-river', 'gan-river'],

  /* labelAt：标签沿线的里程占比（0=源头 / 1=河口），已按地图可读性手工调过 */
  rivers: {
    'yangtze-mainstream': {
      name: '长江干流', color: '#f5b544', labelAt: 0.66,
      role: 'mainstream', badge: 'MAINSTREAM',
      tagline: '从世界屋脊到东海之滨的主轴',
      desc: '沱沱河出自唐古拉山各拉丹冬的冰川，汇成通天河、金沙江，切穿川滇之间的横断山地后转向东北，接纳岷江、嘉陵江、汉江等来水，一路穿过四川盆地与两湖平原，最终在崇明岛以东入海。它把中国地形的三级阶梯串成了同一条线。'
    },
    'yalong-river': {
      name: '雅砻江', color: '#1fd0f7', labelAt: 0.42,
      role: 'tributary', badge: 'MAJOR TRIBUTARY',
      tagline: '纵切川西高原的高山来水',
      desc: '源出青海巴颜喀拉山，自北向南纵贯川西高原，河谷深切、落差集中，在攀枝花附近汇入金沙江。它是长江上游最长的一条支流，水力资源密度在全国大江大河中位居前列。'
    },
    'min-river': {
      name: '岷江', color: '#35a9f5', labelAt: 0.44,
      role: 'tributary', badge: 'MAJOR TRIBUTARY',
      tagline: '喂饱成都平原的那条河',
      desc: '从岷山弓杠岭南下，出山后经都江堰分流，把成都平原浇成了"水旱从人"的天府之地，再一路南行在宜宾汇入长江。水量丰沛而季节悬殊，是长江上游水情最不稳定的一条支流。'
    },
    'jialing-river': {
      name: '嘉陵江', color: '#4a82f5', labelAt: 0.44,
      role: 'tributary', badge: 'MAJOR TRIBUTARY',
      tagline: '横穿四川盆地北部的水道',
      desc: '源出秦岭代王山，自北向南切开大巴山与四川盆地，河道曲折多弯，在重庆朝天门与长江相汇。它与长江一起，把重庆塑造成了中国西南的水运枢纽。'
    },
    'wu-river': {
      name: '乌江', color: '#8b7cf7', labelAt: 0.46,
      role: 'tributary', badge: 'MAJOR TRIBUTARY',
      tagline: '喀斯特高原上的深切河谷',
      desc: '源出贵州威宁香炉山，横切黔中喀斯特高原，在涪陵注入长江。河谷深切、滩多水急，落差集中，是长江上游"水能富矿"的重要组成部分。'
    },
    'xiang-river': {
      name: '湘江', color: '#00e6c3', labelAt: 0.56,
      role: 'tributary', badge: 'MAJOR TRIBUTARY',
      tagline: '纵贯湖南的南北大动脉',
      desc: '源出广西兴安海洋山，自南向北纵贯湖南全境，在湘阴注入洞庭湖，再经城陵矶与长江相通。湖南的主要城市几乎都挂在它这条线上。'
    },
    'yuan-river': {
      name: '沅江', color: '#00d0a4', labelAt: 0.46, intoLake: '洞庭湖',
      role: 'tributary', badge: 'MAJOR TRIBUTARY',
      tagline: '武陵山区的来水通道',
      desc: '源出贵州都匀云雾山，穿行湘黔交界的武陵山区，水量丰沛、支流众多，在常德一带注入洞庭湖。洞庭湖四水中，它的流域面积最大。'
    },
    'han-river': {
      name: '汉江', color: '#1fd6a0', labelAt: 0.46,
      role: 'tributary', badge: 'MAJOR TRIBUTARY',
      tagline: '秦巴山地与江汉平原的纽带',
      desc: '源出陕西宁强嶓冢山，自西向东穿过汉中盆地、丹江口水库与襄宜平原，在武汉汇入长江。它是长江最长的支流，也是南水北调中线工程的水源地所在。'
    },
    'gan-river': {
      name: '赣江', color: '#71e97f', labelAt: 0.56, intoLake: '鄱阳湖',
      role: 'tributary', badge: 'MAJOR TRIBUTARY',
      tagline: '纵贯江西的南北主河',
      desc: '源出江西石城石寮岽，自南向北贯穿赣鄱大地，在南昌以下分汊入鄱阳湖，再经湖口与长江相通。鄱阳湖的丰枯，很大程度上由它说了算。'
    }
  }
};
