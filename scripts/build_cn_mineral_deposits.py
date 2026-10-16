# -*- coding: utf-8 -*-
"""构建《全国矿产分布》互动地图数据（scripts/build_cn_mineral_deposits.py）

输入：D:\\01 资料下载\\【临时】\\全国矿产地图分布（2021版）\\全国矿产地分布_2021版.dbf
     （由同名 .csv 经 ArcGIS XY Table To Point 生成，WGS84，228,189 条记录）
输出：public/maps/cn-kuangchan-2021/data/minerals.json

设计要点：
1. 坐标系：源数据 WGS84；高德底图是 GCJ-02，故**构建期只存 WGS84 整数化坐标**，
   页面运行时再整体转 GCJ-02 配准（与全站其他地图同一口径）。
2. 体积：22.8 万点，逐点属性全部字典化（矿种 / 规模 / 利用现状 / 地质工作程度 /
   矿床成因 / 省 / 市 存索引），坐标按 1e-3 度整数化（≈100 m，点位图足够）。
   名称单独一个数组按索引取，避免每条记录重复写键名。
3. 归属：省 / 市归属在构建期用 shapely 算完（STRtree 加速），前端筛选退化成
   整数比较，不做 22.8 万点 × 复杂边界的射线法，避免卡顿数秒。
"""
import collections
import json
import os
import struct

from shapely.geometry import Point, shape
from shapely.strtree import STRtree
from shapely.validation import make_valid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = r"D:\01 资料下载\【临时】\全国矿产地图分布（2021版）"
DBF = os.path.join(SRC, "全国矿产地分布_2021版.dbf")
PROV_PATH = os.path.join(ROOT, "public", "maps", "_shared", "china-provinces.json")
CITY_PATH = os.path.join(ROOT, "public", "maps", "house-price", "data", "cities-geo.json")
OUT = os.path.join(ROOT, "public", "maps", "cn-kuangchan-2021", "data", "minerals.json")
ENC = "utf-8"

# 中国陆域范围（含南海诸岛），用于剔除源表里经纬度缺失 / 填错的点
CN_BBOX = (73.0, 3.0, 136.0, 54.5)

# ── 矿种大类：顺序即优先级，从上到下第一条命中为准 ──
GROUPS = [
    {"key": "water", "label": "水气矿产", "color": "#38d9a9"},
    {"key": "gem", "label": "宝玉石与观赏石", "color": "#f06595"},
    {"key": "energy", "label": "能源矿产", "color": "#ff922b"},
    {"key": "chem", "label": "化工原料非金属", "color": "#4dabf7"},
    {"key": "flux", "label": "冶金辅助原料", "color": "#20c997"},
    {"key": "ferrous", "label": "黑色金属", "color": "#868e96"},
    {"key": "nonferrous", "label": "有色金属", "color": "#1c7ed6"},
    {"key": "precious", "label": "贵金属", "color": "#fcc419"},
    {"key": "rare", "label": "稀有稀土稀散", "color": "#cc5de8"},
    {"key": "build", "label": "建材与其他非金属", "color": "#a9e34b"},
    {"key": "other", "label": "其他与未标注", "color": "#adb5bd"},
]
GROUP_INDEX = {g["key"]: i for i, g in enumerate(GROUPS)}

