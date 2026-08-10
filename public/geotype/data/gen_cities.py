# -*- coding: utf-8 -*-
"""生成 cities.js：300-500 城静态数据。常见城市真实，长尾合理估算。"""
import json, hashlib, os

# 已知城市真实数据：name -> (country, climate, elevation, coastal, urbanization)
KNOWN = {
    # 中国重点城市
    "北京": ("中国", "temperate", 44, False, 87),
    "上海": ("中国", "subtropical", 4, True, 89),
    "广州": ("中国", "subtropical", 21, True, 86),
    "深圳": ("中国", "subtropical", 20, True, 95),
    "天津": ("中国", "temperate", 5, True, 83),
    "重庆": ("中国", "subtropical", 244, False, 70),
    "武汉": ("中国", "subtropical", 37, False, 80),
    "成都": ("中国", "subtropical", 500, False, 75),
    "杭州": ("中国", "subtropical", 19, True, 83),
    "南京": ("中国", "subtropical", 20, False, 82),
    "西安": ("中国", "temperate", 405, False, 78),
    "苏州": ("中国", "subtropical", 8, True, 81),
    "青岛": ("中国", "temperate", 76, True, 79),
    "大连": ("中国", "temperate", 93, True, 78),
    "厦门": ("中国", "subtropical", 63, True, 80),
    "宁波": ("中国", "subtropical", 13, True, 79),
    "昆明": ("中国", "subtropical", 1890, False, 75),
    "贵阳": ("中国", "subtropical", 1100, False, 72),
    "长沙": ("中国", "subtropical", 68, False, 79),
    "郑州": ("中国", "temperate", 110, False, 78),
    "济南": ("中国", "temperate", 51, False, 78),
    "合肥": ("中国", "subtropical", 30, False, 76),
    "福州": ("中国", "subtropical", 84, True, 78),
    "南昌": ("中国", "subtropical", 47, False, 76),
    "石家庄": ("中国", "temperate", 81, False, 75),
    "太原": ("中国", "temperate", 800, False, 75),
    "沈阳": ("中国", "continental", 55, False, 80),
    "长春": ("中国", "continental", 215, False, 78),
    "哈尔滨": ("中国", "cold", 150, False, 80),
    "兰州": ("中国", "arid", 1520, False, 70),
    "乌鲁木齐": ("中国", "cold", 800, False, 75),
    "呼和浩特": ("中国", "continental", 1060, False, 72),
    "银川": ("中国", "arid", 1110, False, 70),
    "西宁": ("中国", "cold", 2275, False, 68),
    "拉萨": ("中国", "cold", 3650, False, 55),
    "南宁": ("中国", "subtropical", 76, False, 72),
    "海口": ("中国", "tropical", 14, True, 75),
    "三亚": ("中国", "tropical", 18, True, 70),
    "香港": ("中国", "subtropical", 8, True, 100),
    "澳门": ("中国", "subtropical", 6, True, 100),
    "台北": ("中国", "subtropical", 9, True, 95),
    "高雄": ("中国", "subtropical", 12, True, 92),
    "东莞": ("中国", "subtropical", 25, True, 85),
    "佛山": ("中国", "subtropical", 11, True, 83),
    "无锡": ("中国", "subtropical", 6, True, 80),
    "常州": ("中国", "subtropical", 8, True, 78),
    "温州": ("中国", "subtropical", 21, True, 78),
    "金华": ("中国", "subtropical", 64, False, 73),
    "珠海": ("中国", "subtropical", 32, True, 82),
    "中山": ("中国", "subtropical", 18, True, 80),
    "烟台": ("中国", "temperate", 47, True, 76),
    "威海": ("中国", "temperate", 65, True, 75),
    "泉州": ("中国", "subtropical", 21, True, 78),
    # 世界主要城市
    "东京": ("日本", "temperate", 40, True, 92),
    "大阪": ("日本", "temperate", 25, True, 90),
    "名古屋": ("日本", "temperate", 15, True, 88),
    "首尔": ("韩国", "temperate", 38, False, 100),
    "釜山": ("韩国", "temperate", 20, True, 95),
    "新加坡": ("新加坡", "tropical", 15, True, 100),
    "曼谷": ("泰国", "tropical", 5, False, 90),
    "吉隆坡": ("马来西亚", "tropical", 70, False, 92),
    "雅加达": ("印度尼西亚", "tropical", 8, True, 95),
    "马尼拉": ("菲律宾", "tropical", 16, True, 90),
    "河内": ("越南", "subtropical", 17, False, 80),
    "胡志明市": ("越南", "tropical", 19, False, 85),
    "新德里": ("印度", "subtropical", 216, False, 88),
    "孟买": ("印度", "tropical", 14, True, 95),
    "班加罗尔": ("印度", "tropical", 920, False, 85),
    "迪拜": ("阿联酋", "arid", 16, True, 95),
    "阿布扎比": ("阿联酋", "arid", 7, True, 90),
    "利雅得": ("沙特阿拉伯", "arid", 612, False, 88),
    "多哈": ("卡塔尔", "arid", 10, True, 95),
    "特拉维夫": ("以色列", "arid", 30, True, 92),
    "伊斯坦布尔": ("土耳其", "temperate", 40, True, 90),
    "安卡拉": ("土耳其", "continental", 938, False, 85),
    "开罗": ("埃及", "arid", 23, False, 90),
    "内罗毕": ("肯尼亚", "subtropical", 1795, False, 75),
    "拉各斯": ("尼日利亚", "tropical", 41, True, 85),
    "开普敦": ("南非", "mediterranean", 25, True, 90),
    "约翰内斯堡": ("南非", "temperate", 1753, False, 85),
    "莫斯科": ("俄罗斯", "cold", 156, False, 90),
    "圣彼得堡": ("俄罗斯", "cold", 12, True, 88),
    "新西伯利亚": ("俄罗斯", "cold", 150, False, 80),
    "伦敦": ("英国", "temperate", 11, True, 100),
    "曼彻斯特": ("英国", "temperate", 38, False, 95),
    "巴黎": ("法国", "temperate", 35, False, 100),
    "马赛": ("法国", "mediterranean", 12, True, 95),
    "柏林": ("德国", "temperate", 34, False, 98),
    "慕尼黑": ("德国", "continental", 520, False, 97),
    "法兰克福": ("德国", "temperate", 112, False, 97),
    "罗马": ("意大利", "mediterranean", 21, True, 95),
    "米兰": ("意大利", "continental", 122, False, 95),
    "马德里": ("西班牙", "mediterranean", 667, False, 95),
    "巴塞罗那": ("西班牙", "mediterranean", 12, True, 96),
    "阿姆斯特丹": ("荷兰", "temperate", 2, True, 100),
    "布鲁塞尔": ("比利时", "temperate", 13, False, 98),
    "维也纳": ("奥地利", "continental", 151, False, 97),
    "苏黎世": ("瑞士", "continental", 408, False, 98),
    "日内瓦": ("瑞士", "continental", 375, False, 97),
    "斯德哥尔摩": ("瑞典", "cold", 28, True, 96),
    "哥本哈根": ("丹麦", "temperate", 7, True, 98),
    "奥斯陆": ("挪威", "cold", 23, True, 97),
    "赫尔辛基": ("芬兰", "cold", 17, True, 96),
    "雅典": ("希腊", "mediterranean", 70, True, 95),
    "里斯本": ("葡萄牙", "mediterranean", 104, True, 94),
    "都柏林": ("爱尔兰", "temperate", 22, True, 96),
    "华沙": ("波兰", "continental", 110, False, 95),
    "布拉格": ("捷克", "continental", 177, False, 95),
    "布达佩斯": ("匈牙利", "continental", 102, False, 94),
    "纽约": ("美国", "temperate", 10, True, 100),
    "洛杉矶": ("美国", "mediterranean", 71, True, 98),
    "旧金山": ("美国", "mediterranean", 16, True, 97),
    "芝加哥": ("美国", "continental", 190, False, 98),
    "西雅图": ("美国", "temperate", 53, True, 96),
    "波士顿": ("美国", "temperate", 14, True, 98),
    "华盛顿": ("美国", "temperate", 22, False, 98),
    "迈阿密": ("美国", "tropical", 2, True, 95),
    "拉斯维加斯": ("美国", "arid", 610, False, 92),
    "丹佛": ("美国", "continental", 1609, False, 94),
    "休斯顿": ("美国", "subtropical", 32, True, 95),
    "亚特兰大": ("美国", "subtropical", 320, False, 94),
    "多伦多": ("加拿大", "continental", 76, False, 96),
    "温哥华": ("加拿大", "temperate", 70, True, 97),
    "蒙特利尔": ("加拿大", "continental", 233, False, 95),
    "墨西哥城": ("墨西哥", "subtropical", 2240, False, 92),
    "坎昆": ("墨西哥", "tropical", 10, True, 88),
    "圣保罗": ("巴西", "subtropical", 760, False, 92),
    "里约热内卢": ("巴西", "tropical", 2, True, 92),
    "布宜诺斯艾利斯": ("阿根廷", "temperate", 25, True, 93),
    "圣地亚哥": ("智利", "mediterranean", 520, False, 92),
    "利马": ("秘鲁", "arid", 154, True, 90),
    "波哥大": ("哥伦比亚", "subtropical", 2640, False, 88),
    "悉尼": ("澳大利亚", "temperate", 58, True, 95),
    "墨尔本": ("澳大利亚", "temperate", 31, True, 95),
    "珀斯": ("澳大利亚", "mediterranean", 20, True, 92),
    "布里斯班": ("澳大利亚", "subtropical", 10, True, 93),
    "奥克兰": ("新西兰", "temperate", 196, True, 94),
    "惠灵顿": ("新西兰", "temperate", 125, True, 95),
}

