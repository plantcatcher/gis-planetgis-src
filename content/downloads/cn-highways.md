---
slug: cn-highways
title: 全国主要公路矢量数据（1:400 万基础地理数据库 SHP，北京 1954 坐标系）
summary: 源自国家 1:400 万基础地理信息数据库的主要公路图层，含 151 条主要公路线要素，北京 1954 坐标系（Krasovsky 1940 椭球），Shapefile 格式，字段含路名国标码 GBCODE 与 1:400 万要素编码，适用于全国公路网概览、交通专题制图与 GIS 教学。
date: 2026-09-17
category: 地理数据
tags: 公路, 交通, SHP, 矢量数据, 北京1954, 基础地理数据库, 国道, 路网, 地理数据
access: gated
trigger: 主要公路
keywordAliases: 全国公路矢量, 中国主要公路shp, 国家公路数据
code: NSH-SHP-005
download: https://downloads.planetgis.cn/GIS/cn-highways.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 0.23 MB
---

> 本数据包提取自 **国家 1:400 万基础地理信息数据库**（全国基础地理矢量数据），为其中的**主要公路**图层，坐标系为 **北京 1954（GCS_Beijing_1954，Krasovsky 1940 椭球）**，以 Shapefile（.shp）形式提供，共 **1 个图层、151 条线要素**，配套 .shp / .shx / .dbf / .prj / .cpg / .sbn / .sbx 文件齐全，可直接加载到 QGIS / ArcGIS 中使用，适合全国尺度公路网概览与交通专题制图。

![road_1](https://blogphoto.planetgis.cn/PicGo/2026-09-17-road_1.jpg)

## 数据内容

数据包含 **1 个图层**：

- **主要公路（major roads）**：**151** 条线要素，属性表字段含 `FNODE_` / `TNODE_`（起止节点号）、`LPOLY_` / `RPOLY_`（左右多边形）、`LENGTH`（长度）、`ROA_4M_` / `ROA_4M_ID`（1:400 万公路要素编码与 ID）、`GBCODE`（国家标准要素分类码）。`GBCODE` 可用于按国道 / 省道等分级设色与筛选。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-17-road_d.jpg" alt="road_d" style="zoom:50%;" />



## 坐标系与格式

图层采用 **北京 1954 地理坐标系**（GCS_Beijing_1954，基于 Krasovsky 1940 椭球，经纬度），`.prj` 投影文件已随包附带。如需与 WGS84 / CGCS2000 底图叠加，可在 QGIS 中使用「待投影」或 `ogr2ogr` 进行坐标变换。每个图层为独立 Shapefile 数据集，配套 `.shp / .shx / .dbf / .prj / .cpg` 齐全，并附空间索引 `.sbn / .sbx`。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 加载，按 `GBCODE` 或 `ROA_4M_` 字段对国道 / 省道分级设色。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，结合路网做连通性、通达性（Accessibility）或缓冲区分析。
3. **WebGIS 底图**：经 `tippecanoe` 转 MBTiles 后导入 MapLibre / Leaflet，作为全国公路网概览底图。

## 使用须知

- 本数据源自**国家基础地理信息数据库** 1:400 万比例尺成果，适用于学习、科研与教学制图参考；公开使用须遵守《地图管理条例》与测绘成果保密相关规定。
- **不得**对任意行政界线、国界进行删改或歪曲；正式地图出版须使用自然资源部审定的标准地图并标注审图号。
- 数据仅供学习、科研与教学参考，商业用途请自行向主管部门申请授权。

## 适用场景

全国公路网概览图、交通可达性分析、区域交通专题制图、GIS 与交通地理教学演示、与其他 1:400 万基础地理图层（河流、居民地等）叠加做综合底图。
