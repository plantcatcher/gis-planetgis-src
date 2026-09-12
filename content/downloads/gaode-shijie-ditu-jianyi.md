---
slug: gaode-shijie-ditu-jianyi
title: 高德世界地图简易版（国家面 + 大洲边界 WGS84 SHP 矢量包）
summary: 基于高德地图公开数据的世界地图简易版矢量包，Shapefile 格式、WGS84 坐标系，包含 242 个国家/地区面要素与 8 个大洲/区域边界要素，属性含中英文名、大洲、国家编号等，可直接用于 QGIS / ArcGIS / Python 制图与空间分析。
date: 2026-09-12
category: 地理数据
tags: 世界地图, 高德, SHP, 矢量数据, WGS84, 国家边界, QGIS, 地理数据
access: gated
trigger: 高德世界地图简易版
keywordAliases: 高德世界地图shp, 简易世界地图shp
code: NSH-SHP-002
download: https://downloads.planetgis.cn/GIS/gaode-shijie-ditu-jianyi.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 1.83 MB
---

> 本数据包基于**高德地图（AutoNavi）公开的世界地图简易版**整理为矢量格式，坐标系为 **WGS84（GCS_WGS_1984 地理坐标系）**，以 Shapefile（.shp）形式提供，共 **2 个图层**、配套 .shp / .shx / .dbf / .prj / .cpg / .qmd 以及空间索引 .sbn / .sbx、元数据 .shp.xml 齐全，可直接加载到主流 GIS 软件中使用。

---

![world_shp](https://blogphoto.planetgis.cn/PicGo/2026-09-12-world_shp.jpg)

![world_line](https://blogphoto.planetgis.cn/PicGo/2026-09-12-world_line.jpg)

## 数据内容

压缩包含 2 个图层：

- **高德-世界地图-简易**（国家 / 地区面）：共 **242 条**面要素，覆盖全球主要国家与地区。属性表含 7 个字段：`NAME_CHN`（中文名）、`NAME_ENG`（英文名）、`NR_C` 与 `NR_C_ID`（国家编号 / ID）、`SOC`、`大洲`（所属大洲），可用于按国家着色、统计挂接与专题制图。
- **高德-世界地图-简易-边界**（大洲 / 区域分界线）：共 **8 条**边界要素，用于绘制大洲轮廓与区域分隔线，为纯几何图层（无附加属性字段）。

每个图层的属性表均为 UTF-8 编码，中文字段名与属性值在 QGIS / ArcGIS 中均能正常显示，不会出现乱码。

## 坐标系与格式

所有图层统一采用 **WGS84 地理坐标系**（GCS_WGS_1984，经纬度），`.prj` 投影文件已随包附带，无需自行定义投影。文本编码由 `.cpg` 指定为 **UTF-8**。每个图层为独立 Shapefile 数据集，配套 `.shp / .shx / .dbf / .prj / .cpg` 齐全，并附 **QGIS 图层元数据 `.qmd`**（主图层另含 `.sbn / .sbx` 空间索引与 `.shp.xml` Esri 元数据），可直接加载与符号化。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 即可加载，按 `大洲` 或 `富豪` 字段分级设色制作世界专题图。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，配合 `matplotlib` / `plotly` / `keplergl` 出图，或做国家间邻接分析、面积与统计计算。
3. **WebGIS 底图**：可经 `tippecanoe` 转为 MBTiles / Vector PG，或导入 MapLibre / Leaflet 作为世界行政区底图。

## 使用须知

- 本数据基于**高德地图**公开世界地图整理，公开使用请遵守高德地图开放平台相关许可条款与《地图管理条例》。
- **不得**对任意国界、领海界线进行删改、位移或歪曲；涉及中国领土（含南海诸岛、十段线）的画法须以官方标准地图为准，本数据包仅作示意性底图。
- 数据仅供学习、科研与教学制图参考，商业用途请自行向数据提供方申请授权。

## 适用场景

世界地理教学挂图、国家 / 大洲专题图制作、人口经济数据空间连接（Spatial Join）、全球尺度数据可视化、WebGIS 世界底图、国际关系与贸易地图等。