# 关键词按大类顺序书写；"金红石""硫铁矿"这类易误判的放在各自真实类别靠前位置
RULES = [
    ("water", ["矿泉水", "地下水", "地下热水", "地热", "温泉", "氦", "二氧化碳气", "水源"]),
    ("gem", ["玛瑙", "宝石", "金刚石", "水晶", "翡翠", "砚石", "观赏石", "彩石", "叶蜡石",
             "鸡血石", "孔雀石", "玉石", "玉髓", "琥珀"]),
    ("energy", ["煤", "石油", "天然气", "油页岩", "页岩气", "铀", "钍", "油砂"]),
    ("chem", ["硫", "磷", "钾", "硼", "重晶石", "芒硝", "岩盐", "湖盐", "井盐", "盐矿",
              "天然碱", "明矾", "砷", "化工用", "泥炭", "碘", "溴", "硝石", "硝"]),
    ("flux", ["萤石", "耐火", "熔剂", "冶金用", "菱镁", "硅石", "铸型", "白云石", "石墨"]),
    ("ferrous", ["磁铁", "赤铁", "褐铁", "菱铁", "钛铁", "铁", "锰", "铬", "钒", "钛",
                 "金红石"]),
    ("nonferrous", ["铜", "铅", "锌", "铝", "镍", "钴", "锡", "钨", "钼", "铋", "汞",
                    "锑", "镁", "多金属"]),
    ("precious", ["砂金", "金", "银", "铂", "钯", "贵金属"]),
    ("rare", ["锂", "铍", "铌", "钽", "锆", "稀土", "锶", "铷", "铯", "镓", "锗", "铟",
              "铊", "铪", "铼", "镉", "硒", "碲", "钪"]),
    ("build", ["水泥", "玻璃", "石膏", "高岭土", "陶瓷土", "膨润土", "滑石", "长石",
               "饰面", "建筑", "石灰岩", "灰岩", "白云岩", "花岗岩", "凝灰岩", "砂岩",
               "页岩", "粘土", "砂", "大理", "片麻", "硅灰石", "珍珠岩", "沸石",
               "方解石", "蛭石", "陶粒", "砖瓦", "板岩", "玄武岩", "安山岩", "辉绿岩",
               "角岩", "石英", "云母", "硅藻土", "凹凸棒石", "海泡石", "橄榄岩",
               "大理岩", "花岗岩", "片岩", "千枚岩", "砾岩", "卵石", "脉石英", "白垩",
               "硅质", "石材", "条痕", "玉石", "膨润"]),
]

SCALE_RULES = [
    ("超大型", ["超大型"]),
    ("特大型", ["特大型"]),
    ("大型", ["大型"]),
    ("中型", ["中型"]),
    ("小型", ["小型"]),
    ("矿化点", ["矿化点"]),
    ("矿点", ["矿点"]),
]
SCALES = ["超大型", "特大型", "大型", "中型", "小型", "矿点", "矿化点", "未标注"]
SCALE_INDEX = {s: i for i, s in enumerate(SCALES)}

USE_RULES = [
    ("正在开采", ["生产", "开采", "基建", "在建", "建设", "已利用", "边探边采"]),
    ("停采停产", ["停采", "停产", "停建"]),
    ("闭坑关闭", ["闭坑", "关闭", "采空区", "闭矿"]),
    ("尚未利用", ["未利用", "难以利用", "计划近期利用", "推荐近期利用", "不宜",
                  "可供进一步工作", "暂不"]),
]
USES = ["正在开采", "停采停产", "闭坑关闭", "尚未利用", "未标注"]
USE_INDEX = {u: i for i, u in enumerate(USES)}

GEO_RULES = [
    ("勘探", ["勘探", "详勘", "精查", "勘查"]),
    ("详查", ["详查", "初勘"]),
    ("普查", ["普查", "初查"]),
    ("预查", ["预查", "概查", "煤田预测", "预测"]),
    ("调查与其他", ["调查", "检查", "检测", "简测", "补勘", "踏勘", "评价"]),
]
GEOS = ["勘探", "详查", "普查", "预查", "调查与其他", "未标注"]
GEO_INDEX = {g: i for i, g in enumerate(GEOS)}

