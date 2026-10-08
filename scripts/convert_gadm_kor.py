# -*- coding: utf-8 -*-
"""
GADM 4.1 KOR → GeoJSON 转换器（纯 Python，无第三方依赖）
- 输出 public/maps/kor-regions/data/{metro,citycounty}.geojson
- 主层 = 17 个道市（1 特别市 / 6 广域市 / 1 特别自治市 / 1 特别自治道 / 8 道，Level 1）
- 叠加层 = 229 个市 / 郡 / 区（Level 2）
- NL_NAME_1 自带韩文汉字名（釜山廣域市），中文区名直接取汉字；面积球面实算；
  人口为 2023 前后住民登记人口估计（约值，人工整理）
- 分组 = 首都圈 / 忠清圈 / 湖南圈 / 岭南圈 / 江原圈 / 济州

用法：python scripts/convert_gadm_kor.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from gadm_shp import read_dbf, read_shp, build_geojson, geom_area_km2, bbox_of, write_geojson

BASE = "C:/Users/ZhuanZ/Downloads/gadm41_KOR_shp"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public/maps/kor-regions/data")

GROUPS = {
    "capital": ("首都圈", "Capital Region"),
    "chung":   ("忠清圈", "Chungcheong"),
    "honam":   ("湖南圈", "Honam"),
    "yeongnam":("岭南圈", "Yeongnam"),
    "gangwon": ("江原圈", "Gangwon"),
    "jeju":    ("济州", "Jeju"),
}

FACTS = {
    "busan":             dict(name="釜山广域市", cap="—", pop=3360000, g="yeongnam",
                          blurb="韩国第一大港与第二大城市：影岛、海云台与札嘎其市场，东南经济圈的双引擎之一。"),
    "chungcheongbuk-do": dict(name="忠清北道", cap="清州", pop=1600000, g="chung",
                          blurb="韩国唯一的内陆道，清州与五松是半导体产业带（SK 海力士总部区）。"),
    "chungcheongnam-do": dict(name="忠清南道", cap="天安", pop=2120000, g="chung",
                          blurb="道厅设在天安；唐津港、大山港承接西海岸物流，牙山是现代重工大本营。"),
    "daegu":             dict(name="大邱广域市", cap="—", pop=2160000, g="yeongnam",
                          blurb="岭南内陆中枢，纺织与苹果之城，八公山与近代巷道之旅。"),
    "daejeon":           dict(name="大田广域市", cap="—", pop=1470000, g="chung",
                          blurb="韩国科技之都：大德研究园区（KAIST、ETRI）所在，「科学之城」。"),
    "gangwon-do":        dict(name="江原道", cap="春川", pop=1540000, g="gangwon",
                          blurb="太白山脉纵贯，雪岳山与平昌冬奥会（2018）场地；韩国的「森林与滑雪之乡」。"),
    "gwangju":           dict(name="光州广域市", cap="—", pop=1440000, g="honam",
                          blurb="湖南圈的中心，1980 年五月民主运动的历史现场，泡菜与文化之都。"),
    "gyeonggi-do":       dict(name="京畿道", cap="水原", pop=13600000, g="capital",
                          blurb="环绕首尔的道，人口约 1360 万——一道的体量抵得上半个韩国；水原华城、坡州与板门店在此。"),
    "gyeongsangbuk-do":  dict(name="庆尚北道", cap="安东", pop=2640000, g="yeongnam",
                          blurb="新罗古都庆州、佛国寺与石窟庵，安东河回村；面积是韩国最大的道。"),
    "gyeongsangnam-do":  dict(name="庆尚南道", cap="昌原", pop=3340000, g="yeongnam",
                          blurb="统营海路、巨济岛与晋州城；造船（巨济三星重工）与机械产业带。"),
    "incheon":           dict(name="仁川广域市", cap="—", pop=2950000, g="capital",
                          blurb="首都圈门户：仁川国际机场与仁川港，1883 年开埠的近代化起点，松岛新城。"),
    "jeju":              dict(name="济州特别自治道", cap="济州市", pop=670000, g="jeju",
                          blurb="汉拿山与火山岩海岸，韩国唯一的特别自治道，免签证的海岛度假地。"),
    "jeollabuk-do":      dict(name="全罗北道", cap="全州", pop=1820000, g="honam",
                          blurb="全州韩屋村与石锅拌饭的故乡，湖南平原粮仓。"),
    "jeollanam-do":      dict(name="全罗南道", cap="务安", pop=1870000, g="honam",
                          blurb="多岛海（1700 多个岛屿）与丽水世博会场地，道厅位于务安。"),
    "sejong":            dict(name="世宗特别自治市", cap="—", pop=360000, g="chung",
                          blurb="2012 年设立的行政首都：多数中央部委已迁入，以世宗大王命名的新城。"),
    "seoul":             dict(name="首尔特别市", cap="—", pop=9590000, g="capital",
                          blurb="首都：约占全国五分之一人口与四分之一 GDP，600 年朝鲜王朝都城，汉江把城市一分为二。"),
    "ulsan":             dict(name="蔚山广域市", cap="—", pop=1120000, g="yeongnam",
                          blurb="现代汽车与造船工业城，韩国人均 GDP 最高的广域市。"),
}

TYPE_ZH = {
    "Teukbyeolsi": "特别市",
    "Gwangyeoksi": "广域市",
    "Do": "道",
    "Metropolitan Autonomous City": "特别自治市",
}


def main():
    dbf1 = read_dbf(os.path.join(BASE, "gadm41_KOR_1.dbf"))
    _, recs1 = read_shp(os.path.join(BASE, "gadm41_KOR_1.shp"))
    fc1 = {"type": "FeatureCollection", "features": []}
    zh_of = {}
    for d, rings in zip(dbf1, recs1):
        key = (d.get("NAME_1") or "").strip().lower()
        geom = build_geojson(rings, eps=0.005)
        if not geom:
            continue
        f = FACTS.get(key)
        if not f:
            print("  [warn] no FACTS for", key)
            f = dict(name=(d.get("NAME_1") or key), cap=None, pop=None, g="capital")
        zh_of[key] = f["name"]
        grp = GROUPS[f["g"]]
        # NL_NAME_1 形如 "부산광역시 | 釜山廣域市"，取竖线后的汉字
        nl = (d.get("NL_NAME_1") or "").strip()
        hanja = nl.split("|")[-1].strip() if "|" in nl else nl
        props = {
            "gid": d.get("GID_1"),
            "name": f["name"],
            "nameEn": d.get("NAME_1"),
            "nameLocal": nl,
            "hanja": hanja,
            "type": TYPE_ZH.get(d.get("ENGTYPE_1"), d.get("ENGTYPE_1")),
            "typeEn": d.get("ENGTYPE_1"),
            "groupZh": grp[0],
            "groupEn": grp[1],
            "capital": f["cap"],
            "pop": f["pop"],
            "area": round(geom_area_km2(geom)),
            "blurb": f.get("blurb"),
        }
        fc1["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    write_geojson(os.path.join(OUT_DIR, "metro.geojson"), fc1)

    # Level 2：229 市 / 郡 / 区
    dbf2 = read_dbf(os.path.join(BASE, "gadm41_KOR_2.dbf"))
    _, recs2 = read_shp(os.path.join(BASE, "gadm41_KOR_2.shp"))
    fc2 = {"type": "FeatureCollection", "features": []}
    for d, rings in zip(dbf2, recs2):
        geom = build_geojson(rings, eps=0.003)
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
    write_geojson(os.path.join(OUT_DIR, "citycounty.geojson"), fc2)

    print("bbox L1:", bbox_of([r for rings in recs1 for r in rings]))


if __name__ == "__main__":
    main()
