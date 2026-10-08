# -*- coding: utf-8 -*-
"""
GADM 4.1 UKR → GeoJSON 转换器（纯 Python，无第三方依赖）
- 输出 public/maps/ukr-regions/data/{oblasts,raions}.geojson
- 主层 = 27 个州级单位（24 州 + 基辅市 + 克里米亚自治共和国 + 塞瓦斯托波尔市，
  GADM L1 共 28 要素，其中 1 条字段全为 '?' 的异常记录已剔除）
- 叠加层 = 629 个区 / 市（Level 2，2020 年区划改革前的旧口径）
- 面积球面实算；人口为 2021 年前后官方估计（约值，人工整理）；NL_NAME_1 西里尔原名
- 分组按传统方位 = 北部 / 中部 / 东部 / 南部 / 西部
- 政治口径：克里米亚等归属与界线完全沿用 GADM 源数据口径，不代表任何立场。

用法：python scripts/convert_gadm_ukr.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from gadm_shp import read_dbf, read_shp, build_geojson, geom_area_km2, bbox_of, write_geojson

BASE = "C:/Users/ZhuanZ/Downloads/gadm41_UKR_shp"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public/maps/ukr-regions/data")

GROUPS = {
    "north": ("北部", "North"),
    "center":("中部", "Center"),
    "east":  ("东部", "East"),
    "south": ("南部", "South"),
    "west":  ("西部", "West"),
}

# 键 = GADM NAME_1 小写；'?' 异常记录不收录（转换时跳过）
FACTS = {
    "cherkasy":          dict(name="切尔卡瑟州", cap="切尔卡瑟", pop=1780000, g="center",
                          blurb="第聂伯河中游右岸农业州，舍甫琴科故里，塔拉索瓦山与锦葵之乡。"),
    "chernihiv":         dict(name="切尔尼戈夫州", cap="切尔尼戈夫", pop=960000, g="north",
                          blurb="与白俄罗斯接壤的东北边州，11 世纪的救世主大教堂是乌克兰现存最古老的石教堂之一。"),
    "chernivtsi":        dict(name="切尔诺夫策州", cap="切尔诺夫策", pop=890000, g="west",
                          blurb="布科维纳故地：奥匈遗产的切尔诺夫策大学（原东正教都主教府）为世界遗产。"),
    "crimea":            dict(name="克里米亚自治共和国", cap="辛菲罗波尔", pop=2350000, g="south",
                          blurb="黑海半岛：雅尔塔、塞瓦斯托波尔与刻赤海峡；其归属沿用 GADM 源数据口径，不代表任何立场。"),
    "dnipropetrovs'k":   dict(name="第聂伯罗彼得罗夫斯克州", cap="第聂伯罗", pop=3100000, g="east",
                          blurb="乌克兰钢铁与航天心脏：克里沃罗格铁矿带与第聂伯罗火箭工业（南方设计局）。"),
    "donets'k":          dict(name="顿涅茨克州", cap="顿涅茨克", pop=4100000, g="east",
                          blurb="顿巴斯煤田核心，马里乌波尔港与阿佐夫海岸；2014 年以来部分区域不在基辅控制之下。"),
    "ivano-frankivs'k":  dict(name="伊万诺-弗兰科夫斯克州", cap="伊万诺-弗兰科夫斯克", pop=1360000, g="west",
                          blurb="喀尔巴阡山东麓，古加利西亚故地，滑雪胜地亚布卢尼察山口。"),
    "kharkiv":           dict(name="哈尔科夫州", cap="哈尔科夫", pop=2630000, g="east",
                          blurb="苏联时代乌克兰第二首都：哈尔科夫是国家科学城（物理技术研究院）与机械工业中心，地铁与高等教育密度居全国前列。"),
    "kherson":           dict(name="赫尔松州", cap="赫尔松", pop=1010000, g="south",
                          blurb="第聂伯河入黑海三角洲与卡霍夫卡水库，乌克兰最大的灌溉西瓜与番茄产区。"),
    "khmel'nyts'kyy":    dict(name="赫梅利尼茨基州", cap="赫梅利尼茨基", pop=1240000, g="west",
                          blurb="波多利斯克高地东缘，卡缅涅茨-波多利斯基要塞城是乌克兰七大奇迹之一。"),
    "kiev":              dict(name="基辅州", cap="基辅（州辖外）", pop=1790000, g="north",
                          blurb="环绕基辅市但不包含基辅市：切尔诺贝利隔离区（1986）的北部门户在此州境内。"),
    "kiev city":         dict(name="基辅市", cap="—", pop=2950000, g="north",
                          blurb="首都与直辖市：基辅洞窟修道院与圣索菲亚大教堂两处世界遗产，人口约 295 万。"),
    "kirovohrad":        dict(name="基洛沃格勒州", cap="克罗皮夫尼茨基", pop=920000, g="center",
                          blurb="乌克兰的地理中心标志点在此州内，大草原农业带，人口持续外流。"),
    "l'viv":             dict(name="利沃夫州", cap="利沃夫", pop=2490000, g="west",
                          blurb="乌克兰西部门户：利沃夫老城（世界遗产）与咖啡文化，与波兰接壤的欧运枢纽。"),
    "luhans'k":          dict(name="卢甘斯克州", cap="卢甘斯克", pop=2090000, g="east",
                          blurb="乌克兰最东端的州，顿巴斯工业带东翼；2014 年以来部分区域不在基辅控制之下。"),
    "mykolayiv":         dict(name="尼古拉耶夫州", cap="尼古拉耶夫", pop=1100000, g="south",
                          blurb="南布格河口的造船之城（黑海造船厂，苏联航母的摇篮），乌克兰太阳能电站重镇。"),
    "odessa":            dict(name="敖德萨州", cap="敖德萨", pop=2350000, g="south",
                          blurb="黑海门户：敖德萨港与波将金阶梯，多瑙河三角洲乌克兰一侧与摩尔多瓦隔河相望。"),
    "poltava":           dict(name="波尔塔瓦州", cap="波尔塔瓦", pop=1370000, g="center",
                          blurb="1709 年波尔塔瓦战役故地，乌克兰的石油天然气产区与哥萨克文化腹地。"),
    "rivne":             dict(name="罗夫诺州", cap="罗夫诺", pop=1150000, g="west",
                          blurb="波列西耶沼泽林带，库兹涅茨克（库兹涅佐夫斯克）核电站在 2019 年后以沃伦核电站更名。"),
    "sevastopol'":       dict(name="塞瓦斯托波尔市", cap="—", pop=510000, g="south",
                          blurb="黑海舰队母港与英雄城市；其地位沿用 GADM 源数据口径，不代表任何立场。"),
    "sumy":              dict(name="苏梅州", cap="苏梅", pop=1040000, g="north",
                          blurb="与俄罗斯三面接壤的东北边州，苏梅与绍斯特卡为传统工业与化工中心。"),
    "ternopil'":         dict(name="捷尔诺波尔州", cap="捷尔诺波尔", pop=1030000, g="west",
                          blurb="加利西亚东部：捷尔诺波尔湖与上百座城堡遗迹，乌克兰最「波兰化」的地带之一。"),
    "vinnytsya":         dict(name="文尼察州", cap="文尼察", pop=1540000, g="center",
                          blurb="南布格河畔的农业大州：甜菜、糖果（Roshen）与乌克兰最大的太阳能电站群；州徽里的水磨是城市名字的由来。"),
    "volyn":             dict(name="沃伦州", cap="卢茨克", pop=1030000, g="west",
                          blurb="与波兰、白俄罗斯接壤的西北边州，卢茨克上堡与沙茨克湖群。"),
    "zakarpattia":       dict(name="外喀尔巴阡州", cap="乌日霍罗德", pop=1250000, g="west",
                          blurb="喀尔巴阡山以西的「乌克兰尽头」：与四国接壤，匈牙利族与鲁塞尼亚族聚居，乌日霍罗德与穆卡切沃城堡。"),
    "zaporizhia":        dict(name="扎波罗热州", cap="扎波罗热", pop=1640000, g="east",
                          blurb="扎波罗热哥萨克的故地霍尔蒂察岛，欧洲最大核电站扎波罗热核电站位于该州。"),
    "zhytomyr":          dict(name="日托米尔州", cap="日托米尔", pop=1190000, g="north",
                          blurb="波列西耶林带与花岗岩产区，科罗廖夫（苏联航天之父）的故乡。"),
}

TYPE_ZH = {"Oblast'": "州", "Independent City": "直辖市", "Autonomous Republic": "自治共和国"}


def main():
    dbf1 = read_dbf(os.path.join(BASE, "gadm41_UKR_1.dbf"))
    _, recs1 = read_shp(os.path.join(BASE, "gadm41_UKR_1.shp"))
    fc1 = {"type": "FeatureCollection", "features": []}
    zh_of = {}
    skipped = 0
    for d, rings in zip(dbf1, recs1):
        key = (d.get("NAME_1") or "").strip().lower()
        if not key or key == "?" or key == "na":
            skipped += 1
            continue
        geom = build_geojson(rings, eps=0.006)
        if not geom:
            continue
        f = FACTS.get(key)
        if not f:
            print("  [warn] no FACTS for", key)
            f = dict(name=(d.get("NAME_1") or key), cap=None, pop=None, g="center")
        zh_of[key] = f["name"]
        grp = GROUPS[f["g"]]
        props = {
            "gid": d.get("GID_1"),
            "name": f["name"],
            "nameEn": d.get("NAME_1"),
            "nameLocal": (d.get("NL_NAME_1") or "") if (d.get("NL_NAME_1") or "") not in ("", "NA") else "",
            "type": TYPE_ZH.get(d.get("TYPE_1"), d.get("TYPE_1")),
            "typeEn": d.get("ENGTYPE_1"),
            "groupZh": grp[0],
            "groupEn": grp[1],
            "capital": f["cap"],
            "pop": f["pop"],
            "area": round(geom_area_km2(geom)),
            "blurb": f.get("blurb"),
        }
        fc1["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    write_geojson(os.path.join(OUT_DIR, "oblasts.geojson"), fc1)
    print("  skipped anomalous L1 records:", skipped)

    # Level 2：629 区 / 市（跳过 '?' 与占位符记录）
    dbf2 = read_dbf(os.path.join(BASE, "gadm41_UKR_2.dbf"))
    _, recs2 = read_shp(os.path.join(BASE, "gadm41_UKR_2.shp"))
    fc2 = {"type": "FeatureCollection", "features": []}
    skip2 = 0
    for d, rings in zip(dbf2, recs2):
        name1 = (d.get("NAME_1") or "").strip()
        name2 = (d.get("NAME_2") or "").strip()
        if not name1 or name1 == "?" or not name2 or name2 == "?":
            skip2 += 1
            continue
        geom = build_geojson(rings, eps=0.004)
        if not geom:
            continue
        props = {
            "gid": d.get("GID_2"),
            "provZh": zh_of.get(name1.lower(), name1),
            "name2": name2,
            "type2": d.get("TYPE_2") if d.get("TYPE_2") != "?" else "",
            "engtype2": d.get("ENGTYPE_2") if d.get("ENGTYPE_2") != "?" else "",
        }
        fc2["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    write_geojson(os.path.join(OUT_DIR, "raions.geojson"), fc2)
    print("  skipped anomalous L2 records:", skip2)

    print("bbox L1:", bbox_of([r for rings in recs1 for r in rings]))


if __name__ == "__main__":
    main()
