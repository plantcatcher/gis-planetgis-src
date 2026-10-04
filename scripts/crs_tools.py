# -*- coding: utf-8 -*-
"""Albers 反算 + GCJ-02 偏移，验证/重建 cn-rivers 的经纬度数据。

用途：
  1) 校验：把现有 rivers.json 里的要素与 shp 反算结果比对，确认变换链路
  2) 补数据：把缺失层级（如三级河流）按同样链路转成 GeoJSON
"""
import math

# WGS_1984_Albers: 标准纬线 25/47，中央经线 105，原点纬度 0
D2R = math.pi / 180.0
P1, P2 = 25.0 * D2R, 47.0 * D2R
LON0 = 105.0
_A_R = 6378137.0          # 椭球长半轴，shp 平面单位为米
_n = (math.sin(P1) + math.sin(P2)) / 2.0
_C = math.cos(P1) ** 2 + 2.0 * _n * math.sin(P1)
_rho0 = math.sqrt(_C) / _n   # phi0 = 0 -> sin0=0
_rho0 *= _A_R


def albers_inv(x, y):
    """Albers 等积圆锥投影逆变换 -> (lon, lat) WGS84 度

    正算：x = rho*sin(theta), y = rho0 - rho*cos(theta), theta = n*(lon-lon0)
    """
    dy = _rho0 - y
    rho = math.hypot(x, dy) / _A_R          # 归一化到长半轴单位
    theta = math.atan2(x, dy) / _n           # 弧度
    lat = math.asin((_C - rho * rho * _n * _n) / (2.0 * _n))
    lon = LON0 + math.degrees(theta)
    return lon, lat / D2R


# ---------- GCJ-02（WGS84 -> GCJ02）----------
PI = math.pi
X_PI = PI * 3000.0 / 180.0
_A = 6378245.0
_EE = 0.00669342162296594323


def _out_of_china(lon, lat):
    return not (73.66 < lon < 135.05 and 3.86 < lat < 53.55)


def _t_lat(x, y):
    r = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * math.sqrt(abs(x))
    r += (20.0 * math.sin(6.0 * x * PI) + 20.0 * math.sin(2.0 * x * PI)) * 2.0 / 3.0
    r += (20.0 * math.sin(y * PI) + 40.0 * math.sin(y / 3.0 * PI)) * 2.0 / 3.0
    r += (160.0 * math.sin(y / 12.0 * PI) + 320.0 * math.sin(y * PI / 30.0)) * 2.0 / 3.0
    return r


def _t_lon(x, y):
    r = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * math.sqrt(abs(x))
    r += (20.0 * math.sin(6.0 * x * PI) + 20.0 * math.sin(2.0 * x * PI)) * 2.0 / 3.0
    r += (20.0 * math.sin(x * PI) + 40.0 * math.sin(x / 3.0 * PI)) * 2.0 / 3.0
    r += (150.0 * math.sin(x / 12.0 * PI) + 300.0 * math.sin(x / 30.0 * PI)) * 2.0 / 3.0
    return r


def wgs84_to_gcj02(lon, lat):
    if _out_of_china(lon, lat):
        return lon, lat
    dlat = _t_lat(lon - 105.0, lat - 35.0)
    dlon = _t_lon(lon - 105.0, lat - 35.0)
    radlat = lat / 180.0 * PI
    magic = 1.0 - _EE * math.sin(radlat) ** 2
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat * 180.0) / ((_A * (1.0 - _EE)) / (magic * sqrtmagic) * PI)
    dlon = (dlon * 180.0) / (_A / sqrtmagic * math.cos(radlat) * PI)
    return lon + dlon, lat + dlat


def shp_point_to_gcj02(x, y):
    lon, lat = albers_inv(x, y)
    return wgs84_to_gcj02(lon, lat)