# 中国地级市（仅名，合理估算）
CN_EXTRA = [
    "保定","唐山","秦皇岛","邯郸","邢台","张家口","承德","沧州","廊坊","衡水",
    "大同","阳泉","长治","晋城","朔州","晋中","运城","忻州","临汾","吕梁",
    "呼伦贝尔","通辽","赤峰","鄂尔多斯","乌兰察布",
    "本溪","丹东","锦州","营口","阜新","辽阳","盘锦","铁岭","朝阳","葫芦岛",
    "四平","辽源","通化","白山","松原","白城",
    "齐齐哈尔","鸡西","鹤岗","双鸭山","大庆","伊春","佳木斯","七台河","牡丹江","黑河","绥化",
    "徐州","连云港","淮安","盐城","扬州","镇江","泰州","宿迁",
    "嘉兴","湖州","绍兴","金华","衢州","舟山","台州","丽水",
    "芜湖","蚌埠","淮南","马鞍山","淮北","铜陵","安庆","黄山","滁州","阜阳","宿州","六安","亳州","池州","宣城",
    "莆田","三明","泉州","漳州","南平","龙岩","宁德",
    "景德镇","萍乡","九江","新余","鹰潭","赣州","吉安","宜春","抚州","上饶",
    "枣庄","东营","烟台","潍坊","济宁","泰安","威海","日照","莱芜","临沂","德州","聊城","滨州","菏泽",
    "开封","洛阳","平顶山","安阳","鹤壁","新乡","焦作","濮阳","许昌","漯河","三门峡","南阳","商丘","信阳","周口","驻马店",
    "黄石","十堰","宜昌","襄阳","鄂州","荆门","孝感","荆州","黄冈","咸宁","随州",
    "株洲","湘潭","衡阳","邵阳","岳阳","常德","张家界","益阳","郴州","永州","怀化","娄底",
    "韶关","汕头","湛江","茂名","肇庆","江门","茂名","阳江","清远","潮州","揭阳","云浮",
    "柳州","桂林","梧州","北海","防城港","钦州","贵港","玉林","百色","贺州","河池","来宾","崇左",
    "自贡","攀枝花","泸州","德阳","绵阳","广元","遂宁","内江","乐山","南充","眉山","宜宾","广安","达州","雅安","巴中","资阳",
    "六盘水","遵义","安顺","毕节","铜仁",
    "曲靖","玉溪","保山","昭通","丽江","普洱","临沧",
    "延安","汉中","榆林","安康","商洛",
    "天水","武威","张掖","平凉","酒泉","庆阳","定西","陇南",
    "海东",
]

