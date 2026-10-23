// 首页「地理冷知识」卡片的双语内容。
//
// 这是**内容**不是 UI 词条，所以不进 dict（dict 只放界面文案），单独成文件按语言取数组。
// 中英条目一一对应（同下标），不要求逐字对译，但必须讲同一件事，
// 否则切换语言后卡片跳到另一个知识点会让人困惑。

import type { Lang } from './config';

export interface GeoFact {
  q: string;
  a: string;
}

export const GEO_FACTS: Record<Lang, GeoFact[]> = {
  zh: [
    { q: '地球赤道周长约 40,075 公里', a: '以高铁时速 300 公里计，绕赤道一圈约需 5.6 天。' },
    { q: '珠穆朗玛峰每年仍在缓慢长高', a: '印度洋板块持续挤压欧亚板块，珠峰年均抬升约数毫米。' },
    { q: '太平洋约占地球海洋面积的 46%', a: '它比地球上所有陆地面积加起来还要大。' },
    { q: '北半球冬季，地球离太阳更近', a: '每年 1 月初过近日点——季节由地轴倾角决定，而非日地距离。' },
    { q: '本初子午线不止穿过英国', a: '它还经过法国、西班牙、阿尔及利亚、马里、加纳等共 8 国。' },
    { q: '大气层的厚度约为地球半径的 1.5%', a: '但正是这薄薄一层，守护着地表所有的生命与天气。' },
    { q: '地球自转其实在变慢', a: '受月球引潮力制动，每过一百年，一天大约延长 1.7 毫秒。' },
    { q: '死海是地球陆地最低点', a: '湖面海拔约 -430 米，盐度约 34%，浮力大得能躺着读书。' },
    { q: '撒哈拉沙漠曾是一片绿洲', a: '约一万年前这里湖泊密布、草木繁茂，由地球轨道周期变化造成。' },
    { q: '国际日期变更线并不笔直', a: '为避免一国跨两个日期，它在白令海峡和太平洋岛屿处刻意弯折。' },
    { q: '南极比北极冷得多', a: '南极是冰雪覆盖的高原陆地，北极是海洋，海陆差异放大了温差。' },
    { q: '地球并非完美球体', a: '自转离心力使赤道略鼓，赤道半径比极半径长约 21 公里。' },
    { q: '闪电温度可达太阳表面的 5 倍', a: '一道闪电核心约 30,000℃，远超太阳表面约 5,500℃。' },
    { q: '马里亚纳海沟比珠峰还深', a: '最深约 11,034 米，把珠峰放进去仍差两千多米才能填满。' },
    { q: '格陵兰冰盖若全融，海平面约升 7 米', a: '南极冰盖若全融，则可使海平面上升约 60 米。' },
    { q: '一天并非正好 24 小时', a: '相对恒星自转一周仅约 23 时 56 分 4 秒，多出的时间来自公转。' },
    { q: '地球上最干旱处几乎无雨', a: '智利阿塔卡马沙漠部分区域，曾有数百年未见可测量的降雨。' },
    { q: '经度 1° 的距离随纬度变化', a: '赤道约 111 公里、向两极趋近 0；纬度 1° 全球则近恒定约 111 公里。' },
    { q: '喜马拉雅山曾是大海', a: '海相岩层与化石证明，这里数千万年前还是古地中海的一部分。' },
    { q: '城市热岛让城区更暖', a: '混凝土吸热、植被稀少，大城市夜间可比郊区高 3–5℃。' },
  ],
  en: [
    { q: 'The equator is about 40,075 km around', a: 'At 300 km/h on a high-speed train, one lap would take roughly 5.6 days.' },
    { q: 'Mount Everest is still slowly growing', a: 'The Indian plate keeps pushing into Eurasia, lifting Everest a few millimetres a year.' },
    { q: 'The Pacific holds about 46% of all ocean area', a: 'It is larger than every piece of land on Earth combined.' },
    { q: 'In northern winter, Earth is closer to the Sun', a: 'Perihelion falls in early January — seasons come from axial tilt, not distance.' },
    { q: 'The prime meridian does not only cross Britain', a: 'It also runs through France, Spain, Algeria, Mali, Ghana and more — eight countries in all.' },
    { q: 'The atmosphere is only about 1.5% of Earth’s radius', a: 'Yet this thin shell shelters all surface life and weather.' },
    { q: 'Earth’s rotation is slowing down', a: 'Lunar tidal braking lengthens the day by roughly 1.7 milliseconds per century.' },
    { q: 'The Dead Sea is the lowest point on land', a: 'Its surface sits about 430 m below sea level, at roughly 34% salinity — you can float and read.' },
    { q: 'The Sahara was once green', a: 'Around 10,000 years ago it held lakes and grassland, driven by cycles in Earth’s orbit.' },
    { q: 'The International Date Line is not straight', a: 'It bends around the Bering Strait and Pacific islands so one country keeps a single date.' },
    { q: 'The South Pole is far colder than the North', a: 'Antarctica is an ice-covered high plateau; the Arctic is ocean. That contrast amplifies the difference.' },
    { q: 'Earth is not a perfect sphere', a: 'Rotational centrifugal force bulges the equator: the equatorial radius exceeds the polar one by about 21 km.' },
    { q: 'Lightning is five times hotter than the Sun’s surface', a: 'A bolt core reaches about 30,000 °C, far above the Sun’s roughly 5,500 °C surface.' },
    { q: 'The Mariana Trench is deeper than Everest is tall', a: 'At about 11,034 m, dropping Everest in would still leave over two kilometres of open water.' },
    { q: 'If Greenland’s ice sheet melted, seas would rise ~7 m', a: 'A full Antarctic melt would raise global sea level by about 60 m.' },
    { q: 'A day is not exactly 24 hours', a: 'Earth turns once relative to the stars in 23 h 56 m 4 s; the extra time comes from its orbit.' },
    { q: 'The driest place on Earth barely sees rain', a: 'Parts of Chile’s Atacama Desert went centuries without measurable rainfall.' },
    { q: 'One degree of longitude changes size with latitude', a: 'About 111 km at the equator, shrinking to zero at the poles; a degree of latitude stays near 111 km.' },
    { q: 'The Himalayas were once a sea', a: 'Marine strata and fossils show this was part of an ancient sea tens of millions of years ago.' },
    { q: 'Cities run hotter than their surroundings', a: 'Concrete stores heat and vegetation is scarce — big cities can be 3–5 °C warmer than suburbs at night.' },
  ],
};

// DEV 期检查中英文条数一致，防止新增中文后遗漏英文。
if (import.meta.env.DEV) {
  const zhLen = GEO_FACTS.zh.length;
  const enLen = GEO_FACTS.en.length;
  if (zhLen !== enLen) {
    console.warn(
      `[geoFacts] 中英文冷知识条数不一致：zh ${zhLen} 条，en ${enLen} 条。请同步补充。`,
    );
  }
}