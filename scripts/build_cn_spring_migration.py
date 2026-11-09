# -*- coding: utf-8 -*-
"""
中国春运人口迁徙 · 数据构建脚本
================================
数据来源：百度迁徙开放接口 (huiyan.baidu.com/migration/cityrank.jsonp)
  - dt=city, id=<6位adcode>, type=move_in|move_out, date=<YYYYMMDD>
  - 返回某城市在指定日期的「迁入来源城市排行 / 迁出目的城市排行」，value 为占比(%)

说明：
  - 百度迁徙规模指数为**相对值**（城市间可横向对比，无绝对人次），本图仅用于
    表达城市间联系的相对强度，不作为绝对客运量依据。
  - 抓取日默认 20260210（2026 春节前返乡高峰；2026 春节为 2/17）。
  - 坐标：城市经纬度为 WGS84，输出转 GCJ-02 与高德瓦片对齐（保留 wgs84 原值）。

输出：
  public/maps/cn-spring-migration/data/nodes.json  (城市节点)
  public/maps/cn-spring-migration/data/flows.json  (城市间迁徙有向边)
"""

import os, sys, json, time, ssl, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "maps", "cn-spring-migration", "data")
CACHE = os.path.join(ROOT, "scripts", "_cache_cn_spring_migration.json")
DATE = os.environ.get("CSM_DATE", "20260210")   # 2026 春节前返乡高峰
FORCE = os.environ.get("CSM_FORCE", "0") == "1"

# ── 主要城市：adcode -> (名称, 经度WGS84, 纬度WGS84) ───────────────────────
# 覆盖：一线/省会/计划单列市 + 主要务工城市(苏锡常莞佛温泉珠惠等) + 主要人口流出地
CITIES = {
    110000: ("北京", 116.41, 39.90), 120000: ("天津", 117.20, 39.13),
    130100: ("石家庄", 114.51, 38.04), 130200: ("唐山", 118.18, 39.63),
    130400: ("邯郸", 114.49, 36.61), 130600: ("保定", 115.46, 38.87),
    140100: ("太原", 112.55, 37.87), 140800: ("运城", 111.00, 35.02),
    141000: ("临汾", 111.52, 36.08), 150100: ("呼和浩特", 111.75, 40.84),
    210100: ("沈阳", 123.43, 41.80), 210200: ("大连", 121.62, 38.92),
    220100: ("长春", 125.32, 43.82), 230100: ("哈尔滨", 126.53, 45.80),
    320100: ("南京", 118.78, 32.04), 320200: ("无锡", 120.30, 31.57),
    320300: ("徐州", 117.18, 34.26), 320400: ("常州", 119.95, 31.79),
    320500: ("苏州", 120.62, 31.30), 320600: ("南通", 120.86, 31.98),
    321000: ("扬州", 119.41, 32.39), 330100: ("杭州", 120.15, 30.27),
    330200: ("宁波", 121.55, 29.87), 330300: ("温州", 120.70, 28.00),
    330400: ("嘉兴", 120.76, 30.77), 330600: ("绍兴", 120.58, 30.01),
    330700: ("金华", 119.65, 29.08), 330900: ("台州", 121.43, 28.66),
    340100: ("合肥", 117.27, 31.86), 340500: ("芜湖", 118.38, 31.33),
    340800: ("安庆", 117.05, 30.53), 341200: ("阜阳", 115.81, 32.90),
    341500: ("六安", 116.52, 31.75), 341600: ("亳州", 115.78, 33.87),
    341300: ("宿州", 116.97, 33.63), 350100: ("福州", 119.30, 26.08),
    350200: ("厦门", 118.09, 24.48), 350500: ("泉州", 118.58, 24.91),
    360100: ("南昌", 115.86, 28.68), 360700: ("赣州", 114.94, 25.85),
    360900: ("宜春", 114.39, 27.81), 361100: ("上饶", 117.97, 28.45),
    370100: ("济南", 117.00, 36.65), 370200: ("青岛", 120.38, 36.07),
    370600: ("烟台", 121.39, 37.54), 370700: ("潍坊", 119.10, 36.62),
    420100: ("武汉", 114.30, 30.59), 430100: ("长沙", 112.94, 28.23),
    421100: ("黄冈", 114.87, 30.45), 430400: ("衡阳", 112.57, 26.89),
    430500: ("邵阳", 111.47, 27.24), 431200: ("怀化", 110.00, 27.55),
    440100: ("广州", 113.26, 23.13), 440300: ("深圳", 114.06, 22.55),
    440400: ("珠海", 113.55, 22.27), 440600: ("佛山", 113.12, 23.02),
    441300: ("惠州", 114.42, 23.11), 441900: ("东莞", 113.75, 23.02),
    442000: ("中山", 113.39, 22.52), 450100: ("南宁", 108.32, 22.82),
    460100: ("海口", 110.20, 20.04), 500000: ("重庆", 106.55, 29.56),
    510100: ("成都", 104.07, 30.57), 510500: ("泸州", 105.44, 28.87),
    510700: ("绵阳", 104.68, 31.47), 511300: ("南充", 106.08, 30.80),
    511500: ("宜宾", 104.64, 28.75), 511700: ("达州", 107.50, 31.21),
    520100: ("贵阳", 106.71, 26.57), 520300: ("遵义", 106.93, 27.73),
    520500: ("毕节", 105.29, 27.27), 530100: ("昆明", 102.83, 24.88),
    530300: ("曲靖", 103.80, 25.49), 530600: ("昭通", 103.72, 27.34),
    540100: ("拉萨", 91.11, 29.97), 610100: ("西安", 108.94, 34.34),
    610500: ("渭南", 109.51, 34.50), 620100: ("兰州", 103.83, 36.06),
    630100: ("西宁", 101.78, 36.62), 640100: ("银川", 106.23, 38.49),
    650100: ("乌鲁木齐", 87.62, 43.82),
}
NAME2ADCODE = {v[0]: k for k, v in CITIES.items()}

