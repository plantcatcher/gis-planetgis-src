---
slug: global-wastewater
title: 全球废水处理厂数据 SHP（HydroWASTE v1.0，WGS84，Point，4.4 万座）
summary: 全球废水处理厂分布矢量数据集（HydroWASTE v1.0），Shapefile 格式，含 43,980 座废水处理厂点位，WGS84 坐标系，属性含厂名、国家及 ISO 代码、经纬度与数据来源，压缩包另含 README 与 CSV 明细，适合全球污水处理设施空间分析。
date: 2026-09-23
category: 地理数据
tags: 废水处理厂, 污水处理厂, HydroWASTE, 全球废水, Shapefile, WGS84, 矢量数据, 环境基础设施, 地理数据
access: gated
trigger: 全球废水处理厂数据
keywordAliases: 废水处理厂, 废水厂数据, 污水处理设施
code: NSH-GIS-016
download: https://downloads.planetgis.cn/GIS/global-wastewater.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 6.15 MB
---

> 本数据集为 **全球废水处理厂数据（HydroWASTE v1.0）**，以 Shapefile 形式提供，共 **43,980 座**废水处理厂点位（Point），覆盖全球主要国家与地区。坐标系为 **GCS_WGS_1984（WGS84，EPSG:4326 经纬度）**，属性含 WWTP_NAME（厂名）、COUNTRY / CNTRY_ISO（国家及 ISO 代码）、LAT_WWTP / LON_WWTP（经纬度）、SOURCE / ORG_ID（数据来源）等，压缩包另含 README 与 CSV 明细，可直接用于全球污水处理设施空间分析。**未标注官方审图号**。

![waste_1](https://blogphoto.planetgis.cn/PicGo/2026-09-23-waste_1.jpg)

## 数据内容

- **全球废水处理厂（Point，43,980 座）**：每个点位为一座废水处理厂，属性表字段：
  - `WASTE_ID`：处理厂唯一 ID；
  - `WWTP_NAME`：处理厂名称；
  - `COUNTRY` / `CNTRY_ISO`：所在国家及 ISO 国家代码；
  - `LAT_WWTP` / `LON_WWTP`：纬度 / 经度（十进制度）；
  - `SOURCE` / `ORG_ID`：数据来源与来源机构编码。
- 压缩包附带 `HydroWASTE_v10/README.txt` 与同名 CSV，说明字段含义、数据来源与引用方式。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-waste_0.jpg" alt="waste_0" style="zoom:67%;" />

## 坐标系与格式

坐标系为 **WGS84 地理坐标系（EPSG:4326，经纬度）**，`.prj` 已随包附带，主流 GIS 软件可直接识别；与天地图、OSM 等底图天然对齐。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 即可加载，按 COUNTRY / CNTRY_ISO 分级可呈现各国处理厂分布密度。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，配合 `matplotlib` / `keplergl` 出图，或按国家分组统计处理厂数量与空间格局。
3. **WebGIS 底图**：经 `ogr2geojson` 转 GeoJSON 后，用 `tippecanoe` 生成矢量瓦片，导入 MapLibre / Leaflet 做全球污水处理设施可视化。

## 使用须知

- 本数据集为第三方整理的开源地理资料（HydroWASTE v1.0），**未标注官方审图号**，国界与行政区划画法以数据源为准，公开或正式用途请核对官方标准地图与南海十段线表达。
- **严禁**对任意行政界线、国界与南海十段线进行删改、位移或歪曲；数据仅供学习、科研与教学制图参考，商业用途请自行申请授权。
- 设施点位与名称可能存在局部误差或缺漏，引用时请遵循原数据集的署名与引用规范。

## 适用场景

全球污水处理设施空间分布分析、城市环境基础设施研究、水环境与水污染治理教学、WebGIS 环保设施专题底图。
