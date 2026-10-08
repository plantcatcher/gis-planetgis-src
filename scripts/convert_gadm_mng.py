# -*- coding: utf-8 -*-
"""
GADM 4.1 MNG → GeoJSON 转换器（纯 Python，无第三方依赖）
- 输出 public/maps/mng-regions/data/{aimags,sums}.geojson
- 主层 = 22 个省市级（21 省 Aimag + 首都乌兰巴托 + 3 市，GADM 口径 22 要素，Level 1）
- 叠加层 = 327 个苏木（Sum，Level 2）
- 面积球面实算；人口为 2022 前后估计（约值，人工整理）；NL_NAME_2 自带西里尔原名
- 分组 = 西部山区 / 杭爱·中部 / 戈壁地带 / 东部草原

用法：python scripts/convert_gadm_mng.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from gadm_shp import read_dbf, read_shp, build_geojson, geom_area_km2, bbox_of, write_geojson

BASE = "C:/Users/ZhuanZ/Downloads/gadm41_MNG_shp"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public/maps/mng-regions/data")

GROUPS = {
    "west":   ("西部山区", "Western Mongolia"),
    "khangai":("杭爱 · 中部", "Khangai & Central"),
    "gobi":   ("戈壁地带", "Gobi"),
    "east":   ("东部草原", "Eastern Steppe"),
}

FACTS = {
    "arhangay":     dict(name="后杭爱省", cap="车车尔勒格", pop=95000, g="khangai",
                     blurb="杭爱山腹地：腾格里火山湖（白湖）与温泉群，蒙古的「小瑞士」。"),
    "bayan-ölgiy":  dict(name="巴彦乌列盖省", cap="乌列盖", pop=110000, g="west",
                     blurb="蒙古唯一以哈萨克族为主的省：金鹰狩猎传统与蒙赫海尔汗雪山。"),
    "bayanhongor":  dict(name="巴彦洪戈尔省", cap="巴彦洪戈尔", pop=100000, g="khangai",
                     blurb="从杭爱雪峰一路降到戈壁：一省跨四种自然带，恐龙化石点布满南山。"),
    "bulgan":       dict(name="布尔干省", cap="布尔干", pop=62000, g="khangai",
                     blurb="杭爱北麓的农牧过渡带，额尔登特铜矿的北部门户。"),
    "darhan-uul":   dict(name="达尔汗乌拉省", cap="达尔汗", pop=105000, g="khangai",
                     blurb="1994 年才设的年轻省：达尔汗是蒙古第二工业城市（钢铁与水泥）。"),
    "dornod":       dict(name="东方省", cap="乔巴山", pop=84000, g="east",
                     blurb="蒙古最东端：诺门罕战役（1939）战场，呼伦湖盆地与真正的欧亚大草原腹地。"),
    "dornogovi":    dict(name="东戈壁省", cap="赛音山达", pop=63000, g="gobi",
                     blurb="「戈壁之门」：扎门乌德口岸对中国二连浩特，恐龙化石（偷蛋龙巢）最初发现地。"),
    "dundgovi":     dict(name="中戈壁省", cap="阿拉坦布拉格", pop=49000, g="gobi",
                     blurb="察哈尔戈壁的岩画与骆驼群，蒙古地理中心附近的大戈壁省份。"),
    "dzavhan":      dict(name="扎布汗省", cap="乌利亚苏台", pop=67000, g="west",
                     blurb="杭爱山与大湖盆地之间，乌利亚苏台是清代乌里雅苏台将军驻地故地。"),
    "govi-altay":   dict(name="戈壁阿尔泰省", cap="阿尔泰", pop=56000, g="gobi",
                     blurb="阿尔泰山脉南端与戈壁相接：大峡谷（Yolyn Am 级别）与野骆驼保护区。"),
    "govisümber":   dict(name="戈壁苏木贝尔省", cap="乔伊尔", pop=16000, g="gobi",
                     blurb="蒙古人口最少的省（约 1.6 万），乔伊尔是乌兰巴托—赛音山达铁路的中途能源镇。"),
    "hentiy":       dict(name="肯特省", cap="温都尔汗", pop=84000, g="east",
                     blurb="成吉思汗的出生地布尔罕和乐敦（不儿罕山），克鲁伦河与鄂嫩河的源头。"),
    "hovd":         dict(name="科布多省", cap="科布多", pop=87000, g="west",
                     blurb="阿尔泰四族杂居（哈萨克/杜尔伯特等），科布多城是清代西路军政中心故地。"),
    "hövsgöl":      dict(name="库苏古尔省", cap="木伦", pop=132000, g="khangai",
                     blurb="库苏古尔湖：蒙古最大的淡水湖（蓄水量约占全球淡水 0.4%），与贝加尔湖同源。"),
    "ömnögovi":     dict(name="南戈壁省", cap="达兰扎达嘎德", pop=66000, g="gobi",
                     blurb="蒙古经济的发动机：塔温陶勒盖煤矿与奥尤陶勒盖铜矿都在此，戈壁上的巨型矿区。"),
    "orhon":        dict(name="鄂尔浑省", cap="额尔登特", pop=110000, g="khangai",
                     blurb="围绕额尔登特铜钼矿设市立省，是蒙古最大的工业城市。"),
    "övörhangay":   dict(name="前杭爱省", cap="阿尔拜赫雷", pop=62000, g="khangai",
                     blurb="哈拉和林：成吉思汗帝国的故都（1220），鄂尔浑峡谷文化景观是世界遗产。"),
    "selenge":      dict(name="色楞格省", cap="苏赫巴托", pop=104000, g="khangai",
                     blurb="色楞格河谷是蒙古最肥沃的农区，铁路经苏赫巴托直通俄罗斯纳乌什基。"),
    "sühbaatar":    dict(name="苏赫巴托省", cap="西乌尔特", pop=62000, g="east",
                     blurb="以革命领袖苏赫巴托命名的东部省份，典型草原牧区。"),
    "töv":          dict(name="中央省", cap="宗莫德", pop=100000, g="khangai",
                     blurb="环绕乌兰巴托的省：成吉思汗骑马雕像与特日勒吉国家公园在此。"),
    "ulaanbaatar":  dict(name="乌兰巴托市", cap="—", pop=1660000, g="khangai",
                     blurb="首都：全国一半人口（约 166 万）挤在图勒河谷，世界上最冷的国都（冬季 -30°C）。"),
    "uvs":          dict(name="乌布苏省", cap="乌兰固木", pop=84000, g="west",
                     blurb="乌布苏盆地（世界遗产）与蒙古最高点乃拉姆达勒峰（4374 m）均在边界一带。"),
}

TYPE_ZH = {"Aimag": "省", "Hot": "市"}


def main():
    dbf1 = read_dbf(os.path.join(BASE, "gadm41_MNG_1.dbf"))
    _, recs1 = read_shp(os.path.join(BASE, "gadm41_MNG_1.shp"))
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
            f = dict(name=(d.get("NAME_1") or key), cap=None, pop=None, g="khangai")
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
    write_geojson(os.path.join(OUT_DIR, "aimags.geojson"), fc1)

    # Level 2：327 苏木
    dbf2 = read_dbf(os.path.join(BASE, "gadm41_MNG_2.dbf"))
    _, recs2 = read_shp(os.path.join(BASE, "gadm41_MNG_2.shp"))
    fc2 = {"type": "FeatureCollection", "features": []}
    for d, rings in zip(dbf2, recs2):
        geom = build_geojson(rings, eps=0.005)
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
            "local": (d.get("NL_NAME_2") or "") if (d.get("NL_NAME_2") or "") != "NA" else "",
        }
        fc2["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    write_geojson(os.path.join(OUT_DIR, "sums.geojson"), fc2)

    print("bbox L1:", bbox_of([r for rings in recs1 for r in rings]))


if __name__ == "__main__":
    main()
