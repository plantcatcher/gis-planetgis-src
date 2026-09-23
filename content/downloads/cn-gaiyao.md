---
slug: cn-gaiyao
title: 全国 1:400 万基础地理概要数据 SHP（省级行政区/国界/河流/公路/铁路/湖泊 · 北京54 Lambert 投影）
summary: 经典的全国 1:400 万基础地理概要数据集，Shapefile 格式，含省级行政区、省会城市、国界线、主要河流、主要公路、主要铁路、中国湖泊共 7 个图层，北京 1954 基准下的 Lambert 双标准纬线等角圆锥投影（米制），适合全国尺度地理教学、省情可视化与 GIS 课程实验。
date: 2026-09-23
category: 地理数据
tags: 全国概要数据, 基础地理数据, 1:400万, Shapefile, 北京54, Lambert投影, 省级行政区, 国界线, 主要河流, 主要公路, 主要铁路, 中国湖泊, QGIS, 地理数据
access: gated
trigger: 全国概要数据
keywordAliases: 全国概要shp, 全国基础地理
code: NSH-GIS-013
download: https://downloads.planetgis.cn/GIS/cn-gaiyao.rar
cover: /covers/geo-data-cover.jpg
format: RAR
size: 3.40 MB
---

> 本数据集为经典的**全国 1:400 万基础地理概要数据**（源自国家 1:400 万基础地理底图数字化成果），以 Shapefile 形式提供 **7 个图层**：省级行政区、省会城市、国界线、主要河流、主要公路、主要铁路、中国湖泊。坐标系为 **GCS_Beijing_1954（北京 1954 基准）下的 Lambert 双标准纬线等角圆锥投影（China_Lambert_Conformal_Conic，单位：米）**，**未标注官方审图号**，仅供学习、科研与教学参考。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-china_2.jpg" alt="china_2" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-china_3.jpg" alt="china_3" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-china_4.jpg" alt="china_4" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-china_5.jpg" alt="china_5" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-china_6.jpg" alt="china_6" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-china_7.jpg" alt="china_7" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-china_8.jpg" alt="china_8" style="zoom:50%;" />

## 数据内容

数据包共 **7 个图层**，覆盖全国尺度的基础地理要素：

- **省级行政区（Polygon，34 个）**：属性表最丰富，含 NAME、PINYIN_NAM、AREA、PERIMETER、PROVINCE_/PROVINCE_I，以及 1990 年代人口（Pop_1990、城乡人口、民族构成、文盲率）、GDP（1994/1997/1998/1999/2000）与社会经济指标等百余字段，是省级统计制图与空间分析的常用底表。
- **省会城市（Point，34 个）**：字段 name、id，对应 34 个省级行政中心。
- **国界线（PolyLine，1382 条）**：字段含 GBCODE（国界代码）、LENGTH、BOU1_4M_ID 等，为 1:400 万尺度的国界表达。
- **主要河流（PolyLine，3040 条）**：字段 JB，全国主要河网骨架。
- **主要公路（PolyLine，1742 条）**：字段 Id，全国公路主干。
- **主要铁路（PolyLine，504 条）**：字段 Id，全国铁路主干。
- **中国湖泊（Polygon，263 个）**：字段 CODE，全国主要湖泊面状分布。

每个图层均配套 .shp / .shx / .dbf / .prj / .sbn / .sbx / .shp.xml，可直接加载到主流 GIS 软件。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-china_1.jpg" alt="china_1" style="zoom:50%;" />



## 坐标系与格式

所有图层统一采用 **北京 1954（GCS_Beijing_1954）基准 + Lambert 双标准纬线等角圆锥投影**（中央经线 105°E，标准纬线 30°N 与 62°N，单位米）。该投影为**投影平面坐标系（米），非经纬度**，与 WGS84 / CGCS2000 经纬度底图叠加时须先做**投影变换 / 重投影**（如 QGIS 中「重投影图层」到 EPSG:4326 或 EPSG:4490）后才能对齐。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 即可加载；跨坐标系叠加时用「重投影图层 / Project」转为 WGS84 或 CGCS2000。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，配合 `.to_crs()` 重投影后结合 matplotlib / keplergl 出图，或与统计表按 NAME / GBCODE 挂接。
3. **WebGIS 底图**：经 `ogr2ogr` 转为 GeoJSON，再经 `tippecanoe` 生成矢量瓦片，导入 MapLibre / Leaflet 使用。

## 使用须知

- 本数据集为**早期 1:400 万尺度基础地理成果，未标注官方审图号**，国界、省界画法以原始数字化来源为准，**不得**作为权威边界依据；公开或正式用途请核对自然资源部最新标准地图（含审图号）与南海十段线表达。
- **严禁**对任意行政界线、国界与南海十段线进行删改、位移或歪曲；数据仅供学习、科研与教学制图参考，商业用途请自行向主管部门申请授权。
- 属性表中的人口、GDP 等统计为 1990 年代历史数据，仅作时间断面参考，不直接反映现状。

## 适用场景

全国尺度的地理教学底图、省情 / 区域对比可视化、1990 年代社会经济空间分析、地图制图练习、GIS 课程实验数据与 WebGIS 行政区 / 交通 / 水系底图。

## 获取更多矢量数据

如果你需要更新、带审图号或 WGS84 / CGCS2000 坐标系的行政边界与标准地图，推荐阿里云 DataV.GeoAtlas 在线工具：

[阿里云 DataV.GeoAtlas 在线工具](https://datav.aliyun.com/portal/school/atlas/area_selector)

该平台提供全国省 / 市 / 区县三级行政边界的免费下载，支持 GeoJSON、SVG 等格式，公开使用须遵守《地图管理条例》与审图号相关要求。
