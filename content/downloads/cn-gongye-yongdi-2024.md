---
slug: cn-gongye-yongdi-2024
title: 2024 全国工业用地矢量数据 SHP（WGS84，Polygon，13.4 万宗）
summary: 基于 OpenStreetMap（OSM）土地利用数据提取的 2024 年全国工业用地矢量数据集，Shapefile 格式，含 134,589 个工业用地面状要素，WGS84 坐标系，属性含用地类型与名称，适合工业用地分布、产业集聚与国土空间规划分析。
date: 2026-09-23
category: 地理数据
tags: 工业用地, 全国工业用地, 土地利用, OSM, Shapefile, WGS84, 矢量数据, 产业用地, 国土空间, 地理数据
access: gated
trigger: 全国工业用地矢量数据
keywordAliases: 工业用地矢量, 工业用地数据, 工业用地shp
code: NSH-GIS-014
download: https://downloads.planetgis.cn/GIS/cn-gongye-yongdi-2024.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 17.95 MB
---

> 本数据集为 **2024 年全国工业用地矢量数据**，基于 OpenStreetMap（OSM）土地利用数据提取，以 Shapefile 形式提供，共 **134,589 个**工业用地面状要素（Polygon）。坐标系为 **GCS_WGS_1984（WGS84，EPSG:4326 经纬度）**，属性含 osm_id、code、fclass（用地类型）、name（名称），可直接用于 QGIS / ArcGIS / Python 工业用地分布与制图。**未标注官方审图号**。



![gy_1](https://blogphoto.planetgis.cn/PicGo/2026-09-23-gy_1.jpg)

![gy_5](https://blogphoto.planetgis.cn/PicGo/2026-09-23-gy_5.jpg)

![gy_2](https://blogphoto.planetgis.cn/PicGo/2026-09-23-gy_2.jpg)

![gy_3](https://blogphoto.planetgis.cn/PicGo/2026-09-23-gy_3.jpg)

![gy_4](https://blogphoto.planetgis.cn/PicGo/2026-09-23-gy_4.jpg)



## 数据内容

- **全国工业用地（Polygon，134,589 个）**：逐宗工业用地的面状边界，属性表字段：
  - `osm_id`：OSM 要素 ID；
  - `code`：用地类型编码；
  - `fclass`：用地类型（如 industrial 及细分类型）；
  - `name`：用地名称（部分要素为空）。
- 数据覆盖全国范围，适合做工业用地总量、空间集聚与城市产业用地结构分析。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-23-gy_list.jpg" alt="gy_list" style="zoom:67%;" />

## 坐标系与格式

坐标系为 **WGS84 地理坐标系（EPSG:4326，经纬度）**，`.prj` 已随包附带，主流 GIS 软件可直接识别，无需自行定义投影；与天地图、OSM、Google 等底图天然对齐。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 即可加载，按 fclass 分级设色可直观呈现工业用地分布。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，配合 `matplotlib` / `keplergl` 出图，或与行政区面做空间连接（Spatial Join）统计各省市工业用地面积。
3. **WebGIS 底图**：经 `ogr2geojson` 转 GeoJSON 后，用 `tippecanoe` 生成矢量瓦片，导入 MapLibre / Leaflet 展示。

## 使用须知

- 本数据来源于 OpenStreetMap 众包数据，**未标注官方审图号**，行政界线与国界画法以 OSM 为准，公开或正式用途请核对自然资源部最新标准地图与南海十段线表达。
- **严禁**对任意行政界线、国界与南海十段线进行删改、位移或歪曲；数据仅供学习、科研与教学制图参考，商业用途请自行向主管部门申请授权。
- OSM 数据存在局部缺失或误差，分析结论请以官方统计为准。

## 适用场景

工业用地分布与集聚分析、城市产业用地结构研究、开发区与产业园区选址参考、国土空间规划教学、WebGIS 工业用地专题底图。