import math

# WGS84 -> GCJ-02（标准火星坐标转换，与高德瓦片对齐）
A, EE = 6378245.0, 0.00669342162296594323
def _tlat(lng, lat):
    r = -100 + 2*lng + 3*lat + 0.2*lat*lat + 0.1*lng*lat + 0.2*math.sqrt(abs(lng))
    r += (20*math.sin(6*lng*math.pi) + 20*math.sin(2*lng*math.pi)) * 2/3
    r += (20*math.sin(lat*math.pi) + 40*math.sin(lat/3*math.pi)) * 2/3
    r += (160*math.sin(lat/12*math.pi) + 320*math.sin(lat/30*math.pi)) * 2/3
    return r
def _tlng(lng, lat):
    r = 300 + lng + 2*lat + 0.1*lng*lng + 0.1*lng*lat + 0.1*math.sqrt(abs(lng))
    r += (20*math.sin(6*lng*math.pi) + 20*math.sin(2*lng*math.pi)) * 2/3
    r += (20*math.sin(lng*math.pi) + 40*math.sin(lng/3*math.pi)) * 2/3
    r += (150*math.sin(lng/12*math.pi) + 300*math.sin(lng/30*math.pi)) * 2/3
    return r
def wgs84_to_gcj02(lng, lat):
    if lng < 72 or lng > 136 or lat < 0 or lat > 54:
        return lng, lat
    dlat = _tlat(lng-105.0, lat-35.0)
    dlng = _tlng(lng-105.0, lat-35.0)
    radlat = lat/180.0*math.pi
    magic = math.sin(radlat)
    magic = 1 - EE*magic*magic
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat*180.0)/(A*(1-EE)/(magic*sqrtmagic)*math.pi)
    dlng = (dlng*180.0)/(A/sqrtmagic*math.cos(radlat)*math.pi)
    return lng+dlng, lat+dlat

# 网络请求
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
for k in ("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"):
    os.environ.pop(k, None)

def fetch(adcode, typ):
    url = f"https://huiyan.baidu.com/migration/cityrank.jsonp?dt=city&id={adcode}&type={typ}&date={DATE}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Referer": "https://qianxi.baidu.com/"})
    raw = urllib.request.urlopen(req, timeout=20, context=ctx).read().decode("utf-8", "ignore")
    # 剥离 jsonp 包裹
    s = raw.strip()
    if s.startswith("cb("):
        s = s[3:]
    if s.endswith(")"):
        s = s[:-1]
    return json.loads(s)