# 世界城市（名, 国）
WORLD_EXTRA = [
    ("名古屋","日本"),("神户","日本"),("福冈","日本"),("札幌","日本"),
    ("清迈","泰国"),("普吉","泰国"),("芭堤雅","泰国"),
    ("清奈","印度"),("加尔各答","印度"),("海得拉巴","印度"),
    ("贝鲁特","黎巴嫩"),("安曼","约旦"),("科威特城","科威特"),
    ("德黑兰","伊朗"),("巴格达","伊拉克"),("喀土穆","苏丹"),
    ("达累斯萨拉姆","坦桑尼亚"),("亚的斯亚贝巴","埃塞俄比亚"),("卡萨布兰卡","摩洛哥"),
    ("阿尔及尔","阿尔及利亚"),("突尼斯","突尼斯"),("阿克拉","加纳"),
    ("基辅","乌克兰"),("明斯克","白俄罗斯"),("索菲亚","保加利亚"),("贝尔格莱德","塞尔维亚"),
    ("萨格勒布","克罗地亚"),("卢布尔雅那","斯洛文尼亚"),("布拉迪斯拉发","斯洛伐克"),
    ("雷克雅未克","冰岛"),("塔林","爱沙尼亚"),("里加","拉脱维亚"),("维尔纽斯","立陶宛"),
    ("爱丁堡","英国"),("都柏林","爱尔兰"),("波尔图","葡萄牙"),("塞维利亚","西班牙"),
    ("那不勒斯","意大利"),("佛罗伦萨","意大利"),("威尼斯","意大利"),
    ("西雅图","美国"),("波特兰","美国"),("西雅图","美国"),("圣地亚哥","美国"),("菲尼克斯","美国"),
    ("卡尔加里","加拿大"),("埃德蒙顿","加拿大"),("渥太华","加拿大"),("魁北克城","加拿大"),
    ("瓜达拉哈拉","墨西哥"),("蒂华纳","墨西哥"),
    ("加拉加斯","委内瑞拉"),("基多","厄瓜多尔"),("拉巴斯","玻利维亚"),("蒙得维的亚","乌拉圭"),
    ("阿德莱德","澳大利亚"),("堪培拉","澳大利亚"),("霍巴特","澳大利亚"),
    "达尔文","澳大利亚",
]

