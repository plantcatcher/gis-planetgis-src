---
slug: xzqh-point
title: 全国行政区划矢量点数据（省 / 市 / 县 / 乡四级中心点 SHP）
summary: 覆盖全国省、市、县、乡四级行政区划的代表性矢量点数据，WGS84 地理坐标系，Shapefile 格式，共 42,046 个点，可直接用于 QGIS / ArcGIS 标注、专题图注记与空间分析底图。
date: 2026-09-14
category: 地理数据
tags: 行政区划, 矢量点, SHP, WGS84, 省, 市, 县, 乡, 中心点, QGIS, 地理数据
access: gated
trigger: 行政区点
keywordAliases: 行政区划点, 省市县乡点, 行政中心点
code: NSH-SHP-003
download: https://downloads.planetgis.cn/GIS/xzqh-point.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 1.02 MB
---

> 该数据是我本科期间，忘了从哪个地方拿到的数据。最近重新整理了一下，免费分享给大家。使用的时候注意检查[点数据]的名称，因为这份数据并不是最近的版本，因此可能有些地名没及时更新。我之后会整理更多地理数据，并分享出来。欢迎大家订阅公众号【那山那海那座城】~

## 数据内容

数据包按行政层级分为 4 组点图层，共 **42,046** 个点：

- **省点（省会）**：34 个点，对应 34 个省级行政区（省、自治区、直辖市、特别行政区）的省会 / 首府代表点，属性字段 `NAME`（名称）、`KIND`（类别）。
- **市点（地级市）**：304 个点，对应全国地级行政中心，属性字段 `NAME`、`CLASS`。
- **县点**：2,857 个点，对应区县级行政单位，属性字段 `NAME`、`CLASS`。
- **乡点**：38,851 个点，按 31 个省级行政区分别成文件（如 `北京乡镇、街道_POINTS`、`广东乡镇、街道_POINTS` 等），属性字段 `NAME`、`LAYER`、`KML_FOLDER`，适合精细化到乡镇街道的标注与制图。

每个点图层均含 `.shp / .shx / .dbf / .prj / .cpg` 全套文件，省、市、县三级另附带 `.sbn / .sbx` 空间索引与 `.shp.xml` 元数据，可直接加载到主流 GIS 软件中使用。

![sheng_point](https://blogphoto.planetgis.cn/PicGo/2026-09-14-sheng_point.jpg)

![shi_point](https://blogphoto.planetgis.cn/PicGo/2026-09-14-shi_point.jpg)

![xian_point](https://blogphoto.planetgis.cn/PicGo/2026-09-14-xian_point.jpg)

![xiang_point](https://blogphoto.planetgis.cn/PicGo/2026-09-14-xiang_point.jpg)









---



## 坐标系与格式

- 坐标系：**WGS84（GCS_WGS_1984）**，经纬度地理坐标，`.prj` 投影文件已随包附带，无需自行定义投影。
- 文本编码：属性表为 **GBK（代码页 936 / OEM）**，`.cpg` 已指定编码，QGIS / ArcGIS 打开时一般能自动识别中文；若出现乱码，可在加载时手动指定 `GBK` 或 `GB18030`。
- 格式：Shapefile 点数据集，单文件内为点几何 + 属性表，点位坐标为各级行政区的代表性中心位置（非行政边界线）。

## 使用须知

- 本数据为基于公开行政区划资料整理的 **WGS84** 坐标点，未标注自然资源部审图号；其坐标与 CGCS2000 标准地图存在厘米—米级差异，**叠加标准地图边界时可能出现偏移**，正式成图请以标准地图为准。
- 用于互联网地图服务、公开出版或商业用途时，须遵守《地图管理条例》与测绘成果保密相关规定，行政界线与岛礁画法以自然资源部发布的最新标准地图（带审图号）为准，不得自行改动。
- 本数据仅限学习、科研、教学与内部分析参考；公开使用建议再次核对最新行政区划与标准地图版本。

## 适用场景

行政区划专题图注记、地名标注与符号化、人口 / 经济数据空间挂接、校园地理教学、乡镇级精细化制图、WebGIS 行政区注记层、与边界面数据做空间连接等。

---

