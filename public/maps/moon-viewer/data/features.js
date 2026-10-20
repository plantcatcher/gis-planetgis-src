/* 月球查看器 · 标注数据
 * 坐标使用 IAU 月面经纬（东经为正，北纬为正）；直径 / 长度单位 km。
 * 坐标取 IAU 命名与 NASA LRO / 中国探月工程公开任务坐标整理，
 * 供探索参考，非勘界用途。
 */
window.MOON_FEATURES = [
  /* ── 月海 / 洋（正面暗区） ── */
  { name: '风暴洋', en: 'Oceanus Procellarum', type: 'mare', lon: -57, lat: 18.5, size: 2500, note: '月球最大的“洋”，占正面约 16%，实际是最宽阔的暗色玄武岩平原。风暴洋的年龄跨度很大，既有古老高原残留，也有相对年轻的熔岩流。', coord: '-57.0° / +18.5°' },
  { name: '雨海', en: 'Mare Imbrium', type: 'mare', lon: -16, lat: 32.8, size: 1145, note: '由约 39 亿年前的一次大撞击形成，熔岩充填后成为正面最显眼的月海之一。外圈就是雨海山脉，内侧有回旋坑与裂隙，阿波罗 15 号曾落在其东南边缘。', coord: '-16.0° / +32.8°' },
  { name: '静海', en: 'Mare Tranquillitatis', type: 'mare', lon: 31, lat: 8.5, size: 873, note: '人类第一次踏足月球的地方：1969 年阿波罗 11 号在此着陆。静海相对平坦，玄武岩层较厚，边缘有多个著名环形山。', coord: '+31.0° / +8.5°' },
  { name: '澄海', en: 'Mare Serenitatis', type: 'mare', lon: 18, lat: 28, size: 707, note: '位于静海西北，是月震活跃的老月海之一。阿波罗 17 号曾在澄海与静海之间的陶拉斯-利特罗谷采样。', coord: '+18.0° / +28.0°' },
  { name: '丰富海', en: 'Mare Fecunditatis', type: 'mare', lon: 51, lat: -7.8, size: 909, note: '正面的东南月海，最东端靠近月球正面与背面的分界。1970 年苏联月球 16 号在此自动采样返回，是第一台无人采样返回器。', coord: '+51.0° / -7.8°' },
  { name: '云海', en: 'Mare Nubium', type: 'mare', lon: -17, lat: -21, size: 720, note: '位于雨海南侧、第谷辐射纹之下的月海。边缘有“直壁”等月面断层，是观察月壳活动的重要地貌。', coord: '-17.0° / -21.0°' },
  { name: '湿海', en: 'Mare Humorum', type: 'mare', lon: -39, lat: -24, size: 415, note: '西南面的一座小型月海，边缘有重要的环形山链与隆起。', coord: '-39.0° / -24.0°' },
  { name: '冷海', en: 'Mare Frigoris', type: 'mare', lon: 0, lat: 56, size: 1596, note: '一片狭长的北极圈月海，从西到东横跨正面北缘，因所处纬度命名的“冷海”。', coord: '0.0° / +56.0°' },
  { name: '史密斯海', en: 'Mare Smythii', type: 'mare', lon: 87, lat: -1.5, size: 370, note: '位于正面最东缘，部分越过月球东侧明暗界线，是连接正面与背面的过渡月海。', coord: '+87.0° / -1.5°' },
  { name: '知海', en: 'Mare Cognitum', type: 'mare', lon: -23, lat: -10, size: 350, note: '“被认识的海”，位于南海西侧，是勘测者 7 号与阿波罗 12 号着陆区附近的月海。', coord: '-23.0° / -10.0°' },
  { name: '危海', en: 'Mare Crisium', type: 'mare', lon: 59, lat: 17, size: 555, note: '正面东北边缘一座轮廓清晰的圆碗状月海，看起来很像一颗置于暗色胎座中的玛瑙。边缘有著名的普罗克洛斯环形山。', coord: '+59.0° / +17.0°' },
  { name: '界海', en: 'Mare Marginis', type: 'mare', lon: 86, lat: 13, size: 420, note: '接近正东明暗界线的月海，面积不大但边缘地貌丰富。', coord: '+86.0° / +13.0°' },
  { name: '酒海', en: 'Mare Nectaris', type: 'mare', lon: 33.6, lat: -16.3, size: 340, note: '静海东南、丰富海以西的圆形月海，由酒海撞击盆地被熔岩充填而成，是月海盆地演化的标准样本，盆地周围的山链与悬崖至今清晰。', coord: '+33.6° / -16.3°' },
  { name: '东方海', en: 'Mare Orientale', type: 'mare', lon: -92.8, lat: -19.4, size: 300, note: '贴在月球西侧边缘的“靶心”盆地：暗色月海外套两道同心环山，是月球最年轻的大型撞击盆地之一。因为压在明暗界线内侧，地球视角几乎只能看到它的一半。', coord: '-92.8° / -19.4°' },
  { name: '洪堡德海', en: 'Mare Humboldtianum', type: 'mare', lon: 89.9, lat: 56.8, size: 230, note: '贴在东北边缘的月海，满月时也常常只有一部分露出。它和东方海成对出现在两侧边缘，是观察月球“天平动”让边缘地物时隐时现的最佳目标。', coord: '+89.9° / +56.8°' },
  { name: '汽海', en: 'Mare Vaporum', type: 'mare', lon: 3.5, lat: 13, size: 245, note: '静海与雨海之间的一小片暗色月海，周围山丘与断层构成了中纬度高地地貌。', coord: '+3.5° / +13.0°' },
  { name: '疫沼', en: 'Palus Putredinis', type: 'mare', lon: 0, lat: 26.4, size: 161, note: '阿波罗 15 号着陆点西南的暗色地质单元，沿雨海边缘延伸，地质上被归入“月海沼泽”。', coord: '0.0° / +26.4°' },

  /* ── 环形山（撞击坑） ── */
  { name: '第谷', en: 'Tycho', type: 'crater', lon: -11.1, lat: -43.3, size: 85, note: '南半球最醒目的年轻环形山，直径 85 公里，拥有从撞击点延伸出的辐射纹。辐射纹在满月时肉眼可见，可长达上千公里。', coord: '-11.1° / -43.3°' },
  { name: '哥白尼', en: 'Copernicus', type: 'crater', lon: -20, lat: 9.6, size: 93, note: '雨海东南一座约 8 亿岁的年轻撞击坑，有明亮辐射纹与清晰的阶梯状坑壁。它是天文爱好者最常观测的环形山之一。', coord: '-20.0° / +9.6°' },
  { name: '开普勒', en: 'Kepler', type: 'crater', lon: -38, lat: 8.1, size: 31, note: '风暴洋中的一座小但很亮眼的年轻撞击坑，周围有辐射纹，因开普勒命名。', coord: '-38.0° / +8.1°' },
  { name: '阿里斯塔克斯', en: 'Aristarchus', type: 'crater', lon: -47.5, lat: 23.7, size: 40, note: '月球表面反照率最高的年轻环形山之一，直径约 40 公里，坑底极亮。它所在的高原还闻名于广泛的火山地貌与瞬态月球现象记录。', coord: '-47.5° / +23.7°' },
  { name: '柏拉图', en: 'Plato', type: 'crater', lon: -9.4, lat: 51.6, size: 109, note: '雨海正北方一座巨大而平坦的环形山，坑底被熔岩填满，几乎看不出撞击结构，周围的坑壁是高地亮岩。', coord: '-9.4° / +51.6°' },
  { name: '阿基米德', en: 'Archimedes', type: 'crater', lon: -4, lat: 29.7, size: 82, note: '雨海边缘的一座平坦坑底环形山，被晚期熔岩淹没。它的坑壁清晰，但坑内很少崎岖地形。', coord: '-4.0° / +29.7°' },
  { name: '阿里斯塔克斯高原', en: 'Aristarchus Plateau', type: 'crater', lon: -47, lat: 25, size: 200, note: '一个抬升的高原单元，紧邻阿里斯塔克斯环形山，广泛分布火山穹丘、沟壑与暗色火山碎屑沉积。', coord: '-47.0° / +25.0°' },
  { name: '第谷周缘辐射纹', en: 'Tycho Rays', type: 'crater', lon: -11, lat: -40, size: 1500, note: '第谷撞击时喷出的亮色岩石在月面铺开的辐射状条带，覆盖了南半球大片区域。它们是年轻撞击的“新鲜伤疤”。', coord: '-11.0° / -40.0°' },
  { name: '南极点-艾特肯盆地', en: 'South Pole–Aitken Basin', type: 'crater', lon: 180, lat: -53, size: 2500, note: '月球上最大的撞击盆地，直径约 2500 公里，深度远超普通月海。它横跨南极与月背，是太阳系最大的已知撞击构造之一，也是中国嫦娥六号等任务的采样目标区域。', coord: '180.0° / -53.0°' },
  { name: '贝利环形山', en: 'Baillly', type: 'crater', lon: -68, lat: -66, size: 303, note: '南极附近一座巨大的撞击盆地，坑底抬升、边缘多层，是月球南半球重要的地形结构。', coord: '-68.0° / -66.0°' },
  { name: '克勒克', en: 'Clavius', type: 'crater', lon: -14.7, lat: -58.4, size: 225, note: '月球可见面南半球第二大环形山，坑底排列着几座小环形山。它的巨大尺寸说明这里经历了很长的撞击历史。', coord: '-14.7° / -58.4°' },
  { name: '科罗廖夫', en: 'Korolev', type: 'crater', lon: -159.4, lat: -4.2, size: 437, note: '月球背面最著名的巨大环形山，坑底地势低平，永久阴影区可能封存着水冰，是未来月背探测的焦点区域。', coord: '-159.4° / -4.2°' },
  { name: '齐奥尔科夫斯基', en: 'Tsiolkovsky', type: 'crater', lon: 129.2, lat: -20.4, size: 184, note: '月球背面赤道附近的巨大撞击坑，坑底有暗色玄武岩充填，是背面少数「长」得像月海的撞击坑。', coord: '+129.2° / -20.4°' },
  { name: '湿海-风暴洋过渡', en: 'Humorum–Procellarum', type: 'crater', lon: -48, lat: -18, size: 600, note: '风暴洋与湿海之间的玄武岩平原过渡带，分布着裂谷、穹丘与暗色沉积物。', coord: '-48.0° / -18.0°' },
  { name: '雨海东缘', en: 'Imbrium Scarp', type: 'crater', lon: -11, lat: 40, size: 400, note: '雨海撞击盆地的外环断层与山链，在雨海东北方形成连续的弧形边界。', coord: '-11.0° / +40.0°' },
  { name: '直壁', en: 'Rupes Recta', type: 'crater', lon: -8, lat: -22, size: 110, note: '南海边缘的长条悬崖，长约 110 公里、高约数百米，是月壳断层抬升的经典例子。', coord: '-8.0° / -22.0°' },

  /* ── 山脉 / 月谷 / 海角 ── */
  { name: '亚平宁山脉', en: 'Montes Apenninus', type: 'mountain', lon: -3, lat: 20, size: 600, note: '雨海东南缘的弧形山脉，是雨海大撞击盆地外环的残余山链。阿波罗 15 号就在山脉边缘着陆，采集了雨海盆地的抬升岩块。', coord: '-3.0° / +20.0°' },
  { name: '高加索山脉', en: 'Montes Caucasus', type: 'mountain', lon: 10, lat: 38, size: 445, note: '雨海东北方的高地山脉，夹在澄海与冷海之间，山峰相对高度可达数千米。', coord: '+10.0° / +38.0°' },
  { name: '阿尔卑斯山脉', en: 'Montes Alpes', type: 'mountain', lon: 1, lat: 46, size: 281, note: '雨海北缘的山链，中央被阿尔卑斯月谷切出一条峡谷。这座“阿尔卑斯”并非地球上的阿尔卑斯，只是命名沿用。', coord: '+1.0° / +46.0°' },
  { name: '阿尔卑斯月谷', en: 'Vallis Alpes', type: 'mountain', lon: 3, lat: 48, size: 180, note: '一条宽约 15 公里的直线峡谷，横穿阿尔卑斯山脉，谷底局部被月海熔岩覆盖。', coord: '+3.0° / +48.0°' },
  { name: '喀尔巴阡山脉', en: 'Montes Carpatus', type: 'mountain', lon: -24, lat: 14, size: 361, note: '雨海南缘的山链，靠近哥白尼环形山，是雨海盆地的外环残余。', coord: '-24.0° / +14.0°' },
  { name: '侏罗山脉', en: 'Montes Jura', type: 'mountain', lon: -36, lat: 47, size: 422, note: '冷海西侧的弧形山链，包围着小片海湾区域。', coord: '-36.0° / +47.0°' },
  { name: '比利牛斯山脉', en: 'Montes Pyrenaeus', type: 'mountain', lon: 41, lat: -16, size: 222, note: '丰富海西缘的山脉，是大型撞击盆地边缘的残余结构。', coord: '+41.0° / -16.0°' },
  { name: '酒海-丰富海边界山', en: 'Nectaris–Fecunditatis', type: 'mountain', lon: 51, lat: -25, size: 300, note: '酒海与丰富海之间的高地边界带，分布着山链与撞击坑，是月海与高地的典型过渡区。', coord: '+51.0° / -25.0°' },
  { name: '施罗特月谷', en: 'Vallis Schröteri', type: 'mountain', lon: -51, lat: 26, size: 160, note: '阿里斯塔克斯高原的一条蜿蜒月谷，长约 160 公里，被认为是熔岩管塌陷或火山活动形成的沟槽。', coord: '-51.0° / +26.0°' },
  { name: '直壁裂隙', en: 'Rimae Hyginus', type: 'mountain', lon: 6, lat: 7, size: 220, note: '汽海附近的一条月面裂隙系，赫金斯火山口沿裂隙排列，是深月壳断裂的窗口。', coord: '+6.0° / +7.0°' },
  { name: '风暴洋中部低地', en: 'Procellarum Interior', type: 'mountain', lon: -60, lat: 12, size: 900, note: '风暴洋内部广泛分布着低矮穹丘与暗色火山沉积，是月海火山活动的中心区域。', coord: '-60.0° / +12.0°' },

  /* ── 人类探测记录 ── */
  { name: '月球 2 号', en: 'Luna 2', type: 'mission', lon: 0, lat: 29.1, size: 1959, note: '苏联最早撞上月面的探测器，实现人类探测器首次抵达月球。', coord: '+0.0° / +29.1°' },
  { name: '月球 9 号', en: 'Luna 9', type: 'mission', lon: -64, lat: 7, size: 1966, note: '第一台成功软着陆月球并传回月面影像的探测器。', coord: '-64.0° / +7.0°' },
  { name: '阿波罗 11 号', en: 'Apollo 11', type: 'mission', lon: 23.7, lat: 0.7, size: 1969, note: '1969 年 7 月 20 日，阿姆斯特朗与奥尔德林在静海着陆，人类第一次踏上月球，取回 21 公斤月岩。', coord: '+23.7° / +0.7°' },
  { name: '阿波罗 12 号', en: 'Apollo 12', type: 'mission', lon: -23.4, lat: -3.0, size: 1969, note: '在知海附近着陆，回收了勘测者 3 号的部分部件，验证了登陆区地质与航天器残骸的长期表现。', coord: '-23.4° / -3.0°' },
  { name: '阿波罗 14 号', en: 'Apollo 14', type: 'mission', lon: -17.5, lat: -3.6, size: 1971, note: '宇航员艾伦·谢泼德在弗拉·毛罗高地附近着陆，打出了高尔夫球，并首次使用月面手推车。', coord: '-17.5° / -3.6°' },
  { name: '阿波罗 15 号', en: 'Apollo 15', type: 'mission', lon: 3.7, lat: 26.1, size: 1971, note: '首度使用月球车。着陆点在亚平宁山脉与哈德利月谷，发现了被抬升的古老月壳岩块。', coord: '+3.7° / +26.1°' },
  { name: '阿波罗 16 号', en: 'Apollo 16', type: 'mission', lon: 15.5, lat: -9.0, size: 1972, note: '在笛卡尔高地着陆，采样目标不是月海玄武岩而是古老高地，带回了大量角砾岩。', coord: '+15.5° / -9.0°' },
  { name: '阿波罗 17 号', en: 'Apollo 17', type: 'mission', lon: 30.8, lat: 20.2, size: 1972, note: '最后一次载人登月，在陶拉斯-利特罗谷着陆，发现橙色的火山玻璃珠，说明月面曾有火山喷发。', coord: '+30.8° / +20.2°' },
  { name: '月球 16 号', en: 'Luna 16', type: 'mission', lon: 56, lat: -0.7, size: 1970, note: '苏联首台自动采样返回器，在丰富海钻取并带回 101 克月壤。', coord: '+56.0° / -0.7°' },
  { name: '月球 17 号', en: 'Luna 17', type: 'mission', lon: -35, lat: 38.3, size: 1970, note: '携带月球车 1 号（Lunokhod 1）软着陆，是第一台成功的月面巡视器，工作了约 11 个月。', coord: '-35.0° / +38.3°' },
  { name: '月球 21 号', en: 'Luna 21', type: 'mission', lon: 30.5, lat: 25.5, size: 1973, note: '月球车 2 号（Lunokhod 2）着陆于澄海东南，巡视了更崎岖的月面地形。', coord: '+30.5° / +25.5°' },
  { name: '月球 24 号', en: 'Luna 24', type: 'mission', lon: 62.2, lat: 12.7, size: 1976, note: '苏联最后一次月壤取样任务，从危海带回约 170 克样本，证明该区域玄武岩成分与东部月海不同。', coord: '+62.2° / +12.7°' },
  { name: '嫦娥三号', en: 'Chang\'e 3', type: 'mission', lon: -19.5, lat: 44.1, size: 2013, note: '中国首次无人探测器软着陆，携带玉兔号月球车，着陆在雨海北部。', coord: '-19.5° / +44.1°' },
  { name: '嫦娥四号', en: 'Chang\'e 4', type: 'mission', lon: 177.6, lat: -45.5, size: 2019, note: '人类探测器首次在月球背面着陆，地点是冯·卡门环形山，玉兔二号至今仍在巡视。', coord: '+177.6° / -45.5°' },
  { name: '嫦娥五号', en: 'Chang\'e 5', type: 'mission', lon: -51.9, lat: 43.1, size: 2020, note: '中国首次月面采样返回，在风暴洋北部的吕姆克山附近钻取并带回 1731 克月岩，是 44 年来第一批新月壤。', coord: '-51.9° / +43.1°' },
  { name: '嫦娥六号', en: 'Chang\'e 6', type: 'mission', lon: -153.9, lat: -41.6, size: 2024, note: '人类首次在月球背面采样返回，落点在南极-艾特肯盆地内的阿波罗盆地，将揭示月背深部月壳的组成。', coord: '-153.9° / -41.6°' },
  { name: '月船 3 号', en: 'Chandrayaan-3', type: 'mission', lon: 32.3, lat: -69.4, size: 2023, note: '印度维克拉姆着陆器与智慧号月球车在月球南极附近软着陆，验证了极区着陆与巡视能力。', coord: '+32.3° / -69.4°' },
  { name: 'SLIM', en: 'Smart Lander for Investigating Moon', type: 'mission', lon: 25.3, lat: -13.3, size: 2024, note: '日本月球勘测着陆器，着陆时翻倒但完成既定技术验证，落在酒海边缘的斜坡上。', coord: '+25.3° / -13.3°' },
  { name: '游隼号', en: 'Peregrine', type: 'mission', lon: -40, lat: 25, size: 2024, note: '美国商业月球着陆器，目标区在风暴洋东部的黏性湾，因推进剂泄漏未能着陆，但开启了 CLPS 商业月球任务的尝试。', coord: '-40.0° / +25.0°' },
  { name: '奥德修斯号', en: 'IM-1 Odysseus', type: 'mission', lon: -3, lat: -80.1, size: 2024, note: '美国商业月球着陆器，在极区附近着陆，成为首个成功软着陆的 CLPS 任务，但着陆姿态略倾。', coord: '-3.0° / -80.1°' }
];