country_climate = {
    "日本":"temperate","韩国":"temperate","新加坡":"tropical","泰国":"tropical",
    "马来西亚":"tropical","印度尼西亚":"tropical","菲律宾":"tropical","越南":"subtropical",
    "印度":"tropical","阿联酋":"arid","沙特阿拉伯":"arid","卡塔尔":"arid","以色列":"arid",
    "土耳其":"temperate","埃及":"arid","肯尼亚":"subtropical","尼日利亚":"tropical",
    "南非":"mediterranean","俄罗斯":"cold","英国":"temperate","法国":"temperate",
    "德国":"temperate","意大利":"mediterranean","西班牙":"mediterranean","荷兰":"temperate",
    "比利时":"temperate","奥地利":"continental","瑞士":"continental","瑞典":"cold",
    "丹麦":"temperate","挪威":"cold","芬兰":"cold","希腊":"mediterranean",
    "葡萄牙":"mediterranean","爱尔兰":"temperate","波兰":"continental","捷克":"continental",
    "匈牙利":"continental","美国":"temperate","加拿大":"continental","墨西哥":"subtropical",
    "巴西":"subtropical","阿根廷":"temperate","智利":"mediterranean","秘鲁":"arid",
    "哥伦比亚":"subtropical","澳大利亚":"temperate","新西兰":"temperate",
    "黎巴嫩":"arid","约旦":"arid","科威特":"arid","伊朗":"arid","伊拉克":"arid",
    "苏丹":"arid","坦桑尼亚":"tropical","埃塞俄比亚":"subtropical","摩洛哥":"mediterranean",
    "阿尔及利亚":"arid","突尼斯":"mediterranean","加纳":"tropical","乌克兰":"continental",
    "白俄罗斯":"continental","保加利亚":"continental","塞尔维亚":"continental",
    "克罗地亚":"mediterranean","斯洛文尼亚":"continental","斯洛伐克":"continental",
    "冰岛":"cold","爱沙尼亚":"cold","拉脱维亚":"cold","立陶宛":"cold",
    "委内瑞拉":"tropical","厄瓜多尔":"subtropical","玻利维亚":"subtropical","乌拉圭":"temperate",
}

