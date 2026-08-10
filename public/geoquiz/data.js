/**
 * 卫星图猜城市 - 题库数据（100城版）
 * 每题包含：城市名、坐标、缩放级别、俯视特征、冷知识、国家emoji
 * 地理分布：亚洲30 / 欧洲30 / 美洲20 / 非洲12 / 大洋洲8
 */
const CITY_DB = [
  // ==================== 亚洲 15 城 ====================
  {
    id: 1, name: "北京", country: "中国", flag: "🇨🇳",
    lat: 39.8822, lng: 116.4066, zoom: 12,
    feature: "环路同心圆+天坛",
    hint: "古都的礼制建筑与现代化的环形道路交织",
    trivia: ["明清天坛是城南礼制建筑，二环内保留方格路网", "中轴线南起永定门，北至钟鼓楼，全长7.8公里", "从卫星图可清晰看到二环至六环的同心圆结构"],
    nameEn: "Beijing", countryEn: "China",
    featureEn: "Concentric ring roads + Temple of Heaven",
    hintEn: "A capital city where ancient ceremonial architecture intertwines with modern ring roads",
    triviaEn: ["The Temple of Heaven was a Ming-Qing ceremonial complex south of the city; the area inside the 2nd Ring Road retains a grid street pattern", "The central axis runs from Yongdingmen in the south to the Bell and Drum Towers in the north, spanning 7.8 km", "From satellite imagery, the concentric rings from the 2nd to the 6th Ring Road are clearly visible"]
  },
  {
    id: 2, name: "上海", country: "中国", flag: "🇨🇳",
    lat: 31.2397, lng: 121.4998, zoom: 13,
    feature: "陆家嘴高楼群+黄浦江弯",
    hint: "一条大河在这座城市拐了一个大弯，弯边摩天大楼林立",
    trivia: ["陆家嘴曾是农田和仓库区，90年代后崛起为金融天际线", "黄浦江在这里拐了一个近90度的大弯", "东方明珠、上海中心等地标在此形成独特天际线"],
    nameEn: "Shanghai", countryEn: "China",
    featureEn: "Lujiazui skyscrapers + Huangpu River bend",
    hintEn: "A great river makes a dramatic bend here, lined with towering skyscrapers",
    triviaEn: ["Lujiazui was once farmland and warehouses before rising into a financial skyline in the 1990s", "The Huangpu River makes a nearly 90-degree bend at this point", "Landmarks like the Oriental Pearl Tower and Shanghai Tower form a unique skyline here"]
  },
  {
    id: 3, name: "香港", country: "中国", flag: "🇭🇰",
    lat: 22.2855, lng: 114.1577, zoom: 13,
    feature: "维多利亚港+密集高楼",
    hint: "深水良港两岸，摩天大楼密密麻麻挤在海湾边",
    trivia: ["维多利亚港是世界三大天然良港之一，水深港阔", "港岛与九龙隔海相望，是天际线最密集的城市之一", "大片山地限制了城市扩张，建筑只能沿狭窄海岸带分布"],
    nameEn: "Hong Kong", countryEn: "China",
    featureEn: "Victoria Harbour + dense skyscrapers",
    hintEn: "On both sides of a deep-water harbour, skyscrapers are densely packed along the shoreline",
    triviaEn: ["Victoria Harbour is one of the three great natural deep-water harbours in the world", "Hong Kong Island and Kowloon face each other across the water, forming one of the densest skylines on Earth", "Hilly terrain limits urban expansion, forcing buildings onto a narrow coastal strip"]
  },
  {
    id: 4, name: "东京", country: "日本", flag: "🇯🇵",
    lat: 35.6839, lng: 139.7564, zoom: 13,
    feature: "皇居护城河+棋盘",
    hint: "城市中心有一片被护城河环绕的绿色矩形区域",
    trivia: ["皇居即江户城旧址，护城河环绕的矩形清晰可辨", "丸之内商务区就建在皇居外苑东侧", "东京站是放射状铁路网的枢纽，从天空俯瞰路网呈蛛网状"],
    nameEn: "Tokyo", countryEn: "Japan",
    featureEn: "Imperial Palace moat + grid pattern",
    hintEn: "At the city centre lies a green rectangular area surrounded by a moat",
    triviaEn: ["The Imperial Palace stands on the site of Edo Castle; the moated rectangle is clearly recognisable", "The Marunouchi business district lies just east of the palace outer gardens", "Tokyo Station is the hub of a radial rail network, creating a spider-web pattern from above"]
  },
  {
    id: 5, name: "首尔", country: "韩国", flag: "🇰🇷",
    lat: 37.5665, lng: 126.9780, zoom: 12,
    feature: "汉江蜿蜒穿城",
    hint: "一条大河蜿蜒穿过城市，两岸高楼密集",
    trivia: ["汉江自东向西穿过首尔，将城市分为江南与江北", "江南区因影视和娱乐产业闻名全球", "汉江上有27座桥梁，连接两岸的密集都市"],
    nameEn: "Seoul", countryEn: "South Korea",
    featureEn: "Han River meandering through the city",
    hintEn: "A broad river winds through the city, with dense high-rises on both banks",
    triviaEn: ["The Han River flows west through Seoul, dividing the city into Gangnam (south) and Gangbuk (north)", "Gangnam is globally famous for its entertainment and pop-culture industry", "Twenty-seven bridges span the Han River, connecting the densely built-up urban areas on both sides"]
  },
  {
    id: 6, name: "新加坡", country: "新加坡", flag: "🇸🇬",
    lat: 1.2834, lng: 103.8607, zoom: 13,
    feature: "滨海湾+填海造陆",
    hint: "赤道边的岛国，海湾处有独特的花朵形建筑",
    trivia: ["滨海湾金沙酒店是三栋塔楼顶部连着船形空中花园", "滨海堤坝将海湾变成淡水水库，也是休闲胜地", "新加坡通过填海造陆，国土面积比独立时增加了约25%"],
    nameEn: "Singapore", countryEn: "Singapore",
    featureEn: "Marina Bay + land reclamation",
    hintEn: "An equatorial island nation with a unique flower-shaped building on its bayfront",
    triviaEn: ["Marina Bay Sands features three towers linked by a ship-shaped rooftop garden", "The Marina Barrage dams the bay into a freshwater reservoir and leisure destination", "Singapore has expanded its land area by about 25% through land reclamation since independence"]
  },
  {
    id: 7, name: "曼谷", country: "泰国", flag: "🇹🇭",
    lat: 13.7563, lng: 100.5018, zoom: 13,
    feature: "湄南河蜿蜒穿城",
    hint: "热带城市中，一条大河蛇形蜿蜒穿过市区",
    trivia: ["湄南河是泰国的母亲河，曼谷沿河两岸发展", "城市运河纵横，曾有'东方威尼斯'之称", "大皇宫和寺庙群集中在河流弯道处"],
    nameEn: "Bangkok", countryEn: "Thailand",
    featureEn: "Chao Phraya River meandering through the city",
    hintEn: "In this tropical city, a great river snakes its way through the urban landscape",
    triviaEn: ["The Chao Phraya is Thailand's lifeline; Bangkok grew along its banks", "Criss-crossing canals once earned the city the nickname 'Venice of the East'", "The Grand Palace and temple complexes cluster around a bend in the river"]
  },
  {
    id: 8, name: "孟买", country: "印度", flag: "🇮🇳",
    lat: 19.0760, lng: 72.8777, zoom: 12,
    feature: "半岛+海湾",
    hint: "一座伸入阿拉伯海的半岛城市，海湾环绕",
    trivia: ["孟买由七个岛屿填海连接而成，如今连成半岛", "它是印度的金融和娱乐之都，宝莱坞所在地", "马希姆湾与阿拉伯海环抱，海岸线曲折"],
    nameEn: "Mumbai", countryEn: "India",
    featureEn: "Peninsula + bays",
    hintEn: "A peninsula city reaching into the Arabian Sea, embraced by bays",
    triviaEn: ["Mumbai was formed by reclaiming and connecting seven islands into a single peninsula", "It is India's financial and entertainment capital, home to Bollywood", "Mahim Bay and the Arabian Sea cradle the city with a rugged coastline"]
  },
  {
    id: 9, name: "迪拜", country: "阿联酋", flag: "🇦🇪",
    lat: 25.1124, lng: 55.1390, zoom: 13,
    feature: "棕榈岛人工填海",
    hint: "沙漠与海洋的交界处，有着世界上最大的人工岛群",
    trivia: ["棕榈朱美拉是人工岛，棕榈叶形状从太空清晰可见", "整座岛用沙石填海而成，耗资约120亿美元", "岛上的别墅和酒店曾是迪拜房产狂潮的象征"],
    nameEn: "Dubai", countryEn: "UAE",
    featureEn: "Palm Island artificial reclamation",
    hintEn: "At the boundary of desert and sea lies the world's largest group of artificial islands",
    triviaEn: ["Palm Jumeirah is an artificial island whose palm-frond shape is clearly visible from space", "The entire island was built from dredged sand at a cost of about $12 billion", "The villas and hotels on the island were icons of Dubai's real-estate boom"]
  },
  {
    id: 10, name: "多哈", country: "卡塔尔", flag: "🇶🇦",
    lat: 25.2854, lng: 51.5310, zoom: 13,
    feature: "半岛+珍珠岛填海",
    hint: "波斯湾畔的半岛城市，近海有人工岛屿",
    trivia: ["珍珠卡塔尔是人工岛，形如一串珍珠项链", "多哈半岛伸入波斯湾，城市沿半岛两岸展开", "它是2022年世界杯的主办城市之一"],
    nameEn: "Doha", countryEn: "Qatar",
    featureEn: "Peninsula + Pearl Island reclamation",
    hintEn: "A peninsula city on the Persian Gulf with artificial islands offshore",
    triviaEn: ["The Pearl-Qatar is an artificial island shaped like a string of pearls", "The Doha peninsula juts into the Persian Gulf, with the city spreading along both shores", "It was one of the host cities for the 2022 FIFA World Cup"]
  },
  {
    id: 11, name: "利雅得", country: "沙特", flag: "🇸🇦",
    lat: 24.7136, lng: 46.6753, zoom: 12,
    feature: "沙漠网格+国王中心",
    hint: "高原沙漠中，城市以规则网格蔓延，中心有标志性建筑",
    trivia: ["国王中心大厦形如开瓶器，是城市地标", "利雅得意为'花园'，却建在阿拉伯高原沙漠中", "城市规划是典型的方格网，在沙漠中格外醒目"],
    nameEn: "Riyadh", countryEn: "Saudi Arabia",
    featureEn: "Desert grid + Kingdom Centre",
    hintEn: "On a desert plateau, the city spreads in a regular grid with an iconic landmark at its centre",
    triviaEn: ["The Kingdom Centre tower, shaped like a bottle opener, is the city's landmark", "Riyadh means 'gardens', yet it sits on the Arabian desert plateau", "The city's classic grid plan stands out sharply against the surrounding desert"]
  },
  {
    id: 12, name: "特拉维夫", country: "以色列", flag: "🇮🇱",
    lat: 32.0853, lng: 34.7818, zoom: 13,
    feature: "海岸直线+白城建筑",
    hint: "地中海东岸的海滨城市，建筑沿海岸线整齐排列",
    trivia: ["特拉维夫拥有全球最多的包豪斯风格建筑，被称为'白城'", "城市沿海岸线南北延伸，布局规整", "它是以色列的经济中心，与古城雅法相连"],
    nameEn: "Tel Aviv", countryEn: "Israel",
    featureEn: "Straight coastline + White City architecture",
    hintEn: "A Mediterranean coastal city with buildings neatly lined along the shoreline",
    triviaEn: ["Tel Aviv has the world's largest collection of Bauhaus-style buildings, earning it the name 'White City'", "The city extends north-south along the coastline in an orderly layout", "It is Israel's economic hub, connected to the ancient port city of Jaffa"]
  },
  {
    id: 13, name: "吉隆坡", country: "马来西亚", flag: "🇲🇾",
    lat: 3.1390, lng: 101.6869, zoom: 13,
    feature: "双子塔+山谷城市",
    hint: "热带山谷中的城市，有标志性的双塔建筑",
    trivia: ["双子塔曾是世界最高建筑，高452米", "城市建在巴生河与鹅麦河交汇处的山谷中", "周边热带雨林环抱，城市与丛林交错"],
    nameEn: "Kuala Lumpur", countryEn: "Malaysia",
    featureEn: "Petronas Twin Towers + valley city",
    hintEn: "A city nestled in a tropical valley, crowned by its iconic twin towers",
    triviaEn: ["The Petronas Twin Towers were once the world's tallest buildings, standing at 452 metres", "The city sits in a valley at the confluence of the Klang and Gombak Rivers", "Lush tropical rainforest surrounds the city, where urban sprawl meets the jungle"]
  },
  {
    id: 14, name: "雅加达", country: "印尼", flag: "🇮🇩",
    lat: -6.2088, lng: 106.8456, zoom: 12,
    feature: "海岸平原+密集路网",
    hint: "爪哇岛北海岸的特大城市，河网密布",
    trivia: ["雅加达是东南亚人口最多的城市之一", "城市建在沿海冲积平原上，河流纵横", "由于地下水过度开采，雅加达是全球沉降最快的城市"],
    nameEn: "Jakarta", countryEn: "Indonesia",
    featureEn: "Coastal plain + dense road network",
    hintEn: "A megacity on Java's north coast, criss-crossed by a dense network of rivers",
    triviaEn: ["Jakarta is one of the most populous cities in Southeast Asia", "Built on a coastal alluvial plain, the city is threaded by numerous waterways", "Due to excessive groundwater extraction, Jakarta is among the fastest-sinking cities in the world"]
  },
  {
    id: 15, name: "河内", country: "越南", flag: "🇻🇳",
    lat: 21.0285, lng: 105.8542, zoom: 13,
    feature: "红河弯+棋盘老城",
    hint: "红河三角洲的城市，老城区保留棋盘格局",
    trivia: ["河内老城以还剑湖为中心，街道呈棋盘状", "红河在城市东侧蜿蜒流过", "它是越南千年古都，寺庙湖泊遍布全城"],
    nameEn: "Hanoi", countryEn: "Vietnam",
    featureEn: "Red River bend + grid-pattern Old Quarter",
    hintEn: "A city on the Red River Delta whose Old Quarter retains a grid-like street layout",
    triviaEn: ["Hanoi's Old Quarter centres on Hoan Kiem Lake with streets arranged in a grid pattern", "The Red River meanders past the eastern edge of the city", "It is Vietnam's thousand-year-old capital, dotted with temples and lakes throughout"]
  },

  // ==================== 欧洲 15 城 ====================
  {
    id: 16, name: "巴黎", country: "法国", flag: "🇫🇷",
    lat: 48.8606, lng: 2.3376, zoom: 13,
    feature: "凯旋门放射状路网",
    hint: "一座城市的中心，道路像车轮辐条般向四周放射",
    trivia: ["巴黎以凯旋门为圆心，向外延伸出12条放射大道", "这种规划源于19世纪奥斯曼男爵的城市改造", "香榭丽舍大街就是其中最著名的那条"],
    nameEn: "Paris", countryEn: "France",
    featureEn: "Arc de Triomphe radial road network",
    hintEn: "At the heart of this city, roads radiate outward like the spokes of a wheel",
    triviaEn: ["Paris fans out with 12 grand avenues radiating from the Arc de Triomphe", "This layout dates from Baron Haussmann's 19th-century urban renovation", "The Champs-Elysees is the most famous of these radial boulevards"]
  },
  {
    id: 17, name: "伦敦", country: "英国", flag: "🇬🇧",
    lat: 51.5074, lng: -0.1278, zoom: 13,
    feature: "泰晤士河蛇形弯",
    hint: "一条大河在城市中蛇形蜿蜒，两岸地标密布",
    trivia: ["泰晤士河在伦敦市区有多个大弯，最著名的是狗岛弯", "塔桥、伦敦眼、大本钟沿河分布", "河流弯道造就了伦敦独特的城市天际线"],
    nameEn: "London", countryEn: "United Kingdom",
    featureEn: "Thames River meandering bends",
    hintEn: "A great river snakes through the city, with landmarks crowding both banks",
    triviaEn: ["The Thames makes several large bends through central London, the most famous being the Isle of Dogs loop", "Tower Bridge, the London Eye, and Big Ben all line the river", "The river's curves shape London's distinctive urban skyline"]
  },
  {
    id: 18, name: "罗马", country: "意大利", flag: "🇮🇹",
    lat: 41.8902, lng: 12.4922, zoom: 14,
    feature: "斗兽场+台伯河弯",
    hint: "永恒之城，河弯处矗立着椭圆形的古老竞技场",
    trivia: ["罗马斗兽场建于公元70年，可容纳5万观众", "台伯河在这里形成一个明显的弯道", "古罗马广场就在斗兽场旁，是帝国的政治中心"],
    nameEn: "Rome", countryEn: "Italy",
    featureEn: "Colosseum + Tiber River bend",
    hintEn: "The Eternal City, where an oval ancient arena stands by a bend in the river",
    triviaEn: ["The Colosseum was built in AD 70 and could seat 50,000 spectators", "The Tiber River forms a distinct bend at this point", "The Roman Forum, the political heart of the empire, lies right beside the Colosseum"]
  },
  {
    id: 19, name: "威尼斯", country: "意大利", flag: "🇮🇹",
    lat: 45.4408, lng: 12.3155, zoom: 13,
    feature: "运河替代街道",
    hint: "一座没有汽车的城市，水道就是它的街道",
    trivia: ["威尼斯建在潟湖上，全城无汽车，只有水道和步行道", "城市由118个小岛和400多座桥梁组成", "大运河呈S形贯穿全城，是水上交通主干道"],
    nameEn: "Venice", countryEn: "Italy",
    featureEn: "Canals instead of streets",
    hintEn: "A car-free city where canals serve as its streets",
    triviaEn: ["Venice is built on a lagoon with no cars, only canals and walkways", "The city consists of 118 small islands connected by over 400 bridges", "The Grand Canal follows an S-curve through the city, serving as the main waterway"]
  },
  {
    id: 20, name: "阿姆斯特丹", country: "荷兰", flag: "🇳🇱",
    lat: 52.3676, lng: 4.9041, zoom: 13,
    feature: "同心半圆运河",
    hint: "低地国家首都，运河呈同心半圆形层层向外扩展",
    trivia: ["阿姆斯特丹运河带是17世纪黄金时代的产物，呈同心半圆", "城市运河总长超过100公里，有1600多座桥梁", "整个城市建在海平面以下，靠运河排水维持"],
    nameEn: "Amsterdam", countryEn: "Netherlands",
    featureEn: "Concentric semicircular canals",
    hintEn: "The capital of a low-lying country, with canals expanding outward in concentric semicircles",
    triviaEn: ["Amsterdam's canal ring dates from the 17th-century Golden Age, forming concentric semicircles", "The city's canals total over 100 km, crossed by more than 1,600 bridges", "The entire city lies below sea level, kept dry by its canal drainage system"]
  },
  {
    id: 21, name: "巴塞罗那", country: "西班牙", flag: "🇪🇸",
    lat: 41.3851, lng: 2.1734, zoom: 14,
    feature: "规整网格+斜切大道",
    hint: "海滨城市，街区如棋盘般规整，有一条斜切对角的大道",
    trivia: ["扩建区是19世纪的网格规划，街区呈八角形", "对角线大道斜穿整个网格，是城市的几何特色", "圣家堂位于网格区的北端，仍在建造中"],
    nameEn: "Barcelona", countryEn: "Spain",
    featureEn: "Regular grid + diagonal avenue",
    hintEn: "A coastal city with chessboard-like blocks and a diagonal avenue cutting across",
    triviaEn: ["The Eixample district features a 19th-century grid plan with octagonal blocks", "Diagonal Avenue slashes across the entire grid, giving the city its geometric flair", "The Sagrada Familia stands at the northern end of the grid district, still under construction"]
  },
  {
    id: 22, name: "马德里", country: "西班牙", flag: "🇪🇸",
    lat: 40.4168, lng: -3.7038, zoom: 14,
    feature: "放射状路网+广场",
    hint: "伊比利亚高原上的首都，道路以广场为圆心放射",
    trivia: ["太阳门广场是城市中心，也是西班牙公路零公里起点", "多条放射大道从广场向外延伸", "马德里是欧洲海拔最高的首都，约667米"],
    nameEn: "Madrid", countryEn: "Spain",
    featureEn: "Radial road network + plaza",
    hintEn: "A capital on the Iberian plateau, with roads radiating from a central square",
    triviaEn: ["Puerta del Sol is the city centre and the zero-kilometre origin of Spain's road network", "Multiple radial avenues extend outward from the square", "Madrid is the highest capital in Europe at about 667 metres above sea level"]
  },
  {
    id: 23, name: "柏林", country: "德国", flag: "🇩🇪",
    lat: 52.5163, lng: 13.3777, zoom: 13,
    feature: "施普雷河弯+蒂尔加滕",
    hint: "城市中心有一片巨大的长方形绿地公园",
    trivia: ["蒂尔加滕是柏林最大的城市公园，呈长条形", "施普雷河在公园北面形成弯道", "勃兰登堡门就在公园西侧，是城市标志"],
    nameEn: "Berlin", countryEn: "Germany",
    featureEn: "Spree River bend + Tiergarten",
    hintEn: "At the city centre lies a vast rectangular green park",
    triviaEn: ["Tiergarten is Berlin's largest urban park, stretching in a long rectangular shape", "The Spree River curves around the northern edge of the park", "The Brandenburg Gate stands at the western end of the park, the city's iconic symbol"]
  },
  {
    id: 24, name: "维也纳", country: "奥地利", flag: "🇦🇹",
    lat: 48.2082, lng: 16.3738, zoom: 13,
    feature: "多瑙河+环城大道",
    hint: "多瑙河畔的城市，老城被环形大道环绕",
    trivia: ["环城大道沿旧城墙而建，呈环形包围老城", "多瑙河从城市东面流过，多瑙运河分隔老城", "维也纳是音乐之都，莫扎特、贝多芬曾在此创作"],
    nameEn: "Vienna", countryEn: "Austria",
    featureEn: "Danube River + Ringstrasse",
    hintEn: "A city on the Danube, whose old town is encircled by a grand ring boulevard",
    triviaEn: ["The Ringstrasse follows the line of the old city walls, looping around the historic centre", "The Danube flows past the eastern side of the city, with the Danube Canal dividing the old town", "Vienna is the capital of music, where Mozart and Beethoven once composed"]
  },
  {
    id: 25, name: "布拉格", country: "捷克", flag: "🇨🇿",
    lat: 50.0875, lng: 14.4213, zoom: 14,
    feature: "伏尔塔瓦河弯+城堡",
    hint: "伏尔塔瓦河在城市中画出一个大弯，弯内有古堡",
    trivia: ["布拉格城堡位于河弯西岸的山丘上，是世界最大古堡群", "查理大桥横跨伏尔塔瓦河，连接老城与城堡", "城市被誉为'百塔之城'，红屋顶连绵"],
    nameEn: "Prague", countryEn: "Czech Republic",
    featureEn: "Vltava River bend + castle",
    hintEn: "The Vltava River draws a great bend through the city, with an ancient castle inside the curve",
    triviaEn: ["Prague Castle sits on a hill on the west bank of the river bend, the largest ancient castle complex in the world", "Charles Bridge spans the Vltava, linking the Old Town to the castle", "Known as the 'City of a Hundred Spires', its red rooftops stretch endlessly"]
  },
  {
    id: 26, name: "布达佩斯", country: "匈牙利", flag: "🇭🇺",
    lat: 47.4979, lng: 19.0402, zoom: 13,
    feature: "多瑙河两岸双城",
    hint: "多瑙河将城市一分为二，西岸丘陵东岸平原",
    trivia: ["布达与佩斯原是两座城，1873年合并", "布达在河西多丘陵，佩斯在河东是平原", "国会大厦位于佩斯一侧河岸，是哥特复兴建筑杰作"],
    nameEn: "Budapest", countryEn: "Hungary",
    featureEn: "Twin cities on the Danube",
    hintEn: "The Danube splits the city in two, hilly on the west bank and flat on the east",
    triviaEn: ["Buda and Pest were two separate cities until they merged in 1873", "Buda on the west bank is hilly; Pest on the east bank is flat", "The Parliament Building on the Pest side of the river is a masterpiece of Gothic Revival architecture"]
  },
  {
    id: 27, name: "雅典", country: "希腊", flag: "🇬🇷",
    lat: 37.9715, lng: 23.7257, zoom: 14,
    feature: "卫城山+城市",
    hint: "城市中有一座突兀的平顶岩石山，山顶有古神庙",
    trivia: ["雅典卫城建在156米高的石灰岩山上，有帕特农神庙", "整座现代城市围绕卫山铺开，白墙红顶", "它是西方文明的发源地，民主制度的摇篮"],
    nameEn: "Athens", countryEn: "Greece",
    featureEn: "Acropolis hill + city",
    hintEn: "A flat-topped rock outcrop rises in the middle of the city, crowned by an ancient temple",
    triviaEn: ["The Acropolis stands on a 156-metre limestone hill, crowned by the Parthenon", "The modern city spreads out around the rocky hill with white walls and red roofs", "It is the birthplace of Western civilisation and the cradle of democracy"]
  },
  {
    id: 28, name: "莫斯科", country: "俄罗斯", flag: "🇷🇺",
    lat: 55.7517, lng: 37.6233, zoom: 12,
    feature: "环形放射+克里姆林宫",
    hint: "城市以三角形城堡为中心，环路层层向外扩展",
    trivia: ["克里姆林宫是红色三角围墙的城堡群，城市核心", "莫斯科环路多达四环五环，呈同心圆向外辐射", "红场位于克里姆林宫东墙外，是俄罗斯的象征"],
    nameEn: "Moscow", countryEn: "Russia",
    featureEn: "Ring-radial + Kremlin",
    hintEn: "The city expands outward in concentric ring roads centred on a triangular fortress",
    triviaEn: ["The Kremlin is a red-walled triangular fortress complex, the very heart of the city", "Moscow has up to four or five ring roads radiating outward in concentric circles", "Red Square lies just outside the Kremlin's eastern wall, a symbol of Russia"]
  },
  {
    id: 29, name: "圣彼得堡", country: "俄罗斯", flag: "🇷🇺",
    lat: 59.9343, lng: 30.3351, zoom: 13,
    feature: "涅瓦河+棋盘",
    hint: "北方水城，涅瓦河分叉成网，棋盘式街道",
    trivia: ["圣彼得堡建在涅瓦河三角洲上，河流运河纵横", "它有'北方威尼斯'之称，桥梁超过800座", "冬宫位于涅瓦河畔，是沙皇的冬宫"],
    nameEn: "Saint Petersburg", countryEn: "Russia",
    featureEn: "Neva River + grid pattern",
    hintEn: "A northern water city where the Neva branches into a network of canals with grid-pattern streets",
    triviaEn: ["Saint Petersburg was built on the Neva River delta, criss-crossed by rivers and canals", "Called the 'Venice of the North', it has over 800 bridges", "The Winter Palace on the Neva's banks was the Tsar's winter residence"]
  },
  {
    id: 30, name: "里斯本", country: "葡萄牙", flag: "🇵🇹",
    lat: 38.7223, lng: -9.1393, zoom: 13,
    feature: "塔霍河口+七丘",
    hint: "大西洋畔的河口城市，建在七座山丘上",
    trivia: ["里斯本建在七座山丘上，被称为'七丘之城'", "塔霍河在这里注入大西洋，形成宽阔河口", "它是欧洲最西端的首都，大航海时代起点"],
    nameEn: "Lisbon", countryEn: "Portugal",
    featureEn: "Tagus River estuary + seven hills",
    hintEn: "An Atlantic estuary city built on seven hills",
    triviaEn: ["Lisbon is built on seven hills, known as the 'City of Seven Hills'", "The Tagus River meets the Atlantic here, forming a broad estuary", "It is the westernmost capital in Europe and the starting point of the Age of Discovery"]
  },

  // ==================== 美洲 12 城 ====================
  {
    id: 31, name: "纽约", country: "美国", flag: "🇺🇸",
    lat: 40.7549, lng: -73.9840, zoom: 13,
    feature: "曼哈顿棋盘网格",
    hint: "一座岛屿上，街道像棋盘一样横平竖直",
    trivia: ["大道南北向，街东西向，编号即位置", "1811年委员会规划奠定了这座网格城市的基础", "中央公园是网格中那片醒目的绿色长条"],
    nameEn: "New York", countryEn: "United States",
    featureEn: "Manhattan grid pattern",
    hintEn: "On an island, streets run in a rigid chessboard grid",
    triviaEn: ["Avenues run north-south, streets run east-west, and the numbers indicate your position", "The 1811 Commissioners' Plan laid the foundation for this grid city", "Central Park is that striking green rectangle interrupting the grid"]
  },
  {
    id: 32, name: "拉斯维加斯", country: "美国", flag: "🇺🇸",
    lat: 36.1147, lng: -115.1728, zoom: 12,
    feature: "沙漠中的笔直网格",
    hint: "一片荒漠之中，突然出现规则的网格状城市",
    trivia: ["赌城建在莫哈维沙漠中，周围数百公里都是荒漠", "城市布局是严格的南北东西网格，在沙漠中格外醒目", "拉斯维加斯大道是那条贯穿城市的明亮光带"],
    nameEn: "Las Vegas", countryEn: "United States",
    featureEn: "Perfect grid in the desert",
    hintEn: "In the middle of a barren desert, a perfectly gridded city suddenly appears",
    triviaEn: ["This casino city sits in the Mojave Desert, surrounded by hundreds of kilometres of emptiness", "The layout is a strict north-south, east-west grid, strikingly visible in the desert", "The Las Vegas Strip is that bright ribbon of light cutting through the city"]
  },
  {
    id: 33, name: "芝加哥", country: "美国", flag: "🇺🇸",
    lat: 41.8825, lng: -87.6233, zoom: 13,
    feature: "密歇根湖畔网格",
    hint: "大湖岸边的高楼城市，街道垂直于湖岸排列",
    trivia: ["芝加哥沿密歇根湖西岸延伸，街道呈棋盘状", "它是美国摩天大楼的发源地，1871年大火后重建", "千禧公园的豆形雕塑是城市新地标"],
    nameEn: "Chicago", countryEn: "United States",
    featureEn: "Lake Michigan shoreline grid",
    hintEn: "A skyscraper city on a Great Lake, with streets aligned perpendicular to the shoreline",
    triviaEn: ["Chicago stretches along the western shore of Lake Michigan in a chessboard pattern", "It is the birthplace of the American skyscraper, rebuilt after the Great Fire of 1871", "The Bean sculpture in Millennium Park is the city's modern landmark"]
  },
  {
    id: 34, name: "旧金山", country: "美国", flag: "🇺🇸",
    lat: 37.8199, lng: -122.4783, zoom: 13,
    feature: "半岛+金门湾",
    hint: "三面环海的半岛城市，海峡上有红色斜拉桥",
    trivia: ["旧金山建在半岛尖端，三面环水", "金门大桥横跨海峡，是国际橙色悬索桥", "城市建在43座山丘上，街道起伏陡峭"],
    nameEn: "San Francisco", countryEn: "United States",
    featureEn: "Peninsula + Golden Gate Bay",
    hintEn: "A peninsula city surrounded by water on three sides, with a red suspension bridge spanning the strait",
    triviaEn: ["San Francisco sits on the tip of a peninsula, surrounded by water on three sides", "The Golden Gate Bridge spans the strait in its signature international orange", "The city is built on 43 hills, with streets that rise and fall steeply"]
  },
  {
    id: 35, name: "洛杉矶", country: "美国", flag: "🇺🇸",
    lat: 34.0522, lng: -118.2437, zoom: 12,
    feature: "棋盘网格延伸",
    hint: "太平洋东岸的巨型城市，棋盘网格无边无际",
    trivia: ["洛杉矶大都会区绵延上百公里，无明显中心", "街道多为正南北正东西，网格延伸到山脉脚下", "好莱坞标志在山丘上俯瞰整个城市"],
    nameEn: "Los Angeles", countryEn: "United States",
    featureEn: "Endless grid expansion",
    hintEn: "A vast metropolis on the Pacific coast with a grid that stretches endlessly",
    triviaEn: ["The LA metropolitan area sprawls over 100 km with no clear centre", "Most streets run true north-south and east-west, the grid reaching all the way to the mountains", "The Hollywood sign overlooks the city from the hills"]
  },
  {
    id: 36, name: "里约热内卢", country: "巴西", flag: "🇧🇷",
    lat: 22.9519, lng: -43.2105, zoom: 12,
    feature: "山海城市+瓜纳巴拉湾",
    hint: "山海之间，一座巨大的海湾深入城市腹地",
    trivia: ["基督像立于科科瓦多山，俯瞰整座海湾城市", "瓜纳巴拉湾是世界最大的海湾之一", "糖面包山与基督像遥相呼应，是城市地标"],
    nameEn: "Rio de Janeiro", countryEn: "Brazil",
    featureEn: "Mountain-meets-sea city + Guanabara Bay",
    hintEn: "Between mountains and sea, a massive bay cuts deep into the heart of the city",
    triviaEn: ["Christ the Redeemer stands atop Corcovado Mountain, overlooking the entire bay city", "Guanabara Bay is one of the largest bays in the world", "Sugarloaf Mountain echoes Christ the Redeemer as the city's iconic landmarks"]
  },
  {
    id: 37, name: "布宜诺斯艾利斯", country: "阿根廷", flag: "🇦🇷",
    lat: -34.5889, lng: -58.3838, zoom: 13,
    feature: "方格+拉普拉塔河",
    hint: "南美大西洋畔的城市，棋盘街道沿河岸延伸",
    trivia: ["布宜诺斯艾利斯被誉为'南美巴黎'，街道呈方格状", "拉普拉塔河是世界上最宽的河口之一", "五月广场是城市的政治中心"],
    nameEn: "Buenos Aires", countryEn: "Argentina",
    featureEn: "Grid + Rio de la Plata",
    hintEn: "A South American Atlantic city whose grid streets extend along the riverbank",
    triviaEn: ["Buenos Aires is known as the 'Paris of South America', with streets laid out in a grid pattern", "The Rio de la Plata is one of the widest river mouths in the world", "Plaza de Mayo is the political heart of the city"]
  },
  {
    id: 38, name: "墨西哥城", country: "墨西哥", flag: "🇲🇽",
    lat: 19.4326, lng: -99.1332, zoom: 12,
    feature: "高原盆地+宪法广场",
    hint: "高原盆地中的特大城市，建于古湖床上",
    trivia: ["墨西哥城建在特斯科科湖的干涸湖床上", "宪法广场是拉美最大的广场", "城市四周被火山环绕，海拔2240米"],
    nameEn: "Mexico City", countryEn: "Mexico",
    featureEn: "Highland basin + Zocalo",
    hintEn: "A megacity in a highland basin, built on a dried-up ancient lakebed",
    triviaEn: ["Mexico City was built on the dried lakebed of Lake Texcoco", "The Zocalo (Constitution Square) is the largest plaza in Latin America", "The city is ringed by volcanoes at an elevation of 2,240 metres"]
  },
  {
    id: 39, name: "多伦多", country: "加拿大", flag: "🇨🇦",
    lat: 43.6532, lng: -79.3832, zoom: 13,
    feature: "安大略湖畔+CN塔",
    hint: "大湖北岸的城市，湖边矗立着一座高耸的尖塔",
    trivia: ["CN塔高553米，曾是世界最高独立建筑", "多伦多沿安大略湖北岸延伸", "它是加拿大最大城市，多元文化之都"],
    nameEn: "Toronto", countryEn: "Canada",
    featureEn: "Lake Ontario shoreline + CN Tower",
    hintEn: "A city on the northern shore of a Great Lake, crowned by a soaring needle tower",
    triviaEn: ["The CN Tower rises 553 metres and was once the world's tallest freestanding structure", "Toronto stretches along the northern shore of Lake Ontario", "It is Canada's largest city and a capital of multiculturalism"]
  },
  {
    id: 40, name: "温哥华", country: "加拿大", flag: "🇨🇦",
    lat: 49.2827, lng: -123.1207, zoom: 13,
    feature: "海湾+山脉",
    hint: "山海之间的港口城市，背景是覆雪山脉",
    trivia: ["温哥华背靠海岸山脉，面朝太平洋海湾", "它是北美密度最高的城市之一，高楼集中在半岛", "斯坦利公园是北美最大城市公园之一"],
    nameEn: "Vancouver", countryEn: "Canada",
    featureEn: "Bay + mountains",
    hintEn: "A port city nestled between mountains and sea, backed by snow-capped peaks",
    triviaEn: ["Vancouver sits between the Coast Mountains and a Pacific bay", "It is one of the densest cities in North America, with skyscrapers concentrated on a peninsula", "Stanley Park is one of the largest urban parks in North America"]
  },
  {
    id: 41, name: "迈阿密", country: "美国", flag: "🇺🇸",
    lat: 25.7832, lng: -80.1330, zoom: 12,
    feature: "海岸+人工岛",
    hint: "大西洋沿岸的低洼城市，海湾中有人工岛屿群",
    trivia: ["迈阿密海滩建在堰洲岛上，与大陆隔比斯坎湾", "湾区人工岛屿星罗棋布，是富人的聚居地", "它面临海平面上升威胁，是气候变化的焦点城市"],
    nameEn: "Miami", countryEn: "United States",
    featureEn: "Coastline + artificial islands",
    hintEn: "A low-lying city on the Atlantic coast with a cluster of artificial islands in its bay",
    triviaEn: ["Miami Beach sits on a barrier island, separated from the mainland by Biscayne Bay", "Artificial islands dot the bay, home to exclusive residential communities", "It faces a serious threat from sea-level rise, making it a focal point for climate change"]
  },
  {
    id: 42, name: "西雅图", country: "美国", flag: "🇺🇸",
    lat: 47.6205, lng: -122.3493, zoom: 12,
    feature: "普吉特海湾+太空针",
    hint: "太平洋西北的港口城市，海湾与湖泊环绕",
    trivia: ["西雅图建在普吉特湾与华盛顿湖之间的地峡上", "太空针塔是为1962年世博会建造的地标", "它被湖泊、海湾和山脉环抱，地理环境独特"],
    nameEn: "Seattle", countryEn: "United States",
    featureEn: "Puget Sound + Space Needle",
    hintEn: "A Pacific Northwest port city surrounded by bays and lakes",
    triviaEn: ["Seattle sits on an isthmus between Puget Sound and Lake Washington", "The Space Needle was built as the landmark for the 1962 World's Fair", "It is embraced by lakes, bays, and mountains in a unique geographic setting"]
  },

  // ==================== 非洲 5 城 ====================
  {
    id: 43, name: "开罗", country: "埃及", flag: "🇪🇬",
    lat: 30.0131, lng: 31.2118, zoom: 12,
    feature: "尼罗河穿城+西南金字塔",
    hint: "一条大河穿城而过，城郊沙漠中屹立着千年古迹",
    trivia: ["吉萨金字塔群位于城市西南郊的沙漠边缘", "尼罗河是这座千年古城的生命线", "从卫星图可见城市沿尼罗河两岸蔓延，向西直达沙漠"],
    nameEn: "Cairo", countryEn: "Egypt",
    featureEn: "Nile River through the city + pyramids to the southwest",
    hintEn: "A great river flows through the city, with millennia-old monuments standing on its desert outskirts",
    triviaEn: ["The Giza Pyramid Complex sits on the desert edge at the city's south-western fringe", "The Nile River is the lifeline of this ancient city", "From satellite imagery, the city spreads along both banks of the Nile, reaching west to the desert"]
  },
  {
    id: 44, name: "开普敦", country: "南非", flag: "🇿🇦",
    lat: -33.9091, lng: 18.4236, zoom: 12,
    feature: "桌山+海湾",
    hint: "非洲最南端的城市，背后是平坦如桌的山峰",
    trivia: ["桌山高1086米，山顶平坦如桌，是城市标志", "开普敦位于大西洋与印度洋交汇处", "好望角就在城南，是航海史上的地标"],
    nameEn: "Cape Town", countryEn: "South Africa",
    featureEn: "Table Mountain + bay",
    hintEn: "A city at Africa's southern tip, backed by a mountain with a flat tabletop summit",
    triviaEn: ["Table Mountain rises 1,086 metres with a perfectly flat summit, the city's icon", "Cape Town lies where the Atlantic and Indian Oceans meet", "The Cape of Good Hope lies just south of the city, a landmark in maritime history"]
  },
  {
    id: 45, name: "内罗毕", country: "肯尼亚", flag: "🇰🇪",
    lat: -1.2921, lng: 36.8219, zoom: 12,
    feature: "高原城市+恩贡山",
    hint: "东非高原上的绿色城市，西边可见一排山丘",
    trivia: ["内罗毕海拔1795米，意为'凉爽的水'", "它是东非最大的城市，也是联合国环境署所在地", "恩贡山在城西，是《走出非洲》的故事背景地"],
    nameEn: "Nairobi", countryEn: "Kenya",
    featureEn: "Highland city + Ngong Hills",
    hintEn: "A green city on the East African plateau, with a row of hills visible to the west",
    triviaEn: ["Nairobi sits at 1,795 metres, its name meaning 'cool water'", "It is the largest city in East Africa and the headquarters of the UN Environment Programme", "The Ngong Hills to the west were the setting for 'Out of Africa'"]
  },
  {
    id: 46, name: "拉各斯", country: "尼日利亚", flag: "🇳🇬",
    lat: 6.4541, lng: 3.3940, zoom: 12,
    feature: "海岛+潟湖",
    hint: "西非潟湖与大海之间的城市，岛屿与陆地相连",
    trivia: ["拉各斯由大陆和岛屿组成，潟湖遍布", "它是非洲人口最多的城市，超过1500万", "维多利亚岛是商务中心，由桥梁与大陆相连"],
    nameEn: "Lagos", countryEn: "Nigeria",
    featureEn: "Islands + lagoon",
    hintEn: "A city between a West African lagoon and the sea, with islands linked to the mainland",
    triviaEn: ["Lagos consists of mainland and islands, threaded by lagoons", "It is the most populous city in Africa with over 15 million people", "Victoria Island is the business hub, connected to the mainland by bridges"]
  },
  {
    id: 47, name: "卡萨布兰卡", country: "摩洛哥", flag: "🇲🇦",
    lat: 33.5731, lng: -7.5898, zoom: 12,
    feature: "海岸+哈桑二世清真寺",
    hint: "大西洋东岸的城市，海上有巨大的清真寺",
    trivia: ["哈桑二世清真寺建在海边，部分伸入大西洋", "它的宣礼塔高210米，是世界最高宗教建筑", "卡萨布兰卡是大西洋沿岸的港口城市"],
    nameEn: "Casablanca", countryEn: "Morocco",
    featureEn: "Coastline + Hassan II Mosque",
    hintEn: "A city on the Atlantic coast with a massive mosque standing over the sea",
    triviaEn: ["The Hassan II Mosque is built on the seaside, partially extending into the Atlantic Ocean", "Its minaret rises 210 metres, the tallest religious structure in the world", "Casablanca is a major Atlantic port city"]
  },

  // ==================== 大洋洲 3 城 ====================
  {
    id: 48, name: "悉尼", country: "澳大利亚", flag: "🇦🇺",
    lat: -33.8573, lng: 151.2153, zoom: 13,
    feature: "杰克逊港+歌剧院帆形",
    hint: "一座海港城市，有着世界上最著名的贝壳状建筑",
    trivia: ["歌剧院由2000多块陶瓷'帆'壳组成，耗时14年建成", "杰克逊港是世界最大的天然良港之一", "海港大桥与歌剧院隔湾相望，构成经典天际线"],
    nameEn: "Sydney", countryEn: "Australia",
    featureEn: "Port Jackson + sail-shaped Opera House",
    hintEn: "A harbour city home to the world's most famous shell-shaped building",
    triviaEn: ["The Opera House is clad in over 2,000 ceramic 'sail' shells and took 14 years to build", "Port Jackson (Sydney Harbour) is one of the largest natural harbours in the world", "The Harbour Bridge faces the Opera House across the bay, forming a classic skyline"]
  },
  {
    id: 49, name: "墨尔本", country: "澳大利亚", flag: "🇦🇺",
    lat: -37.8136, lng: 144.9631, zoom: 13,
    feature: "菲利普湾+棋盘",
    hint: "南半球的海湾城市，街道呈规整棋盘",
    trivia: ["墨尔本CBD是严格的棋盘格局，街道以名字命名", "雅拉河从城市穿过注入菲利普湾", "它连续多年被评为全球最宜居城市之一"],
    nameEn: "Melbourne", countryEn: "Australia",
    featureEn: "Port Phillip Bay + grid pattern",
    hintEn: "A Southern Hemisphere bay city with neatly laid-out grid streets",
    triviaEn: ["Melbourne's CBD follows a strict grid pattern, with streets named rather than numbered", "The Yarra River flows through the city and empties into Port Phillip Bay", "It has been ranked among the world's most liveable cities for many consecutive years"]
  },
  {
    id: 50, name: "奥克兰", country: "新西兰", flag: "🇳🇿",
    lat: -36.8485, lng: 174.7633, zoom: 12,
    feature: "两港+火山锥",
    hint: "一座建在火山群上的城市，两面环海",
    trivia: ["奥克兰建在48座火山锥上，是唯一的火山城市", "它被两个海湾环抱，被称为'帆船之都'", "朗伊托托火山岛守卫着港口入口，是城市标志"],
    nameEn: "Auckland", countryEn: "New Zealand",
    featureEn: "Two harbours + volcanic cones",
    hintEn: "A city built on a volcanic field, embraced by sea on two sides",
    triviaEn: ["Auckland is built on around 48 volcanic cones, making it a unique volcanic city", "Embraced by two harbours, it is known as the 'City of Sails'", "Rangitoto Island, a volcanic island, guards the harbour entrance as the city's symbol"]
  },

  // ==================== 亚洲新增 15 城 ====================
  {
    id: 51, name: "广州", country: "中国", flag: "🇨🇳",
    lat: 23.1291, lng: 113.2644, zoom: 12,
    feature: "珠江穿城+琶洲",
    hint: "珠江入海口前的大城，江中岛屿密布",
    trivia: ["广州塔位于珠江南岸，高600米是中国第一高塔", "珠江穿城而过，琶洲展馆形如多个相连的椭圆", "它是中国古代海上丝绸之路的起点之一"],
    nameEn: "Guangzhou", countryEn: "China",
    featureEn: "Pearl River through the city + Pazhou",
    hintEn: "A great city before the Pearl River estuary, dotted with islands in the river",
    triviaEn: ["Canton Tower on the south bank of the Pearl River is 600 metres tall, China's tallest tower", "The Pearl River flows through the city; the Pazhou exhibition halls look like linked ovals", "It was one of the starting points of the ancient Maritime Silk Road"]
  },
  {
    id: 52, name: "深圳", country: "中国", flag: "🇨🇳",
    lat: 22.5431, lng: 114.0579, zoom: 12,
    feature: "深圳湾+沿海带状",
    hint: "紧邻香港的沿海城市，城市沿海岸带状延伸",
    trivia: ["深圳是中国最年轻的特大城市，40年间从小渔村崛起", "深圳湾大桥连接深圳与香港", "城市呈东西向带状发展，受地形限制明显"],
    nameEn: "Shenzhen", countryEn: "China",
    featureEn: "Shenzhen Bay + coastal strip",
    hintEn: "A coastal city neighbouring Hong Kong, the city extends in a strip along the shore",
    triviaEn: ["Shenzhen is China's youngest megacity, rising from a fishing village in just 40 years", "The Shenzhen Bay Bridge links Shenzhen with Hong Kong", "The city develops in an east-west strip, clearly constrained by terrain"]
  },
  {
    id: 53, name: "成都", country: "中国", flag: "🇨🇳",
    lat: 30.5728, lng: 104.0668, zoom: 12,
    feature: "环城高速+天府广场",
    hint: "四川盆地中的环状城市，中心有圆形广场",
    trivia: ["成都以天府广场为圆心，环路层层向外扩展", "它是少数保留完整环状路网的西部城市", "府河与南河在城中心汇合成锦江"],
    nameEn: "Chengdu", countryEn: "China",
    featureEn: "Ring roads + Tianfu Square",
    hintEn: "A ring-shaped city in the Sichuan Basin, with a circular plaza at its centre",
    triviaEn: ["Chengdu expands outward in concentric ring roads centred on Tianfu Square", "It is one of the few western Chinese cities that retains a complete ring-road network", "The Fu River and South River merge into the Jin River at the city centre"]
  },
  {
    id: 54, name: "台北", country: "中国", flag: "🇨🇳",
    lat: 25.0330, lng: 121.5654, zoom: 13,
    feature: "基隆河蜿蜒+101",
    hint: "盆地中的城市，河湾处有高耸的摩天大楼",
    trivia: ["台北101曾是世界最高建筑，高508米", "基隆河在城市中画出大弯，弯内即市区核心", "城市建在台北盆地中，四周群山环绕"],
    nameEn: "Taipei", countryEn: "China",
    featureEn: "Keelung River meander + Taipei 101",
    hintEn: "A basin city with a soaring skyscraper at a river bend",
    triviaEn: ["Taipei 101 was once the world's tallest building at 508 metres", "The Keelung River makes a large bend through the city, enclosing the urban core", "The city sits in the Taipei Basin, surrounded by mountains on all sides"]
  },
  {
    id: 55, name: "伊斯坦布尔", country: "土耳其", flag: "🇹🇷",
    lat: 41.0082, lng: 28.9784, zoom: 12,
    feature: "博斯普鲁斯海峡",
    hint: "横跨两大洲的城市，海峡穿城而过",
    trivia: ["伊斯坦布尔是世界上唯一横跨两大洲的城市", "博斯普鲁斯海峡连接黑海与马尔马拉海", "它曾是拜占庭和奥斯曼两大帝国的首都"],
    nameEn: "Istanbul", countryEn: "Turkey",
    featureEn: "Bosphorus Strait",
    hintEn: "A city straddling two continents, with a strait running right through it",
    triviaEn: ["Istanbul is the only city in the world that spans two continents", "The Bosphorus Strait connects the Black Sea to the Sea of Marmara", "It served as the capital of both the Byzantine and Ottoman Empires"]
  },
  {
    id: 56, name: "阿斯塔纳", country: "哈萨克斯坦", flag: "🇰🇿",
    lat: 51.1605, lng: 71.4704, zoom: 12,
    feature: "草原网格+伊希姆河",
    hint: "北方草原上的规划新城，河流穿城而过",
    trivia: ["阿斯塔纳1997年成为哈萨克斯坦新首都", "城市在草原上按规划网格建设，造型前卫", "伊希姆河将城市分为左右两岸"],
    nameEn: "Astana", countryEn: "Kazakhstan",
    featureEn: "Steppe grid + Ishim River",
    hintEn: "A planned new city on the northern steppes, with a river flowing through it",
    triviaEn: ["Astana became Kazakhstan's new capital in 1997", "The city was built from scratch on the steppe with a planned grid and avant-garde architecture", "The Ishim River divides the city into east and west banks"]
  },
  {
    id: 57, name: "加德满都", country: "尼泊尔", flag: "🇳🇵",
    lat: 27.7172, lng: 85.3240, zoom: 13,
    feature: "河谷盆地密集城",
    hint: "喜马拉雅山南麓的河谷盆地城市",
    trivia: ["加德满都建在喜马拉雅南麓的河谷盆地中", "城市被群山环抱，建筑密集无序", "它是尼泊尔首都，有大量古老寺庙广场"],
    nameEn: "Kathmandu", countryEn: "Nepal",
    featureEn: "Dense valley basin city",
    hintEn: "A city in a river valley basin at the foot of the Himalayas",
    triviaEn: ["Kathmandu sits in a river valley basin on the southern slopes of the Himalayas", "The city is hemmed in by mountains, with dense, organic urban fabric", "It is the capital of Nepal, home to numerous ancient temple squares"]
  },
  {
    id: 58, name: "科伦坡", country: "斯里兰卡", flag: "🇱🇰",
    lat: 6.9271, lng: 79.8612, zoom: 13,
    feature: "海岸+潟湖",
    hint: "岛国南端的海港城市，城市沿珊瑚海岸延伸",
    trivia: ["科伦坡是斯里兰卡最大城市和主要港口", "贝拉湖位于市中心，是城市标志性水体", "它位于赤道附近，热带植被茂盛"],
    nameEn: "Colombo", countryEn: "Sri Lanka",
    featureEn: "Coastline + lagoon",
    hintEn: "A port city on a tropical island nation, stretching along a coral coast",
    triviaEn: ["Colombo is the largest city and main port of Sri Lanka", "Beira Lake lies at the city centre, a signature body of water", "It lies near the equator, with lush tropical vegetation"]
  },
  {
    id: 59, name: "马尼拉", country: "菲律宾", flag: "🇵🇭",
    lat: 14.5995, lng: 120.9842, zoom: 13,
    feature: "马尼拉湾+帕西格河",
    hint: "群岛国家的首都，海湾与河流交汇处",
    trivia: ["马尼拉湾是世界最美的落日海湾之一", "帕西格河穿城而过，将城市分为南北", "它是亚洲受西班牙殖民影响最深的城市"],
    nameEn: "Manila", countryEn: "Philippines",
    featureEn: "Manila Bay + Pasig River",
    hintEn: "The capital of an archipelago nation, at the confluence of a bay and a river",
    triviaEn: ["Manila Bay is renowned as one of the most beautiful sunset bays in the world", "The Pasig River flows through the city, dividing it into north and south", "It is the Asian city most deeply influenced by Spanish colonialism"]
  },
  {
    id: 60, name: "卡拉奇", country: "巴基斯坦", flag: "🇵🇰",
    lat: 24.8607, lng: 67.0011, zoom: 12,
    feature: "海岸平原密集",
    hint: "阿拉伯海滨的巨型城市，海岸线笔直",
    trivia: ["卡拉奇是巴基斯坦最大城市和主要港口", "城市沿阿拉伯海海岸平原蔓延", "它是世界上人口增长最快的城市之一"],
    nameEn: "Karachi", countryEn: "Pakistan",
    featureEn: "Dense coastal plain",
    hintEn: "A megacity on the Arabian Sea coast with a ruler-straight shoreline",
    triviaEn: ["Karachi is Pakistan's largest city and main port", "The city sprawls along the coastal plain of the Arabian Sea", "It is one of the fastest-growing cities in the world"]
  },
  {
    id: 61, name: "德黑兰", country: "伊朗", flag: "🇮🇷",
    lat: 35.6892, lng: 51.3890, zoom: 12,
    feature: "厄尔布尔士山南麓",
    hint: "山脉南麓的盆地城市，北靠高山",
    trivia: ["德黑兰北依厄尔布尔士山脉，海拔约1200米", "城市北高南低，空气污染常聚集在南部", "它是中东最大城市之一"],
    nameEn: "Tehran", countryEn: "Iran",
    featureEn: "Southern foothills of the Alborz Mountains",
    hintEn: "A basin city at the foot of a mountain range, backed by high peaks",
    triviaEn: ["Tehran sits at the southern foot of the Alborz Mountains at about 1,200 metres elevation", "The city slopes upward from south to north, with air pollution often trapped in the south", "It is one of the largest cities in the Middle East"]
  },
  {
    id: 62, name: "耶路撒冷", country: "以色列", flag: "🇮🇱",
    lat: 31.7683, lng: 35.2137, zoom: 13,
    feature: "高原古城+城墙",
    hint: "三大宗教圣城，老城有完整古城墙",
    trivia: ["耶路撒冷老城墙是16世纪奥斯曼时期修建的", "它是犹太教、基督教、伊斯兰教共同的圣地", "城市建在犹地亚高原上，海拔约750米"],
    nameEn: "Jerusalem", countryEn: "Israel",
    featureEn: "Highland ancient city + city walls",
    hintEn: "A holy city of three faiths, its old town enclosed by intact ancient walls",
    triviaEn: ["Jerusalem's old walls were built in the 16th century during the Ottoman era", "It is a sacred city shared by Judaism, Christianity, and Islam", "The city sits on the Judean Plateau at about 750 metres elevation"]
  },
  {
    id: 63, name: "平壤", country: "朝鲜", flag: "🇰🇵",
    lat: 39.0392, lng: 125.7625, zoom: 12,
    feature: "大同江穿城",
    hint: "大同江畔的城市，建筑间距宽阔",
    trivia: ["平壤沿大同江两岸发展，江中岛屿众多", "它是朝鲜首都，建筑布局宽阔规整", "主体思想塔矗立在大同江畔"],
    nameEn: "Pyongyang", countryEn: "North Korea",
    featureEn: "Taedong River through the city",
    hintEn: "A city on the Taedong River, with generously spaced buildings",
    triviaEn: ["Pyongyang developed along both banks of the Taedong River, with many islands in midstream", "As the capital of North Korea, its building layout is spacious and orderly", "The Juche Tower stands on the bank of the Taedong River"]
  },
  {
    id: 64, name: "仰光", country: "缅甸", flag: "🇲🇲",
    lat: 16.8409, lng: 96.1735, zoom: 13,
    feature: "仰光河+大金塔",
    hint: "热带河口城市，山丘上有金色塔群",
    trivia: ["仰光大金塔高99米，是缅甸最神圣的佛塔", "城市建在仰光河三角洲上", "它曾是缅甸首都，至今仍是最大城市"],
    nameEn: "Yangon", countryEn: "Myanmar",
    featureEn: "Yangon River + Shwedagon Pagoda",
    hintEn: "A tropical river-mouth city with a golden pagoda complex atop a hill",
    triviaEn: ["The Shwedagon Pagoda rises 99 metres and is Myanmar's most sacred Buddhist stupa", "The city is built on the Yangon River delta", "It was formerly Myanmar's capital and remains the largest city"]
  },
  {
    id: 65, name: "吉达", country: "沙特", flag: "🇸🇦",
    lat: 21.5433, lng: 39.1728, zoom: 12,
    feature: "红海海岸带状",
    hint: "红海东岸的港口城市，沿海岸带状延伸",
    trivia: ["吉达是沙特最大的港口城市，朝圣门户", "城市沿红海海岸南北延伸", "它有世界上最高的喷泉法赫德国王喷泉"],
    nameEn: "Jeddah", countryEn: "Saudi Arabia",
    featureEn: "Red Sea coastal strip",
    hintEn: "A Red Sea port city, extending in a strip along the coast",
    triviaEn: ["Jeddah is Saudi Arabia's largest port city and the gateway for pilgrims", "The city stretches north-south along the Red Sea coast", "It is home to the King Fahd Fountain, the tallest fountain in the world"]
  },

  // ==================== 欧洲新增 15 城 ====================
  {
    id: 66, name: "都柏林", country: "爱尔兰", flag: "🇮🇪",
    lat: 53.3498, lng: -6.2603, zoom: 13,
    feature: "利菲河穿城",
    hint: "爱尔兰岛东岸的城市，河流穿城入海",
    trivia: ["都柏林建在利菲河入海口", "它是爱尔兰首都，也是最大城市", "城市名意为'黑色池塘'，源于古爱尔兰语"],
    nameEn: "Dublin", countryEn: "Ireland",
    featureEn: "River Liffey through the city",
    hintEn: "A city on the east coast of Ireland, with a river flowing through it to the sea",
    triviaEn: ["Dublin was founded at the mouth of the River Liffey", "It is the capital and largest city of Ireland", "The city's name means 'black pool', derived from Old Irish"]
  },
  {
    id: 67, name: "爱丁堡", country: "英国", flag: "🇬🇧",
    lat: 55.9533, lng: -3.1883, zoom: 13,
    feature: "火山岩城堡山",
    hint: "城市中心有一座火山岩上的城堡",
    trivia: ["爱丁堡城堡建在死火山的岩顶上", "城市分为老城和新城，均是世界遗产", "它每年举办世界最大的艺术节"],
    nameEn: "Edinburgh", countryEn: "United Kingdom",
    featureEn: "Volcanic rock castle hill",
    hintEn: "A city with a castle perched on volcanic rock right in the centre",
    triviaEn: ["Edinburgh Castle sits atop the crag of an extinct volcano", "The city is divided into Old Town and New Town, both UNESCO World Heritage Sites", "It hosts the world's largest arts festival every year"]
  },
  {
    id: 68, name: "哥本哈根", country: "丹麦", flag: "🇩🇰",
    lat: 55.6761, lng: 12.5683, zoom: 13,
    feature: "海峡+手指规划",
    hint: "波罗的海出海口的港口城市",
    trivia: ["哥本哈根位于厄勒海峡西岸，与瑞典隔海相望", "它采用著名的'手指规划'，沿铁路线发展", "小美人鱼雕像是城市的标志性雕塑"],
    nameEn: "Copenhagen", countryEn: "Denmark",
    featureEn: "Strait + finger plan",
    hintEn: "A port city at the outlet to the Baltic Sea",
    triviaEn: ["Copenhagen lies on the west shore of the Oresund Strait, facing Sweden across the water", "It follows the famous 'finger plan', developing along railway lines radiating outward", "The Little Mermaid statue is the city's iconic sculpture"]
  },
  {
    id: 69, name: "斯德哥尔摩", country: "瑞典", flag: "🇸🇪",
    lat: 59.3293, lng: 18.0686, zoom: 12,
    feature: "群岛城市",
    hint: "波罗的海上的群岛城市，由多个岛屿组成",
    trivia: ["斯德哥尔摩建在14个岛屿上，桥梁遍布", "它被誉为'北方威尼斯'", "老城Gamla Stan是城市最古老的岛屿"],
    nameEn: "Stockholm", countryEn: "Sweden",
    featureEn: "Archipelago city",
    hintEn: "A Baltic Sea city spread across multiple islands",
    triviaEn: ["Stockholm is built on 14 islands, with bridges everywhere", "It is known as the 'Venice of the North'", "Gamla Stan (the Old Town) is the city's oldest island"]
  },
  {
    id: 70, name: "赫尔辛基", country: "芬兰", flag: "🇫🇮",
    lat: 60.1699, lng: 24.9384, zoom: 12,
    feature: "半岛+堡垒岛",
    hint: "波罗的海东岸的半岛城市，海上有星形堡垒",
    trivia: ["赫尔辛基建在多个半岛上，海岸线曲折", "芬兰堡是海上星形堡垒，是世界遗产", "它是世界最北的首都之一"],
    nameEn: "Helsinki", countryEn: "Finland",
    featureEn: "Peninsula + fortress island",
    hintEn: "A Baltic Sea peninsula city with a star-shaped sea fortress nearby",
    triviaEn: ["Helsinki is built on several peninsulas with a deeply indented coastline", "Suomenlinna is a star-shaped sea fortress and a UNESCO World Heritage Site", "It is one of the northernmost capitals in the world"]
  },
  {
    id: 71, name: "奥斯陆", country: "挪威", flag: "🇳🇴",
    lat: 59.9139, lng: 10.7522, zoom: 12,
    feature: "峡湾尽头",
    hint: "峡湾最深处的城市，三面被山丘环绕",
    trivia: ["奥斯陆位于奥斯陆峡湾的尽头", "城市三面环山，一面临海", "它是欧洲少数拥有森林边界内的首都"],
    nameEn: "Oslo", countryEn: "Norway",
    featureEn: "End of a fjord",
    hintEn: "A city at the innermost point of a fjord, surrounded by hills on three sides",
    triviaEn: ["Oslo lies at the head of the Oslofjord", "The city is ringed by hills on three sides and faces the sea on the fourth", "It is one of the few European capitals with forests within its boundaries"]
  },
  {
    id: 72, name: "雷克雅未克", country: "冰岛", flag: "🇮🇸",
    lat: 64.1466, lng: -21.9426, zoom: 13,
    feature: "半岛+火山地貌",
    hint: "北极圈附近的岛国首都，地热烟雾弥漫",
    trivia: ["雷克雅未克是世界最北的首都", "城市名意为'冒烟的湾'，源于地热温泉", "它紧邻大西洋中脊，火山活动活跃"],
    nameEn: "Reykjavik", countryEn: "Iceland",
    featureEn: "Peninsula + volcanic landscape",
    hintEn: "An island capital near the Arctic Circle, with geothermal steam rising all around",
    triviaEn: ["Reykjavik is the world's northernmost capital", "The city's name means 'smoky bay', from the geothermal hot springs", "It sits near the Mid-Atlantic Ridge, where volcanic activity is intense"]
  },
  {
    id: 73, name: "慕尼黑", country: "德国", flag: "🇩🇪",
    lat: 48.1351, lng: 11.5820, zoom: 13,
    feature: "伊萨尔河弯+环路",
    hint: "阿尔卑斯山前的城市，河流穿城而过",
    trivia: ["慕尼黑位于阿尔卑斯山北麓的平原上", "伊萨尔河在城市中形成多个弯道", "它是巴伐利亚州首府，啤酒节闻名世界"],
    nameEn: "Munich", countryEn: "Germany",
    featureEn: "Isar River bend + ring road",
    hintEn: "A city at the foot of the Alps, with a river flowing through it",
    triviaEn: ["Munich lies on the plain north of the Alps", "The Isar River forms multiple bends as it passes through the city", "It is the capital of Bavaria, famous worldwide for its Oktoberfest"]
  },
  {
    id: 74, name: "汉堡", country: "德国", flag: "🇩🇪",
    lat: 53.5511, lng: 9.9937, zoom: 12,
    feature: "港口+运河网",
    hint: "易北河下游的港口城市，运河密布如网",
    trivia: ["汉堡是德国最大港口，被誉为'通向世界的门户'", "城市运河纵横，桥梁数量超过威尼斯和阿姆斯特丹", "它建在易北河与阿尔斯特河交汇处"],
    nameEn: "Hamburg", countryEn: "Germany",
    featureEn: "Port + canal network",
    hintEn: "A port city on the lower Elbe, with a dense web of canals",
    triviaEn: ["Hamburg is Germany's largest port, known as the 'Gateway to the World'", "The city's canals criss-cross the urban fabric; it has more bridges than Venice and Amsterdam combined", "It sits at the confluence of the Elbe and Alster Rivers"]
  },
  {
    id: 75, name: "苏黎世", country: "瑞士", flag: "🇨🇭",
    lat: 47.3769, lng: 8.5417, zoom: 13,
    feature: "苏黎世湖+利马特河",
    hint: "湖畔城市，河流从湖中流出穿城而过",
    trivia: ["利马特河从苏黎世湖流出，穿城向北", "苏黎世是瑞士最大城市，金融中心", "它连续多年位居全球宜居城市前列"],
    nameEn: "Zurich", countryEn: "Switzerland",
    featureEn: "Lake Zurich + Limmat River",
    hintEn: "A lakeside city where a river flows out of the lake and through the town",
    triviaEn: ["The Limmat River flows out of Lake Zurich and threads north through the city", "Zurich is Switzerland's largest city and a global financial centre", "It consistently ranks among the world's most liveable cities"]
  },
  {
    id: 76, name: "米兰", country: "意大利", flag: "🇮🇹",
    lat: 45.4642, lng: 9.1900, zoom: 13,
    feature: "放射环城+运河",
    hint: "波河平原上的城市，环路层层向外",
    trivia: ["米兰是意大利第二大城，时尚之都", "城市保留古罗马时期的设计，街道呈放射状", "它拥有欧洲最大的哥特式教堂之一"],
    nameEn: "Milan", countryEn: "Italy",
    featureEn: "Radial ring road + canals",
    hintEn: "A city on the Po Plain, with ring roads expanding layer by layer",
    triviaEn: ["Milan is Italy's second city and the capital of fashion", "The city retains its Roman-era radial street design", "It houses one of the largest Gothic cathedrals in Europe"]
  },
  {
    id: 77, name: "那不勒斯", country: "意大利", flag: "🇮🇹",
    lat: 40.8518, lng: 14.2681, zoom: 13,
    feature: "海湾+维苏威火山",
    hint: "海湾城市，背后矗立着著名的活火山",
    trivia: ["维苏威火山公元79年喷发，掩埋了庞贝古城", "那不勒斯湾是著名的火山海湾", "它是披萨饼的发源地"],
    nameEn: "Naples", countryEn: "Italy",
    featureEn: "Bay + Mount Vesuvius",
    hintEn: "A bay city with a famous active volcano towering behind it",
    triviaEn: ["Mount Vesuvius erupted in AD 79, burying the city of Pompeii", "The Bay of Naples is a renowned volcanic bay", "It is the birthplace of pizza"]
  },
  {
    id: 78, name: "里昂", country: "法国", flag: "🇫🇷",
    lat: 45.7640, lng: 4.8357, zoom: 13,
    feature: "两河交汇半岛",
    hint: "两条大河交汇处的城市，市中心在半岛上",
    trivia: ["里昂位于罗讷河与索恩河交汇处", "城市中心建在两河之间的半岛上", "它是联合国教科文组织世界遗产"],
    nameEn: "Lyon", countryEn: "France",
    featureEn: "Two-river confluence peninsula",
    hintEn: "A city at the junction of two great rivers, with its centre on a peninsula",
    triviaEn: ["Lyon sits at the confluence of the Rhone and Saone Rivers", "The city centre occupies a peninsula between the two rivers", "It is a UNESCO World Heritage Site"]
  },
  {
    id: 79, name: "马赛", country: "法国", flag: "🇫🇷",
    lat: 43.2965, lng: 5.3698, zoom: 12,
    feature: "地中海港湾+岛屿",
    hint: "地中海沿岸的港口城市，湾中有岛屿",
    trivia: ["马赛是法国最古老的城市，建于公元前600年", "伊夫城堡位于海湾小岛上，是《基督山伯爵》的故事地", "它是法国最大的地中海港口"],
    nameEn: "Marseille", countryEn: "France",
    featureEn: "Mediterranean harbour + islands",
    hintEn: "A Mediterranean port city with islands in its bay",
    triviaEn: ["Marseille is France's oldest city, founded around 600 BC", "The Chateau d'If sits on a small island in the bay, the setting of 'The Count of Monte Cristo'", "It is France's largest port on the Mediterranean"]
  },
  {
    id: 80, name: "萨尔茨堡", country: "奥地利", flag: "🇦🇹",
    lat: 47.8095, lng: 13.0550, zoom: 13,
    feature: "萨尔察赫河+城堡",
    hint: "阿尔卑斯山前的城市，山顶有白色古堡",
    trivia: ["萨尔茨堡城堡是欧洲最大的中世纪城堡之一", "它是莫扎特的出生地，音乐之城", "城市位于德国边境，紧邻阿尔卑斯山"],
    nameEn: "Salzburg", countryEn: "Austria",
    featureEn: "Salzach River + castle",
    hintEn: "A pre-Alpine city with a white castle perched on a hilltop",
    triviaEn: ["Hohensalzburg Castle is one of the largest medieval fortresses in Europe", "It is the birthplace of Mozart, a city of music", "The city lies near the German border, right at the foot of the Alps"]
  },

  // ==================== 美洲新增 8 城 ====================
  {
    id: 81, name: "波士顿", country: "美国", flag: "🇺🇸",
    lat: 42.3601, lng: -71.0589, zoom: 13,
    feature: "查尔斯河+海湾",
    hint: "新英格兰的海港城市，河流分隔城区",
    trivia: ["波士顿是美国最古老的城市之一", "查尔斯河将城区与剑桥分开", "它是哈佛大学和麻省理工学院所在地"],
    nameEn: "Boston", countryEn: "United States",
    featureEn: "Charles River + bay",
    hintEn: "A New England port city where a river separates the urban districts",
    triviaEn: ["Boston is one of the oldest cities in the United States", "The Charles River separates Boston proper from Cambridge", "It is home to Harvard University and the Massachusetts Institute of Technology"]
  },
  {
    id: 82, name: "华盛顿", country: "美国", flag: "🇺🇸",
    lat: 38.8895, lng: -77.0353, zoom: 13,
    feature: "放射大道+国家广场",
    hint: "首都城市规划，有东西向长条形绿色广场",
    trivia: ["华盛顿由法国建筑师朗方规划，大道呈放射状", "国家广场从国会大厦延伸到林肯纪念堂", "波托马克河环绕城市西南"],
    nameEn: "Washington", countryEn: "United States",
    featureEn: "Radial avenues + National Mall",
    hintEn: "A planned capital city featuring a long east-west green esplanade",
    triviaEn: ["Washington was designed by French architect Pierre Charles L'Enfant, with radiating boulevards", "The National Mall stretches from the Capitol to the Lincoln Memorial", "The Potomac River curves around the south-west of the city"]
  },
  {
    id: 83, name: "休斯顿", country: "美国", flag: "🇺🇸",
    lat: 29.7604, lng: -95.3698, zoom: 12,
    feature: "平原网格+高速环",
    hint: "墨西哥湾平原上的城市，无明显地形",
    trivia: ["休斯顿是美国第四大城市，没有严格的分区规划", "它是NASA约翰逊航天中心所在地", "城市建在墨西哥湾沿岸平原上"],
    nameEn: "Houston", countryEn: "United States",
    featureEn: "Plain grid + highway loop",
    hintEn: "A city on the Gulf coastal plain with no notable terrain features",
    triviaEn: ["Houston is America's fourth-largest city, with no strict zoning laws", "It is home to NASA's Johnson Space Center", "The city spreads across the Gulf Coast plain"]
  },
  {
    id: 84, name: "圣保罗", country: "巴西", flag: "🇧🇷",
    lat: -23.5505, lng: -46.6333, zoom: 12,
    feature: "高原密集网格",
    hint: "南半球最大城市，高原上密集铺开",
    trivia: ["圣保罗是南半球最大城市，人口超1200万", "城市建在巴西高原东南边缘", "它是巴西的经济金融中心"],
    nameEn: "Sao Paulo", countryEn: "Brazil",
    featureEn: "Dense highland grid",
    hintEn: "The largest city in the Southern Hemisphere, sprawling densely across a highland",
    triviaEn: ["Sao Paulo is the largest city in the Southern Hemisphere, with over 12 million people", "The city sits on the south-eastern edge of the Brazilian Highlands", "It is Brazil's economic and financial centre"]
  },
  {
    id: 85, name: "利马", country: "秘鲁", flag: "🇵🇪",
    lat: -12.0464, lng: -77.0428, zoom: 12,
    feature: "海岸沙漠+河谷",
    hint: "太平洋东岸沙漠中的城市，河溪穿城",
    trivia: ["利马建在里马克河谷中，周围是沙漠", "它是世界第二大沙漠首都", "由于降雨极少，被称为'无雨之城'"],
    nameEn: "Lima", countryEn: "Peru",
    featureEn: "Coastal desert + river valley",
    hintEn: "A city in the Pacific coastal desert, with streams trickling through it",
    triviaEn: ["Lima sits in the Rimac River valley, surrounded by desert", "It is the world's second-largest desert capital", "With almost no rainfall, it is known as the 'city without rain'"]
  },
  {
    id: 86, name: "圣地亚哥", country: "智利", flag: "🇨🇱",
    lat: -33.4489, lng: -70.6693, zoom: 12,
    feature: "安第斯山前盆地",
    hint: "安第斯山脚下的盆地城市，东靠雪山",
    trivia: ["圣地亚哥建在安第斯山前的盆地里", "从城市东望可见终年积雪的安第斯山", "它是南美洲最发达的首都之一"],
    nameEn: "Santiago", countryEn: "Chile",
    featureEn: "Andean foreland basin",
    hintEn: "A basin city at the foot of the Andes, backed by snow-capped peaks",
    triviaEn: ["Santiago lies in a basin at the foot of the Andes", "Looking east from the city, the snow-capped Andes are visible year-round", "It is one of the most developed capitals in South America"]
  },
  {
    id: 87, name: "波哥大", country: "哥伦比亚", flag: "🇨🇴",
    lat: 4.7110, lng: -74.0721, zoom: 12,
    feature: "高原盆地网格",
    hint: "安第斯山中的高原城市，街道规整",
    trivia: ["波哥大建在安第斯山的高原盆地中，海拔2640米", "它是世界第三高首都", "城市保留西班牙殖民时期的棋盘格局"],
    nameEn: "Bogota", countryEn: "Colombia",
    featureEn: "Highland basin grid",
    hintEn: "A highland city in the Andes with orderly, well-planned streets",
    triviaEn: ["Bogota sits in a highland basin in the Andes at 2,640 metres elevation", "It is the third-highest capital city in the world", "The city retains the chessboard street pattern of its Spanish colonial era"]
  },
  {
    id: 88, name: "哈瓦那", country: "古巴", flag: "🇨🇺",
    lat: 23.1136, lng: -82.3666, zoom: 13,
    feature: "海湾+海岸线",
    hint: "加勒比海岛上的港口城市，海湾深入城市",
    trivia: ["哈瓦那建在古巴岛西北海岸", "它的海湾入口狭窄，内部宽阔，是天然良港", "老城区保留大量西班牙殖民建筑"],
    nameEn: "Havana", countryEn: "Cuba",
    featureEn: "Bay + coastline",
    hintEn: "A port city on a Caribbean island, with a bay cutting deep into the city",
    triviaEn: ["Havana is located on the north-west coast of Cuba", "Its bay has a narrow entrance but widens inside, making it a natural harbour", "The old town preserves a wealth of Spanish colonial architecture"]
  },

  // ==================== 非洲新增 7 城 ====================
  {
    id: 89, name: "约翰内斯堡", country: "南非", flag: "🇿🇦",
    lat: -26.2041, lng: 28.0473, zoom: 12,
    feature: "高原网格+矿山堆",
    hint: "内陆高原上的城市，周围有黄色尾矿堆",
    trivia: ["约翰内斯堡因金矿而兴起，是世界最大金矿区", "城市建在海拔1753米的高原上", "它是南非最大城市，没有天然水体"],
    nameEn: "Johannesburg", countryEn: "South Africa",
    featureEn: "Highland grid + mine dumps",
    hintEn: "An inland highland city surrounded by yellow mine tailings",
    triviaEn: ["Johannesburg grew from gold mining and sits atop the world's largest goldfield", "The city is built on a plateau at 1,753 metres elevation", "It is South Africa's largest city, with no major natural body of water"]
  },
  {
    id: 90, name: "德班", country: "南非", flag: "🇿🇦",
    lat: -29.8587, lng: 31.0218, zoom: 12,
    feature: "海岸+港口",
    hint: "印度洋西岸的港口城市，海岸线笔直",
    trivia: ["德班是非洲最繁忙的港口之一", "城市沿印度洋海岸延伸", "它是南非第三大城市"],
    nameEn: "Durban", countryEn: "South Africa",
    featureEn: "Coastline + port",
    hintEn: "A port city on the western Indian Ocean with a ruler-straight coast",
    triviaEn: ["Durban is one of the busiest ports in Africa", "The city extends along the Indian Ocean coastline", "It is South Africa's third-largest city"]
  },
  {
    id: 91, name: "亚的斯亚贝巴", country: "埃塞俄比亚", flag: "🇪🇹",
    lat: 9.0249, lng: 38.7469, zoom: 12,
    feature: "高原山地下城",
    hint: "东非高原上的城市，海拔高且起伏",
    trivia: ["亚的斯亚贝巴海拔2355米，是世界最高首都之一", "城市名意为'新鲜的花'", "它是非洲联盟总部所在地"],
    nameEn: "Addis Ababa", countryEn: "Ethiopia",
    featureEn: "Highland city in the mountains",
    hintEn: "A city on the East African plateau, high in elevation and hilly",
    triviaEn: ["Addis Ababa sits at 2,355 metres, one of the highest capitals in the world", "The city's name means 'new flower'", "It is the headquarters of the African Union"]
  },
  {
    id: 92, name: "达累斯萨拉姆", country: "坦桑尼亚", flag: "🇹🇿",
    lat: -6.8161, lng: 39.2804, zoom: 12,
    feature: "印度洋港湾",
    hint: "印度洋西岸的港口城市，海湾深入陆地",
    trivia: ["达累斯萨拉姆意为'和平之港'", "它是坦桑尼亚最大城市和主要港口", "城市建在印度洋沿岸的天然港湾处"],
    nameEn: "Dar es Salaam", countryEn: "Tanzania",
    featureEn: "Indian Ocean harbour",
    hintEn: "A port city on the western Indian Ocean, with a bay cutting into the land",
    triviaEn: ["Dar es Salaam means 'haven of peace'", "It is Tanzania's largest city and main port", "The city is built on a natural harbour along the Indian Ocean coast"]
  },
  {
    id: 93, name: "阿比让", country: "科特迪瓦", flag: "🇨🇮",
    lat: 5.3600, lng: -4.0083, zoom: 12,
    feature: "潟湖+半岛",
    hint: "潟湖与大海之间的城市，半岛伸入潟湖",
    trivia: ["阿比让建在埃布里耶潟湖沿岸", "它是西非最现代化的城市之一", "城市规划区位于潟湖中的半岛上"],
    nameEn: "Abidjan", countryEn: "Ivory Coast",
    featureEn: "Lagoon + peninsula",
    hintEn: "A city between a lagoon and the sea, with a peninsula reaching into the lagoon",
    triviaEn: ["Abidjan is built along the Ebrie Lagoon", "It is one of the most modern cities in West Africa", "The planned business district sits on a peninsula in the lagoon"]
  },
  {
    id: 94, name: "阿克拉", country: "加纳", flag: "🇬🇭",
    lat: 5.6037, lng: -0.1870, zoom: 12,
    feature: "海岸平原直线",
    hint: "几内亚湾沿岸的城市，海岸线笔直",
    trivia: ["阿克拉建在几内亚湾的平原上", "它是加纳首都和最大城市", "城市沿海岸东西向延伸"],
    nameEn: "Accra", countryEn: "Ghana",
    featureEn: "Straight coastal plain",
    hintEn: "A city on the Gulf of Guinea coast with a ruler-straight shoreline",
    triviaEn: ["Accra sits on the coastal plain of the Gulf of Guinea", "It is the capital and largest city of Ghana", "The city extends east-west along the coastline"]
  },
  {
    id: 95, name: "亚丁", country: "也门", flag: "🇾🇪",
    lat: 12.7794, lng: 45.0367, zoom: 12,
    feature: "火山口港+半岛",
    hint: "火山半岛上的港口城市，港湾呈圆形",
    trivia: ["亚丁港建在死火山口中，是天然良港", "城市位于阿拉伯半岛南端", "它是古代重要的海上贸易中转站"],
    nameEn: "Aden", countryEn: "Yemen",
    featureEn: "Volcanic crater port + peninsula",
    hintEn: "A port city on a volcanic peninsula, with a near-circular harbour",
    triviaEn: ["The port of Aden sits inside an extinct volcanic crater, a natural harbour", "The city is located at the southern tip of the Arabian Peninsula", "It was an important maritime trade hub in ancient times"]
  },

  // ==================== 大洋洲新增 5 城 ====================
  {
    id: 96, name: "布里斯班", country: "澳大利亚", flag: "🇦🇺",
    lat: -27.4698, lng: 153.0251, zoom: 13,
    feature: "河流蛇形穿城",
    hint: "澳大利亚东岸的城市，河流在城中蛇形蜿蜒",
    trivia: ["布里斯班河在城市中蛇形蜿蜒，形成多个弯道", "它是澳大利亚第三大城市", "城市建在河口上游的河谷中"],
    nameEn: "Brisbane", countryEn: "Australia",
    featureEn: "River snaking through the city",
    hintEn: "An Australian east-coast city whose river winds in serpentine bends through the urban area",
    triviaEn: ["The Brisbane River snakes through the city, forming multiple meanders", "It is the third-largest city in Australia", "The city is built in a river valley upstream of the estuary"]
  },
  {
    id: 97, name: "珀斯", country: "澳大利亚", flag: "🇦🇺",
    lat: -31.9505, lng: 115.8605, zoom: 12,
    feature: "天鹅河+海岸",
    hint: "澳大利亚西海岸的城市，河流入海前蜿蜒",
    trivia: ["珀斯是澳大利亚西海岸最大城市", "天鹅河从城市穿过注入印度洋", "它是世界上最孤立的大城市之一"],
    nameEn: "Perth", countryEn: "Australia",
    featureEn: "Swan River + coastline",
    hintEn: "An Australian west-coast city where a river meanders before reaching the sea",
    triviaEn: ["Perth is the largest city on Australia's west coast", "The Swan River flows through the city and empties into the Indian Ocean", "It is one of the most isolated major cities in the world"]
  },
  {
    id: 98, name: "阿德莱德", country: "澳大利亚", flag: "🇦🇺",
    lat: -34.9285, lng: 138.6007, zoom: 12,
    feature: "方格+圣文森特湾",
    hint: "海湾旁的城市，街道呈规整方格状",
    trivia: ["阿德莱德是规划城市，街道呈规整方格", "城市东靠洛夫蒂山脉，西临圣文森特湾", "它被称为'教堂之城'"],
    nameEn: "Adelaide", countryEn: "Australia",
    featureEn: "Grid + St Vincent's Gulf",
    hintEn: "A city beside a gulf, with streets laid out in a neat grid pattern",
    triviaEn: ["Adelaide is a planned city with streets laid out in a regular grid", "The city is flanked by the Mount Lofty Ranges to the east and St Vincent's Gulf to the west", "It is known as the 'City of Churches'"]
  },
  {
    id: 99, name: "惠灵顿", country: "新西兰", flag: "🇳🇿",
    lat: -41.2865, lng: 174.7762, zoom: 13,
    feature: "港湾+山丘环绕",
    hint: "海峡旁的港口城市，三面环山",
    trivia: ["惠灵顿是世界上最南的首都", "城市建在惠灵顿港畔，三面环山", "它被称为'风城'，是世界最风大的城市之一"],
    nameEn: "Wellington", countryEn: "New Zealand",
    featureEn: "Harbour + hills on all sides",
    hintEn: "A port city on a strait, surrounded by hills on three sides",
    triviaEn: ["Wellington is the world's southernmost capital", "The city is built on the shores of Wellington Harbour, surrounded by hills on three sides", "Known as 'Windy Wellington', it is one of the windiest cities on Earth"]
  },
  {
    id: 100, name: "堪培拉", country: "澳大利亚", flag: "🇦🇺",
    lat: -35.2809, lng: 149.1300, zoom: 13,
    feature: "规划圆环+人工湖",
    hint: "规划建造的首都，有人工湖和环形路网",
    trivia: ["堪培拉是20世纪规划的花园城市", "城市中心的人工湖伯利格里芬湖", "它的路网由几何对称的圆环和放射大道组成"],
    nameEn: "Canberra", countryEn: "Australia",
    featureEn: "Planned concentric rings + artificial lake",
    hintEn: "A purpose-built capital featuring an artificial lake and circular ring roads",
    triviaEn: ["Canberra is a 20th-century planned garden city", "Lake Burley Griffin, an artificial lake, sits at the city's heart", "Its road network consists of geometrically symmetrical rings and radiating avenues"]
  }
];