GEN_RULES = [
    ("岩浆与火山作用", ["岩浆", "火山", "侵入", "超基性", "基性岩", "伟晶"]),
    ("热液与接触交代", ["热液", "接触交代", "矽卡岩", "气成", "蚀变", "斑岩", "脉状"]),
    ("沉积作用", ["沉积", "蒸发", "生物", "化学", "结核", "淋积"]),
    ("变质作用", ["变质", "区域变质", "接触变质", "热变质", "混合岩"]),
    ("风化作用", ["风化", "残积", "风化壳"]),
    ("砂矿与冲积", ["砂矿", "冲积", "残坡积", "洪积", "海滨", "滨海", "河流"]),
]
GENS = ["岩浆与火山作用", "热液与接触交代", "沉积作用", "变质作用", "风化作用",
        "砂矿与冲积", "其他与未标注"]
GEN_INDEX = {g: i for i, g in enumerate(GENS)}


def norm_kind(raw):
    """矿种归一：去空白、去括号注释（如『萤石（普通）』→『萤石』）。"""
    s = (raw or "").strip()
    if not s:
        return "未标注"
    for ch in "（(【[":
        p = s.find(ch)
        if p > 0:
            s = s[:p].strip()
    s = s.replace("矿床", "").strip()
    return s or "未标注"


def classify(kind):
    for key, kws in RULES:
        for kw in kws:
            if kw in kind:
                return GROUP_INDEX[key]
    return GROUP_INDEX["other"]


def pick(value, rules, fallback):
    v = (value or "").strip()
    if not v:
        return fallback
    for name, kws in rules:
        for kw in kws:
            if kw in v:
                return name
    return fallback


def read_dbf(path):
    """流式读取 DBF（228,189 条 × 1837 B），返回 (记录数, 生成器)。"""
    f = open(path, "rb")
    head = f.read(32)
    nrec = struct.unpack("<I", head[4:8])[0]
    hlen = struct.unpack("<H", head[8:10])[0]
    rlen = struct.unpack("<H", head[10:12])[0]
    fields = []
    while True:
        d = f.read(32)
        if not d or d[0:1] == b"\r":
            break
        fields.append((chr(d[11]), d[16]))
    f.seek(hlen)

    def it():
        for _ in range(nrec):
            raw = f.read(rlen)
            if not raw or raw[0:1] == b"\x1a":
                break
            pos = 1
            vals = []
            for _ft, fl in fields:
                vals.append(raw[pos:pos + fl].decode(ENC, "replace").strip())
                pos += fl
            yield vals
    return nrec, it()


def load_regions(path):
    gj = json.load(open(path, encoding="utf-8"))
    items = []
    for f in gj["features"]:
        props = f.get("properties") or {}
        if not props.get("name"):
            continue
        g = f.get("geometry")
        if not g:
            continue
        s = shape(g)
        if not s.is_valid:
            s = make_valid(s)
        items.append({
            "adcode": str(props.get("adcode")),
            "name": props.get("name"),
            "center": props.get("center") or props.get("centroid"),
            "geom": s,
        })
    return items


