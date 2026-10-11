# -*- coding: utf-8 -*-
"""中方主张领土裁剪模块（scripts/km_claims.py）
把境外国家矢量与中国省级边界（中方主张画法，public/maps/_shared/china-provinces.json）
相交的部分剔除——阿克赛钦、喀喇昆仑走廊等中国主张领土不得出现在他国矢量内。
可被 _g 修复脚本调用，也可在 gen_*_regions.py 转换阶段调用（防回归）。
"""
import json, os
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
from shapely.validation import make_valid

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CHINA_PATH = os.path.join(ROOT, "public", "maps", "_shared", "china-provinces.json")

_china = None

def get_china():
    global _china
    if _china is None:
        cj = json.load(open(CHINA_PATH, encoding="utf-8"))
        gs = []
        for f in cj["features"]:
            if f.get("geometry"):
                s = shape(f["geometry"])
                gs.append(make_valid(s) if not s.is_valid else s)
        _china = unary_union(gs)
    return _china

def _round(obj, nd=5):
    if isinstance(obj, (list, tuple)):
        if obj and isinstance(obj[0], (int, float)):
            return [round(float(v), nd) for v in obj]
        return [_round(x, nd) for x in obj]
    return obj

def clip_feature(feat, china=None, min_area=1e-6, nd=5):
    """剔除单个 Feature 与中方主张区的重叠。返回 (new_feat, clipped_area)。
    若整个 Feature 落在中方主张区内，返回 (原 feat, area)，由调用方丢弃。"""
    china = china or get_china()
    g = feat.get("geometry")
    if not g:
        return feat, 0.0
    s = shape(g)
    if not s.is_valid:
        s = make_valid(s)
    if not s.intersects(china):
        return feat, 0.0
    inter = s.intersection(china)
    if inter.is_empty or inter.area <= 0:
        return feat, 0.0
    a = inter.area
    s2 = s.difference(china)
    if s2.is_empty:
        return feat, a
    try:
        parts = list(s2.geoms) if s2.geom_type.startswith("Multi") else [s2]
        keep = [q for q in parts if q.area >= min_area]
        if not keep:
            return feat, a
        s2 = keep[0] if len(keep) == 1 else unary_union(keep)
    except Exception:
        pass
    m = mapping(s2)
    nf = {"type": "Feature", "properties": feat.get("properties"),
          "geometry": {"type": m["type"], "coordinates": _round(m["coordinates"], nd)}}
    return nf, a

def clip_feature_collection(fc, verbose=True, tag=""):
    """就地裁剪整个 FeatureCollection，返回被裁剪的要素数。"""
    china = get_china()
    out, n = [], 0
    for f in fc.get("features", []):
        nf, a = clip_feature(f, china)
        if a > 0:
            n += 1
            if verbose:
                print(f"    [km-claims]{(' ' + tag) if tag else ''} 剔除重叠 {a:.4f} 平方度")
            if nf is f:      # 整块落入中方主张区，剔除该要素
                continue
        out.append(nf)
    fc["features"] = out
    return n

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    apply_ = "--apply" in sys.argv
    slugs = args or ["pak-regions", "kaz-regions"]
    print("模式:", "APPLY" if apply_ else "DRY-RUN", "| 目标:", slugs)
    for slug in slugs:
        for fn in ("provinces.geojson", "districts.geojson"):
            p = os.path.join(ROOT, "public", "maps", slug, "data", fn)
            if not os.path.exists(p):
                print(f"  [skip] {slug}/{fn} 不存在"); continue
            fc = json.load(open(p, encoding="utf-8"))
            import io, contextlib
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                n = clip_feature_collection(fc, tag=slug)
            print(f"  {slug}/{fn}: 受影响 {n} 个要素")
            if buf.getvalue().strip():
                print("    " + buf.getvalue().strip().replace("\n", "\n    "))
            if apply_ and n:
                json.dump(fc, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
                print(f"    ✔ 已写回 {p}")
