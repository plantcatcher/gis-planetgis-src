---
slug: cn-coastline-shp
title: 中国海岸线矢量数据 SHP（WGS84，单图层）
summary: 中国海岸线矢量数据集，Shapefile 格式，GCS_WGS_1984（EPSG:4326）地理坐标系，单图层「中国海岸线」含 2 条要素，配套 .shp/.shx/.dbf/.prj/.sbn/.sbx 齐全，可直接用于 QGIS / ArcGIS / Python 海岸带分析与海平面上升模拟底图。
date: 2026-09-19
category: 地理数据
tags: 海岸线, 中国海岸线, SHP, 矢量数据, WGS84, QGIS, 海岸带, 地理数据
access: gated
trigger: 中国海岸线
keywordAliases: 海岸线矢量, 中国海岸线shp, 海岸线数据
code: NSH-CL-001
download: https://downloads.planetgis.cn/GIS/cn-coastline-shp.zip
cover: https://blogphoto.planetgis.cn/PicGo/2026-09-19-sealine_2.jpg
format: SHP（ZIP 压缩包）
size: 0.22 MB
---

> 本数据集为 **中国海岸线矢量数据**，以 Shapefile（.shp）形式提供，压缩包约 **0.22 MB**。坐标系为 **GCS_WGS_1984（EPSG:4326，WGS84 地理坐标，经纬度）**，于 2026-01-19 通过 DefineProjection 显式定义投影。**单图层「中国海岸线」**，共 **2 条**海岸线要素，属性表仅含 `OBJECTID` 字段，**未标注官方审图号**，使用时请注意合规要求（详见使用须知）。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-19-sealine_1.jpg" alt="sealine_1" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-19-sealine_2.jpg" alt="sealine_2" style="zoom:50%;" />

## 数据内容

数据集为 **1 个图层**，结构极简：

- **中国海岸线**：2 条要素，覆盖中国大陆岸线及海岛岸线（或按区段拆分的两段），几何完整可直接加载。
- 属性字段仅 `OBJECTID`（要素序号），无额外分类 / 名称字段，适合作为底图线或面参与叠加分析，不依赖属性表即可使用。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-19-s_list.jpg" alt="s_list" style="zoom:50%;" />



## 坐标系与格式

图层采用 **GCS_WGS_1984 / EPSG:4326** 地理坐标系（经纬度），`.prj` 投影文件随包附带，无需自行定义投影。文件配套 `.shp / .shx / .dbf / .prj / .sbn / .sbx` 及 `.shp.xml` 元数据齐全（无独立 `.cpg`，默认按 UTF-8 读取中文图层名）。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 即可加载，可沿线做缓冲区、量算岸线长度或叠加行政区底图。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，配合 `matplotlib` / `cartopy` 出图，或与 DEM、海平面栅格做叠加裁剪。
3. **WebGIS 底图**：经 `tippecanoe` 转为 MBTiles / Vector PG，或导入 MapLibre / Leaflet 作为海岸线底图。

## 使用须知

- 本数据**无官方审图号**，属整理成果，公开使用须遵守《地图管理条例》与测绘成果保密相关规定；海岸线涉及南海诸岛等敏感区域，**不得**对任意国界、行政界线、南海十段线及岛礁进行删改、位移或歪曲。
- 坐标系为 **WGS84**，与国内正式出图常用的 **CGCS2000** 存在厘米级差异；用于正式出版或测绘成果前，建议做坐标转换并核对最新官方数据。
- 数据仅供学习、科研与教学制图参考，商业用途请自行向主管部门或数据提供方申请授权。

## 适用场景

海岸带与海平面上升模拟底图、滨海城市空间分析、海洋 / 海岸专题图制作、岸线长度量算、WebGIS 海岸线底图、遥感影像海岸线叠加等。





<div class="shot-grid">
<img alt="内页 1" src="https://blogphoto.planetgis.cn/PicGo/2026-09-19-s_1.jpg" />
<img alt="内页 2" src="https://blogphoto.planetgis.cn/PicGo/2026-09-19-s_2.jpg" />
<img alt="内页 3" src="https://blogphoto.planetgis.cn/PicGo/2026-09-19-s_3.jpg" />
<img alt="内页 4" src="https://blogphoto.planetgis.cn/PicGo/2026-09-19-s_4.jpg" />
<img alt="内页 5" src="https://blogphoto.planetgis.cn/PicGo/2026-09-19-s_5.jpg" />

</div>