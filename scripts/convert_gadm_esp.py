# -*- coding: utf-8 -*-
"""
GADM 4.1 ESP → GeoJSON 转换器（纯 Python，无第三方依赖）
- 输出 public/maps/esp-regions/data/{communities,provinces}.geojson
- 主层 = 18 个自治区（Comunidad Autónoma，含休达与梅利利亚合并要素，Level 1）
- 叠加层 = 52 个省（Provincia，Level 2）
- 面积球面近似实算；人口为 INE 2023 前后估计（约值，人工整理）
- 中文译名按通行译法；分组 = 绿色北部 / 中部高原 / 地中海东岸 / 安达卢西亚 / 海岛与飞地

用法：python scripts/convert_gadm_esp.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from gadm_shp import read_dbf, read_shp, build_geojson, geom_area_km2, bbox_of, write_geojson

BASE = "C:/Users/ZhuanZ/Downloads/gadm41_ESP_shp"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public/maps/esp-regions/data")

GROUPS = {
    "north":  ("绿色西班牙 · 北部", "Green Spain"),
    "meseta": ("中部高原 · 梅塞塔", "Meseta Central"),
    "east":   ("地中海东岸", "Mediterranean East"),
    "south":  ("安达卢西亚 · 南部", "Andalusia"),
    "islands":("海岛与北非飞地", "Islands & Enclaves"),
}

FACTS = {
    "andalucía":                dict(name="安达卢西亚", cap="塞维利亚", pop=8590000, g="south",
                                     blurb="西班牙人口第二多的自治区：塞维利亚、格拉纳达（阿尔罕布拉宫）、科尔多瓦，斗牛与弗拉门戈之乡。"),
    "aragón":                   dict(name="阿拉贡", cap="萨拉戈萨", pop=1330000, g="meseta",
                                     blurb="埃布罗河谷自治区，皮雷内斯山最高峰阿内托峰在此；中世纪阿拉贡王国的故地。"),
    "cantabria":                dict(name="坎塔布里亚", cap="桑坦德", pop=580000, g="north",
                                     blurb="「绿色西班牙」最小成员之一，阿尔塔米拉史前洞穴与桑坦德海湾在此。"),
    "castilla-la mancha":       dict(name="卡斯蒂利亚-拉曼恰", cap="托莱多", pop=2060000, g="meseta",
                                     blurb="堂吉诃德的风车场：西班牙面积第三大的自治区，番红花与红酒产区拉曼恰平原。"),
    "castilla y león":          dict(name="卡斯蒂利亚-莱昂", cap="巴利亚多利德", pop=2390000, g="meseta",
                                     blurb="西班牙面积最大的自治区（约 9.4 万 km²），塞戈维亚水道桥、布尔戈斯与萨拉曼卡大学城。"),
    "cataluña":                 dict(name="加泰罗尼亚", cap="巴塞罗那", pop=7780000, g="east",
                                     blurb="经济重镇：巴塞罗那高迪建筑群、萨格雷拉山区与自己的语言（加泰罗尼亚语）。"),
    "ceuta y melilla":          dict(name="休达与梅利利亚", cap="—", pop=90000, g="islands",
                                     blurb="北非海岸的两座自治市（西班牙本土外的飞地），面积合计不到 30 km²，地中海出入门户。"),
    "comunidad de madrid":      dict(name="马德里自治区", cap="马德里", pop=6770000, g="meseta",
                                     blurb="首都所在：面积只有全国 1.6%，却贡献约五分之一的经济产出，海拔 650 m 的欧洲高地都会。"),
    "comunidad foral de navarra":dict(name="纳瓦拉", cap="潘普洛纳", pop=660000, g="north",
                                     blurb="奔牛节的故乡，圣雅各之路的咽喉；历史上独立的纳瓦拉王国故地。"),
    "comunidad valenciana":     dict(name="巴伦西亚自治区", cap="巴伦西亚", pop=5180000, g="east",
                                     blurb="地中海米仓与橙乡：巴伦西亚、阿利坎特与海鲜饭（paella）的发明地。"),
    "extremadura":              dict(name="埃斯特雷马杜拉", cap="梅里达", pop=1060000, g="meseta",
                                     blurb="与葡萄牙接壤的人口流失大省，征服美洲的科尔特斯与皮萨罗皆出身于此。"),
    "galicia":                  dict(name="加利西亚", cap="圣地亚哥-德孔波斯特拉", pop=2680000, g="north",
                                     blurb="大西洋海岸与「世界尽头」菲尼斯特雷角，圣地亚哥朝圣之路的终点，有自己的语言加利西亚语。"),
    "islas baleares":           dict(name="巴利阿里群岛", cap="帕尔马", pop=1190000, g="islands",
                                     blurb="地中海度假群岛：马略卡、梅诺卡与伊维萨，旅游业占经济近半。"),
    "islas canarias":           dict(name="加那利群岛", cap="拉斯帕尔马斯 / 圣克鲁斯", pop=2170000, g="islands",
                                     blurb="大西洋上的火山群岛（摩洛哥以西约 100 km）：泰德火山是西班牙最高峰（3715 m）。"),
    "la rioja":                 dict(name="拉里奥哈", cap="洛格罗尼奥", pop=320000, g="north",
                                     blurb="西班牙人口最少的自治区，里奥哈红酒的名字来源，埃布罗上游河谷。"),
    "país vasco":               dict(name="巴斯克自治区", cap="维多利亚", pop=2210000, g="north",
                                     blurb="毕尔巴鄂古根海姆博物馆所在地，欧洲最独特的语言（巴斯克语）与自治传统。"),
    "principado de asturias":   dict(name="阿斯图里亚斯", cap="奥维耶多", pop=1010000, g="north",
                                     blurb="坎塔布连山与比斯开湾之间，欧洲之峰国家公园；历史上「收复失地运动」的起点。"),
    "región de murcia":         dict(name="穆尔西亚", cap="穆尔西亚", pop=1500000, g="east",
                                     blurb="东南阳光海岸（Costa Cálida），西班牙的菜篮子，缺水最严重的农业区。"),
}

TYPE_ZH = {"Comunidad Autónoma": "自治区", "Ciudad Autónoma": "自治市"}


def main():
    dbf1 = read_dbf(os.path.join(BASE, "gadm41_ESP_1.dbf"))
    _, recs1 = read_shp(os.path.join(BASE, "gadm41_ESP_1.shp"))
    fc1 = {"type": "FeatureCollection", "features": []}
    zh_of = {}
    for d, rings in zip(dbf1, recs1):
        key = (d.get("NAME_1") or "").strip().lower()
        geom = build_geojson(rings, eps=0.008)
        if not geom:
            continue
        f = FACTS.get(key)
        if not f:
            print("  [warn] no FACTS for", key)
            f = dict(name=(d.get("NAME_1") or key), cap=None, pop=None, g="meseta")
        zh_of[key] = f["name"]
        grp = GROUPS[f["g"]]
        props = {
            "gid": d.get("GID_1"),
            "name": f["name"],
            "nameEn": d.get("NAME_1"),
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
    write_geojson(os.path.join(OUT_DIR, "communities.geojson"), fc1)

    # Level 2：52 省
    dbf2 = read_dbf(os.path.join(BASE, "gadm41_ESP_2.dbf"))
    _, recs2 = read_shp(os.path.join(BASE, "gadm41_ESP_2.shp"))
    fc2 = {"type": "FeatureCollection", "features": []}
    for d, rings in zip(dbf2, recs2):
        geom = build_geojson(rings, eps=0.004)
        if not geom:
            continue
        name2 = (d.get("NAME_2") or "").strip()
        if not name2 or name2 == "NA":
            name2 = "—"
        props = {
            "gid": d.get("GID_2"),
            "provZh": zh_of.get((d.get("NAME_1") or "").strip().lower(), (d.get("NAME_1") or "").strip()),
            "name2": name2,
            "type2": d.get("TYPE_2"),
            "engtype2": d.get("ENGTYPE_2"),
        }
        fc2["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    write_geojson(os.path.join(OUT_DIR, "provinces.geojson"), fc2)

    print("bbox L1:", bbox_of([r for rings in recs1 for r in rings]))


if __name__ == "__main__":
    main()
