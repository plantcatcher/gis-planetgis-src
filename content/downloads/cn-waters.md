---
slug: cn-waters
title: 我国水域矢量数据包（水域线 + 水域面 SHP，WGS84 坐标系）
summary: 基于 OpenStreetMap 水系数据整理的全國水域矢量包，含水域线（河流、沟渠、运河等 32.5 万条）与水域面（湖泊、水库、坑塘、海域等 45.7 万面）两个图层，WGS84 经纬度坐标系，Shapefile 格式，适用于全国尺度水文分析、水系制图与 GIS 教学。
date: 2026-09-17
category: 地理数据
tags: 水域, 水系, SHP, 矢量数据, WGS84, OpenStreetMap, 水文, 湖泊, 河流, 地理数据
access: gated
trigger: 我国水域
keywordAliases: 全国水域矢量包, 中国水域shp数据, 我国水域shapefile
code: NSH-SHP-004
downloadType: baidu
panCode: zfsj
download: https://pan.baidu.com/s/1XID9kn0mMiPplZ94AoENnQ?pwd=zfsj
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 415.11 MB
---

> 本数据包基于 **OpenStreetMap（OSM）** 公开水系数据提取整理，包含**全国尺度**的**水域线**与**水域面**两套矢量图层，坐标系为 **WGS84（GCS_WGS_1984，经纬度）**，以 Shapefile（.shp）形式提供，共 **2 个图层**、约 **78.2 万条要素**，配套 .shp / .shx / .dbf / .prj / .cpg / .sbn / .sbx 等文件齐全，可直接加载到 QGIS / ArcGIS 中使用。数据不含行政界线，仅表达自然与人工水体，适合作为水文分析、水系专题制图与 GIS 教学的底图数据。

![water_1](https://blogphoto.planetgis.cn/PicGo/2026-09-17-water_1.jpg)

![water_3](https://blogphoto.planetgis.cn/PicGo/2026-09-17-water_3.jpg)

## 数据内容

数据包共 **2 个图层**，均含完整几何与属性表：

- **水域线（waterway lines）**：**325,614** 条线要素，字段含 `osm_id`（OSM 要素 ID）、`code`（要素编码）、`fclass`（要素类别，如 river / stream / canal / ditch）、`width`（宽度）、`name`（名称）。覆盖全国河流、溪流、渠道、运河等线状水体。
- **水域面（water polygons）**：**456,700** 个面要素，字段含 `osm_id`、`code`、`fclass`、`name`。覆盖湖泊、水库、坑塘、养殖水面及近海海域等面状水体。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-17-2026-09-17-water_d.jpeg" alt="water_d" style="zoom:50%;" />

## 坐标系与格式

所有图层统一采用 **WGS84 地理坐标系**（GCS_WGS_1984，经纬度，与 Google / 高德 / 天地图等主流底图可直接叠加），`.prj` 投影文件已随包附带，无需自行定义投影。每个图层为独立 Shapefile 数据集，配套 `.shp / .shx / .dbf / .prj / .cpg` 齐全，并附空间索引 `.sbn / .sbx`，文本编码由 `.cpg` 指定（UTF-8）。

![water_2](https://blogphoto.planetgis.cn/PicGo/2026-09-17-water_2.jpg)

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 即可加载，可按 `fclass` 字段分级设色，区分河流 / 湖泊 / 水库等水体类型。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，配合 `matplotlib` / `keplergl` 出图，或做水系密度、河网连通性、湖泊面积统计。
3. **WebGIS 底图**：可经 `tippecanoe` 转为 MBTiles / Vector PG，或导入 MapLibre / Leaflet 作为水系底图。

## 使用须知

- 本数据源自 **OpenStreetMap** 社区协作成果，按 ODbL 协议共享，适用于学习、科研与教学制图；公开使用请遵守 OSM 署名与共享条款。
- 数据**不含**任何行政界线与国界画法，**不得**用于需要法定审图号的正式地图出版；涉及国界、海岸线等表达时，须以自然资源部发布的标准地图为准。
- 数据仅供学习、科研与教学参考，商业用途请自行评估合规风险并申请授权。

## 适用场景

全国尺度水文分析、河网 / 湖泊专题图制作、GIS 与水文学教学演示、WebGIS 水系底图、生态环境与水资源相关空间研究。
