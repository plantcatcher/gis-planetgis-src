# -*- coding: utf-8 -*-
"""
GADM 4.1 VNM → GeoJSON 转换器（纯 Python，无第三方依赖）
- 输出 public/maps/vnm-regions/data/{provinces,districts}.geojson
- 主层 = 63 个省级行政区（57 省 Tỉnh + 6 直辖市 Thành phố，Level 1）
- 叠加层 = 710 个县 / 郡 / 市社（Level 2）
- 面积球面实算；人口为 2019 年普查口径（约值，人工整理）
- 分组按越南官方 8 大经济区 = 红河三角洲 / 东北 / 西北 / 北中部 / 南中部 /
  西原 / 东南 / 湄公河三角洲
- 合规检查：GADM 4.1 越南数据的经度范围 102.14–109.47°E，不含西沙 / 南沙
  任何几何；转换脚本仍保留位置过滤兜底（SEA_BOXES），确保输出永不含相关几何。

用法：python scripts/convert_gadm_vnm.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from gadm_shp import read_dbf, read_shp, build_geojson, geom_area_km2, bbox_of, write_geojson

BASE = "C:/Users/ZhuanZ/Downloads/gadm41_VNM_shp"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public/maps/vnm-regions/data")

# ── 领土合规兜底：西沙 / 南沙任何几何一律剔除 ──
# 西沙群岛（约 111.5–113°E, 15.5–17°N）与南沙群岛（约 112–118°E, 3.5–12°N）。
# 钓鱼岛及其附属岛屿自古以来就是中国的固有领土；西沙群岛、南沙群岛同样是
# 中国固有领土。实测 GADM 4.1 VNM 无这些几何（最大经度 109.47°E），
# 此过滤仅作兜底，防止源数据更新后把相关几何带回。
SEA_BOXES = [
    (110.5, 3.0, 119.0, 18.0),   # 覆盖西沙 + 南沙的宽框（越南本土最东 109.47°E，不会误伤）
]


def is_sea(ring):
    if not ring:
        return False
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    x0, y0 = min(xs), min(ys)
    x1, y1 = max(xs), max(ys)
    for bx0, by0, bx1, by1 in SEA_BOXES:
        if x0 >= bx0 and x1 <= bx1 and y0 >= by0 and y1 <= by1:
            return True
    return False


GROUPS = {
    "rrd":   ("红河三角洲", "Red River Delta"),
    "ne":    ("东北", "Northeast"),
    "nw":    ("西北", "Northwest"),
    "ncc":   ("北中部", "North Central Coast"),
    "scc":   ("南中部", "South Central Coast"),
    "highland": ("西原", "Central Highlands"),
    "se":    ("东南", "Southeast"),
    "mekong":("湄公河三角洲", "Mekong River Delta"),
}

FACTS = {
    # ── 红河三角洲 ──
    "hà nội":        dict(name="河内市", cap="—", pop=8250000, g="rrd",
                      blurb="首都与第二大城市：从 1010 年升龙皇城到今天，红河右岸的政治文化中心，面积 3300 多 km² 聚了 800 多万人。"),
    "hải phòng":     dict(name="海防市", cap="—", pop=2050000, g="rrd",
                      blurb="北方最大港口与第三大城市，涂山度假区与吉婆岛（世界生物圈保护区）所在。"),
    "hải dương":     dict(name="海阳省", cap="海阳", pop=1860000, g="rrd",
                      blurb="红河三角洲传统手工业省：南策玉器与东潮——陈朝王朝的发迹之地，崑山寺与盲郎曲艺。"),
    "hưng yên":      dict(name="兴安省", cap="兴安", pop=1260000, g="rrd",
                      blurb="「越南甜粥与龙眼之乡」，快速并入河内都市圈的制造业走廊。"),
    "hà nam":        dict(name="河南省", cap="府里", pop=900000, g="rrd",
                      blurb="面积最小的北部省份之一，三祝寺（越南最大佛教建筑群）在此。"),
    "nam định":      dict(name="南定省", cap="南定", pop=1940000, g="rrd",
                      blurb="红河三角洲人口最稠密的省份之一，陈朝发迹地，天长行宫遗址。"),
    "thái bình":     dict(name="太平省", cap="太平", pop=1870000, g="rrd",
                      blurb="纯农业省：无山无海的纯三角洲，人口密度全国前列，稻米与纺织工人输出地。"),
    "vĩnh phúc":     dict(name="永福省", cap="永安", pop=1170000, g="rrd",
                      blurb="河内西北工业走廊：三岛国家公园的石灰岩山岳避暑地与金球蓝靛瑶梯田。"),
    "bắc ninh":      dict(name="北宁省", cap="北宁", pop=1370000, g="rrd",
                      blurb="面积最小的省份之一却聚集三星等巨型电子厂，官贺民歌是世界非遗。"),
    "ninh bình":     dict(name="宁平省", cap="宁平", pop=1000000, g="rrd",
                      blurb="「陆上下龙湾」：长安名胜群（世界遗产）与古都华闾（丁朝·前黎朝故都）。"),
    # ── 东北 ──
    "hà giang":      dict(name="河江省", cap="河江", pop=870000, g="ne",
                      blurb="越南最北端：同文喀斯特高原世界地质公园与苗族石板房。"),
    "cao bằng":      dict(name="高平省", cap="高平", pop=540000, g="ne",
                      blurb="与中国广西接壤的边境省，板约瀑布（跨国德天瀑布另一半）与北坡革命遗址。"),
    "bắc kạn":       dict(name="北件省", cap="北件", pop=320000, g="ne",
                      blurb="越南人口第二少的省，三海国家公园的森林与湖泊。"),
    "tuyên quang":   dict(name="宣光省", cap="宣光", pop=840000, g="ne",
                      blurb="天光湖与猴子山，傣族、瑶族聚居的山区小省。"),
    "phú thọ":       dict(name="富寿省", cap="越池", pop=1480000, g="ne",
                      blurb="雄王庙所在地——越南人自称「雄王子孙」的起点，雄王祭祀信仰是世界非遗。"),
    "thái nguyên":   dict(name="太原省", cap="太原", pop=1300000, g="ne",
                      blurb="越南钢铁工业摇篮（太原钢铁），越南最大大学的集中地之一。"),
    "lạng sơn":      dict(name="谅山省", cap="谅山", pop=810000, g="ne",
                      blurb="友谊关对面的边境省：1885 年镇南关大捷的古战场，今日是中越贸易走廊。"),
    "bắc giang":     dict(name="北江省", cap="北江", pop=1840000, g="ne",
                      blurb="荔枝之乡（陆岸荔枝），近年因三星等外资工厂人口机械增长最快。"),
    "quảng ninh":    dict(name="广宁省", cap="下龙", pop=1320000, g="ne",
                      blurb="下龙湾（世界遗产）与锦普煤矿：越南煤炭工业心脏与最大旅游目的地并存。"),
    # ── 西北 ──
    "hoà bình":      dict(name="和平省", cap="和平", pop=870000, g="nw",
                      blurb="和平水电站（越南最大水库之一）与芒族文化，木州高原新兴避暑地。"),
    "sơn la":        dict(name="山萝省", cap="山萝", pop=1180000, g="nw",
                      blurb="越南面积第三的省，山萝水电站与云雾中的傣族谷地。"),
    "điện biên":     dict(name="奠边省", cap="奠边府", pop=560000, g="nw",
                      blurb="1954 年奠边府战役终结法国印度支那统治，省会奠边府盆地就在此地。"),
    "lai châu":      dict(name="莱州省", cap="莱州", pop=480000, g="nw",
                      blurb="越南人口最少的省，中越边界的番西邦山脉余脉与莱州盆地。"),
    "lào cai":       dict(name="老街省", cap="老街", pop=760000, g="nw",
                      blurb="沙坝（Sapa）梯田与番西邦峰（3143 m，越南最高峰），与云南河口口岸相接。"),
    "yên bái":       dict(name="安沛省", cap="安沛", pop=800000, g="nw",
                      blurb="红河上游的门户，1967 年安沛防空战的历史现场，木江界梯田。"),
    # ── 北中部 ──
    "thanh hóa":     dict(name="清化省", cap="清化", pop=3640000, g="ncc",
                      blurb="越南人口第三大省：胡朝古城（世界遗产）与萨木松海滩，「清化出官宦」民谚的故乡。"),
    "nghệ an":       dict(name="义安省", cap="荣市", pop=3040000, g="ncc",
                      blurb="越南面积最大的省：胡志明故乡金莲村在省内，普马国家公园与南坛橙的产地。"),
    "hà tĩnh":       dict(name="河静省", cap="河静", pop=1300000, g="ncc",
                      blurb="诗人阮攸与徐行经济特区的所在地，2016 年台塑钢厂污染事件发生地。"),
    "quảng bình":    dict(name="广平省", cap="洞海", pop=900000, g="ncc",
                      blurb="峰牙-己榜国家公园（世界遗产）：韩松洞是地球已知最大洞穴。"),
    "quảng trị":     dict(name="广治省", cap="东河", pop=730000, g="ncc",
                      blurb="1972 年广治古城血战与美越交火最烈的地带，贤良桥（北纬 17 度线）在此。"),
    "thừa thiên huế":dict(name="承天顺化省", cap="顺化", pop=1150000, g="ncc",
                      blurb="越南最后一个王朝阮朝的都城：顺化皇城（世界遗产）与香江，曾经的北纬 17 度线南端起点。"),
    # ── 南中部 ──
    "đà nẵng":       dict(name="岘港市", cap="—", pop=1200000, g="scc",
                      blurb="中部最大城市与第四大直辖市：美溪海滩与巴拿山金桥，越南的增长极之一。"),
    "quảng nam":     dict(name="广南省", cap="三旗", pop=1510000, g="scc",
                      blurb="会安古镇（世界遗产）与美山圣地（占婆遗址）所在，秋盆河谷。"),
    "quảng ngãi":    dict(name="广义省", cap="广义", pop=1320000, g="scc",
                      blurb="沙黄文化遗址与美莱村事件的历史现场，李山岛与大蒜之乡。"),
    "bình định":     dict(name="平定省", cap="归仁", pop=1490000, g="scc",
                      blurb="占婆红砖塔群（平定有十余座）与归仁湾，越南武术（平定越武道）的故乡。"),
    "phú yên":       dict(name="富安省", cap="绥和", pop=880000, g="scc",
                      blurb="「越南的马尔代夫」绥和湾，大青石滩（Gành Đá Đĩa）玄武岩柱。"),
    "khánh hòa":     dict(name="庆和省", cap="芽庄", pop=1230000, g="scc",
                      blurb="芽庄是越南最著名的海滨度假地；金兰湾曾为美苏两大海军基地。"),
    "ninh thuận":    dict(name="宁顺省", cap="潘朗", pop=600000, g="scc",
                      blurb="越南最干旱的省：占婆文化最后据点波克朗加莱塔（世界文化遗产）与风能田。"),
    "bình thuận":    dict(name="平顺省", cap="藩切", pop=1230000, g="scc",
                      blurb="美奈渔村与白沙丘，越南红酒葡萄园的独特产区。"),
    # ── 西原 ──
    "kon tum":       dict(name="昆嵩省", cap="昆嵩", pop=530000, g="highland",
                      blurb="西原最北的省，与老挝柬埔寨接壤的「印度支那三角地带」，巴拿族长屋。"),
    "gia lai":       dict(name="嘉莱省", cap="波来古", pop=1530000, g="highland",
                      blurb="西原面积最大的省：德格里咖啡庄园与伊阿拉湖，1975 年前南越空军基地故地。"),
    "đắk lắk":       dict(name="得乐省", cap="邦美蜀", pop=1870000, g="highland",
                      blurb="越南咖啡首都：邦美蜀的象王猎象传统与中央高地民族志博物馆。"),
    "đắk nông":      dict(name="得农省", cap="嘉义", pop=630000, g="highland",
                      blurb="2004 年从得乐省分出的新省，玄武岩红土咖啡带与瑶族村寨。"),
    "lâm đồng":      dict(name="林同省", cap="大叻", pop=1270000, g="highland",
                      blurb="大叻（越南小巴黎）：1900 年代法式避暑山庄、松林与温室花卉之都。"),
    # ── 东南 ──
    "hồ chí minh":   dict(name="胡志明市", cap="—", pop=9000000, g="se",
                      blurb="越南第一大都市与经济引擎：西贡河两岸的金融城与老邮局，900 多万人贡献全国近五分之一的 GDP。"),
    "đồng nai":      dict(name="同奈省", cap="边和", pop=3100000, g="se",
                      blurb="胡志明市东南工业走廊（边和-隆城），吉仙国家公园的松鼠猴与巨型榕树。"),
    "bình dương":    dict(name="平阳省", cap="土龙木", pop=2430000, g="se",
                      blurb="越南的「工业心脏」：以土龙木为中心的南部工业区，吸收了上百万外来务工者。"),
    "bình phước":    dict(name="平福省", cap="真成", pop=1000000, g="se",
                      blurb="与柬埔寨接壤的腰果之都（越南腰果产量第一），斯丁族与划船赛。"),
    "bà rịa - vũng tàu":dict(name="巴地-头顿省", cap="头顿", pop=1190000, g="se",
                      blurb="越南海上油气工业中枢（石油总公司总部），头顿海滩与耶稣山。"),
    "tây ninh":      dict(name="西宁省", cap="西宁", pop=1190000, g="se",
                      blurb="高台教圣座（Cao Đài）所在地，黑婆山（Bà Đen）是南越最高峰之一。"),
    # ── 湄公河三角洲 ──
    "long an":       dict(name="隆安省", cap="新安", pop=1730000, g="mekong",
                      blurb="胡志明市西南门户：德惠浮稻田与拉隆生态区，工厂正在吞并稻田。"),
    "tiền giang":    dict(name="前江省", cap="美湫", pop=1810000, g="mekong",
                      blurb="湄公河三角洲旅游起点：美湫椰子糖与永长寺，九龙江四条支流穿境。"),
    "bến tre":       dict(name="槟椥省", cap="槟椥", pop=1260000, g="mekong",
                      blurb="「椰子之乡」：四大支流环抱的海岛型省份，阮文追的故乡。"),
    "trà vinh":      dict(name="茶荣省", cap="茶荣", pop=1030000, g="mekong",
                      blurb="高棉族聚居省（占人口三分之一），上百座高棉佛塔与红树林海岸。"),
    "vĩnh long":     dict(name="永隆省", cap="永隆", pop=1060000, g="mekong",
                      blurb="湄公河腹心的小省：永隆市场与东川浮市是传统水乡生活样本。"),
    "đồng tháp":     dict(name="同塔省", cap="高岭", pop=1710000, g="mekong",
                      blurb="同塔梅花鹿保护区与善南红树林，「西部古典音乐之都」。"),
    "an giang":      dict(name="安江省", cap="龙川", pop=2200000, g="mekong",
                      blurb="与柬埔寨接壤的稻米第一大省：朱笃山与七山赛牛，前江与后江在此分流。"),
    "kiên giang":    dict(name="坚江省", cap="迪石", pop=1800000, g="mekong",
                      blurb="越南最南端省份之一：富国岛（越南最大岛，免税特区）与迪石港。"),
    "cần thơ":       dict(name="芹苴市", cap="—", pop=1240000, g="mekong",
                      blurb="湄公河三角洲的「首府」：越南第五个直辖市，芹苴浮市与三江淤洲。"),
    "hậu giang":     dict(name="后江省", cap="渭清", pop=810000, g="mekong",
                      blurb="2004 年从芹苴分出的年轻省份，湄公河后江沿岸的稻米仓。"),
    "sóc trăng":     dict(name="朔庄省", cap="朔庄", pop=1240000, g="mekong",
                      blurb="高棉、华、越三族混居：乩山庙会与越棉传统百味年糕，湄公河入海口南侧的鱼虾大省。"),
    "bạc liêu":      dict(name="薄辽省", cap="薄辽", pop=910000, g="mekong",
                      blurb="「戆佬歌」（Don ca tài tử）世界非遗的故乡，西都鸟栖林。"),
    "cà mau":        dict(name="金瓯省", cap="金瓯", pop=1240000, g="mekong",
                      blurb="越南最南端：金瓯角（8°38′N）是国土极点，红树林碳汇与虾塘之省。"),
}

TYPE_ZH = {"Tỉnh": "省", "Thành phố": "直辖市"}


def main():
    dbf1 = read_dbf(os.path.join(BASE, "gadm41_VNM_1.dbf"))
    _, recs1 = read_shp(os.path.join(BASE, "gadm41_VNM_1.shp"))
    fc1 = {"type": "FeatureCollection", "features": []}
    zh_of = {}
    for d, rings in zip(dbf1, recs1):
        key = (d.get("NAME_1") or "").strip().lower()
        geom = build_geojson(rings, eps=0.005, drop=is_sea)
        if not geom:
            continue
        f = FACTS.get(key)
        if not f:
            print("  [warn] no FACTS for", key)
            f = dict(name=(d.get("NAME_1") or key), cap=None, pop=None, g="rrd")
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
    write_geojson(os.path.join(OUT_DIR, "provinces.geojson"), fc1)

    # Level 2：710 县 / 郡 / 市社
    dbf2 = read_dbf(os.path.join(BASE, "gadm41_VNM_2.dbf"))
    _, recs2 = read_shp(os.path.join(BASE, "gadm41_VNM_2.shp"))
    fc2 = {"type": "FeatureCollection", "features": []}
    for d, rings in zip(dbf2, recs2):
        geom = build_geojson(rings, eps=0.003, drop=is_sea)
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