def norm_name(n):
    for suf in ("市", "地区", "区", "县", "自治州", "盟"):
        if n.endswith(suf):
            n = n[:-len(suf)]
    return n

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    # 读缓存
    raw = {}
    if not FORCE and os.path.exists(CACHE):
        try:
            raw = json.load(open(CACHE, encoding="utf-8"))
            print(f"[cache] 已加载 {len(raw)} 条缓存")
        except Exception:
            raw = {}

    for adcode in CITIES:
        for typ in ("move_in", "move_out"):
            key = f"{adcode}:{typ}"
            if key in raw:
                continue
            for attempt in range(3):
                try:
                    data = fetch(adcode, typ)
                    raw[key] = data
                    time.sleep(0.12)
                    break
                except Exception as e:
                    print(f"[warn] {key} 重试 {attempt+1}: {repr(e)[:120]}")
                    time.sleep(0.5)
            else:
                raw[key] = {"errno": -1, "data": {"list": []}}

    json.dump(raw, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"[done] 抓取完成，共 {len(raw)} 条，已缓存")

    # 构建有向边：key=(from_adcode, to_adcode) -> weight
    edges = {}
    def add_edge(fr, to, w):
        if fr == to or fr not in CITIES or to not in CITIES:
            return
        k = (fr, to)
        if k in edges:
            edges[k] = (edges[k] + w) / 2.0
        else:
            edges[k] = w

    for adcode in CITIES:
        # move_in of B：来源城市 A 迁入 B
        din = raw.get(f"{adcode}:move_in", {}).get("data", {}).get("list", []) or []
        for item in din:
            a = NAME2ADCODE.get(norm_name(item.get("city_name", "")))
            if a:
                add_edge(a, adcode, float(item.get("value", 0) or 0))
        # move_out of A：目的城市 B 迁出 A
        dout = raw.get(f"{adcode}:move_out", {}).get("data", {}).get("list", []) or []
        for item in dout:
            b = NAME2ADCODE.get(norm_name(item.get("city_name", "")))
            if b:
                add_edge(adcode, b, float(item.get("value", 0) or 0))

    # 节点：枢纽度 strength + 净流动 net
    strength = {c: 0.0 for c in CITIES}
    net = {c: 0.0 for c in CITIES}
    for (fr, to), w in list(edges.items()):
        strength[fr] += w
        strength[to] += w
        net[to] += w      # 流入 to
        net[fr] -= w      # 从 fr 流出

    FLOW_MIN = 0.8  # 剔除极弱噪声边

    # 输出 nodes.json
    nodes = {"_comment": f"中国春运人口迁徙 · 城市节点（GCJ-02）。数据日 {DATE}，来源百度迁徙规模指数(相对值)。properties.wgs84 为原始 WGS84。",
             "type": "FeatureCollection", "features": []}
    for adcode, (name, lng, lat) in CITIES.items():
        glng, glat = wgs84_to_gcj02(lng, lat)
        nodes["features"].append({
            "type": "Feature",
            "properties": {
                "id": f"c-{adcode}", "name": name, "adcode": adcode,
                "prov": adcode // 10000,
                "strength": round(strength[adcode], 2),
                "net": round(net[adcode], 2),
                "wgs84": [round(lng, 5), round(lat, 5)],
            },
            "geometry": {"type": "Point", "coordinates": [round(glng, 5), round(glat, 5)]},
        })

    # 输出 flows.json（标记跨省，按阈值过滤）
    flows = {"_comment": f"中国春运人口迁徙 · 城市间有向边（GCJ-02）。数据日 {DATE}，value 为百度迁徙占比(%)，相对值；cross=是否跨省。",
             "type": "FeatureCollection", "features": []}
    n_cross = 0
    for (fr, to), w in edges.items():
        if w < FLOW_MIN:
            continue
        f = CITIES[fr]; t = CITIES[to]
        cross = (fr // 10000) != (to // 10000)
        if cross:
            n_cross += 1
        flng, flat = wgs84_to_gcj02(f[1], f[2])
        tlng, tlat = wgs84_to_gcj02(t[1], t[2])
        flows["features"].append({
            "type": "Feature",
            "properties": {
                "from": fr, "to": to, "from_name": f[0], "to_name": t[0],
                "w": round(w, 2), "cross": cross,
            },
            "geometry": {"type": "LineString", "coordinates": [
                [round(flng, 5), round(flat, 5)], [round(tlng, 5), round(tlat, 5)]]},
        })

    json.dump(nodes, open(os.path.join(OUT_DIR, "nodes.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(flows, open(os.path.join(OUT_DIR, "flows.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"[out] 节点 {len(nodes['features'])} 个，边 {len(flows['features'])} 条（其中跨省 {n_cross} 条）")
    # 打印 top 边
    top = sorted(edges.items(), key=lambda x: -x[1])[:15]
    print("[top edges]")
    for (fr, to), w in top:
        print(f"  {CITIES[fr][0]} -> {CITIES[to][0]}: {w:.2f}")

if __name__ == "__main__":
    main()
