---
slug: global-airports-2025
title: 2025 全球机场分布数据 SHP（WGS84，Point，8.2 万座）
summary: 2025 年全球机场分布矢量数据集，Shapefile 格式，含 82,262 座机场点位，WGS84 坐标系，属性含 ICAO/IATA 标识、机场类型、名称、经纬度、海拔与所属大洲，适合全球航空网络、机场密度与区域可达性分析。
date: 2026-09-23
category: 地理数据
tags: 全球机场, 机场分布, 机场数据, 航空, Shapefile, WGS84, 矢量数据, 交通地理, 地理数据
access: gated
trigger: 2025全球机场分布数据
keywordAliases: 全球机场数据, 机场分布数据, 全球机场shp
code: NSH-GIS-015
download: https://downloads.planetgis.cn/GIS/global-airports-2025.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 7.85 MB
---

> 本数据集为 **2025 年全球机场分布数据**，以 Shapefile 形式提供，共 **82,262 座**机场点位（Point），覆盖全球各大洲。坐标系为 **GCS_WGS_1984（WGS84，EPSG:4326 经纬度）**，属性含 ident（ICAO/IATA 标识）、type（机场类型）、name（名称）、latitude_d / longitude_（经纬度）、elevation_（海拔）、continent（所属大洲），可直接用于全球航空网络分析与制图。**未标注官方审图号**。

![airport_1](https://blogphoto.planetgis.cn/PicGo/2026-09-23-airport_1.jpg)

![airport_2](https://blogphoto.planetgis.cn/PicGo/2026-09-23-airport_2.jpg)

## 数据内容

- **全球机场分布（Point，82,262 座）**：每条记录为一个机场点位，属性表字段：
  - `ident`：机场标识（ICAO 或 IATA 代码）；
  - `type`：机场类型（如 large_airport / medium_airport / small_airport / heliport 等）；
  - `name`：机场名称；
  - `latitude_d` / `longitude_`：纬度 / 经度（十进制度）；
  - `elevation_`：海拔（米）；
  - `continent`：所属大洲。
- 数据覆盖全球，适合做航空网络密度、机场类型结构与区域可达性分析。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-airport_0.jpg" alt="airport_0" style="zoom: 67%;" />

## 坐标系与格式

坐标系为 **WGS84 地理坐标系（EPSG:4326，经纬度）**，`.prj` 已随包附带，主流 GIS 软件可直接识别；与天地图、OSM 等底图天然对齐。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 即可加载，按 type 或 continent 分级符号化呈现机场等级与分布。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，配合 `matplotlib` / `keplergl` 出图，或按大洲 / 类型做分组统计。
3. **WebGIS 底图**：经 `ogr2geojson` 转 GeoJSON 后，用 `tippecanoe` 生成矢量瓦片，导入 MapLibre / Leaflet 做全球机场可视化。

## 使用须知

- 本数据集为第三方整理的公开航空资料，**未标注官方审图号**，国界与行政区划画法以数据源为准，公开或正式用途请核对官方标准地图与南海十段线表达。
- **严禁**对国界与南海十段线进行删改、位移或歪曲；数据仅供学习、科研与教学制图参考，商业用途请自行申请授权。
- 机场经纬度、海拔可能存在局部误差，关键应用请以官方航行情报为准。

## 适用场景

全球航空网络与机场密度分析、机场类型结构研究、区域可达性与枢纽识别、交通地理教学、WebGIS 全球机场专题底图。
