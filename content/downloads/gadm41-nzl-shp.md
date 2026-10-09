---
slug: gadm41-nzl-shp
title: GADM 4.1 新西兰行政区划矢量数据 SHP（国界 / 19 大区级 / 75 自治市，WGS84）
summary: GADM 4.1 新西兰行政区划数据集，三级 Shapefile：国界、16 大区 + 2 群岛组 + 1 领地共 19 个一级单元、75 个二级行政区，含查塔姆群岛等离岛，WGS84 坐标系，可直接用于 QGIS / ArcGIS / Python 空间分析。
date: 2026-10-09
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 新西兰, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM新西兰
keywordAliases: 新西兰行政区划, 新西兰SHP, 新西兰shp
code: NSH-GIS-032
download: https://pan.baidu.com/s/1j-CHL6HKS29zGZ9_VF6gzw?pwd=fqfy
downloadType: baidu
panCode: fqfy
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-gadm41-nzl-shp-cover.jpg
format: SHP（ZIP 压缩包）
size: 43.0 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**新西兰**部分，三级 Shapefile 共 15 个文件，压缩包仅约 **43.0 MB（43,034,797 字节）**，是六国包里最轻量、要素最少的一份（全包共 95 个要素）。新西兰是「大区—郡/自治市」两级制，北岛 + 南岛 + 斯图尔特岛之外的离岛（查塔姆群岛等）也一并收录，数据横跨 180° 经线，是个值得注意的技术细节。本文所有数字均经 Python geopandas 逐要素实算，非官方文档转述。



## 数据内容

包内按行政层级分为 3 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，新西兰全国边界（含离岛）。字段 `GID_0`（NZL）、`COUNTRY`。
- **Level 1（大区级）**：**19 个要素**，按 `ENGTYPE_1` 实算：Region（大区）16、Group of islands（群岛组）2、Territory（领地，查塔姆群岛）1。
- **Level 2**：**75 个要素**，郡 / 自治市一级（district / city / territorial authority 等）。

各层级通过 `GID_0 → GID_1 → GID_2` 编码严格逐级嵌套（如 `NZL.1.1_1`），字段含 `NAME_x`、`VARNAME_x`、`TYPE_x / ENGTYPE_x`、`ISO_x`、`HASC_x`、`CC_x` 等。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 随包附带。
- 文本编码：`.cpg` 指定 **UTF-8**，属性表英文存储，无乱码。
- 几何类型：POLYGON（MultiPolygon）。范围经度 -178.83°—179.07°（**横跨 180° 经线**，见下文）、纬度 -52.62°—-29.23°S，全国轮廓面积约 **26.9 万 km²**（EPSG:6933 等面积投影实算）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`；95 个要素体量很小，全量渲染无压力，L1 做大区专题图、L2 做郡市分析。
2. **Python 空间分析**：`geopandas.read_file("gadm41_NZL_2.shp")`；`sjoin` 挂载地震 / 气候站点数据，`dissolve(by="NAME_1")` 聚合到大区。
3. **WebGIS**：`ogr2ogr` 转 GeoJSON 直接接入 MapLibre / Leaflet；95 个要素可整体前端渲染，无需切片。

## 已知数据瑕疵（实测发现，重要）

- **数据横跨 180° 经线**：查塔姆群岛位于 180° 线以西（约西经 176.5°），与新西兰本土（东经 166°—179°）分居经线两侧，全包经度范围因此从 -178.8° 跨到 179.1°。用简单 bbox 判断会误以为数据横跨整个世界；QGIS / ArcGIS / geopandas 正常读取显示即可，做自定义 Web 渲染时注意跨经线处理。
- L1 的 2 个 Group of islands 属 GADM 的非标准分类，与新西兰官方「16 大区 + 查塔姆群岛领地 + 区域外岛屿」的口径略有差异，做严格统计时按 `ENGTYPE_1` 自行归并。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。

## 适用场景

新西兰区域地理教学、大区 / 郡市尺度的农业与地震灾害统计制图、南半球对比研究（与澳洲、智利对齐）、毛利地名与英文地名对照、远洋航线分析的行政区裁剪。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [新西兰行政区划互动地图](/maps/nzl-regions)


