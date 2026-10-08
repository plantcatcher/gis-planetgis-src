# -*- coding: utf-8 -*-
"""
GADM 4.1 EGY → GeoJSON 转换器（纯 Python，无第三方依赖）
- 输出 public/maps/egy-regions/data/{governorates,districts}.geojson
- 主层 = 27 个省（Muhafazah / Governorate，Level 1）
- 叠加层 = 343 个区（Level 2）
- 面积由球面近似实算（km²）；人口为首府所在省的公开估计值（约值，人工整理）
- 中文译名按中国地名委员会标准译法；分组 = 大开罗 / 下埃及·三角洲与运河 /
  上埃及·尼罗河谷 / 沙漠与边疆

用法：python scripts/convert_gadm_egy.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from gadm_shp import read_dbf, read_shp, build_geojson, geom_area_km2, bbox_of, write_geojson

BASE = "C:/Users/ZhuanZ/Downloads/gadm41_EGY_shp"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public/maps/egy-regions/data")

# 分组：group = (中文名, 英文名)
GROUPS = {
    "cairo": ("大开罗", "Greater Cairo"),
    "delta": ("下埃及 · 三角洲与运河", "Lower Egypt"),
    "valley": ("上埃及 · 尼罗河谷", "Upper Egypt"),
    "frontier": ("沙漠与边疆省", "Desert & Frontier"),
}

# FACTS：键 = GADM NAME_1 小写；pop = 2023 前后公开估计（约值）；cap = 首府（中文）
FACTS = {
    "ad daqahliyah":     dict(name="代盖赫利耶省", cap="曼苏拉", pop=6720000, g="delta",
                              blurb="尼罗河达米埃塔支流入海口，曼苏拉在十字军东征中两次击败路易九世。"),
    "al bahr al ahmar":  dict(name="红海省", cap="古尔代盖", pop=390000, g="frontier",
                              blurb="埃及红海度假带：霍尔格达、萨法加与西奈隔海相望，人口却不到全国 0.4%。"),
    "al buhayrah":       dict(name="布海拉省", cap="达曼胡尔", pop=6610000, g="delta",
                              blurb="「海省」之名来自三角洲潟湖，农业大省，古亚历山大城的水源腹地。"),
    "al fayyum":         dict(name="法尤姆省", cap="法尤姆", pop=3880000, g="valley",
                              blurb="绿洲省：古埃及称「舍易斯」，加龙湖与卡伦湖是尼罗河谷以西最大的绿洲盆府。"),
    "al gharbiyah":      dict(name="西部省", cap="坦塔", pop=5290000, g="delta",
                              blurb="埃及人口密度最高的省份之一，坦塔大学城是北非重要宗教文化中心。"),
    "al iskandariyah":   dict(name="亚历山大省", cap="亚历山大", pop=5480000, g="delta",
                              blurb="地中海明珠：托勒密王朝都城、亚历山大灯塔与图书馆的故乡，埃及第二大城市。"),
    "al isma`iliyah":    dict(name="伊斯梅利亚省", cap="伊斯梅利亚", pop=1420000, g="delta",
                              blurb="苏伊士运河中段省会，运河管理总部的所在地，运河之战的现场。"),
    "al jizah":          dict(name="吉萨省", cap="吉萨", pop=9270000, g="cairo",
                              blurb="金字塔省：胡夫、哈夫拉、孟考拉三大金字塔与狮身人面像均在此，人口全国第二。"),
    "al minufiyah":      dict(name="米努夫省", cap="希宾库姆", pop=4530000, g="delta",
                              blurb="尼罗河杜姆亚特与罗塞塔两支之间的农业心脏，出过萨达特与穆巴拉克两位总统。"),
    "al minya":          dict(name="明亚省", cap="明亚", pop=6010000, g="valley",
                              blurb="「上埃及的珍珠」：阿玛尔纳与贝尼哈桑岩窟墓，中王国时期的首府故地。"),
    "al qahirah":        dict(name="开罗省", cap="开罗", pop=10230000, g="cairo",
                              blurb="千塔之城、非洲与阿拉伯世界最大的都会区核心，埃及人口最多的省。"),
    "al qalyubiyah":     dict(name="盖勒尤卜省", cap="本哈", pop=5950000, g="cairo",
                              blurb="大开罗东北翼，面积不到 1200 km² 却挤了近 600 万人，密度全国第一档。"),
    "al uqsur":          dict(name="卢克索省", cap="卢克索", pop=1320000, g="valley",
                              blurb="古都底比斯：卡纳克神庙、卢克索神庙与帝王谷，世界上最大的露天博物馆。"),
    "al wadi al jadid":  dict(name="新河谷省", cap="哈尔加", pop=260000, g="frontier",
                              blurb="埃及面积最大的省（约 44 万 km²），却只有 20 多万人——西部沙漠的全部荒凉。"),
    "as suways":         dict(name="苏伊士省", cap="苏伊士", pop=780000, g="delta",
                              blurb="运河南端门户：苏伊士城扼红海入口，1956 年苏伊士危机的引爆点。"),
    "ash sharqiyah":     dict(name="东部省", cap="扎加济格", pop=7570000, g="delta",
                              blurb="三角洲东部农业大省，塔纳与萨努河之间的粮仓，古埃及布巴斯提斯猫神故地。"),
    "aswan":             dict(name="阿斯旺省", cap="阿斯旺", pop=1540000, g="valley",
                              blurb="阿斯旺大坝与纳赛尔水库，埃及最南端的努比亚故地与花岗岩采石场。"),
    "asyut":             dict(name="艾斯尤特省", cap="艾斯尤特", pop=4770000, g="valley",
                              blurb="上埃及最大省分之一，古科普特基督教重镇，尼罗河在此转向西行。"),
    "bani suwayf":       dict(name="贝尼苏韦夫省", cap="贝尼苏韦夫", pop=3490000, g="valley",
                              blurb="尼罗河谷与西部沙漠之间的过渡带，梅杜姆金字塔（斯尼夫鲁折角试验场）在此。"),
    "bur sa`id":         dict(name="塞得港省", cap="塞得港", pop=790000, g="delta",
                              blurb="运河北端入地中海的门户港，1956 年英法入侵的第一登陆点。"),
    "dumyat":            dict(name="杜姆亚特省", cap="杜姆亚特", pop=1600000, g="delta",
                              blurb="埃及面积最小的省之一，家具之都，达米埃塔支流的入海口糖业港。"),
    "janub sina'":       dict(name="南西奈省", cap="图尔", pop=110000, g="frontier",
                              blurb="沙姆沙伊赫与圣凯瑟琳修道院（西奈山）所在地，红海潜水圣地。"),
    "kafr ash shaykh":   dict(name="谢赫村省", cap="谢赫村", pop=3640000, g="delta",
                              blurb="三角洲潟湖布如鲁斯湖所在，渔业与稻米并重，人口稠密。"),
    "matrouh":           dict(name="马特鲁省", cap="马特鲁港", pop=550000, g="frontier",
                              blurb="西北边疆省：直抵利比亚国界，阿拉曼战场与「克莉奥佩特拉浴场」海滩。"),
    "qina":              dict(name="基纳省", cap="基纳", pop=3490000, g="valley",
                              blurb="上埃及传统保守的心脏地带，丹德拉哈托尔神庙在此，与红海隔山相望。"),
    "shamal sina'":      dict(name="北西奈省", cap="阿里什", pop=450000, g="frontier",
                              blurb="西奈半岛北半部，直抵加沙与以色列边界，地势从沙丘抬升到山地。"),
    "suhaj":             dict(name="索哈杰省", cap="索哈杰", pop=5680000, g="valley",
                              blurb="上埃及人口大省，阿拜多斯（奥西里斯崇拜中心）与红修道院所在地。"),
}

TYPE_ZH = {"Muhafazah": "省"}


def main():
    # ── Level 1：27 省 ──
    dbf1 = read_dbf(os.path.join(BASE, "gadm41_EGY_1.dbf"))
    _, recs1 = read_shp(os.path.join(BASE, "gadm41_EGY_1.shp"))
    assert len(dbf1) == len(recs1)
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
            f = dict(name=(d.get("NAME_1") or key), cap=None, pop=None, g="frontier")
        zh_of[key] = f["name"]
        grp = GROUPS[f["g"]]
        props = {
            "gid": d.get("GID_1"),
            "name": f["name"],
            "nameEn": d.get("NAME_1"),
            "nameLocal": (d.get("NL_NAME_1") or "").replace("محافظة ", ""),
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
    write_geojson(os.path.join(OUT_DIR, "governorates.geojson"), fc1)

    # ── Level 2：343 区 ──
    dbf2 = read_dbf(os.path.join(BASE, "gadm41_EGY_2.dbf"))
    _, recs2 = read_shp(os.path.join(BASE, "gadm41_EGY_2.shp"))
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
    write_geojson(os.path.join(OUT_DIR, "districts.geojson"), fc2)

    print("bbox L1:", bbox_of([r for rings in recs1 for r in rings]))


if __name__ == "__main__":
    main()