def main():
    nrec, rows = read_dbf(DBF)
    provinces = load_regions(PROV_PATH)
    cities = load_regions(CITY_PATH)
    prov_tree = STRtree([p["geom"] for p in provinces])
    city_tree = STRtree([c["geom"] for c in cities])
    city_parent = {c["adcode"]: c["adcode"][:2] + "0000" for c in cities}
    prov_pos = {p["adcode"]: i for i, p in enumerate(provinces)}

    names = []
    names_index = {}
    pts = []
    kept = 0
    dropped = 0
    prov_total = collections.Counter()
    prov_big = collections.Counter()
    prov_kind = collections.defaultdict(collections.Counter)
    city_total = collections.Counter()
    city_big = collections.Counter()
    city_kind = collections.defaultdict(collections.Counter)
    scale_count = collections.Counter()
    use_count = collections.Counter()
    geo_count = collections.Counter()
    gen_count = collections.Counter()

    def name_id(name):
        i = names_index.get(name)
        if i is None:
            i = len(names)
            names_index[name] = i
            names.append(name)
        return i

    for vals in rows:
        try:
            lon = float(vals[3])
            lat = float(vals[4])
        except ValueError:
            dropped += 1
            continue
        if not (CN_BBOX[0] <= lon <= CN_BBOX[2] and CN_BBOX[1] <= lat <= CN_BBOX[3]):
            dropped += 1
            continue

        raw_kinds = (vals[9] or "").replace("，", "、").replace(";", "、").replace("/", "、")
        ks = []
        for part in raw_kinds.split("、"):
            k = norm_kind(part)
            if k == "未标注" or k in ks:
                continue
            ks.append(k)
        if not ks:
            ks = ["未标注"]
        kis = []
        for k in ks:
            ki = KIND_ID.get(k)
            if ki is None:
                ki = len(KINDS)
                KIND_ID[k] = ki
                KINDS.append({"t": k, "g": classify(k)})
            kis.append(ki)
            KINDS[ki]["n"] = KINDS[ki].get("n", 0) + 1

        sc = pick(vals[10], SCALE_RULES, "未标注")
        us = pick(vals[6], USE_RULES, "未标注")
        ge = pick(vals[7], GEO_RULES, "未标注")
        gn = pick(vals[8], GEN_RULES, "其他与未标注")
        scale_count[sc] += 1
        use_count[us] += 1
        geo_count[ge] += 1
        gen_count[gn] += 1

        pt = Point(lon, lat)
        pi = -1
        for gi in prov_tree.query(pt):
            if provinces[gi]["geom"].contains(pt):
                pi = int(gi)
                break
        ci = -1
        for gi2 in city_tree.query(pt):
            if cities[gi2]["geom"].contains(pt):
                ci = int(gi2)
                break
        if pi >= 0:
            prov_total[pi] += 1
            prov_kind[pi][kis[0]] += 1
            if sc in ("超大型", "特大型", "大型"):
                prov_big[pi] += 1
        if ci >= 0:
            city_total[ci] += 1
            city_kind[ci][kis[0]] += 1
            if sc in ("超大型", "特大型", "大型"):
                city_big[ci] += 1

        # 名称索引（重名共用一条，压缩体积）
        ni = name_id(vals[2] or "")

        # 主矿种索引 + 最多 2 个伴生矿种（-1 表示无）
        k0 = kis[0]
        k1 = kis[1] if len(kis) > 1 else -1
        k2 = kis[2] if len(kis) > 2 else -1
        pts.append([
            int(round(lon * 1000)),
            int(round(lat * 1000)),
            k0, k1, k2,
            SCALE_INDEX[sc],
            USE_INDEX[us],
            GEO_INDEX[ge],
            GEN_INDEX[gn],
            pi, ci, ni,
        ])
        kept += 1

    print("records", nrec, "kept", kept, "dropped", dropped, "unique names", len(names))
    print("kinds", len(KINDS))
    top = sorted(KINDS, key=lambda x: -x.get("n", 0))[:25]
    for k in top:
        print("   ", k["t"], k["n"], GROUPS[k["g"]]["label"])
    print("--- scales")
    for s in SCALES:
        print("   ", s, scale_count[s])
    print("--- uses")
    for u in USES:
        print("   ", u, use_count[u])
    print("--- geos")
    for g in GEOS:
        print("   ", g, geo_count[g])
    print("--- gens")
    for g in GENS:
        print("   ", g, gen_count[g])

    # 注意：prov_out / city_out 输出前按矿产地数量降序排序，而 pts 里的省市索引是
    # **排序前**的下标。若不重映射，前端 p[9] 会指向排序后同一下标的另一个省
    # （典型症状：点排行榜第一条贵州，实际筛出北京市）。故排序后统一回写索引。
    prov_out = []
    for i, p in enumerate(provinces):
        gcount = prov_kind.get(i, collections.Counter())
        topk = [KINDS[ki]["t"] for ki, _c in gcount.most_common(3)]
        prov_out.append({
            "a": p["adcode"],
            "n": p["name"],
            "c": [round(p["center"][0], 4), round(p["center"][1], 4)] if p["center"] else None,
            "t": prov_total[i],
            "b": prov_big[i],
            "k": topk,
            "_i": i,
        })
    prov_out.sort(key=lambda x: -x["t"])
    prov_remap = {}
    for new_i, p in enumerate(prov_out):
        prov_remap[p.pop("_i")] = new_i

    city_out = []
    for i, c in enumerate(cities):
        if city_total[i] <= 0:
            continue
        gcount = city_kind.get(i, collections.Counter())
        topk = [KINDS[ki]["t"] for ki, _c in gcount.most_common(3)]
        city_out.append({
            "a": c["adcode"],
            "n": c["name"],
            "p": city_parent[c["adcode"]],
            "t": city_total[i],
            "b": city_big[i],
            "k": topk,
            "_i": i,
        })
    city_out.sort(key=lambda x: -x["t"])
    city_remap = {}
    for new_i, c in enumerate(city_out):
        city_remap[c.pop("_i")] = new_i

    # 回写点位上的省市索引，使其指向排序后的数组下标
    for pt in pts:
        if pt[9] >= 0:
            pt[9] = prov_remap.get(pt[9], -1)
        if pt[10] >= 0:
            pt[10] = city_remap.get(pt[10], -1)
    print("--- province top 12")
    for p in prov_out[:12]:
        print("   ", p["n"], p["t"], "大型及以上", p["b"], "/".join(p["k"]))
    print("--- city top 10")
    for c in city_out[:10]:
        print("   ", c["n"], c["t"], "大型及以上", c["b"], "/".join(c["k"]))
    print("--- province tail 6")
    for p in prov_out[-6:]:
        print("   ", p["n"], p["t"])

    group_count = collections.Counter()
    for k in KINDS:
        group_count[k["g"]] += k.get("n", 0)
    groups_out = []
    for i, g in enumerate(GROUPS):
        groups_out.append({"key": g["key"], "label": g["label"], "color": g["color"], "n": group_count[i]})
    print("--- groups")
    for g in groups_out:
        print("   ", g["label"], g["n"])

    # 自检：按回写后的索引重算各省计数，必须与 prov_out[i].t 完全一致
    chk_prov = [0] * len(prov_out)
    chk_city = [0] * len(city_out)
    for pt in pts:
        if pt[9] >= 0:
            chk_prov[pt[9]] += 1
        if pt[10] >= 0:
            chk_city[pt[10]] += 1
    bad = [prov_out[i]["n"] for i in range(len(prov_out)) if chk_prov[i] != prov_out[i]["t"]]
    badc = [city_out[i]["n"] for i in range(len(city_out)) if chk_city[i] != city_out[i]["t"]]
    print("--- 索引回写自检：省级不一致", bad, "市级不一致", badc)
    assert not bad and not badc, "省市索引回写失败"

    payload = {
        "meta": {
            "title": "全国矿产地分布（2021版）",
            "source": "公开版《全国矿产地分布（2021版）》矿产地名录表（CSV → ArcGIS XY Table To Point）",
            "crs": "WGS84 / EPSG:4326",
            "precision": "坐标按 0.001° 整数化（≈100 m）",
            "updated": "2026-10-17",
            "total": kept,
            "kinds": len(KINDS),
        },
        "groups": groups_out,
        "kinds": [{"t": k["t"], "g": k["g"], "n": k.get("n", 0)} for k in KINDS],
        "scales": [{"t": s, "n": scale_count[s]} for s in SCALES],
        "uses": [{"t": u, "n": use_count[u]} for u in USES],
        "geos": [{"t": g, "n": geo_count[g]} for g in GEOS],
        "gens": [{"t": g, "n": gen_count[g]} for g in GENS],
        "provinces": prov_out,
        "cities": city_out,
        "names": names,
        "pts": pts,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    print("wrote", OUT, os.path.getsize(OUT) / 1024 / 1024, "MB")


KINDS = []
KIND_ID = {}

if __name__ == "__main__":
    main()
