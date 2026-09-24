---
slug: cn-rivers-1
title: 全国一级河流矢量数据（1:400 万基础地理数据库 SHP，北京 1954 坐标系）
summary: 源自国家 1:400 万基础地理信息数据库的一级河流图层，含河流线 840 条与河流水域面 544 个，北京 1954 坐标系（Krasovsky 1940 椭球），Shapefile 格式，字段含河流名称、国标码 GBCODE 与 1:400 万要素编码，适用于全国水系制图、水文分析与 GIS 教学。
date: 2026-09-17
category: 地理数据
tags: 河流, 水系, SHP, 矢量数据, 北京1954, 基础地理数据库, 水文, 一级河流, 地理数据
access: gated
trigger: 一级河流
keywordAliases: 全国河流矢量, 中国一级河流shp, 主要河流数据
code: NSH-SHP-006
download: https://downloads.planetgis.cn/GIS/cn-rivers-1.zip
cover: https://blogphoto.planetgis.cn/PicGo/2026-09-17-river_2.jpg
format: SHP（ZIP 压缩包）
size: 0.76 MB
---

> 本数据包提取自 **国家 1:400 万基础地理信息数据库**（全国基础地理矢量数据），为其中的**一级河流**图层，坐标系为 **北京 1954（GCS_Beijing_1954，Krasovsky 1940 椭球）**，以 Shapefile（.shp）形式提供，共 **2 个图层**、约 **1,384 条 / 面要素**，配套 .shp / .shx / .dbf / .prj / .cpg / .sbn / .sbx 文件齐全，可直接加载到 QGIS / ArcGIS 中使用，适合全国尺度水系制图与水文分析。

![river_1](https://blogphoto.planetgis.cn/PicGo/2026-09-17-river_1.jpg)

![river_2](https://blogphoto.planetgis.cn/PicGo/2026-09-17-river_2.jpg)



## 数据内容

数据包共 **2 个图层**：

- **一级河流（river lines）**：**840** 条线要素，字段含 `FNODE_` / `TNODE_`（起止节点）、`LPOLY_` / `RPOLY_`（左右多边形）、`LENGTH`（长度）、`HYD1_4M_` / `HYD1_4M_ID`（1:400 万水文要素编码与 ID）、`GBCODE`（国家标准要素分类码）、`NAME`（河流名称）、`LEVEL_RIVE`（河流等级）、`LEVEL_LAKE`（关联湖泊等级）。
- **一级河流_水域（river water polygons）**：**544** 个面要素，字段含 `AREA`（面积）、`PERIMETER`（周长）、`HYD1_4M_` / `HYD1_4M_ID`、`GBCODE`、`NAME`（名称）、`LEVEL_LAKE`（湖泊等级）、`CODE_LAKE`（湖泊代码）。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-17-river_d.jpg" alt="river_d" style="zoom:50%;" />

## 坐标系与格式

图层采用 **北京 1954 地理坐标系**（GCS_Beijing_1954，基于 Krasovsky 1940 椭球，经纬度），`.prj` 投影文件已随包附带。如需与 WGS84 / CGCS2000 底图叠加，可在 QGIS 中使用「待投影」或 `ogr2ogr` 做坐标变换。每个图层为独立 Shapefile 数据集，配套 `.shp / .shx / .dbf / .prj / .cpg` 齐全，并附空间索引 `.sbn / .sbx`。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 加载，按 `NAME` / `LEVEL_RIVE` 标注河流名称与等级，按 `GBCODE` 分级设色。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，做河流长度统计、流域缓冲区或与水系面叠加分析。
3. **WebGIS 底图**：经 `tippecanoe` 转 MBTiles 后导入 MapLibre / Leaflet，作为全国水系概览底图。

## 使用须知

- 本数据源自**国家基础地理信息数据库** 1:400 万比例尺成果，适用于学习、科研与教学制图参考；公开使用须遵守《地图管理条例》与测绘成果保密相关规定。
- **不得**对任意行政界线、国界进行删改或歪曲；正式地图出版须使用自然资源部审定的标准地图并标注审图号。
- 数据仅供学习、科研与教学参考，商业用途请自行向主管部门申请授权。

## 适用场景

全国水系专题图、河流等级与命名标注、水文与水资源分析、GIS 与水文学教学演示、与其他 1:400 万基础地理图层（公路、居民地等）叠加做综合底图。