/**
 * 为指定城市生成干扰项
 */
function generateDistractors(correctId, count = 3) {
  const others = CITY_DB.filter(c => c.id !== correctId);
  const shuffled = others.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 从题库中随机抽取 N 题
 */
function pickQuestions(count = 10) {
  const shuffled = [...CITY_DB].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 获取评价语
 */
function getEvaluation(score, total = 10) {
  const ratio = score / (total * 150);
  if (ratio >= 0.9) return { title: I18n.t('eval1Title'), desc: I18n.t('eval1Desc'), emoji: I18n.t('eval1Emoji') };
  if (ratio >= 0.75) return { title: I18n.t('eval2Title'), desc: I18n.t('eval2Desc'), emoji: I18n.t('eval2Emoji') };
  if (ratio >= 0.6) return { title: I18n.t('eval3Title'), desc: I18n.t('eval3Desc'), emoji: I18n.t('eval3Emoji') };
  if (ratio >= 0.4) return { title: I18n.t('eval4Title'), desc: I18n.t('eval4Desc'), emoji: I18n.t('eval4Emoji') };
  return { title: I18n.t('eval5Title'), desc: I18n.t('eval5Desc'), emoji: I18n.t('eval5Emoji') };
}

/**
 * 按 ID 顺序固定出题（无随机）
 */
function pickQuestionsInOrder(count = 10) {
  return CITY_DB.slice(0, count);
}

/**
 * 从题库中随机抽取 N 题，排除已见过的城市
 * @param {number} count - 抽取数量
 * @param {number[]} seenCityIds - 已见过的城市 ID 列表
 * @returns {Array} 城市对象数组
 */
function pickQuestionsNoRepeat(count = 10, seenCityIds = []) {
  const pool = CITY_DB.filter(c => !seenCityIds.includes(c.id));
  if (pool.length >= count) {
    return shuffle(pool).slice(0, count);
  }
  // 不重复的城市不够一局，从全部城市中补充
  const needed = count - pool.length;
  const extras = shuffle(CITY_DB.filter(c => seenCityIds.includes(c.id) && !pool.find(p => p.id === c.id))).slice(0, needed);
  return shuffle([...pool, ...extras]);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CITY_DB, generateDistractors, pickQuestions, pickQuestionsInOrder, pickQuestionsNoRepeat, getEvaluation };
}
