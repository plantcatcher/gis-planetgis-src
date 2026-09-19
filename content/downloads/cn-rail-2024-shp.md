---
slug: cn-rail-2024-shp
title: 2024 全国铁路（普铁 / 高铁 / 地铁）矢量数据集 SHP（WGS84，分 8 类）
summary: 2024 年全国铁路网络矢量数据集，涵盖普速铁路、高速铁路、地铁及城市轨道等，按 8 类细分图层，GCS_WGS_1984（EPSG:4326）地理坐标系，Shapefile 格式，可直接用于 QGIS / ArcGIS / Python 空间分析与交通地理制图。
date: 2026-09-19
category: 地理数据
tags: 铁路, 高铁, 地铁, SHP, 矢量数据, WGS84, OpenStreetMap, QGIS, 交通地理, 地理数据
access: gated
trigger: 全国铁路2024
keywordAliases: 全国铁路矢量, 高铁矢量数据, 地铁矢量数据
code: NSH-TL-001
download: https://pan.baidu.com/s/1Tgl2V9W3TMeS1E9CkYKx3g?pwd=9i7k 
downloadType: baidu
panCode: 9i7k
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 83.5 MB
---

> 本数据集为 2024 年汇总的**全国铁路网络矢量数据**，覆盖普速铁路、高速铁路、地铁及各类城市轨道，坐标系为 **GCS_WGS_1984（EPSG:4326，WGS84 地理坐标，经纬度）**，以 Shapefile（.shp）形式提供，压缩包约 **83.5 MB**。数据由开源地图（OpenStreetMap 类底图）整理而来，属性字段为 `GM_LAYER`（图层类别）与 `GM_TYPE`（要素类型），**未标注官方审图号**，属第三方整理成果，使用时请注意合规与坐标差异（详见使用须知）。



![road_all](https://blogphoto.planetgis.cn/PicGo/2026-09-19-road_all.jpg)



## 数据内容

数据集由 **1 个合并主图层 + 8 个分类子图层** 组成，合并主图层共 **369,597** 条铁路 / 轨道要素：

- **rail_铁路（普速铁路）**：338,808 条，全国普速干线及支线。
- **subway_地铁交通（地铁 / 城轨）**：24,910 条，各城市轨道交通线路。
- **tram_有轨电车**：城市有轨电车线网。
- **light_rai_轻轨（轻轨）**：轻轨线路。
- **monorail_单轨铁路**：单轨（如重庆等）线路。
- **narrow_gauge_窄轨铁路**：窄轨铁路（如米轨等）。
- **funicular_缆索铁道**：缆索 / 登山铁道。
- **miniature_railway_微型火车网络**：微型 / 观光火车网络。

每个分类图层均含完整几何与属性表，字段为 `GM_LAYER`、`GM_TYPE`，可直接在 QGIS 属性表或 Python 中按类型筛选与统计。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-19-list_0.jpg" alt="list_0" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-19-list.jpg" alt="list" style="zoom:50%;" />



## 坐标系与格式

所有图层统一采用 **GCS_WGS_1984 / EPSG:4326** 地理坐标系（经纬度），`.prj` 投影文件随包附带，无需自行定义投影。每个图层为独立 Shapefile 数据集，配套 `.shp / .shx / .dbf / .prj / .cpg` 齐全，主图层另含 `.sbn / .sbx` 空间索引，文本编码由 `.cpg` 指定（UTF-8）。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 即可加载，可按 `GM_TYPE` 分级设色区分普铁 / 高铁 / 地铁。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，配合 `matplotlib` / `keplergl` 出图，或做线路密度、连通性、缓冲区分析。
3. **WebGIS 底图**：经 `tippecanoe` 转为 MBTiles / Vector PG，或导入 MapLibre / Leaflet 作为铁路网底图。

## 使用须知

- 本数据源于开源地图整理，**无官方审图号**，公开使用须遵守《地图管理条例》与测绘成果保密相关规定，**不得**对任意行政界线、国界及南海十段线进行删改、位移或歪曲。
- 坐标系为 **WGS84**，与国内正式出图常用的 **CGCS2000** 存在厘米级差异；用于正式出版或测绘成果前，建议做坐标转换并核对最新官方数据。
- 数据仅供学习、科研与教学制图参考，商业用途请自行向主管部门或数据提供方申请授权。

## 适用场景

交通地理教学、铁路网密度与可达性分析、城市群轨道连通性研究、WebGIS 铁路底图、遥感影像铁路线叠加、城乡规划与枢纽选址等。
