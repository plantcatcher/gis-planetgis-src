---
slug: cn-zhuyao-shuixi-shp
title: 中国 1-5 级水系SHP数据（国家基础地理信息数据库 SHP，WGS84 Albers 投影）
summary: 提取自国家基础地理信息系统数据的主要水系图层集合，含三级以上河流（线）、三级以上湖泊/水体（面）、四级河流（线）、五级河流（线）共 4 个图层、约 6928 条/面要素，WGS_1984_Albers（Albers 等面积圆锥投影，WGS84 基准）坐标系，Shapefile 格式，字段含河流名称、国标码 GBCODE、河流等级与流域/支流代码，适用于全国尺度水系制图、水文分析与 GIS 教学底图。
date: 2026-09-24
category: 地理数据
tags: 主要水系, 水系, 河流, 湖泊, SHP, 矢量数据, 国家基础地理信息系统, 水文, WGS84_Albers, 地理数据
access: gated
trigger: 中国主要水系
keywordAliases: 主要水系矢量, 主要河流SHP, 中国水系SHP
code: NSH-SHP-007
download: https://downloads.planetgis.cn/GIS/cn-zhuyao-shuixi-shp.zip
cover: https://blogphoto.planetgis.cn/PicGo/2026-09-24-R_cover.jpg
format: SHP（ZIP 压缩包）
size: 7.97 MB
---

> 本数据包提取自 **国家基础地理信息系统数据**（全国基础地理矢量数据库），为其中的 **主要水系** 图层集合，以 Shapefile（.shp）形式提供，坐标系为 **WGS_1984_Albers（Albers 等面积圆锥投影，WGS84 基准，中央经线 105°E，双标准纬线 25°N / 47°N，单位为米）**，共 **4 个图层**、约 **6,928 条 / 面要素**，配套 .shp / .shx / .dbf / .prj / .sbn / .sbx 文件齐全（压缩包内另含 1 个 ArcGIS 遗留的 0 字节锁文件，可忽略），可直接加载到 QGIS / ArcGIS 中使用。数据不含行政界线与国界，仅表达自然与人工水系，适合全国尺度水系制图、水文分析与 GIS 教学底图。

![R_1](https://blogphoto.planetgis.cn/PicGo/2026-09-24-R_1.jpg)

![R_4](https://blogphoto.planetgis.cn/PicGo/2026-09-24-R_4.jpg)

![R_5](https://blogphoto.planetgis.cn/PicGo/2026-09-24-R_5.jpg)

## 数据内容

数据包共 **4 个图层**，均含完整几何与属性表：

- **三级以上河流（线）R12**：**2,143** 条线要素。字段含 `FNODE_` / `TNODE_`（起止节点）、`LPOLY_` / `RPOLY_`（左右多边形）、`LENGTH`（长度，米）、`HYD2_4M_` / `HYD2_4M_ID`（1:400 万水文要素编码与 ID）、`GBCODE`（国家标准要素分类码）、`NAME`（河流名称）、`LEVEL_RIVE`（河流等级）、`LEVEL_LAKE`（关联湖泊等级）。
- **三级以上湖泊 / 水体（面）R12P**：**826** 个面要素。字段含 `AREA`（面积）、`PERIMETER`（周长）、`HYD2_4M_` / `HYD2_4M_ID`、`GBCODE`、`NAME`、`LEVEL_LAKE`（湖泊等级）、`CODE_LAKE`（湖泊代码）。
- **四级河流（线）R4**：**992** 条线要素。字段在 R12 基础上增加 `HYDNTG_` / `HYDNTG_ID`、`SHARE`（共享标志）、`CLASS`、`R_CODE`（河流代码）、`BASIN1` / `BASIN2`（一级 / 二级流域代码）、`BRANCH` / `BRANCH2`（一级 / 二级支流代码）、`LEVEL`（等级）。
- **五级河流（线）R5**：**2,967** 条线要素，字段结构与 R4 完全一致。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-24-R_d.jpg" alt="R_d" style="zoom:50%;" />

## 坐标系与格式

所有图层统一采用 **WGS_1984_Albers 投影坐标系**（Albers 等面积圆锥投影，WGS84 基准），`.prj` 投影文件已随包附带；该投影为中国全图制图的常用投影，面积与长度量算无显著畸变，但坐标为投影平面坐标（米）而非经纬度。若需与 WGS84 / CGCS2000 经纬度底图（天地图、高德等）叠加，可在 QGIS 中重投影或经 `ogr2ogr` 转换。每个图层配套 `.shp / .shx / .dbf / .prj` 齐全，并附空间索引 `.sbn / .sbx`。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 加载，可按 `NAME` 标注河流 / 湖泊名称，按 `LEVEL_RIVE` / `LEVEL` 分级设色区分河流等级，或按 `GBCODE` 提取特定类型水系。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，配合 `matplotlib` / `cartopy` 出图，做河流长度统计、河网密度、湖泊面积汇总或按 `BASIN1` / `BASIN2` 做流域聚合。
3. **WebGIS 底图**：经 `tippecanoe` 转为 MBTiles / Vector PG，或导入 MapLibre / Leaflet 作为全国水系概览底图（注意先重投影到 Web 墨卡托 EPSG:3857）。

## 使用须知

- 本数据源自 **国家基础地理信息系统数据**（全国基础地理矢量数据库），适用于学习、科研与教学制图参考；公开使用须遵守《地图管理条例》与测绘成果保密相关规定。
- 数据仅含自然与人工水系要素，**不含**任何行政界线与国界画法；如制图中需表达行政界线、海岸线或南海十段线，须以自然资源部发布的标准地图为准，**不得**自行增删、位移或歪曲。
- 数据仅供学习、科研与教学参考，商业用途请自行向主管部门或数据提供方申请授权。

## 适用场景

全国 / 流域尺度水系专题图、河流等级与命名标注、河网密度与湖泊面积统计、水文与水资源分析、GIS 与水文学教学演示、与 1:400 万基础地理其他图层（行政区、公路、居民地等）叠加做综合底图。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-24-R_cover.jpg" alt="R_cover" style="zoom: 33%;" />