def det(name, lo, hi):
    h = int(hashlib.md5(name.encode("utf-8")).hexdigest(), 16)
    return lo + (h % (hi - lo + 1))

cities = []
seen = set()

def add(name, country, climate, elevation, coastal, urbanization):
    if name in seen:
        return
    seen.add(name)
    cities.append({
        "city": name, "country": country, "climate": climate,
        "elevation": elevation, "coastal": coastal, "urbanization": urbanization,
    })

# 已知
for name, v in KNOWN.items():
    add(name, *v)

# 中国长尾
coastal_cn = {"秦皇岛","连云港","盐城","南通","上海","宁波","温州","福州","厦门","泉州",
              "广州","深圳","珠海","汕头","湛江","海口","三亚","香港","澳门","台北","高雄",
              "青岛","烟台","威海","大连","天津","北海","防城港","钦州","东莞","佛山","中山"}
for name in CN_EXTRA:
    if name in seen:
        continue
    climate = "subtropical" if name in ("韶关","汕头","湛江","茂名","肇庆","江门","阳江","清远","潮州","揭阳","云浮","柳州","桂林","梧州","北海","防城港","钦州","贵港","玉林","百色","贺州","河池","来宾","崇左","自贡","泸州","德阳","绵阳","广元","遂宁","内江","乐山","南充","眉山","宜宾","广安","达州","雅安","巴中","资阳","昆明","曲靖","玉溪","保山","昭通","丽江","普洱","临沧","六盘水","遵义","安顺","毕节","铜仁","韶关") else "temperate"
    climate = "arid" if name in ("鄂尔多斯","榆林","延安","武威","张掖","酒泉","庆阳","定西","金昌","白银","嘉峪关","石嘴山","吴忠","中卫","吐鲁番","哈密") else climate
    climate = "cold" if name in ("海东","西宁","拉萨","海北","黄南","海南","果洛","玉树","那曲","阿里","昌都","哈尔滨","齐齐哈尔","牡丹江","佳木斯","大庆","伊春","黑河","绥化","加格达奇") else climate
    coastal = name in coastal_cn
    elevation = det(name, 5, 1500)
    urbanization = det(name, 55, 85)
    add(name, "中国", climate, elevation, coastal, urbanization)

# 世界长尾
for item in WORLD_EXTRA:
    if isinstance(item, tuple):
        name, country = item
    else:
        name, country = item, "澳大利亚"
    if name in seen:
        continue
    climate = country_climate.get(country, "temperate")
    coastal = det(name, 0, 1) == 0 and country not in ("瑞士","奥地利","蒙古","尼泊尔","玻利维亚","埃塞俄比亚","肯尼亚","津巴布韦")
    elevation = det(name, 5, 1800)
    urbanization = det(name, 70, 98)
    add(name, country, climate, elevation, bool(coastal), urbanization)

# 去重保序，按国家+城市排序便于查找
cities.sort(key=lambda c: (c["country"], c["city"]))

out = "window.CITIES = " + json.dumps(cities, ensure_ascii=False, indent=2) + ";\n"
here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "cities.js"), "w", encoding="utf-8") as f:
    f.write(out)

print("生成城市数:", len(cities))
print("中国城市:", sum(1 for c in cities if c["country"] == "中国"))
print("示例:", cities[0], cities[-1])
